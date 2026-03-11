import { NextRequest, NextResponse } from "next/server";
import { rtdb } from "@/lib/firebase";
import { ref, push, set, get } from "firebase/database";

// GET /api/links
export async function GET() {
    try {
        const linksRef = ref(rtdb, "links");
        const snapshot = await get(linksRef);
        if (!snapshot.exists()) return NextResponse.json([]);

        const data = snapshot.val();
        const links = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));
        return NextResponse.json(links);
    } catch (err: any) {
        return NextResponse.json({ error: "Falha ao buscar links." }, { status: 500 });
    }
}

// POST /api/links — cria um novo link (legacy endpoint, preferir salvar direto no RTDB)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const linksRef = ref(rtdb, "links");
        const newLinkRef = push(linksRef);
        const now = new Date().toISOString();

        const newLink = {
            visits: 0,
            aiQuestions: 0,
            simulations: 0,
            status: "active",
            createdAt: now,
            updatedAt: now,
            ...body,
        };

        await set(newLinkRef, newLink);
        return NextResponse.json({ id: newLinkRef.key, ...newLink }, { status: 201 });
    } catch (err: any) {
        console.error("Erro ao criar link:", err);
        return NextResponse.json({ error: "Falha ao criar link." }, { status: 400 });
    }
}
