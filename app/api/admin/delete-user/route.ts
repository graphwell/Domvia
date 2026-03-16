import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

// ── POST /api/admin/delete-user ──────────────────────────────────
// Body: { uid: string }
// This endpoint performs a complete and permanent deletion of a user.

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { uid } = body;

        if (!uid || typeof uid !== "string") {
            return NextResponse.json({ error: "Missing uid" }, { status: 400 });
        }

        return await executeSecureDeletion(uid, req);

    } catch (error: any) {
        console.error("delete-user error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}

async function executeSecureDeletion(uid: string, req: NextRequest) {
    const auth = getAdminAuth();
    const db = getAdminDb();

    try {
        // Fetch user data for logging
        const userSnap = await db.ref(`users/${uid}`).get();
        if (!userSnap.exists()) {
             return NextResponse.json({ error: "User not found in database" }, { status: 404 });
        }
        const userData = userSnap.val();

        // 1. Remove from Firebase Authentication
        try {
            await auth.deleteUser(uid);
        } catch (authErr: any) {
            // If user doesn't exist in Auth, we should still proceed with DB cleanup
            if (authErr.code !== 'auth/user-not-found') {
                throw authErr;
            }
            console.warn(`[Delete] User ${uid} not found in Auth, but proceeding with DB cleanup.`);
        }

        // 2. Clear all RTDB paths
        const paths = [
            `users/${uid}`,
            `user_credits/${uid}`,
            `usage/${uid}`,
            `usage_stats/${uid}`,
            `documents/${uid}`,
            `credit_history/${uid}`,
            `tool_unlocks/${uid}`,
            `tool_usage/${uid}`,
            `credit_transactions/${uid}`,
            `notifications/${uid}`,
            `engagement/${uid}`,
            `fcmTokens/${uid}`,
            `leads/${uid}` // Also clear leads if they belong strictly to this user
        ];

        const updates: any = {};
        paths.forEach(p => updates[p] = null);
        
        // Add log entry
        const logId = `del_${Date.now()}_${uid}`;
        updates[`admin_logs/deletions/${logId}`] = {
            uid,
            email: userData.email || "N/A",
            name: userData.name || "N/A",
            deletedAt: Date.now(),
            adminEmail: "Unknown Admin", // Ideally we'd get this from the requester session
            status: "success"
        };

        await db.ref().update(updates);

        return NextResponse.json({ 
            success: true, 
            message: `Usuário ${userData.email} excluído permanentemente de todas as camadas.` 
        });

    } catch (error: any) {
        console.error("[Delete Process Failed]", error);
        
        return NextResponse.json({ 
            error: "Processo de exclusão falhou: " + error.message,
            details: "Alguns dados podem ter sido removidos, mas a exclusão completa falhou."
        }, { status: 500 });
    }
}
