import { rtdb } from "./firebase";
import { ref, get, set, push, serverTimestamp } from "firebase/database";
import { User } from "@/hooks/auth-provider";

export type EngagementCategory = 
    | "motivation" 
    | "opportunity" 
    | "tip" 
    | "feature_suggestion";

export interface EngagementMessage {
    id: string;
    category: EngagementCategory;
    content: string;
    targetTool?: string;
}

export interface UserEngagementData {
    lastLoginDate?: string; // YYYY-MM-DD
    lastNotificationSent?: number;
    monthlyCount?: number;
    weeklyCount?: number;
    toolsUsed?: Record<string, boolean>;
    currentMonth?: string; // YYYY-MM
}

// Default library of messages (will be synced to RTDB engagement_messages path)
const DEFAULT_MESSAGES: Omit<EngagementMessage, 'id'>[] = [
    {
        category: "motivation",
        content: "Bem-vindo ao Domvia 👋 Hoje pode ser um ótimo dia para captar novos imóveis. Que tal criar um link de captação para divulgar?",
    },
    {
        category: "opportunity",
        content: "Corretores que captam pelo menos 1 imóvel por semana vendem muito mais. Que tal usar o Domvia hoje para criar um link de captação?",
    },
    {
        category: "tip",
        content: "Uma estratégia simples: procure imóveis no bairro mais valorizado da sua cidade e publique nos grupos hoje. O Domvia pode gerar o link em segundos.",
    },
    {
        category: "feature_suggestion",
        content: "Você sabia que o Domvia pode gerar descrições profissionais para seus imóveis em segundos? Experimente o Gerador de Descrição.",
        targetTool: "ai_description_generate"
    },
    {
        category: "feature_suggestion",
        content: "Ainda não criou seu primeiro Tour 360? É uma das formas que mais geram leads no sistema.",
        targetTool: "tour_created"
    },
    {
        category: "motivation",
        content: "O mercado está aquecido! Continue focado e use a tecnologia para multiplicar seus resultados."
    }
];

const COOLDOWN_MIN_TIME = 72 * 60 * 60 * 1000; // 72 hours
const MAX_WEEKLY = 1;
const MAX_MONTHLY = 3;

/**
 * Checks if the user is eligible for an engagement notification and triggers it.
 */
export async function checkEngagement(user: User): Promise<void> {
    if (!user?.id) return;

    try {
        const engagementRef = ref(rtdb, `users/${user.id}/engagement`);
        const engagementSnap = await get(engagementRef);
        const data: UserEngagementData = engagementSnap.val() || {};

        const now = Date.now();
        const todayStr = new Date().toISOString().slice(0, 10);
        const currentMonth = todayStr.slice(0, 7);

        // ── 1. Update activity tracking
        if (data.lastLoginDate !== todayStr) {
            const lastLogin = data.lastLoginDate ? new Date(data.lastLoginDate).getTime() : now;
            const daysInactive = Math.floor((now - lastLogin) / (24 * 60 * 60 * 1000));

            await set(ref(rtdb, `users/${user.id}/engagement/lastLoginDate`), todayStr);
            
            // Trigger evaluate with extra metadata
            await evaluateTriggers(user, { ...data, daysInactive }, todayStr, currentMonth);
        }

    } catch (error) {
        console.error("[Engagement] Error checking engagement:", error);
    }
}

async function evaluateTriggers(
    user: User, 
    data: UserEngagementData & { daysInactive?: number }, 
    todayStr: string,
    currentMonth: string
) {
    const now = Date.now();

    // Reset counters if month changed
    let monthlyCount = data.monthlyCount || 0;
    if (data.currentMonth !== currentMonth) {
        monthlyCount = 0;
        await set(ref(rtdb, `users/${user.id}/engagement/currentMonth`), currentMonth);
        await set(ref(rtdb, `users/${user.id}/engagement/monthlyCount`), 0);
        await set(ref(rtdb, `users/${user.id}/engagement/weeklyCount`), 0);
    }

    // --- COOLDOWN & ANTI-SPAM RULES ---
    // 1. Min 72 hours between notifications
    if (data.lastNotificationSent && (now - data.lastNotificationSent < COOLDOWN_MIN_TIME)) return;
    
    // 2. Max 3 per month
    if (monthlyCount >= MAX_MONTHLY) return;
    
    // 3. Max 1 per week (using 7 days check)
    if (data.lastNotificationSent && (now - data.lastNotificationSent < 7 * 24 * 60 * 60 * 1000)) {
        if (data.weeklyCount && data.weeklyCount >= MAX_WEEKLY) return;
    }

    // --- SELECT MESSAGE CATEGORY ---
    let category: EngagementCategory = "motivation";
    
    // Priority 1: Inactivity re-engagement
    if (data.daysInactive && data.daysInactive >= 7) {
        category = "motivation"; // Will select a re-engagement style message
    } 
    // Priority 2: Feature discovery
    else if (Math.random() > 0.5) {
        category = "feature_suggestion";
    }
    // Priority 3: Random tip or opportunity
    else {
        const cats: EngagementCategory[] = ["tip", "opportunity"];
        category = cats[Math.floor(Math.random() * cats.length)];
    }

    // Load messages from RTDB
    let messages = DEFAULT_MESSAGES;
    try {
        const msgSnap = await get(ref(rtdb, "engagement_messages"));
        if (msgSnap.exists()) {
            const rtdbMsgs = msgSnap.val();
            messages = Object.keys(rtdbMsgs).map(k => ({ ...rtdbMsgs[k], id: k }));
        }
    } catch (e) {
        console.warn("[Engagement] Using default messages fallback");
    }

    // Logic to select message
    const message = selectMessage(user, data, messages, category);
    if (!message) return;

    // Trigger notification
    await triggerNotification(user, message);

    // Update engagement metadata
    await set(ref(rtdb, `users/${user.id}/engagement/lastNotificationSent`), now);
    await set(ref(rtdb, `users/${user.id}/engagement/monthlyCount`), monthlyCount + 1);
    await set(ref(rtdb, `users/${user.id}/engagement/weeklyCount`), (data.weeklyCount || 0) + 1);
}

function selectMessage(
    user: User, 
    data: UserEngagementData, 
    messages: Omit<EngagementMessage, 'id'>[],
    preferredCategory: EngagementCategory
): Omit<EngagementMessage, 'id'> | null {
    // Filter by category
    let filtered = messages.filter(m => m.category === preferredCategory);
    
    // If it's a feature suggestion, don't suggest already used tools
    if (preferredCategory === "feature_suggestion") {
        filtered = filtered.filter(m => m.targetTool && !data.toolsUsed?.[m.targetTool]);
    }

    if (filtered.length === 0) {
        // Fallback to any motivation
        filtered = messages.filter(m => m.category === "motivation");
    }

    if (filtered.length === 0) return null;
    return filtered[Math.floor(Math.random() * filtered.length)];
}

async function triggerNotification(user: User, message: Omit<EngagementMessage, 'id'>) {
    // FIX: Consistent path with NotificationContext
    const notificationRef = ref(rtdb, `users/${user.id}/notifications`);
    const newRef = push(notificationRef);
    
    await set(newRef, {
        title: "Domvia Intelligence ✨",
        message: message.content,
        type: "engagement",
        read: false,
        timestamp: serverTimestamp(),
        category: message.category
    });
}
