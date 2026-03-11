import { NextRequest, NextResponse } from "next/server";
import { MOCK_LINKS } from "@/lib/mock-data";

// Kept for backward compat — now returns links, not properties
export async function GET() {
    return NextResponse.json(MOCK_LINKS);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        return NextResponse.json({ id: `link_${Date.now()}`, ...body }, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed" }, { status: 400 });
    }
}
