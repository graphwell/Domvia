"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { rtdb } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import {
    Trophy, MessageSquare, FileText, Calculator,
    Link2, Camera, TrendingUp, Clock, AlertTriangle,
    UserCheck, Activity
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────
interface UsageStats {
    ai_chat_message?: number;
    ai_doc_generate?: number;
    ai_description_generate?: number;
    ai_title_generate?: number;
    ai_social_generate?: number;
    calculator_financing?: number;
    calculator_investment?: number;
    link_created?: number;
    lead_captured?: number;
    tour_created?: number;
    last_seen?: number;
}

interface UserBasic {
    name?: string;
    email?: string;
    plan?: string;
}

const FEATURE_KEYS: { key: keyof UsageStats; label: string; icon: React.ElementType; color: string }[] = [
    { key: "ai_chat_message", label: "IA Chat", icon: MessageSquare, color: "#6366f1" },
    { key: "ai_doc_generate", label: "Doc IA", icon: FileText, color: "#8b5cf6" },
    { key: "ai_description_generate", label: "Descrição", icon: TrendingUp, color: "#3b82f6" },
    { key: "ai_title_generate", label: "Títulos", icon: TrendingUp, color: "#0ea5e9" },
    { key: "ai_social_generate", label: "Social", icon: TrendingUp, color: "#06b6d4" },
    { key: "calculator_financing", label: "Simulador", icon: Calculator, color: "#10b981" },
    { key: "calculator_investment", label: "Investimento", icon: Calculator, color: "#14b8a6" },
    { key: "link_created", label: "Links", icon: Link2, color: "#f59e0b" },
    { key: "lead_captured", label: "Leads", icon: UserCheck, color: "#ef4444" },
    { key: "tour_created", label: "Tour 360°", icon: Camera, color: "#ec4899" },
];

function totalActions(stats: UsageStats) {
    return FEATURE_KEYS.reduce((s, { key }) => s + ((stats[key] as number) ?? 0), 0);
}

function daysSince(ts: number) {
    return Math.floor((Date.now() - ts) / 86400000);
}

// ─── Component ────────────────────────────────────────────────────
export default function AdminMetricsPage() {
    const [usageMap, setUsageMap] = useState<Record<string, UsageStats>>({});
    const [userMap, setUserMap] = useState<Record<string, UserBasic>>({});
    const [tab, setTab] = useState<"ranking" | "features" | "inactive">("ranking");

    useEffect(() => {
        const off1 = onValue(ref(rtdb, "usage_stats"), (s) => setUsageMap(s.val() ?? {}));
        const off2 = onValue(ref(rtdb, "users"), (s) => {
            const raw = s.val() ?? {};
            const mapped: Record<string, UserBasic> = {};
            for (const id in raw) mapped[id] = { name: raw[id].name, email: raw[id].email, plan: raw[id].plan };
            setUserMap(mapped);
        });
        return () => { off1(); off2(); };
    }, []);

    // ── Rankings ──────────────────────────────────────────────────
    const ranked = Object.entries(usageMap)
        .map(([id, stats]) => ({
            id,
            name: userMap[id]?.name ?? "Usuário",
            email: userMap[id]?.email ?? "",
            plan: userMap[id]?.plan ?? "Trial",
            total: totalActions(stats),
            lastSeen: stats.last_seen,
            stats,
        }))
        .sort((a, b) => b.total - a.total);

    // Max total for bar proportions
    const maxTotal = ranked[0]?.total ?? 1;

    // ── Feature totals ────────────────────────────────────────────
    const featureTotals = FEATURE_KEYS.map(({ key, label, color }) => ({
        label,
        color,
        value: Object.values(usageMap).reduce((s, st) => s + ((st[key] as number) ?? 0), 0),
    })).filter((f) => f.value > 0).sort((a, b) => b.value - a.value);

    // ── Inactive users ────────────────────────────────────────────
    const inactive = ranked.filter((u) => {
        if (!u.lastSeen) return true;
        return daysSince(u.lastSeen) >= 7;
    }).sort((a, b) => (a.lastSeen ?? 0) - (b.lastSeen ?? 0));

    // ── Summary numbers ───────────────────────────────────────────
    const totalAllActions = ranked.reduce((s, u) => s + u.total, 0);
    const activeToday = ranked.filter((u) => u.lastSeen && daysSince(u.lastSeen) === 0).length;
    const topFeature = featureTotals[0];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display text-2xl font-bold text-slate-900">Métricas de Uso</h1>
                <p className="text-slate-500 text-sm">Ranking, análise de uso por funcionalidade e usuários inativos</p>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Ações Totais", value: totalAllActions.toLocaleString("pt-BR"), icon: Activity, color: "text-indigo-600 bg-indigo-50" },
                    { label: "Usuários com Uso", value: ranked.length, icon: UserCheck, color: "text-emerald-600 bg-emerald-50" },
                    { label: "Ativos Hoje", value: activeToday, icon: TrendingUp, color: "text-blue-600 bg-blue-50" },
                    { label: "Inativos +7d", value: inactive.length, icon: AlertTriangle, color: "text-amber-600 bg-amber-50" },
                ].map((k) => (
                    <Card key={k.label} padding="md" className="border-slate-200">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${k.color}`}>
                            <k.icon className="h-5 w-5" />
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{k.label}</p>
                        <p className="text-2xl font-display font-black text-slate-900">{k.value}</p>
                    </Card>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 pb-0">
                {([
                    { id: "ranking", label: "🏆 Ranking de Usuários" },
                    { id: "features", label: "🔧 Uso por Funcionalidade" },
                    { id: "inactive", label: "😴 Inativos" },
                ] as const).map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors -mb-px ${tab === t.id ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── Ranking tab ── */}
            {tab === "ranking" && (
                <div className="space-y-4">
                    {ranked.slice(0, 50).map((u, i) => (
                        <Card key={u.id} padding="md" className="border-slate-200 hover:border-indigo-200 transition-colors">
                            <div className="flex items-center gap-4">
                                {/* Rank */}
                                <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-display font-black text-lg shrink-0 ${i === 0 ? "bg-amber-100 text-amber-600" :
                                        i === 1 ? "bg-slate-100 text-slate-600" :
                                            i === 2 ? "bg-orange-100 text-orange-600" :
                                                "bg-slate-50 text-slate-400"
                                    }`}>
                                    {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                                </div>
                                {/* User */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-bold text-slate-900 truncate">{u.name}</p>
                                        <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full font-semibold shrink-0">{u.plan}</span>
                                    </div>
                                    {/* Usage bar */}
                                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-1">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                            style={{ width: `${Math.min(100, (u.total / maxTotal) * 100)}%` }}
                                        />
                                    </div>
                                    {/* Feature breakdown mini */}
                                    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                                        {FEATURE_KEYS.filter(({ key }) => (u.stats[key] ?? 0) > 0).map(({ key, label }) => (
                                            <span key={key} className="text-[10px] text-slate-400">
                                                {label}: <strong className="text-slate-600">{u.stats[key]}</strong>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {/* Total */}
                                <div className="text-right shrink-0">
                                    <p className="text-lg font-display font-black text-slate-900">{u.total.toLocaleString("pt-BR")}</p>
                                    <p className="text-[10px] text-slate-400">ações</p>
                                    {u.lastSeen && (
                                        <p className={`text-[10px] font-medium mt-0.5 ${daysSince(u.lastSeen) >= 7 ? "text-amber-500" : "text-slate-400"}`}>
                                            {daysSince(u.lastSeen) === 0 ? "Hoje" : `${daysSince(u.lastSeen)}d atrás`}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                    {ranked.length === 0 && (
                        <div className="py-16 text-center text-slate-400">
                            <Activity className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p>Nenhum dado de uso registrado ainda</p>
                        </div>
                    )}
                </div>
            )}

            {/* ── Features tab ── */}
            {tab === "features" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card padding="lg" className="border-slate-200">
                        <h3 className="font-display font-bold text-slate-900 mb-6">Total de Usos por Funcionalidade</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={featureTotals} layout="vertical" margin={{ left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={80} />
                                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                                        {featureTotals.map((entry, i) => (
                                            <Cell key={`cell-${i}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card padding="lg" className="border-slate-200">
                        <h3 className="font-display font-bold text-slate-900 mb-6">Distribuição de Uso</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={featureTotals}
                                        dataKey="value"
                                        nameKey="label"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={90}
                                        innerRadius={50}
                                    >
                                        {featureTotals.map((entry, i) => (
                                            <Cell key={`pie-${i}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Feature stat cards */}
                    <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {featureTotals.map((f) => (
                            <Card key={f.label} padding="sm" className="border-slate-200 text-center">
                                <div className="h-8 w-8 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: `${f.color}20` }}>
                                    <div className="h-3 w-3 rounded-full" style={{ background: f.color }} />
                                </div>
                                <p className="text-xs text-slate-500 font-medium">{f.label}</p>
                                <p className="text-xl font-display font-black text-slate-900">{f.value.toLocaleString("pt-BR")}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Inactive tab ── */}
            {tab === "inactive" && (
                <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-amber-800">{inactive.length} usuários inativos há 7+ dias</p>
                            <p className="text-xs text-amber-600">Considere enviar lembretes ou novidades para reengajamento</p>
                        </div>
                    </div>

                    <Card padding="none" className="border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plano</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Último Uso</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Ações</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {inactive.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-bold text-slate-900">{u.name}</p>
                                            <p className="text-[11px] text-slate-400">{u.email}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">{u.plan}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5 text-amber-500" />
                                                <span className={`text-xs font-medium ${!u.lastSeen ? "text-red-500" : "text-amber-600"}`}>
                                                    {u.lastSeen ? `${daysSince(u.lastSeen)} dias atrás` : "Nunca usou"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-bold text-slate-700">{u.total.toLocaleString("pt-BR")}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <a
                                                href={`mailto:${u.email}?subject=Novidades na Domvia!&body=Olá ${u.name}! Sentimos sua falta. Temos novidades que vão facilitar sua rotina. Acesse domvia.ai e descubra!`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
                                            >
                                                Enviar e-mail
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                                {inactive.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                                            🎉 Nenhum usuário inativo! Todos estão usando a plataforma.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </Card>
                </div>
            )}
        </div>
    );
}
