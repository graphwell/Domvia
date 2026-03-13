import { NextRequest, NextResponse } from "next/server";
import { generateTitleSuggestions } from "@/lib/ai";
import { checkAndConsumeCreditsAdmin } from "@/lib/billing-server";

export async function POST(req: NextRequest) {
    try {
        const userId = req.headers.get("x-user-id");
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { title } = await req.json();

        // Check credits
        const creditCheck = await checkAndConsumeCreditsAdmin(userId, 'title_gen');
        if (!creditCheck.success) {
            return NextResponse.json({ error: "Insufficient credits", reason: creditCheck.reason }, { status: 402 });
        }

        const result = await generateTitleSuggestions({ title });
        return NextResponse.json({ result });
    } catch (error) {
        console.error("AI title tool error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
