import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { rtdb } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { LeadConversionPage } from "@/components/lead/LeadConversionPage";
import type { CampaignLink } from "@/types";

interface Props {
    params: Promise<{ linkId: string }>;
}

async function getLinkBySlug(slug: string): Promise<CampaignLink | null> {
    try {
        const linksRef = ref(rtdb, "links");
        const snapshot = await get(linksRef);
        if (!snapshot.exists()) return null;

        const data = snapshot.val();
        const entries = Object.entries(data) as [string, any][];
        const found = entries.find(([, val]) => val.slug === slug || val.id === slug);
        if (!found) return null;

        return { id: found[0], ...found[1] } as CampaignLink;
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { linkId } = await params;
    const link = await getLinkBySlug(linkId);
    if (!link) return { title: "Link não encontrado" };
    return {
        title: link.title,
        description: link.description ?? "Fale com o corretor e simule seu financiamento.",
    };
}

export default async function LeadPage({ params }: Props) {
    const { linkId } = await params;
    const link = await getLinkBySlug(linkId);
    if (!link) notFound();
    return <LeadConversionPage link={link} />;
}
