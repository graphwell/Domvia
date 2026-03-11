"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/auth-provider";
import { rtdb } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import type { Lead } from "@/types";
import { LeadsList } from "@/components/leads/LeadsList";
import { Loader2 } from "lucide-react";

export default function LeadsPage() {
    const { user } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const leadsRef = ref(rtdb, "leads");
        const unsubscribe = onValue(leadsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Get all links for this user first to filter leads
                const list: Lead[] = Object.entries(data)
                    .map(([id, val]: [string, any]) => ({ id, ...val }))
                    .filter((l: any) => l.userId === user.id || !l.userId) // support legacy leads
                    .sort((a: any, b: any) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                setLeads(list);
            } else {
                setLeads([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
                <p className="text-slate-500 text-sm">Carregando seus leads...</p>
            </div>
        );
    }

    return <LeadsList leads={leads} />;
}
