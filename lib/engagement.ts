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
        content: "Bem-vindo ao Domvia 👋 Hoje pode ser um ótimo dia para captar novos imóveis. Vamos pra cima?"
    },
    {
        category: "tip",
        content: "Dica Domvia: Corretores que captam pelo menos 1 imóvel por semana vendem 3x mais. Já usou a Captação Inteligente hoje?"
    },
    {
        category: "opportunity",
        content: "O mercado está aquecido! Que tal criar um novo link de captação e compartilhar nos seus grupos agora?"
    },
    {
        category: "feature_suggestion",
        content: "Você sabia que o Domvia pode criar descrições incríveis para seus imóveis usando IA? Experimente o Gerador de Descrição!",
        targetTool: "ai_description_generate"
    },
    {
        category: "motivation",
        content: "Consistência é a chave do sucesso. Um link compartilhado hoje pode ser a venda de amanhã. Boa jornada!"
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

        // 1. Update activity tracking
        if (data.lastLoginDate !== todayStr) {
            await set(ref(rtdb, `users/${user.id}/engagement/lastLoginDate`), todayStr);
            
            // Check if it's the first login of the day to evaluate notification
            await evaluateTriggers(user, data, todayStr, currentMonth);
        }

        // 2. Check for inactivity (last activity > 7 days) - Handled separately if needed, 
        // but for now we focus on active session re-engagement.

    } catch (error) {
        console.error("[Engagement] Error checking engagement:", error);
    }
}

async function evaluateTriggers(
    user: User, 
    data: UserEngagementData, 
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

    // Cooldown checks
    if (data.lastNotificationSent && (now - data.lastNotificationSent < COOLDOWN_MIN_TIME)) return;
    if (monthlyCount >= MAX_MONTHLY) return;
    
    // Weekly check
    if (data.lastNotificationSent && (now - data.lastNotificationSent < 7 * 24 * 60 * 60 * 1000)) {
        if (data.weeklyCount && data.weeklyCount >= MAX_WEEKLY) return;
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
    const message = selectMessage(user, data, messages);
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
    messages: Omit<EngagementMessage, 'id'>[]
): Omit<EngagementMessage, 'id'> | null {
    // Feature discovery priority
    const unusedTools = messages.filter(m => 
        m.category === "feature_suggestion" && 
        m.targetTool && 
        !data.toolsUsed?.[m.targetTool]
    );

    if (unusedTools.length > 0 && Math.random() > 0.4) {
        return unusedTools[Math.floor(Math.random() * unusedTools.length)];
    }

    // Random motivation or tip
    const generalMessages = messages.filter(m => m.category !== "feature_suggestion");
    if (generalMessages.length === 0) return null;
    return generalMessages[Math.floor(Math.random() * generalMessages.length)];
}

async function triggerNotification(user: User, message: Omit<EngagementMessage, 'id'>) {
    const notificationRef = ref(rtdb, `notifications/${user.id}`);
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
