import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, lastName, phone, linkId, brokerName } = body;

        // Validação básica
        if (!name || !lastName || !phone) {
            return NextResponse.json(
                { error: "Dados incompletos" },
                { status: 400 }
            );
        }

        // Em produção, aqui salvaríamos no banco de dados (Prisma/Supabase/etc)
        console.log("=== NOVO LEAD REGISTRADO ===");
        console.log("Link ID:", linkId);
        console.log("Corretor:", brokerName);
        console.log("Lead:", name, lastName, "-", phone);
        console.log("Data:", new Date().toLocaleString());
        console.log("============================");

        return NextResponse.json({
            success: true,
            message: "Lead registrado com sucesso",
            leadId: `lead_${Date.now()}`
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
