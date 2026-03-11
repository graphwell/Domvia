"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/auth-provider";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, push, set, remove, query, orderByChild, equalTo } from "firebase/database";
import type { CampaignLink } from "@/types";
import { LinksList } from "@/components/links/LinksList";
import { Loader2 } from "lucide-react";

export default function LinksPage() {
    const { user } = useAuth();
    const [links, setLinks] = useState<CampaignLink[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const linksRef = ref(rtdb, "links");
        const unsubscribe = onValue(linksRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list: CampaignLink[] = Object.entries(data)
                    .map(([id, val]: [string, any]) => ({ id, ...val }))
                    .filter((l: any) => l.userId === user.id)
                    .sort((a: any, b: any) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                setLinks(list);
            } else {
                setLinks([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
                <p className="text-slate-500 text-sm">Carregando seus links...</p>
            </div>
        );
    }

    return <LinksList links={links} />;
}
