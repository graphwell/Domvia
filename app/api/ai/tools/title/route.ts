import { NextRequest, NextResponse } from "next/server";
import { generateTitleSuggestions } from "@/lib/ai";

export async function POST(req: NextRequest) {
    try {
        const { title } = await req.json();
        const result = await generateTitleSuggestions({ title });
        return NextResponse.json({ result });
    } catch (error) {
        console.error("AI title tool error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
