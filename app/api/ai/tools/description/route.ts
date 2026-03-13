import { NextRequest, NextResponse } from "next/server";
import { generateLinkDescription } from "@/lib/ai";
import { checkAndConsumeCreditsAdmin } from "@/lib/billing-server";

export async function POST(req: NextRequest) {
    try {
        const userId = req.headers.get("x-user-id");
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { title, price, description } = await req.json();

        // Check credits
        const creditCheck = await checkAndConsumeCreditsAdmin(userId, 'description_gen');
        if (!creditCheck.success) {
            return NextResponse.json({ error: "Insufficient credits", reason: creditCheck.reason }, { status: 402 });
        }

        const result = await generateLinkDescription({ title, price, description });
        return NextResponse.json({ result });
    } catch (error) {
        console.error("AI description tool error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
