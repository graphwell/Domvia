import { rtdb } from "./firebase";
import { ref, get, set, push, update, serverTimestamp } from "firebase/database";

export interface CreditTransaction {
    id?: string;
    amount: number;
    type: 'earned' | 'spent' | 'purchase' | 'referral' | 'admin_adjustment';
    description: string;
    timestamp: number;
    expiresAt?: number | null; // 90 days validity for some operations
    toolId?: string;
    targetUserId?: string; // For tracking who was referred
}

export interface ToolUnlock {
    toolId: string;
    unlockedAt: number;
    expiresAt: number | null; // null means lifetime unlock per limits (or not time-based)
}

/**
 * Creates a notification for a user in RTDB.
 */
export async function createNotification(userId: string, title: string, message: string, type: 'credit' | 'system' | 'lead' | 'achievement' = 'system') {
    const notifRef = ref(rtdb, `users/${userId}/notifications`);
    const newNotifRef = push(notifRef);
    
    await set(newNotifRef, {
        title,
        message,
        type,
        timestamp: Date.now(),
        read: false
    });
}

/**
 * Adds credits to a user and logs the transaction.
 */
export async function addCredits(userId: string, amount: number, description: string, type: 'earned' | 'purchase' | 'referral' | 'admin_adjustment', daysValid?: number) {
    if (amount <= 0) return;

    // 1. Get current balance
    const userRef = ref(rtdb, `users/${userId}`);
    const userSnap = await get(userRef);
    if (!userSnap.exists()) throw new Error("Usuário não encontrado.");

    const currentCredits = userSnap.val().credits || 0;
    const newCredits = currentCredits + amount;

    // 2. Add history entry
    const historyRef = ref(rtdb, `credit_history/${userId}`);
    const newHistoryRef = push(historyRef);

    const expiresAt = daysValid ? Date.now() + (daysValid * 24 * 60 * 60 * 1000) : null;

    const transaction: CreditTransaction = {
        amount,
        type,
        description,
        timestamp: Date.now(),
        expiresAt
    };

    // 3. Update both atomically
    const updates: any = {};
    updates[`users/${userId}/credits`] = newCredits;
    updates[`credit_history/${userId}/${newHistoryRef.key}`] = transaction;

    await update(ref(rtdb), updates);

    // 4. Create notification
    await createNotification(
        userId, 
        "Créditos Adicionados!", 
        `${description}: +${amount} créditos.`, 
        'credit'
    );

    return newCredits;
}

/**
 * Consumes credits from a user if they have enough balance, logs transaction, and unlocks tool.
 */
export async function consumeCredits(userId: string, amount: number, description: string, toolId: string, durationDays?: number) {
    if (amount <= 0) return true;

    // 1. Check balance
    const userRef = ref(rtdb, `users/${userId}`);
    const userSnap = await get(userRef);
    if (!userSnap.exists()) throw new Error("Usuário não encontrado.");

    const currentCredits = userSnap.val().credits || 0;
    if (currentCredits < amount) {
        throw new Error("Saldo de créditos insuficiente.");
    }
    const newCredits = currentCredits - amount;

    // 2. Add history entry
    const historyRef = ref(rtdb, `credit_history/${userId}`);
    const newHistoryRef = push(historyRef);
    const transaction: CreditTransaction = {
        amount: -amount,
        type: 'spent',
        description,
        timestamp: Date.now(),
        toolId
    };

    const updates: any = {};
    updates[`users/${userId}/credits`] = newCredits;
    updates[`credit_history/${userId}/${newHistoryRef.key}`] = transaction;

    // 3. Add to tool_unlocks if duration applies
    if (durationDays) {
        const unlockRef = ref(rtdb, `tool_unlocks/${userId}/${toolId}`);
        const unlocksData: ToolUnlock = {
            toolId,
            unlockedAt: Date.now(),
            expiresAt: Date.now() + (durationDays * 24 * 60 * 60 * 1000)
        };
        updates[`tool_unlocks/${userId}/${toolId}`] = unlocksData;
    }

    await update(ref(rtdb), updates);

    // 4. Create notification if substantial or for tool
    if (amount > 0) {
        await createNotification(
            userId, 
            "Ferramenta Ativada", 
            `Você usou ${amount} créditos para: ${description}.`, 
            'credit'
        );
    }

    return true;
}

/**
 * Unlocks a tool without consuming credits (e.g. via plans).
 */
export async function forceUnlockTool(userId: string, toolId: string, durationDays: number | null) {
    const unlockRef = ref(rtdb, `tool_unlocks/${userId}/${toolId}`);
    const unlocksData: ToolUnlock = {
        toolId,
        unlockedAt: Date.now(),
        expiresAt: durationDays ? Date.now() + (durationDays * 24 * 60 * 60 * 1000) : null
    };
    await set(unlockRef, unlocksData);
}

/**
 * Checks if a specific tool is unlocked for the user in `tool_unlocks` and hasn't expired.
 */
export async function hasToolUnlocked(userId: string, toolId: string): Promise<boolean> {
    const unlockRef = ref(rtdb, `tool_unlocks/${userId}/${toolId}`);
    const snap = await get(unlockRef);
    if (!snap.exists()) return false;

    const data = snap.val() as ToolUnlock;
    if (data.expiresAt === null) return true; // Lifetime

    if (Date.now() > data.expiresAt) {
        // Expired
        return false;
    }

    return true;
}

/**
 * Removes credits directly (used by admin).
 */
export async function removeCredits(userId: string, amount: number, description: string) {
    if (amount <= 0) return;

    // 1. Check balance
    const userRef = ref(rtdb, `users/${userId}`);
    const userSnap = await get(userRef);
    if (!userSnap.exists()) throw new Error("Usuário não encontrado.");

    const currentCredits = userSnap.val().credits || 0;
    const newCredits = Math.max(0, currentCredits - amount); // Don't go below 0

    // 2. Add history entry
    const historyRef = ref(rtdb, `credit_history/${userId}`);
    const newHistoryRef = push(historyRef);
    const transaction: CreditTransaction = {
        amount: -(currentCredits - newCredits), // Actual amount removed
        type: 'admin_adjustment',
        description,
        timestamp: Date.now()
    };

    const updates: any = {};
    updates[`users/${userId}/credits`] = newCredits;
    updates[`credit_history/${userId}/${newHistoryRef.key}`] = transaction;

    await update(ref(rtdb), updates);

    // 3. Create notification
    await createNotification(
        userId, 
        "Ajuste de Saldo", 
        `${description}: -${currentCredits - newCredits} créditos.`, 
        'system'
    );

    return newCredits;
}

/**
 * Processes a referral, rewarding both the referrer and the new user.
 * Rules:
 * - Both receive 5 credits.
 * - Referrer has a limit of 5 successful referrals (max 25 credits).
 * - Referral credits expire in 30 days.
 */
export async function processReferral(referrerId: string, newUserId: string) {
    try {
        // 0. Fetch referral rules from settings
        const rulesRef = ref(rtdb, "settings/referral_rules");
        const rulesSnap = await get(rulesRef);
        const rules = rulesSnap.exists() ? rulesSnap.val() : {
            reward_referrer: 5,
            reward_referred: 5,
            limit_per_user: 5,
            expiration_days: 30
        };

        const referrerRef = ref(rtdb, `users/${referrerId}`);
        const snap = await get(referrerRef);
        
        if (!snap.exists()) return;

        const currentCount = snap.val().inviteCount || 0;
        
        // 1. Check referral limit
        if (currentCount >= (rules.limit_per_user || 5)) {
            console.log(`[Credits] Referrer ${referrerId} reached referral limit.`);
            // Still log the connection for audit, but no credits
            const referralLogRef = ref(rtdb, `referrals/${referrerId}/${newUserId}`);
            await set(referralLogRef, {
                acceptedAt: Date.now(),
                status: 'limit_reached'
            });
            return;
        }

        // 2. Reward referrer
        await addCredits(
            referrerId, 
            rules.reward_referrer || 5, 
            "Bônus de indicação (Novo usuário)", 
            'referral',
            rules.expiration_days || 30
        );

        // 3. Increment referrer's invite count
        await update(referrerRef, { inviteCount: currentCount + 1 });

        // 4. Mark the referral connection specifically for audit
        const referralLogRef = ref(rtdb, `referrals/${referrerId}/${newUserId}`);
        await set(referralLogRef, {
            acceptedAt: Date.now(),
            status: 'accepted'
        });

        // 5. Reward new user
        await addCredits(
            newUserId, 
            rules.reward_referred || 5, 
            "Bem-vindo! Bônus de indicação", 
            'referral',
            rules.expiration_days || 30
        );

        console.log(`[Credits] Referral processed: ${referrerId} referred ${newUserId}`);
    } catch (error) {
        console.error("[Credits] Error processing referral:", error);
    }
}
