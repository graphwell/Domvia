import { calculateFinancing } from "@/lib/financing";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const input = await req.json();
        const result = calculateFinancing(input);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
}
