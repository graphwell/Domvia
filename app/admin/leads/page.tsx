"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { rtdb } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import {
    Search, Filter, Calendar,
    User, MessageSquare, Calculator,
    ExternalLink, Download, ChevronRight,
    UserCheck, Globe, Clock
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────
interface LeadRecord {
    id: string;
    compositeId: string;
    userId: string;
    name?: string;
    email?: string;
    phone?: string;
    linkTitle?: string;
    linkId?: string;
    status?: string;
    createdAt?: number;
    usedChat?: boolean;
    usedCalc?: boolean;
}
interface UserBasic {
    name?: string;
    email?: string;
}

type PeriodFilter = "all" | "today" | "week" | "month";

function fmtDate(ts: number) {
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const isYesterday = d.toDateString() === new Date(Date.now() - 86400000).toDateString();
    const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    if (isToday) return `Hoje, ${time}`;
    if (isYesterday) return `Ontem, ${time}`;
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) + `, ${time}`;
}

function exportCsv(leads: LeadRecord[], users: Record<string, UserBasic>) {
    const header = ["ID", "Nome", "Email", "Telefone", "Corretor", "Imóvel", "Status", "Data", "IA Chat", "Simulação"];
    const rows = leads.map((l) => [
        l.id,
        l.name ?? "",
        l.email ?? "",
        l.phone ?? "",
        users[l.userId]?.name ?? l.userId,
        l.linkTitle ?? "",
        l.status ?? "",
        l.createdAt ? new Date(l.createdAt).toLocaleString("pt-BR") : "",
        l.usedChat ? "Sim" : "Não",
        l.usedCalc ? "Sim" : "Não",
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ─── Component ───────────────────────────────────────────────────
export default function AdminLeadsPage() {
    const [leads, setLeads] = useState<LeadRecord[]>([]);
    const [users, setUsers] = useState<Record<string, UserBasic>>({});
    const [search, setSearch] = useState("");
    const [filterBroker, setFilterBroker] = useState("all");
    const [filterPeriod, setFilterPeriod] = useState<PeriodFilter>("all");
    const [filterStatus, setFilterStatus] = useState("all");

    // ── Load data ─────────────────────────────────────────────────
    useEffect(() => {
        const off1 = onValue(ref(rtdb, "leads"), (snap) => {
            const raw = snap.val() ?? {};
            const list: LeadRecord[] = [];
            for (const uid in raw) {
                for (const lid in raw[uid]) {
                    const l = raw[uid][lid];
                    list.push({
                        id: lid,
                        compositeId: `${uid}_${lid}`,
                        userId: uid,
                        name: l.name,
                        email: l.email,
                        phone: l.phone,
                        linkTitle: l.linkTitle,
                        linkId: l.linkId,
                        status: l.status ?? "new",
                        createdAt: l.createdAt,
                        usedChat: l.usedChat ?? false,
                        usedCalc: l.usedCalc ?? false,
                    });
                }
            }
            list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
            setLeads(list);
        });
        const off2 = onValue(ref(rtdb, "users"), (snap) => {
            const raw = snap.val() ?? {};
            const mapped: Record<string, UserBasic> = {};
            for (const id in raw) mapped[id] = { name: raw[id].name, email: raw[id].email };
            setUsers(mapped);
        });
        return () => { off1(); off2(); };
    }, []);

    // ── Filters ───────────────────────────────────────────────────
    const brokers = useMemo(() => {
        const ids = [...new Set(leads.map((l) => l.userId))];
        return ids.map((id) => ({ id, name: users[id]?.name ?? id })).sort((a, b) => a.name.localeCompare(b.name));
    }, [leads, users]);

    const now = Date.now();
    const periodStart: Record<PeriodFilter, number> = {
        all: 0,
        today: new Date().setHours(0, 0, 0, 0),
        week: now - 7 * 86400000,
        month: now - 30 * 86400000,
    };

    const visible = leads.filter((l) => {
        const q = search.toLowerCase();
        const matchSearch = !q || (l.name ?? "").toLowerCase().includes(q) || (l.email ?? "").toLowerCase().includes(q) || (l.linkTitle ?? "").toLowerCase().includes(q);
        const matchBroker = filterBroker === "all" || l.userId === filterBroker;
        const matchPeriod = !l.createdAt || l.createdAt >= periodStart[filterPeriod];
        const matchStatus = filterStatus === "all" || l.status === filterStatus;
        return matchSearch && matchBroker && matchPeriod && matchStatus;
    });

    // ── Summary stats ─────────────────────────────────────────────
    const todayCount = leads.filter((l) => l.createdAt && l.createdAt >= periodStart.today).length;
    const qualifiedCount = leads.filter((l) => l.status === "qualified").length;
    const chatCount = leads.filter((l) => l.usedChat).length;

    return (
        <div className="space-y-6 animate-fade-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold text-slate-900">Leads Globais</h1>
                    <p className="text-slate-500 text-sm">Monitoramento de captação de todos os corretores em tempo real</p>
                </div>
                <Button
                    variant="secondary"
                    leftIcon={<Download className="h-4 w-4" />}
                    onClick={() => exportCsv(visible, users)}
                >
                    Exportar CSV ({visible.length})
                </Button>
            </div>

            {/* Summary mini-stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total de Leads", value: leads.length, icon: UserCheck, color: "text-indigo-600 bg-indigo-50" },
                    { label: "Leads Hoje", value: todayCount, icon: Clock, color: "text-blue-600 bg-blue-50" },
                    { label: "Qualificados", value: qualifiedCount, icon: Globe, color: "text-emerald-600 bg-emerald-50" },
                    { label: "Usaram IA Chat", value: chatCount, icon: MessageSquare, color: "text-purple-600 bg-purple-50" },
                ].map((s) => (
                    <Card key={s.label} padding="md" className="border-slate-200">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                            <s.icon className="h-5 w-5" />
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                        <p className="text-2xl font-display font-black text-slate-900">{s.value}</p>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card padding="md" className="border-slate-200">
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Nome, email ou imóvel..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                        />
                    </div>
                    <select
                        value={filterBroker}
                        onChange={(e) => setFilterBroker(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <option value="all">Todos os Corretores</option>
                        {brokers.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                    <div className="flex gap-1.5">
                        {(["all", "today", "week", "month"] as PeriodFilter[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => setFilterPeriod(p)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterPeriod === p ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                            >
                                {{ all: "Todos", today: "Hoje", week: "7 dias", month: "30 dias" }[p]}
                            </button>
                        ))}
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <option value="all">Todos os Status</option>
                        <option value="new">Novo</option>
                        <option value="contacted">Contatado</option>
                        <option value="qualified">Qualificado</option>
                    </select>
                </div>
            </Card>

            {/* Leads List */}
            <div className="space-y-3">
                {visible.length === 0 && (
                    <Card padding="lg" className="border-slate-200 text-center py-16 text-slate-400 text-sm">
                        {leads.length === 0 ? "Nenhum lead registrado ainda." : "Nenhum lead encontrado com os filtros selecionados."}
                    </Card>
                )}
                {visible.map((lead) => (
                    <Card key={lead.compositeId} padding="none" className="border-slate-200 hover:border-indigo-200 transition-all group cursor-pointer overflow-hidden">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 p-4">
                            {/* Lead Info */}
                            <div className="flex-1 min-w-[200px]">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{lead.name ?? "Anônimo"}</h3>
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${lead.status === "qualified"
                                        ? "bg-emerald-50 text-emerald-700"
                                        : lead.status === "contacted"
                                            ? "bg-amber-50 text-amber-700"
                                            : "bg-blue-50 text-blue-700"
                                        }`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${lead.status === "qualified" ? "bg-emerald-500" : lead.status === "contacted" ? "bg-amber-500" : "bg-blue-500"}`} />
                                        {lead.status === "qualified" ? "Qualificado" : lead.status === "contacted" ? "Contatado" : "Novo"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                                    {lead.email && <span>{lead.email}</span>}
                                    {lead.phone && <span>{lead.phone}</span>}
                                    {lead.createdAt && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {fmtDate(lead.createdAt)}
                                        </span>
                                    )}
                                    {lead.linkTitle && (
                                        <span className="flex items-center gap-1 text-slate-500 font-medium italic">
                                            <ChevronRight className="h-3 w-3" />
                                            {lead.linkTitle}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Broker */}
                            <div className="md:w-44 px-4 border-l border-slate-100 hidden md:block">
                                <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Corretor</p>
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600 uppercase">
                                        {(users[lead.userId]?.name ?? "?").charAt(0)}
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 truncate">{users[lead.userId]?.name ?? lead.userId.slice(0, 8)}</span>
                                </div>
                            </div>

                            {/* Interactions */}
                            <div className="flex items-center gap-4 px-4 md:border-l border-slate-100">
                                <div className={`flex flex-col items-center gap-1 ${lead.usedChat ? "text-indigo-600" : "text-slate-200"}`}>
                                    <MessageSquare className="h-5 w-5" />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Chat IA</span>
                                </div>
                                <div className={`flex flex-col items-center gap-1 ${lead.usedCalc ? "text-emerald-600" : "text-slate-200"}`}>
                                    <Calculator className="h-5 w-5" />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Calc</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Footer summary */}
            {leads.length > 0 && (
                <Card padding="lg" className="bg-indigo-900 text-white overflow-hidden relative">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h2 className="font-display text-xl font-bold mb-2">Resumo Geral</h2>
                            <p className="text-indigo-200 text-sm max-w-md">
                                Taxa de qualificação média: {" "}
                                <span className="text-white font-bold">
                                    {leads.length > 0 ? Math.round((qualifiedCount / leads.length) * 100) : 0}%
                                </span>.{" "}
                                {chatCount} leads interagiram com a IA conversacional.
                            </p>
                        </div>
                        <div className="flex gap-8">
                            <div className="text-center">
                                <p className="text-indigo-300 text-[10px] uppercase font-black mb-1">Total Leads</p>
                                <p className="text-3xl font-display font-black tracking-tighter">{leads.length.toLocaleString("pt-BR")}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-indigo-300 text-[10px] uppercase font-black mb-1">Qualificados</p>
                                <p className="text-3xl font-display font-black tracking-tighter text-emerald-400">{qualifiedCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-indigo-800 to-transparent pointer-events-none" />
                </Card>
            )}
        </div>
    );
}
