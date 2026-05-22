import { NextResponse } from "next/server";
import { getAdminDb, adminMessaging } from "@/lib/firebase-admin";

export async function POST(req: Request) {
    try {
        const alert = await req.json();

        const db = getAdminDb();
        const usersRef = db.ref("users");

        // Query both ADMIN and ADMIN_MASTER roles
        const [adminSnap, masterSnap] = await Promise.all([
            usersRef.orderByChild("role").equalTo("ADMIN").get(),
            usersRef.orderByChild("role").equalTo("ADMIN_MASTER").get(),
        ]);

        const tokens: string[] = [];

        const collectTokens = (snap: any) => {
            if (!snap.exists()) return;
            Object.values(snap.val() as Record<string, any>).forEach((u: any) => {
                if (u.fcmToken) tokens.push(u.fcmToken);
            });
        };

        collectTokens(adminSnap);
        collectTokens(masterSnap);

        if (tokens.length === 0) {
            console.log("[PushAlert] Nenhum token de admin encontrado.");
            return NextResponse.json({ success: true, message: "No admin tokens found" });
        }

        const message = {
            notification: {
                title: `🚨 Alerta: Erro em ${alert.toolId}`,
                body: `${alert.userName || "Usuário"} encontrou um erro: ${alert.message}`,
            },
            data: {
                url: "/admin/alerts",
                alertId: alert.id || "",
            },
            tokens,
        };

        const response = await adminMessaging.sendEachForMulticast(message);
        console.log(`[PushAlert] Enviado: ${response.successCount} ok, ${response.failureCount} falhas.`);

        return NextResponse.json({ success: true, sent: response.successCount });
    } catch (error: any) {
        console.error("[PushAlert] ERRO:", error?.message, error?.stack);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
