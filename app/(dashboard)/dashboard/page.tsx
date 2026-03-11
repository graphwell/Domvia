"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/auth-provider";
import { useLanguage } from "@/hooks/use-language";
import { rtdb } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import type { DashboardStats, Lead, CampaignLink } from "@/types";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { Loader2 } from "lucide-react";

// Generate last-7-days chart data from real leads
function buildChartData(leads: Lead[], links: CampaignLink[], days: string[]) {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        const dayStr = d.toISOString().slice(0, 10);
        const dayLeads = leads.filter((l) => l.createdAt?.startsWith(dayStr)).length;
        const dayViews = links.reduce((sum, l) => sum + (l.visits || 0), 0);
        return { day: days[d.getDay()], leads: dayLeads, views: Math.round(dayViews / 7) };
    });
}

export default function DashboardPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [links, setLinks] = useState<CampaignLink[]>([]);
    const [captures, setCaptures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        let leadsLoaded = false;
        let linksLoaded = false;
        let capturesLoaded = false;

        const checkDone = () => {
            if (leadsLoaded && linksLoaded && capturesLoaded) setLoading(false);
        };

        const leadsUnsub = onValue(ref(rtdb, "leads"), (snap) => {
            const data = snap.val();
            if (data) {
                setLeads(
                    Object.entries(data)
                        .map(([id, v]: [string, any]) => ({ id, ...v }))
                        .filter((l: any) => l.userId === user.id || !l.userId)
                );
            } else {
                setLeads([]);
            }
            leadsLoaded = true;
            checkDone();
        });

        const linksUnsub = onValue(ref(rtdb, "links"), (snap) => {
            const data = snap.val();
            if (data) {
                setLinks(
                    Object.entries(data)
                        .map(([id, v]: [string, any]) => ({ id, ...v }))
                        .filter((l: any) => l.userId === user.id)
                        .sort((a: any, b: any) =>
                            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        )
                );
            } else {
                setLinks([]);
            }
            linksLoaded = true;
            checkDone();
        });

        const capturesUnsub = onValue(ref(rtdb, `captures/${user.id}`), (snap) => {
            const data = snap.val();
            if (data) {
                setCaptures(Object.entries(data).map(([id, v]: [string, any]) => ({ id, ...v })));
            } else {
                setCaptures([]);
            }
            capturesLoaded = true;
            checkDone();
        });

        return () => {
            leadsUnsub();
            linksUnsub();
            capturesUnsub();
        };
    }, [user]);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
                <p className="text-slate-500 text-sm">{t("dashboard.loading")}</p>
            </div>
        );
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const stats: DashboardStats = {
        totalLinks: links.length,
        totalLeads: leads.length,
        leadsThisWeek: leads.filter((l) => new Date(l.createdAt) > oneWeekAgo).length,
        totalSimulations: leads.filter((l) => l.usedCalculator).length,
        totalAIQuestions: leads.reduce((sum, l) => sum + (l.questions?.length ?? 0), 0),
        totalCaptures: captures.length,
    };

    const recentLeads = [...leads]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    const chartDays = t("dashboard.chart.days") as unknown as string[];
    const chartData = buildChartData(leads, links, chartDays);

    return (
        <DashboardOverview
            user={user}
            stats={stats}
            recentLeads={recentLeads}
            links={links}
            chartData={chartData}
        />
    );
}
