import Stripe from "stripe";
import * as admin from "firebase-admin";
import { adminDb } from "./firebase-admin";
import { PLAN_CONFIG } from "./billing";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-01-27-02-00" as any,
});

/**
 * Activate a trial for a new user.
 */
export async function activateTrial(userId: string) {
    const trialDays = PLAN_CONFIG.trial.durationDays;
    const now = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(now.getDate() + trialDays);

    const updates: any = {};
    updates[`users/${userId}/planId`] = 'trial';
    updates[`users/${userId}/planStatus`] = 'active';
    updates[`users/${userId}/trialEnd`] = trialEnd.toISOString();
    
    // Initial credits
    updates[`user_credits/${userId}/plan_credits`] = PLAN_CONFIG.trial.creditsInbound;
    updates[`user_credits/${userId}/bonus_credits`] = 0;
    updates[`user_credits/${userId}/total_credits`] = PLAN_CONFIG.trial.creditsInbound;
    updates[`user_credits/${userId}/updated_at`] = Date.now();

    // Log transaction
    const txId = adminDb.ref(`credit_transactions/${userId}`).push().key;
    updates[`credit_transactions/${userId}/${txId}`] = {
        type: 'bonus',
        amount: PLAN_CONFIG.trial.creditsInbound,
        balance_after: PLAN_CONFIG.trial.creditsInbound,
        description: "Bônus de Trial (14 dias)",
        created_at: Date.now()
    };

    await adminDb.ref().update(updates);
}

/**
 * Handle Stripe Webhook Events
 */
export async function handleStripeEvent(event: Stripe.Event) {
    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object as Stripe.Checkout.Session;
            await handleCheckoutCompleted(session);
            break;
            
        case "invoice.payment_succeeded":
            const invoice = event.data.object as any;
            if (invoice.subscription) {
                await renewSubscription(invoice.subscription as string);
            }
            break;

        case "invoice.payment_failed":
            // Mark as past_due
            break;

        case "customer.subscription.deleted":
            // Mark as cancelled/expired
            break;
    }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.client_reference_id;
    if (!userId) return;

    if (session.mode === 'subscription') {
        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
        const planType = session.metadata?.plan_type as any || 'pro';
        
        await adminDb.ref(`users/${userId}`).update({
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: session.customer as string,
            planId: planType,
            planStatus: 'active',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
        });

        // Reset usage for the new period
        await resetMonthlyUsage(userId, planType);
    } else {
        // One-time credit purchase
        const credits = parseInt(session.metadata?.credits || "0");
        const package_name = session.metadata?.package || "starter";
        
        if (credits > 0) {
            await addBonusCredits(userId, credits, `Pacote ${package_name}`);
        }
    }

    // Log sale for financial metrics
    if (session.amount_total) {
        await logSale(userId, session.amount_total / 100, session.currency || 'brl', session.mode === 'subscription' ? 'subscription' : 'credits');
    }
}

async function logSale(userId: string, amount: number, currency: string, type: 'subscription' | 'credits') {
    const saleId = adminDb.ref('sales').push().key;
    const now = new Date();
    const month = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

    await adminDb.ref(`sales/${saleId}`).set({
        userId,
        amount,
        currency,
        type,
        month,
        created_at: admin.database.ServerValue.TIMESTAMP
    });

    // Also update monthly aggregates
    const metricsRef = adminDb.ref(`financial_metrics/${month}`);
    await metricsRef.transaction((curr) => {
        const data = curr || { total_sales: 0, subscription_revenue: 0, credit_revenue: 0, count: 0 };
        data.total_sales += amount;
        if (type === 'subscription') data.subscription_revenue += amount;
        else data.credit_revenue += amount;
        data.count += 1;
        return data;
    });
}

async function renewSubscription(subscriptionId: string) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
    const userSnap = await adminDb.ref('users').orderByChild('stripeSubscriptionId').equalTo(subscriptionId).get();
    
    if (userSnap.exists()) {
        const users = userSnap.val();
        const userId = Object.keys(users)[0];
        const planType = users[userId].planId || 'pro';

        await adminDb.ref(`users/${userId}`).update({
            planStatus: 'active',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
        });

        await resetMonthlyUsage(userId, planType);
    }
}

export async function resetMonthlyUsage(userId: string, planType: string) {
    const config = PLAN_CONFIG[planType as keyof typeof PLAN_CONFIG] || PLAN_CONFIG.pro;
    const now = new Date();
    const month = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

    const updates: any = {};
    // Clear usage for the new month
    updates[`tool_usage/${userId}/${month}`] = null; // Next usage will initialize
    
    // Reset plan credits
    updates[`user_credits/${userId}/plan_credits`] = config.creditsInbound;
    
    // Total credits update
    const creditsSnap = await adminDb.ref(`user_credits/${userId}/bonus_credits`).get();
    const bonus = creditsSnap.val() || 0;
    updates[`user_credits/${userId}/total_credits`] = config.creditsInbound + bonus;
    updates[`user_credits/${userId}/last_reset`] = Date.now();

    // Transaction log
    const txId = adminDb.ref(`credit_transactions/${userId}`).push().key;
    updates[`credit_transactions/${userId}/${txId}`] = {
        type: 'reset',
        amount: config.creditsInbound,
        balance_after: config.creditsInbound + bonus,
        description: `Renovação mensal do plano ${config.name}`,
        created_at: Date.now()
    };

    await adminDb.ref().update(updates);
}

async function addBonusCredits(userId: string, amount: number, description: string) {
    const creditsRef = adminDb.ref(`user_credits/${userId}`);
    const snap = await creditsRef.get();
    const data = snap.val() || { plan_credits: 0, bonus_credits: 0 };
    
    const newBonus = (data.bonus_credits || 0) + amount;
    const newTotal = (data.plan_credits || 0) + newBonus;

    const updates: any = {};
    updates[`user_credits/${userId}/bonus_credits`] = newBonus;
    updates[`user_credits/${userId}/total_credits`] = newTotal;
    updates[`user_credits/${userId}/updated_at`] = Date.now();

    const txId = adminDb.ref(`credit_transactions/${userId}`).push().key;
    updates[`credit_transactions/${userId}/${txId}`] = {
        type: 'recharge',
        amount,
        balance_after: newTotal,
        description,
        created_at: Date.now()
    };

    await adminDb.ref().update(updates);
}
/**
 * Server-side version of checkAndConsumeCredits using Firebase Admin
 */
export async function checkAndConsumeCreditsAdmin(userId: string, tool: string): Promise<{ success: boolean; reason?: 'insufficient_credits' | 'limit_reached' }> {
    // 1. Free tools
    const { TOOL_CREDIT_COSTS, PLAN_CONFIG } = require('./billing');
    if (TOOL_CREDIT_COSTS[tool] === 0) return { success: true };

    const userRef = adminDb.ref(`users/${userId}`);
    const snap = await userRef.get();
    if (!snap.exists()) return { success: false };

    const userData = snap.val();
    const planType = (userData.planId || 'trial') as any;
    
    // 2. Max plan is unlimited
    if (planType === 'max') return { success: true };

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // 3. Check monthly usage limit
    const usageRef = adminDb.ref(`tool_usage/${userId}/${currentMonth}/${tool}`);
    const usageSnap = await usageRef.get();
    const currentUsage = usageSnap.val() || 0;
    
    const planLimits = PLAN_CONFIG[planType]?.limits || {};
    const toolLimit = planLimits[tool] || 0;

    if (currentUsage < toolLimit) {
        // Within plan limits, just record usage
        await usageRef.transaction((curr: any) => (curr || 0) + 1);
        return { success: true };
    }

    // 4. Exceeded monthly limit, try to consume credits
    const cost = TOOL_CREDIT_COSTS[tool];
    const creditsRef = adminDb.ref(`user_credits/${userId}`);
    const creditsSnap = await creditsRef.get();
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
    updates[`user_credits/${userId}/updated_at`] = admin.database.ServerValue.TIMESTAMP;

    // Transaction log
    const txRef = adminDb.ref(`credit_transactions/${userId}`).push();
    updates[`credit_transactions/${userId}/${txRef.key}`] = {
        type: 'consume',
        tool,
        amount: -cost,
        balance_after: newPlanCredits + newBonusCredits,
        description: `Uso de ${tool} (excedente plano)`,
        created_at: admin.database.ServerValue.TIMESTAMP
    };

    // Also record as usage for stats
    updates[`tool_usage/${userId}/${currentMonth}/${tool}`] = currentUsage + 1;

    await adminDb.ref().update(updates);

    return { success: true };
}
