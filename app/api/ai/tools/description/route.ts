import { NextRequest, NextResponse } from "next/server";
import { generateLinkDescription } from "@/lib/ai";

export async function POST(req: NextRequest) {
    try {
        const { title, price, description } = await req.json();
        const result = await generateLinkDescription({ title, price, description });
        return NextResponse.json({ result });
    } catch (error) {
        console.error("AI description tool error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
