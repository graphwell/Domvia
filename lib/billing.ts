import { rtdb } from "./firebase";
import { ref, get, update, runTransaction, serverTimestamp, push } from "firebase/database";

export type PlanType = 'trial' | 'pro' | 'max' | 'elite' | 'lifetime';

export interface PlanLimit {
    monthlyLimit: number;
    creditCost: number;
}

export const PLAN_CONFIG = {
    trial: {
        id: 'trial',
        name: 'Trial',
        creditsInbound: 100,
        durationDays: 14,
        badge: 'TRIAL',
        color: 'slate',
        limits: {
            'captacao': 15,
            'doc_gen': 5,
            'description_gen': 20,
            'title_gen': 20,
            'social_gen': 20,
            'tour_360': 0,
            'ai_chat': 10,
            'link_gen': 10,
        }
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        creditsInbound: 500,
        badge: 'PRO',
        color: 'brand',
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY || 'price_1pro_monthly_3990',
        limits: {
            'captacao': 150,
            'doc_gen': 50,
            'description_gen': 200,
            'title_gen': 200,
            'social_gen': 200,
            'tour_360': 0,
            'ai_chat': 100,
            'link_gen': 100,
        }
    },
    max: {
        id: 'max',
        name: 'Max',
        creditsInbound: 10000,
        badge: 'MAX',
        color: 'amber',
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MAX_MONTHLY || 'price_1max_monthly_7900',
        limits: {} // Unlimited
    },
    elite: {
        id: 'elite',
        name: 'Elite',
        creditsInbound: 10000,
        badge: 'ELITE',
        color: 'amber',
        limits: {} // Unlimited
    },
    lifetime: {
        id: 'lifetime',
        name: 'Lifetime',
        creditsInbound: 10000,
        badge: 'LIFETIME',
        color: 'emerald',
        limits: {} // Unlimited
    }
} as const;

export const TOPUP_CONFIG = {
    'credits_100': { id: 'credits_100', credits: 100, price: 19.00, stripePriceId: 'price_1topup_100_1900' },
    'credits_300': { id: 'credits_300', credits: 300, price: 39.00, stripePriceId: 'price_1topup_300_3900' },
    'credits_1000': { id: 'credits_1000', credits: 1000, price: 97.00, stripePriceId: 'price_1topup_1000_9700' },
} as const;

// Default costs if DB is empty
export const DEFAULT_TOOL_CREDIT_COSTS: Record<string, number> = {
    'captacao': 3,
    'doc_gen': 2,
    'description_gen': 1,
    'title_gen': 1,
    'social_gen': 1,
    'tour_360': 5,
    'ai_chat': 2,
    'link_gen': 1,
    'finance': 0,
    'terrain': 0,
    'rentability': 0,
    'landing_page': 2,
};

/**
 * Replaced by dynamic cost fetcher from DB settings.
 */
export async function getToolCostDynamic(toolId: string, planId: string): Promise<number> {
    const costRef = ref(rtdb, `settings/tool_costs/${toolId}`);
    const snap = await get(costRef);
    
    const pId = (planId || 'trial').toLowerCase();

    if (snap.exists()) {
        const costs = snap.val();
        // planId might be 'trial', 'pro', 'max' (normalizing here too for safety)
        const tier = pId === 'trial' ? 'free' : pId;
        return costs[tier] ?? costs['free'] ?? DEFAULT_TOOL_CREDIT_COSTS[toolId] ?? 1;
    }
    
    return DEFAULT_TOOL_CREDIT_COSTS[toolId] ?? 1;
}

/**
 * Core function to check and consume credits/usage.
 * Logic:
 * 1. Free tool? Return true.
 * 2. Max plan? Return true.
 * 3. Monthly limit not reached? Increment usage, return true.
 * 4. Has credits (plan or bonus)? Consume, log transaction, return true.
 * 5. Otherwise return false (upsell).
 */
export async function checkAndConsumeCredits(userId: string, tool: string): Promise<{ success: boolean; reason?: 'insufficient_credits' | 'limit_reached' }> {
    // 1. Free tools
    const toolCostDefault = DEFAULT_TOOL_CREDIT_COSTS[tool] ?? 1;
    if (toolCostDefault === 0) return { success: true };

    const userRef = ref(rtdb, `users/${userId}`);
    const snap = await get(userRef);
    if (!snap.exists()) return { success: false };

    const userData = snap.val();
    const planType = ((userData.planId || userData.plan || 'trial').toLowerCase()) as PlanType;
    
    // 2. Max/Elite/Lifetime plans are unlimited (if not specifically configured to cost credits)
    if (planType === 'max' || planType === 'elite' || planType === 'lifetime') return { success: true };

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // 3. Check monthly usage limit
    const usageRef = ref(rtdb, `tool_usage/${userId}/${currentMonth}/${tool}`);
    const usageSnap = await get(usageRef);
    const currentUsage = usageSnap.val() || 0;
    
    // Safety check for plan config
    const config = PLAN_CONFIG[planType as keyof typeof PLAN_CONFIG] || PLAN_CONFIG.trial;
    const planLimits = (config.limits || {}) as any;
    const toolLimit = planLimits[tool] || 0;

    if (currentUsage < toolLimit) {
        // Within plan limits, just record usage
        await runTransaction(usageRef, (curr) => (curr || 0) + 1);
        return { success: true };
    }

    // 4. Exceeded monthly limit, try to consume credits
    const cost = await getToolCostDynamic(tool, planType);
    if (cost === 0) return { success: true };
    
    // In this app, credits are stored in users/${userId}/credits (verified in lib/credits.ts and Admin)
    // There was a discrepancy using user_credits/${userId} here.
    const creditsFromUserNode = userData.credits || 0;

    if (creditsFromUserNode < cost) {
        return { success: false, reason: 'insufficient_credits' };
    }

    // Execute credit consumption
    const newTotalCredits = creditsFromUserNode - cost;

    const updates: any = {};
    updates[`users/${userId}/credits`] = newTotalCredits;
    updates[`users/${userId}/updated_at`] = serverTimestamp();

    // Transaction log
    const txRef = ref(rtdb, `credit_history/${userId}`);
    const newTxKey = push(txRef).key;
    updates[`credit_history/${userId}/${newTxKey}`] = {
        type: 'spent',
        tool,
        amount: -cost,
        balance_after: newTotalCredits,
        description: `Uso de ${tool} (excedente plano)`,
        timestamp: Date.now()
    };

    // Also record as usage for stats
    updates[`tool_usage/${userId}/${currentMonth}/${tool}`] = currentUsage + 1;

    await update(ref(rtdb), updates);

    return { success: true };
}
