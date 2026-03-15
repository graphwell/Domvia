import { NextResponse } from "next/server";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
}

export async function POST(req: Request) {
    try {
        const { userId, title, body, data } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // 1. Get user's FCM token from RTDB
        const userSnap = await admin.database().ref(`users/${userId}/fcmToken`).get();
        const fcmToken = userSnap.val();

        if (!fcmToken) {
            console.error(`[Push] No FCM token found for user ${userId}`);
            return NextResponse.json({ error: "User has no push token registered" }, { status: 404 });
        }

        // 2. Send push via FCM
        const message = {
            notification: {
                title: title || "Domvia ✨",
                body: body || "Você tem uma nova mensagem estratégica!",
            },
            data: {
                ...data,
                click_action: "FLUTTER_NOTIFICATION_CLICK", // For some older mobile implementations
            },
            token: fcmToken,
        };

        const response = await admin.messaging().send(message);
        console.log("[Push] Successfully sent message:", response);

        return NextResponse.json({ success: true, messageId: response });
    } catch (error: any) {
        console.error("[Push] Error sending FCM message:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
