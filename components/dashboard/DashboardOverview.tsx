"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/hooks/use-language";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import type { DashboardStats, Lead, CampaignLink } from "@/types";
import type { User } from "@/hooks/auth-provider";
import {
    Link2, Users, Calculator, MessageSquare, TrendingUp,
    Eye, Plus, ArrowRight, Coins, Copy, CheckCheck, Gift, Camera
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

interface DashboardOverviewProps {
    user: User | null;
    stats: DashboardStats;
    recentLeads: Lead[];
    links: CampaignLink[];
    chartData: Array<{ day: string; leads: number; views: number }>;
}

export function DashboardOverview({ user, stats, recentLeads, links, chartData }: DashboardOverviewProps) {
    const { t, language } = useLanguage();
    const [copied, setCopied] = useState<string | null>(null);

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://domvia.ai";

    const copyLink = (slug: string) => {
        navigator.clipboard.writeText(`${baseUrl}/lead/${slug}`);
        setCopied(slug);
        setTimeout(() => setCopied(null), 2000);
    };

    const statCards = [
        { label: t("dashboard.stats.links"), value: stats.totalLinks, icon: Link2, color: "text-brand-600 bg-brand-50", href: "/links" },
        {
            label: t("dashboard.stats.leads"),
            value: stats.totalLeads,
            icon: Users,
            color: "text-emerald-600 bg-emerald-50",
            href: "/leads",
            trend: language === "en" ? `+${stats.leadsThisWeek} this week` : language === "es" ? `+${stats.leadsThisWeek} esta semana` : `+${stats.leadsThisWeek} esta semana`
        },
        { label: t("dashboard.stats.simulations"), value: stats.totalSimulations, icon: Calculator, color: "text-purple-600 bg-purple-50", href: "/leads" },
        { label: "Captações", value: stats.totalCaptures || 0, icon: Camera, color: "text-brand-600 bg-brand-50", href: "/tools/captacao" },
    ];

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">{t("dashboard.title")}</h1>
                    <p className="text-slate-500 text-sm mt-1">{t("dashboard.welcome")}</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/links/new">
                        <Button leftIcon={<Plus className="h-4 w-4" />}>{t("dashboard.btn_new")}</Button>
                    </Link>
                </div>
            </div>

            {/* Dashboard Stats */}

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((s) => (
                    <Link key={s.label} href={s.href}>
                        <Card hover padding="md" className="h-full">
                            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl mb-3 ${s.color}`}>
                                <s.icon className="h-5 w-5" />
                            </div>
                            <p className="font-display text-2xl sm:text-3xl font-black text-slate-900">{s.value}</p>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{s.label}</p>
                            {s.trend && (
                                <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" /> {s.trend}
                                </p>
                            )}
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Chart + Leads */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3" padding="md">
                    <h3 className="font-display font-bold text-slate-800 mb-4">{t("dashboard.chart.title")}</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                            <Legend />
                            <Line type="monotone" dataKey="leads" name={t("dashboard.chart.leads")} stroke="#2057f5" strokeWidth={2.5} dot={false} />
                            <Line type="monotone" dataKey="views" name={t("dashboard.chart.views")} stroke="#a78bfa" strokeWidth={2.5} dot={false} strokeDasharray="5 5" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                <Card className="lg:col-span-2" padding="md">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display font-bold text-slate-800">{t("dashboard.recent_leads.title")}</h3>
                        <Link href="/leads" className="text-xs text-brand-600 font-medium hover:text-brand-700 flex items-center gap-1">
                            {t("dashboard.recent_leads.view_all")} <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentLeads.map((lead) => (
                            <div key={lead.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{lead.name ?? (language === "en" ? "Visitor" : language === "es" ? "Visitante" : "Visitante")}</p>
                                    <p className="text-xs text-slate-400 truncate max-w-[140px]">{lead.linkTitle}</p>
                                </div>
                                <div className="text-right">
                                    <Badge variant={lead.status === "new" ? "brand" : lead.status === "qualified" ? "success" : "warning"} dot className="text-[10px]">
                                        {lead.status === "new"
                                            ? (language === "en" ? "New" : language === "es" ? "Nuevo" : "Novo")
                                            : lead.status === "qualified"
                                                ? (language === "en" ? "Qualified" : language === "es" ? "Calificado" : "Qualificado")
                                                : (language === "en" ? "Contacted" : language === "es" ? "Contactado" : "Contatado")}
                                    </Badge>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{formatRelativeDate(lead.createdAt, language)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Links quick view */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-xl font-bold text-slate-900">{t("dashboard.active_links.title")}</h2>
                    <Link href="/links">
                        <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>{t("dashboard.active_links.view_all")}</Button>
                    </Link>
                </div>
                <div className="space-y-3">
                    {links.slice(0, 3).map((link) => (
                        <Card key={link.id} hover padding="md">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
                                    <Link2 className="h-5 w-5 text-brand-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-900 truncate">{link.title}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <code className="text-xs text-slate-400 font-mono">/lead/{link.slug}</code>
                                        <button onClick={() => copyLink(link.slug)} className="text-slate-400 hover:text-brand-600">
                                            {copied === link.slug ? <CheckCheck className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-3 text-xs text-slate-500 shrink-0">
                                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{link.visits}</span>
                                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-brand-400" />{link.aiQuestions}</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
