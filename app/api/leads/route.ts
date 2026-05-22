import { NextRequest, NextResponse } from "next/server";
import { rtdb } from "@/lib/firebase";
import { ref, push, set, get } from "firebase/database";
import { getAdminDb, adminMessaging } from "@/lib/firebase-admin";

// GET /api/leads — retorna todos os leads (usado pelo admin)
export async function GET() {
    try {
        const leadsRef = ref(rtdb, "leads");
        const snapshot = await get(leadsRef);
        if (!snapshot.exists()) return NextResponse.json([]);

        const data = snapshot.val();
        const leads = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));
        return NextResponse.json(leads);
    } catch (err: any) {
        return NextResponse.json({ error: "Falha ao buscar leads." }, { status: 500 });
    }
}

// POST /api/leads — registra nova visita/lead e notifica o corretor
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const leadsRef = ref(rtdb, "leads");
        const newLeadRef = push(leadsRef);

        const newLead = {
            status: "new",
            timeOnPage: 0,
            usedCalculator: false,
            usedChat: false,
            questions: [],
            createdAt: new Date().toISOString(),
            ...body,
        };

        await set(newLeadRef, newLead);

        // Notificar corretor de forma assíncrona (não bloqueia a resposta)
        notifyCorretor(body.userId, newLead).catch((err) =>
            console.error("[Leads] Falha ao notificar corretor:", err)
        );

        return NextResponse.json({ id: newLeadRef.key, ...newLead }, { status: 201 });
    } catch (err: any) {
        console.error("Erro ao registrar lead:", err);
        return NextResponse.json({ error: "Falha ao registrar lead." }, { status: 400 });
    }
}

async function notifyCorretor(userId: string, lead: any) {
    if (!userId) return;

    const db = getAdminDb();
    const userSnap = await db.ref(`users/${userId}`).get();
    if (!userSnap.exists()) return;

    const user = userSnap.val();
    const leadName = `${lead.name ?? ""} ${lead.lastName ?? ""}`.trim() || "Cliente";
    const title = "🏠 Novo Lead Captado!";
    const message = `${leadName} (${lead.phone ?? "sem tel."}) tem interesse em: ${lead.linkTitle ?? "seu anúncio"}`;

    // Notificação interna no RTDB
    await db.ref(`users/${userId}/notifications`).push().set({
        title,
        message,
        type: "lead",
        timestamp: Date.now(),
        read: false,
        leadPhone: lead.phone ?? "",
        leadName,
        linkTitle: lead.linkTitle ?? "",
    });

    // Push FCM se o corretor tiver token
    if (user.fcmToken) {
        await adminMessaging.sendEachForMulticast({
            notification: { title, body: message },
            data: { url: "/leads", phone: lead.phone ?? "" },
            tokens: [user.fcmToken],
        });
    }
}
