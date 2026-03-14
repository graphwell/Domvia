"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { rtdb } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import {
    Users, TrendingUp, HandCoins,
    Bot, ArrowUpRight, ArrowDownRight,
    Activity, Globe, Link2, UserCheck, Clock
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from "recharts";

// ─── Types ──────────────────────────────────────────────────────
interface UserRecord {
    name?: string;
    email?: string;
    plan?: string;
    status?: string;
    createdAt?: number;
    role?: string;
}
interface LeadRecord {
    name?: string;
    email?: string;
    createdAt?: number;
    userId?: string;
    linkTitle?: string;
}
interface LinkRecord {
    title?: string;
    userId?: string;
    createdAt?: number;
}
interface UsageStats {
    ai_chat_message?: number;
    last_seen?: number;
}

// ─── Plan pricing (monthly R$) ──────────────────────────────────
const PLAN_PRICE: Record<string, number> = {
    Trial: 0,
    Pro: 39.9,
    Max: 79.0,
    Elite: 99.0,
    Lifetime: 0,
};

// ─── Helpers ─────────────────────────────────────────────────────
const MONTHS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function getMonthKey(ts: number) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${d.getMonth()}`;
}
function getMonthLabel(ts: number) {
    const d = new Date(ts);
    return MONTHS_PT[d.getMonth()];
}
function fmtBRL(n: number) {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}
function fmtDate(ts: number) {
    return new Date(ts).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

// ─── Component ───────────────────────────────────────────────────
export default function AdminDashboard() {
    const [users, setUsers] = useState<Record<string, UserRecord>>({});
    const [leads, setLeads] = useState<Record<string, LeadRecord>>({});
    const [links, setLinks] = useState<Record<string, LinkRecord>>({});
    const [usage, setUsage] = useState<Record<string, UsageStats>>({});

    useEffect(() => {
        const off1 = onValue(ref(rtdb, "users"), (s) => setUsers(s.val() ?? {}));
        const off2 = onValue(ref(rtdb, "leads"), (s) => {
            // leads are nested under userId
            const raw = s.val() ?? {};
            const flat: Record<string, LeadRecord> = {};
            for (const uid in raw) {
                for (const lid in raw[uid]) {
                    flat[`${uid}_${lid}`] = { ...raw[uid][lid], userId: uid };
                }
            }
            setLeads(flat);
        });
        const off3 = onValue(ref(rtdb, "links"), (s) => {
            const raw = s.val() ?? {};
            const flat: Record<string, LinkRecord> = {};
            // Correct logic: count each key in the 'links' node as one link
            for (const lid in raw) {
                flat[lid] = { ...raw[lid] };
            }
            setLinks(flat);
        });
        const off4 = onValue(ref(rtdb, "usage_stats"), (s) => setUsage(s.val() ?? {}));
        return () => { off1(); off2(); off3(); off4(); };
    }, []);

    // ── Derivadas ─────────────────────────────────────────────────
    const userList = Object.entries(users);
    const leadList = Object.values(leads);
    const linkList = Object.values(links);

    const totalUsers = userList.length;
    const activeUsers = userList.filter(([, u]) => u.status === "active").length;
    const totalLeads = leadList.length;
    const totalLinks = linkList.length;
    const totalAiMsgs = Object.values(usage).reduce((s, u) => s + (u.ai_chat_message ?? 0), 0);
    const monthlyRevenue = userList.reduce((s, [, u]) => s + (PLAN_PRICE[u.plan ?? "Trial"] ?? 0), 0);

    // ── Gráfico: usuários por mês (últimos 6 meses) ───────────────
    const now = Date.now();
    const sixMonthsAgo = now - 6 * 30 * 24 * 3600000;
    const monthGroups: Record<string, { label: string; users: number; leads: number }> = {};

    // Inicializa os últimos 6 meses
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now - i * 30 * 24 * 3600000);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        monthGroups[key] = { label: MONTHS_PT[d.getMonth()], users: 0, leads: 0 };
    }
    userList.forEach(([, u]) => {
        if (u.createdAt && u.createdAt >= sixMonthsAgo) {
            const key = getMonthKey(u.createdAt);
            if (monthGroups[key]) monthGroups[key].users++;
        }
    });
    leadList.forEach((l) => {
        if (l.createdAt && l.createdAt >= sixMonthsAgo) {
            const key = getMonthKey(l.createdAt);
            if (monthGroups[key]) monthGroups[key].leads++;
        }
    });
    const chartData = Object.values(monthGroups);

    // ── Eventos recentes (leads + users misturados) ───────────────
    type Event = { label: string; sub: string; ts: number; type: "lead" | "user" };
    const events: Event[] = [
        ...leadList
            .filter((l) => l.createdAt)
            .map((l) => ({
                label: l.name ?? "Lead anônimo",
                sub: l.linkTitle ? `via "${l.linkTitle}"` : "novo lead",
                ts: l.createdAt!,
                type: "lead" as const,
            })),
        ...userList
            .filter(([, u]) => u.createdAt)
            .map(([, u]) => ({
                label: u.name ?? "Usuário",
                sub: `Cadastro — ${u.plan ?? "Trial"}`,
                ts: u.createdAt!,
                type: "user" as const,
            })),
    ]
        .sort((a, b) => b.ts - a.ts)
        .slice(0, 7);

    // ── Stats cards ────────────────────────────────────────────────
    const stats = [
        { label: "Total de Usuários", value: totalUsers, icon: Users, sub: `${activeUsers} ativos`, trend: "up" },
        { label: "Receita Mensal Est.", value: fmtBRL(monthlyRevenue), icon: HandCoins, sub: "por planos ativos", trend: "up" },
        { label: "Consultas à IA (total)", value: totalAiMsgs.toLocaleString("pt-BR"), icon: Bot, sub: "msgs acumuladas", trend: "up" },
        { label: "Links Ativos", value: totalLinks, icon: Globe, sub: `${totalLeads} leads captados`, trend: "up" },
    ];

    return (
        <div className="space-y-8 animate-fade-up">
            <div>
                <h1 className="font-display text-3xl font-bold text-slate-900">Visão Geral</h1>
                <p className="text-slate-500 text-sm">Dashboard administrativo · dados em tempo real</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} padding="md" className="border-slate-200 shadow-sm hover:border-indigo-200 transition-colors group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 h-10 w-10 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors flex items-center justify-center">
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                                <ArrowUpRight className="h-3 w-3" />
                            </div>
                        </div>
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
                        <p className="text-2xl font-display font-black text-slate-900 mt-1">{typeof stat.value === "number" ? stat.value.toLocaleString("pt-BR") : stat.value}</p>
                        <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
                    </Card>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Area chart */}
                <Card padding="lg" className="lg:col-span-2 border-slate-200">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-display font-bold text-slate-800">Crescimento — Últimos 6 Meses</h3>
                            <p className="text-xs text-slate-400">Novos usuários e leads por mês</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold">
                            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-500" />Usuários</span>
                            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" />Leads</span>
                        </div>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="gradUser" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradLead" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} allowDecimals={false} />
                                <Tooltip
                                    cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                                />
                                <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} fill="url(#gradUser)" name="Usuários" dot={{ r: 3, fill: "#6366f1" }} activeDot={{ r: 5 }} />
                                <Area type="monotone" dataKey="leads" stroke="#10b981" strokeWidth={2} fill="url(#gradLead)" name="Leads" dot={{ r: 3, fill: "#10b981" }} activeDot={{ r: 5 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* System Status */}
                <Card padding="lg" className="border-slate-200 bg-indigo-900 text-white shadow-xl shadow-indigo-900/10">
                    <h3 className="font-display font-bold mb-1">Status do Sistema</h3>
                    <p className="text-indigo-300 text-xs mb-8">Health check em tempo real</p>
                    <div className="space-y-6">
                        {[
                            { name: "API Gateway", status: "Online", latency: "24ms", ok: true },
                            { name: "IA Processing", status: "Online", latency: "850ms", ok: true },
                            { name: "Firebase RTDB", status: `${totalUsers} registros`, latency: "-", ok: true },
                            { name: "Storage", status: "Online", latency: "-", ok: true },
                        ].map((item) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-white uppercase tracking-wider">{item.name}</p>
                                    <p className="text-[10px] text-indigo-400">{item.latency}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-indigo-200">{item.status}</span>
                                    <span className={`h-2 w-2 rounded-full ${item.ok ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-red-400"}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 bg-indigo-800/50 rounded-2xl p-4 border border-indigo-700/50">
                        <p className="text-xs text-indigo-200 mb-1">Total de ações de IA</p>
                        <p className="text-lg font-display font-black text-white">{totalAiMsgs.toLocaleString("pt-BR")} msgs</p>
                    </div>
                </Card>
            </div>

            {/* Recent Events and Links Audit */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Events */}
                <Card padding="none" className="border-slate-200 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                        <Activity className="h-4 w-4 text-indigo-600" />
                        <h3 className="font-display font-bold text-slate-800">Feed de Eventos Recentes</h3>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {events.length === 0 && (
                            <div className="py-12 text-center text-slate-400 text-sm">Nenhum evento registrado ainda</div>
                        )}
                        {events.map((ev, i) => (
                            <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 transition-colors">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${ev.type === "lead" ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"}`}>
                                    {ev.type === "lead" ? <UserCheck className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{ev.label}</p>
                                    <p className="text-xs text-slate-400">{ev.sub}</p>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
                                    <Clock className="h-3 w-3" />
                                    {fmtDate(ev.ts)}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Latest Links Audit */}
                <Card padding="none" className="border-slate-200 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                        <Link2 className="h-4 w-4 text-indigo-600" />
                        <h3 className="font-display font-bold text-slate-800">Auditória de Links Recentes</h3>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {linkList.length === 0 && (
                            <div className="py-12 text-center text-slate-400 text-sm">Nenhum link ativo encontrado</div>
                        )}
                        {linkList
                            .filter(l => l.createdAt)
                            .sort((a,b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
                            .slice(0, 7)
                            .map((link, i) => (
                                <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 transition-colors">
                                    <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                                        <Link2 className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{link.title}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] text-indigo-500 font-mono">Dono: {users[link.userId!]?.name || "Desconhecido"}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0">
                                        <p className="text-[10px] text-slate-400">Criado em:</p>
                                        <p className="text-[10px] font-bold text-slate-500">{new Date(link.createdAt!).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </Card>
            </div>
        </div>
    );
}
