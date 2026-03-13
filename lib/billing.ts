import { rtdb } from "./firebase";
import { ref, get, update, runTransaction, serverTimestamp, push } from "firebase/database";

export type PlanType = 'trial' | 'pro' | 'max';

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
        limits: {
            'captacao': 15,
            'doc_gen': 5,
            'description_gen': 10,
            'title_gen': 10,
            'social_gen': 10,
            'tour_360': 2,
            'ai_chat': 10,
            'link_gen': 10,
        }
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        creditsInbound: 500,
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY || 'ID_DO_PRECO_PRO_AQUI',
        limits: {
            'captacao': 150,
            'doc_gen': 50,
            'description_gen': 100,
            'title_gen': 100,
            'social_gen': 100,
            'tour_360': 20,
            'ai_chat': 100,
            'link_gen': 100,
        }
    },
    max: {
        id: 'max',
        name: 'Max',
        creditsInbound: 999999,
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MAX_MONTHLY || 'ID_DO_PRECO_MAX_AQUI',
        limits: {} // Unlimited
    }
} as const;

export const TOOL_CREDIT_COSTS: Record<string, number> = {
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
    if (TOOL_CREDIT_COSTS[tool] === 0) return { success: true };

    const userRef = ref(rtdb, `users/${userId}`);
    const snap = await get(userRef);
    if (!snap.exists()) return { success: false };

    const userData = snap.val();
    const planType = (userData.planId || 'trial') as PlanType;
    
    // 2. Max plan is unlimited
    if (planType === 'max') return { success: true };

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // 3. Check monthly usage limit
    const usageRef = ref(rtdb, `tool_usage/${userId}/${currentMonth}/${tool}`);
    const usageSnap = await get(usageRef);
    const currentUsage = usageSnap.val() || 0;
    
    const planLimits = PLAN_CONFIG[planType].limits as any;
    const toolLimit = planLimits[tool] || 0;

    if (currentUsage < toolLimit) {
        // Within plan limits, just record usage
        await runTransaction(usageRef, (curr) => (curr || 0) + 1);
        return { success: true };
    }

    // 4. Exceeded monthly limit, try to consume credits
    const cost = TOOL_CREDIT_COSTS[tool];
    const creditsRef = ref(rtdb, `user_credits/${userId}`);
    const creditsSnap = await get(creditsRef);
    const creditsData = creditsSnap.val() || { plan_credits: 0, bonus_credits: 0 };
    
    const totalAvailable = (creditsData.plan_credits || 0) + (creditsData.bonus_credits || 0);

    if (totalAvailable < cost) {
        return { success: false, reason: 'insufficient_credits' };
    }

    // Execute credit consumption
    let remainingToConsume = cost;
    let newPlanCredits = creditsData.plan_credits || 0;
    let newBonusCredits = creditsData.bonus_credits || 0;

    // Plan credits consumed first
    if (newPlanCredits >= remainingToConsume) {
        newPlanCredits -= remainingToConsume;
        remainingToConsume = 0;
    } else {
        remainingToConsume -= newPlanCredits;
        newPlanCredits = 0;
        newBonusCredits -= remainingToConsume;
    }

    const updates: any = {};
    updates[`user_credits/${userId}/plan_credits`] = newPlanCredits;
    updates[`user_credits/${userId}/bonus_credits`] = newBonusCredits;
    updates[`user_credits/${userId}/total_credits`] = newPlanCredits + newBonusCredits;
    updates[`user_credits/${userId}/updated_at`] = serverTimestamp();

    // Transaction log
    const txRef = ref(rtdb, `credit_transactions/${userId}`);
    const newTxKey = push(txRef).key;
    updates[`credit_transactions/${userId}/${newTxKey}`] = {
        type: 'consume',
        tool,
        amount: -cost,
        balance_after: newPlanCredits + newBonusCredits,
        description: `Uso de ${tool} (excedente plano)`,
        created_at: serverTimestamp()
    };

    // Also record as usage for stats
    updates[`tool_usage/${userId}/${currentMonth}/${tool}`] = currentUsage + 1;

    await update(ref(rtdb), updates);

    return { success: true };
}
