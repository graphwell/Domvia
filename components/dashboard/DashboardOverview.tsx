"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/hooks/use-language";
import { formatCurrency, formatRelativeDate, cn } from "@/lib/utils";
import type { DashboardStats, Lead, CampaignLink } from "@/types";
import type { User } from "@/hooks/auth-provider";
import {
    Link2, Users, Calculator, MessageSquare, TrendingUp,
    Eye, Plus, ArrowRight, Coins, Copy, CheckCheck, Gift, Camera
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    AreaChart, Area, BarChart, Bar
} from "recharts";
import { toast } from "sonner";
import { triggerHaptic } from "@/lib/haptic";

interface DashboardOverviewProps {
    user: User | null;
    stats: DashboardStats;
    recentLeads: Lead[];
    links: CampaignLink[];
    chartData: Array<{ day: string; leads: number; views: number }>;
    captures: any[];
}

import { RotaryPhrases } from "./RotaryPhrases";
import { SmartSuggestions } from "./SmartSuggestions";

export function DashboardOverview({ user, stats, recentLeads, links, chartData, captures }: DashboardOverviewProps) {
    const { t, language } = useLanguage();
    const [copied, setCopied] = useState<string | null>(null);
    const [activeChart, setActiveChart] = useState(0);
    const [capturesView, setCapturesView] = useState<'day' | 'month'>('day');

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveChart((prev) => (prev === 0 ? 1 : 0));
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    // Generate real captures data
    const capturesData = capturesView === 'day' 
        ? Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dayStr = d.toISOString().slice(0, 10);
            const count = captures.filter(c => {
                const cDate = new Date(c.timestamp).toISOString().slice(0, 10);
                return cDate === dayStr;
            }).length;
            
            // Get day name (shortened)
            const dayNames = t("dashboard.chart.days") as unknown as string[];
            return { label: dayNames[d.getDay()], count };
        })
        : Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            const month = d.getMonth();
            const year = d.getFullYear();
            const count = captures.filter(c => {
                const cDate = new Date(c.timestamp);
                return cDate.getMonth() === month && cDate.getFullYear() === year;
            }).length;
            
            const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
            return { label: monthNames[month], count };
        });

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://domvia.ai";

    const copyLink = (slug: string) => {
        navigator.clipboard.writeText(`${baseUrl}/lead/${slug}`);
        setCopied(slug);
        setTimeout(() => setCopied(null), 2000);
    };

    const statCards = [
        { label: t("dashboard.stats.links"), value: stats.totalLinks, icon: Link2, color: "text-brand-600 bg-brand-50", href: "/links" },
        { label: t("dashboard.stats.leads"), value: stats.totalLeads, icon: Users, color: "text-emerald-600 bg-emerald-50", href: "/leads" },
        { label: t("dashboard.stats.simulations"), value: stats.totalSimulations, icon: Calculator, color: "text-purple-600 bg-purple-50", href: "/leads" },
        { label: t("dashboard.stats.captures"), value: stats.totalCaptures || 0, icon: Camera, color: "text-blue-600 bg-blue-50", href: "/tools/captacao" },
    ];


    useEffect(() => {
        // Trigger welcome notification if it's a new user and hasn't been shown in this session
        if (stats.totalLinks === 0 && !sessionStorage.getItem('welcome_notified')) {
            toast.success("Bem-vindo ao Domvia! ✨", {
                description: "Estamos felizes em ter você aqui. Comece criando seu primeiro link!",
                duration: 6000
            });
            sessionStorage.setItem('welcome_notified', 'true');
        }
    }, [stats.totalLinks]);

    return (
        <div className="space-y-6">
            {/* Page header & Rotary Phrases */}
            <div className="text-center pt-2">
                <RotaryPhrases />
            </div>

            {/* Compact Stat Cards - 2x2 Grid on Mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {statCards.map((s) => (
                    <Link key={s.label} href={s.href} className="w-full">
                        <Card hover padding="none" className="h-full py-4 px-3 flex flex-col items-center justify-center text-center">
                            <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg mb-2 ${s.color}`}>
                                <s.icon className="h-4 w-4" />
                            </div>
                            <p className="font-display text-xl font-black text-slate-900 leading-none">{s.value}</p>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-1.5">{s.label}</p>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Referral Banner - Matched with SmartSuggestions style */}
            <Card hover padding="none" className="overflow-hidden border-brand-100 bg-gradient-to-r from-brand-50/50 to-transparent">
                <Link href="/referrals" className="flex items-center gap-4 p-4 group">
                    <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                        <Gift className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Gift className="h-3 w-3 text-brand-500" />
                            <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Indique e Ganhe</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                            {t("dashboard.referral_banner.title")}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            {t("dashboard.referral_banner.desc")}
                        </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                </Link>
            </Card>

            {/* Smart Suggestions */}
            <SmartSuggestions />

            {/* Chart + Leads */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3" padding="none">
                    <div className="p-4 flex items-center justify-between border-b border-slate-100/60">
                        <h3 className="font-display font-bold text-slate-800 tracking-tight uppercase text-[10px]">Análise de Performance</h3>
                        <div className="flex gap-1">
                            <div className={cn("h-1.5 w-1.5 rounded-full transition-all", activeChart === 0 ? "bg-brand-600 w-4" : "bg-slate-200")} />
                            <div className={cn("h-1.5 w-1.5 rounded-full transition-all", activeChart === 1 ? "bg-brand-600 w-4" : "bg-slate-200")} />
                        </div>
                    </div>
                    
                    <div className="p-4 h-[250px] relative overflow-hidden group">
                        <div className={cn("absolute inset-0 p-4 transition-all duration-700 flex flex-col", activeChart === 0 ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none")}>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Leads vs Visitas</p>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2057f5" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#2057f5" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="leads" name="Leads" stroke="#2057f5" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                                    <Area type="monotone" dataKey="views" name="Visitas" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className={cn("absolute inset-0 p-4 transition-all duration-700 flex flex-col", activeChart === 1 ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none")}>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Captações de Imóveis</p>
                                <div className="flex bg-slate-100 rounded-lg p-0.5">
                                    <button 
                                        onClick={() => setCapturesView('day')}
                                        className={cn("text-[9px] px-2 py-1 rounded-md transition-all", capturesView === 'day' ? "bg-white text-brand-700 shadow-sm" : "text-slate-500")}
                                    >Dia</button>
                                    <button 
                                        onClick={() => setCapturesView('month')}
                                        className={cn("text-[9px] px-2 py-1 rounded-md transition-all", capturesView === 'month' ? "bg-white text-brand-700 shadow-sm" : "text-slate-500")}
                                    >Mês</button>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={capturesData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                    <Tooltip 
                                        cursor={{fill: '#f8fafc'}}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="count" name="Captações" fill="#2057f5" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
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
                                        <button 
                                            onClick={() => { copyLink(link.slug); triggerHaptic('medium'); }} 
                                            className="text-slate-400 hover:text-brand-600"
                                        >
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
