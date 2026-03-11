import { NextRequest, NextResponse } from "next/server";
import { rtdb } from "@/lib/firebase";
import { ref, push, set, get } from "firebase/database";

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

// POST /api/leads — registra uma nova visita/lead
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
        return NextResponse.json({ id: newLeadRef.key, ...newLead }, { status: 201 });
    } catch (err: any) {
        console.error("Erro ao registrar lead:", err);
        return NextResponse.json({ error: "Falha ao registrar lead." }, { status: 400 });
    }
}
