import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
    try {
        const userId = req.headers.get("x-user-id");
        if (!userId) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const auth = getAdminAuth();
        const db = getAdminDb();

        // 1. Delete user data from Realtime Database
        // We delete their captures, leads, and usage logs
        const pathsToDelete = [
            `users/${userId}`,
            `captures/${userId}`,
            `leads/${userId}`,
            `usage/${userId}`,
            `notifications/${userId}`
        ];

        const deletePromises = pathsToDelete.map(path => 
            db.ref(path).remove()
        );

        await Promise.all(deletePromises);

        // 2. Delete user from Firebase Auth
        await auth.deleteUser(userId);

        return NextResponse.json({ success: true, message: "Conta e dados excluídos com sucesso." });
    } catch (error: any) {
        console.error("Account Deletion Error:", error);
        return NextResponse.json({ 
            error: "Erro ao excluir conta", 
            details: error.message 
        }, { status: 500 });
    }
}
