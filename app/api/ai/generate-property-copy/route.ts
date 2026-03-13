import { NextRequest, NextResponse } from "next/server";
import { generatePropertyLandingCopy } from "@/lib/ai";

export async function POST(req: NextRequest) {
    try {
        const { title, price, language } = await req.json();

        if (!title) {
            return NextResponse.json({ error: "Missing title" }, { status: 400 });
        }

        const copy = await generatePropertyLandingCopy({ title, price }, language || "pt");

        return NextResponse.json(copy);
    } catch (error) {
        console.error("Generate property copy error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
