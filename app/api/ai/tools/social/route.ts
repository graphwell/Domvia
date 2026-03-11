import { NextRequest, NextResponse } from "next/server";
import { generateSocialCaption } from "@/lib/ai";

export async function POST(req: NextRequest) {
    try {
        const { title, price, linkSlug, platform } = await req.json();
        const result = await generateSocialCaption({ title, price, linkSlug }, platform);
        return NextResponse.json({ result });
    } catch (error) {
        console.error("AI social tool error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
