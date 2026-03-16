import { NextResponse } from "next/server";
import { getAdminDb, adminMessaging } from "@/lib/firebase-admin";

export async function POST(req: Request) {
    try {
        const alert = await req.json();
        
        // 1. Find all admins
        const db = getAdminDb();
        const usersRef = db.ref('users');
        const adminSnap = await usersRef.orderByChild('role').equalTo('admin').get();
        
        if (!adminSnap.exists()) {
            return NextResponse.json({ success: true, message: "No admins found" });
        }

        const admins = adminSnap.val();
        const tokens: string[] = [];

        Object.values(admins).forEach((u: any) => {
            if (u.fcmToken) tokens.push(u.fcmToken);
        });

        if (tokens.length === 0) {
            return NextResponse.json({ success: true, message: "No admin tokens found" });
        }

        // 2. Prepare multicast message
        const message = {
            notification: {
                title: `🚨 Alerta: Erro em ${alert.toolId}`,
                body: `${alert.userName || 'Usuário'} encontrou um erro: ${alert.message}`
            },
            data: {
                url: '/admin/alerts',
                alertId: alert.id || ''
            },
            tokens: tokens
        };

        // 3. Send
        const response = await adminMessaging.sendEachForMulticast(message);
        
        console.log(`[PushAlert] Sent ${response.successCount} messages, ${response.failureCount} failures.`);

        return NextResponse.json({ success: true, sent: response.successCount });
    } catch (error: any) {
        console.error("[PushAlert API Error]:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
