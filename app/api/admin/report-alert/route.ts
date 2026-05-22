import { NextResponse } from "next/server";
import { getAdminDb, adminMessaging } from "@/lib/firebase-admin";

export async function POST(req: Request) {
    try {
        const alert = await req.json();

        const db = getAdminDb();

        // 1. Persist alert via Admin SDK — bypasses RTDB security rules entirely
        const newRef = db.ref("admin/alerts").push();
        await newRef.set({
            ...alert,
            timestamp: Date.now(),
            read: false,
        });

        // 2. Find admin FCM tokens and send push (non-blocking)
        const [adminSnap, masterSnap] = await Promise.all([
            db.ref("users").orderByChild("role").equalTo("ADMIN").get(),
            db.ref("users").orderByChild("role").equalTo("ADMIN_MASTER").get(),
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

        if (tokens.length > 0) {
            adminMessaging
                .sendEachForMulticast({
                    notification: {
                        title: `🚨 Alerta: Erro em ${alert.toolId}`,
                        body: `${alert.userName || "Usuário"} encontrou um erro: ${alert.message}`,
                    },
                    data: { url: "/admin/alerts", alertId: newRef.key ?? "" },
                    tokens,
                })
                .catch((err: any) => console.error("[ReportAlert] Push FCM falhou:", err));
        }

        return NextResponse.json({ success: true, alertId: newRef.key });
    } catch (error: any) {
        console.error("[ReportAlert] ERRO:", error?.message, error?.stack);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
