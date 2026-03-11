"use server";

import { generateTourStructureWithAI, AITourGraph } from "@/lib/ai";

export async function generateTourAction(images: { id: string; name: string; url: string; }[]): Promise<AITourGraph> {
    return generateTourStructureWithAI(images);
}
