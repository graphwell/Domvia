"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { rtdb } from "@/lib/firebase";
import { addCredits, removeCredits } from "@/lib/credits";
import { ref, onValue, update, remove, set } from "firebase/database";
import {
    Search, UserPlus, Edit2, Trash2, Power, X, Crown,
    Mail, Calendar, BarChart2, Clock, ShieldCheck,
    ChevronRight, Gift, AlertTriangle, TrendingUp, MessageSquare,
    FileText, Calculator, Link2, Camera, Copy, CheckCircle, Coins
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────
interface UserPerms {
    ai_chat: boolean;
    links: boolean;
    docs: boolean;
    simulator: boolean;
    tours: boolean;
    description_gen: boolean;
    title_gen: boolean;
    social_gen: boolean;
}

interface UserRecord {
    id: string;
    name: string;
    email: string;
    role: string;
    plan: string;
    status: "active" | "inactive" | "suspended";
    createdAt: number;
    planExpiresAt?: number;
    permissions?: Partial<UserPerms>;
    simulatorLevel?: "basic" | "advanced" | "professional";
    inviteCode?: string;
    invitedBy?: string;
    inviteCount?: number;
    credits?: number;
}

interface UsageStats {
    ai_chat_message?: number;
    ai_doc_generate?: number;
    ai_description_generate?: number;
    ai_title_generate?: number;
    calculator_financing?: number;
    calculator_investment?: number;
    link_created?: number;
    lead_captured?: number;
    tour_created?: number;
    last_seen?: number;
}

const DEFAULT_PERMISSIONS: UserPerms = {
    ai_chat: true,
    links: true,
    docs: true,
    simulator: true,
    tours: false,
    description_gen: true,
    title_gen: true,
    social_gen: true,
};

const PERM_LABELS: { key: keyof UserPerms; label: string; icon: React.ElementType }[] = [
    { key: "ai_chat", label: "IA Conversacional", icon: MessageSquare },
    { key: "links", label: "Links Inteligentes", icon: Link2 },
    { key: "docs", label: "Gerador de Documentos", icon: FileText },
    { key: "simulator", label: "Simulador de Financiamento", icon: Calculator },
    { key: "tours", label: "Tour 360°", icon: Camera },
    { key: "description_gen", label: "Gerador de Descrição", icon: Edit2 },
    { key: "title_gen", label: "Sugestão de Títulos", icon: TrendingUp },
    { key: "social_gen", label: "Texto para Redes Sociais", icon: BarChart2 },
];

const PLANS = ["Trial", "Starter", "Pro", "Elite", "Lifetime"];
const PLAN_COLOR: Record<string, string> = {
    Trial: "text-slate-500",
    Starter: "text-blue-600",
    Pro: "text-indigo-600",
    Elite: "text-amber-500",
    Lifetime: "text-emerald-600",
};

// ─── Helpers ─────────────────────────────────────────────────────
function fmtDate(ts: number) {
    return new Date(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}
function daysSince(ts: number) {
    return Math.floor((Date.now() - ts) / 86400000);
}
function totalActions(stats: UsageStats) {
    const keys: (keyof UsageStats)[] = [
        "ai_chat_message", "ai_doc_generate", "ai_description_generate",
        "ai_title_generate", "calculator_financing", "calculator_investment",
        "link_created", "lead_captured", "tour_created",
    ];
    return keys.reduce((s, k) => s + ((stats[k] as number) ?? 0), 0);
}

// ─── Invite Code Generator ────────────────────────────────────────
function genInviteCode(name: string) {
    const slug = name.replace(/\s+/g, "").toLowerCase().slice(0, 6);
    return `DV-${slug}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

// ─── Component ───────────────────────────────────────────────────
export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [usageMap, setUsageMap] = useState<Record<string, UsageStats>>({});
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "suspended">("all");
    const [sortBy, setSortBy] = useState<"joined" | "usage" | "lastSeen">("joined");
    const [selected, setSelected] = useState<UserRecord | null>(null);
    const [modal, setModal] = useState<"edit" | "perms" | "extend" | "credits" | null>(null);
    const [saved, setSaved] = useState(false);

    // ── Load users from Firebase ──────────────────────────────────
    useEffect(() => {
        const usersRef = ref(rtdb, "users");
        return onValue(usersRef, (snap) => {
            const data = snap.val() ?? {};
            const list: UserRecord[] = Object.entries(data).map(([id, u]: [string, any]) => ({
                id,
                name: u.name ?? "Sem nome",
                email: u.email ?? "",
                role: u.role ?? "CORRETOR",
                plan: u.plan ?? "Trial",
                status: u.status ?? "active",
                createdAt: u.createdAt ?? Date.now(),
                planExpiresAt: u.planExpiresAt,
                permissions: u.permissions ?? DEFAULT_PERMISSIONS,
                simulatorLevel: u.simulatorLevel,
                inviteCode: u.inviteCode ?? genInviteCode(u.name ?? "user"),
                invitedBy: u.invitedBy,
                inviteCount: u.inviteCount ?? 0,
                credits: u.credits ?? 0,
            }));
            setUsers(list.sort((a, b) => b.createdAt - a.createdAt));
        });
    }, []);

    // ── Load usage stats ──────────────────────────────────────────
    useEffect(() => {
        const statsRef = ref(rtdb, "usage_stats");
        return onValue(statsRef, (snap) => {
            setUsageMap(snap.val() ?? {});
        });
    }, []);

    // ── Filtered + sorted users ───────────────────────────────────
    const visible = users
        .filter((u) => {
            const q = search.toLowerCase();
            const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
            const matchStatus = filterStatus === "all" || u.status === filterStatus;
            return matchSearch && matchStatus;
        })
        .sort((a, b) => {
            if (sortBy === "usage") return (totalActions(usageMap[b.id] ?? {}) - totalActions(usageMap[a.id] ?? {}));
            if (sortBy === "lastSeen") return ((usageMap[b.id]?.last_seen ?? 0) - (usageMap[a.id]?.last_seen ?? 0));
            return b.createdAt - a.createdAt;
        });

    // ── Actions ───────────────────────────────────────────────────
    const saveUser = async (patch: Partial<UserRecord>) => {
        if (!selected) return;
        await update(ref(rtdb, `users/${selected.id}`), patch);
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
        setModal(null);
    };

    const toggleStatus = async (u: UserRecord) => {
        const next = u.status === "active" ? "inactive" : "active";
        await update(ref(rtdb, `users/${u.id}`), { status: next });
    };

    const suspendUser = async (u: UserRecord) => {
        if (!confirm(`Suspender ${u.name}?`)) return;
        await update(ref(rtdb, `users/${u.id}`), { status: "suspended" });
    };

    const deleteUser = async (u: UserRecord) => {
        if (!confirm(`Excluir permanentemente ${u.name}? Essa ação não pode ser desfeita.`)) return;
        await remove(ref(rtdb, `users/${u.id}`));
    };

    const extendPlan = async (days: number) => {
        if (!selected) return;
        const current = selected.planExpiresAt ?? Date.now();
        const next = Math.max(current, Date.now()) + days * 86400000;
        await saveUser({ planExpiresAt: next });
    };

    const savePerms = async (perms: UserPerms, simulatorLevel?: string) => {
        if (!selected) return;
        const payload: any = { permissions: perms };
        if (simulatorLevel !== undefined) {
            payload.simulatorLevel = simulatorLevel === "" ? null : simulatorLevel;
        }
        await update(ref(rtdb, `users/${selected.id}`), payload);
        setModal(null);
    };

    const [copiedId, setCopiedId] = useState<string | null>(null);
    const copyInvite = (code: string, id: string) => {
        navigator.clipboard.writeText(`Você foi convidado para o Domvia! Use o código ${code} em domvia.ai/register?invite=${code}`);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // ── Summary Stats ─────────────────────────────────────────────
    const totalUsers = users.length;
    const activeCount = users.filter((u) => u.status === "active").length;
    const inactiveSince7 = users.filter((u) => {
        const ls = usageMap[u.id]?.last_seen;
        return ls ? daysSince(ls) >= 7 : daysSince(u.createdAt) >= 7;
    }).length;
    const totalActionsAll = Object.values(usageMap).reduce((s, st) => s + totalActions(st), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl font-bold text-slate-900">Gestão de Usuários</h1>
                    <p className="text-slate-500 text-sm">Controle total de corretores, permissões e acessos</p>
                </div>
                <Button
                    className="bg-indigo-600 hover:bg-indigo-700"
                    leftIcon={<UserPlus className="h-4 w-4" />}
                    onClick={() => { setSelected(null); setModal("edit"); }}
                >
                    Adicionar Usuário
                </Button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Cadastrados", value: totalUsers, icon: Users2, color: "text-indigo-600 bg-indigo-50" },
                    { label: "Ativos", value: activeCount, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
                    { label: "Inativos +7d", value: inactiveSince7, icon: AlertTriangle, color: "text-amber-600 bg-amber-50" },
                    { label: "Ações Totais", value: totalActionsAll.toLocaleString("pt-BR"), icon: BarChart2, color: "text-purple-600 bg-purple-50" },
                ].map((s) => (
                    <Card key={s.label} padding="md" className="border-slate-200">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                            <s.icon className="h-5 w-5" />
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                        <p className="text-2xl font-display font-black text-slate-900">{value(s.value)}</p>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card padding="sm" className="border-slate-200">
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Nome ou email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                        />
                    </div>
                    {(["all", "active", "inactive", "suspended"] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterStatus === s ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                        >
                            {{ all: "Todos", active: "Ativos", inactive: "Inativos", suspended: "Suspensos" }[s]}
                        </button>
                    ))}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="ml-auto text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
                    >
                        <option value="joined">Por Cadastro</option>
                        <option value="usage">Por Uso Total</option>
                        <option value="lastSeen">Por Última Atividade</option>
                    </select>
                </div>
            </Card>

            {/* Table */}
            <Card padding="none" className="border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plano / Status</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Uso Total</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Última Atividade</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Convites</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Créditos</th>
                                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {visible.length === 0 && (
                                <tr><td colSpan={6} className="py-12 text-center text-slate-400 text-sm">Nenhum usuário encontrado</td></tr>
                            )}
                            {visible.map((u) => {
                                const stats = usageMap[u.id] ?? {};
                                const actions = totalActions(stats);
                                const lastSeen = stats.last_seen;
                                const inactive = lastSeen ? daysSince(lastSeen) >= 7 : daysSince(u.createdAt) >= 7;
                                const expires = u.planExpiresAt;
                                const expiring = expires && expires - Date.now() < 7 * 86400000;

                                return (
                                    <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm shrink-0">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 leading-tight">{u.name}</p>
                                                    <p className="text-[11px] text-slate-400">{u.email}</p>
                                                    <p className="text-[10px] text-slate-300">Cadastro: {fmtDate(u.createdAt)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Crown className={`h-3 w-3 ${PLAN_COLOR[u.plan] ?? "text-slate-400"}`} />
                                                    <span className={`text-xs font-bold ${PLAN_COLOR[u.plan] ?? "text-slate-600"}`}>{u.plan}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${u.status === "active" ? "bg-emerald-50 text-emerald-700" :
                                                        u.status === "suspended" ? "bg-red-50 text-red-700" :
                                                            "bg-slate-100 text-slate-500"
                                                        }`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${u.status === "active" ? "bg-emerald-500" : u.status === "suspended" ? "bg-red-500" : "bg-slate-400"}`} />
                                                        {{ active: "Ativo", inactive: "Inativo", suspended: "Suspenso" }[u.status]}
                                                    </span>
                                                    {expiring && <span className="text-[10px] text-amber-600 font-bold">⚠ Expira em breve</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-bold text-slate-900">{actions.toLocaleString("pt-BR")}</p>
                                                <p className="text-[10px] text-slate-400">ações totais</p>
                                                {/* Mini usage bar */}
                                                <div className="h-1 w-20 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (actions / 500) * 100)}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className={`flex items-center gap-1.5 text-xs font-medium ${inactive ? "text-amber-600" : "text-slate-500"}`}>
                                                <Clock className="h-3.5 w-3.5" />
                                                {lastSeen
                                                    ? daysSince(lastSeen) === 0 ? "Hoje" :
                                                        daysSince(lastSeen) === 1 ? "Ontem" :
                                                            `${daysSince(lastSeen)}d atrás`
                                                    : "Nunca usou"}
                                            </div>
                                            {inactive && <p className="text-[10px] text-amber-500 mt-0.5">Inativo +7 dias</p>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <Gift className="h-3.5 w-3.5 text-indigo-400" />
                                                <span className="text-xs font-bold text-slate-700">{u.inviteCount ?? 0}/5</span>
                                            </div>
                                            <button
                                                onClick={() => copyInvite(u.inviteCode!, u.id)}
                                                className="flex items-center gap-1 text-[10px] text-indigo-500 hover:text-indigo-700 mt-0.5"
                                            >
                                                {copiedId === u.id ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                                {copiedId === u.id ? "Copiado!" : u.inviteCode}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <Coins className="h-3.5 w-3.5 text-indigo-400" />
                                                <span className="text-sm font-bold text-slate-700">{u.credits || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => { setSelected(u); setModal("credits"); }}
                                                    title="Gerenciar Créditos"
                                                    className="p-1.5 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                                >
                                                    <Coins className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => { setSelected(u); setModal("perms"); }}
                                                    title="Permissões"
                                                    className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                                >
                                                    <ShieldCheck className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => { setSelected(u); setModal("extend"); }}
                                                    title="Prorrogar plano"
                                                    className="p-1.5 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                                                >
                                                    <Calendar className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => { setSelected(u); setModal("edit"); }}
                                                    title="Editar"
                                                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => toggleStatus(u)}
                                                    title={u.status === "active" ? "Desativar" : "Ativar"}
                                                    className={`p-1.5 rounded-lg transition-colors ${u.status === "active" ? "text-slate-400 hover:bg-red-50 hover:text-red-500" : "text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"}`}
                                                >
                                                    <Power className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* ── Permissions Modal ── */}
            {modal === "perms" && selected && (
                <PermissionsModal
                    user={selected}
                    onSave={savePerms}
                    onClose={() => setModal(null)}
                />
            )}

            {/* ── Extend Plan Modal ── */}
            {modal === "extend" && selected && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <Card padding="lg" className="w-full max-w-sm bg-white shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-display font-bold text-slate-900">Prorrogar Acesso</h3>
                                <p className="text-xs text-slate-500">{selected.name}</p>
                            </div>
                            <button onClick={() => setModal(null)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                                <X className="h-4 w-4 text-slate-400" />
                            </button>
                        </div>
                        {selected.planExpiresAt && (
                            <p className="text-xs text-slate-600 mb-4 bg-slate-50 rounded-lg px-3 py-2">
                                Expira em: <strong>{fmtDate(selected.planExpiresAt)}</strong>
                            </p>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                            {[7, 15, 30, 60, 90, 365].map((d) => (
                                <button
                                    key={d}
                                    onClick={() => extendPlan(d)}
                                    className="py-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-sm font-semibold text-slate-700 hover:text-indigo-700 transition-all"
                                >
                                    +{d} dias
                                </button>
                            ))}
                        </div>
                        <Button
                            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => extendPlan(9999)}
                        >
                            Acesso Vitalício
                        </Button>
                    </Card>
                </div>
            )}

            {/* ── Edit Modal ── */}
            {modal === "edit" && (
                <EditUserModal
                    user={selected}
                    onSave={saveUser}
                    onClose={() => setModal(null)}
                />
            )}

            {/* ── Credits Modal ── */}
            {modal === "credits" && selected && (
                <ManageCreditsModal
                    user={selected}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
}

// ─── Sub-components ──────────────────────────────────────────────
function value(v: any) { return v; }

function Users2({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function ManageCreditsModal({ user, onClose }: { user: UserRecord, onClose: () => void }) {
    const [amount, setAmount] = useState<string | number>("");
    const [type, setType] = useState<"add" | "remove">("add");
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!amount || amount <= 0) return alert("Insira um valor maior que zero.");
        if (!reason.trim()) return alert("Insira um motivo para a transação.");
        setLoading(true);
        try {
            if (type === "add") {
                await addCredits(user.id, Number(amount), `Admin: ${reason}`, "admin_adjustment");
            } else {
                await removeCredits(user.id, Number(amount), `Admin: ${reason}`);
            }
            onClose();
        } catch (err: any) {
            alert(err.message || "Erro ao processar transação.");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <Card padding="lg" className="w-full max-w-sm bg-white shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-display font-bold text-slate-900">Gerenciar Créditos</h3>
                        <p className="text-xs text-slate-500">{user.name}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
                        <X className="h-4 w-4 text-slate-400" />
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl mb-6">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Saldo Atual</span>
                    <span className="font-display font-black text-2xl text-indigo-600">{user.credits || 0}</span>
                </div>

                <div className="space-y-4">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${type === "add" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            onClick={() => setType("add")}
                        >
                            Adicionar
                        </button>
                        <button
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${type === "remove" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            onClick={() => setType("remove")}
                        >
                            Remover
                        </button>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quantidade</label>
                        <input
                            type="number"
                            min="1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Motivo (Ficará no histórico)</label>
                        <input
                            type="text"
                            placeholder="Ex: Bônus de parceria"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none"
                        />
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                    <Button variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
                    <Button
                        loading={loading}
                        onClick={handleSubmit}
                        className={`flex-1 text-white ${type === "add" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`}
                    >
                        Confirmar
                    </Button>
                </div>
            </Card>
        </div>
    );
}

function PermissionsModal({ user, onSave, onClose }: {
    user: UserRecord;
    onSave: (p: UserPerms, simLevel?: string) => void;
    onClose: () => void;
}) {
    const [perms, setPerms] = useState<UserPerms>({ ...DEFAULT_PERMISSIONS, ...user.permissions });
    const [simLevel, setSimLevel] = useState(user.simulatorLevel || "");
    const toggle = (k: keyof UserPerms) => setPerms((p) => ({ ...p, [k]: !p[k] }));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <Card padding="none" className="w-full max-w-md bg-white shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <div>
                        <h3 className="font-display font-bold text-slate-900">Permissões de Acesso</h3>
                        <p className="text-xs text-slate-500">{user.name}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-lg"><X className="h-4 w-4 text-slate-400" /></button>
                </div>
                <div className="p-6 space-y-3">
                    <div className="flex gap-2 mb-2">
                        <button onClick={() => setPerms(Object.fromEntries(Object.keys(DEFAULT_PERMISSIONS).map(k => [k, true])) as unknown as UserPerms)}
                            className="flex-1 text-xs py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100">
                            Liberar Tudo
                        </button>
                        <button onClick={() => setPerms(Object.fromEntries(Object.keys(DEFAULT_PERMISSIONS).map(k => [k, false])) as unknown as UserPerms)}
                            className="flex-1 text-xs py-1.5 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100">
                            Revogar Tudo
                        </button>
                    </div>
                    {PERM_LABELS.map(({ key, label, icon: Icon }) => (
                        <div key={key} className="space-y-1.5">
                            <div
                                onClick={() => toggle(key)}
                                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${perms[key] ? "border-indigo-200 bg-indigo-50" : "border-slate-150 bg-slate-50 opacity-60"}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`h-4 w-4 ${perms[key] ? "text-indigo-600" : "text-slate-400"}`} />
                                    <span className="text-sm font-medium text-slate-700">{label}</span>
                                </div>
                                <div className={`h-5 w-9 rounded-full transition-colors ${perms[key] ? "bg-indigo-600" : "bg-slate-200"} relative`}>
                                    <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${perms[key] ? "translate-x-4" : "translate-x-0.5"}`} />
                                </div>
                            </div>
                            {key === "simulator" && perms.simulator && (
                                <div className="pl-4 pr-1 pt-1 pb-1 animate-fade-in flex items-center justify-between">
                                    <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Nível de Acesso:</span>
                                    <select
                                        value={simLevel}
                                        onChange={(e) => setSimLevel(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:ring-1 focus:ring-indigo-500 outline-none text-slate-700 w-1/2"
                                    >
                                        <option value="">Padrão do Plano</option>
                                        <option value="basic">Simples</option>
                                        <option value="advanced">Inteligente</option>
                                        <option value="professional">Profissional</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex gap-3 px-6 pb-6">
                    <Button variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
                    <Button onClick={() => onSave(perms, simLevel)} className="flex-1 bg-indigo-600 hover:bg-indigo-700">Salvar Permissões</Button>
                </div>
            </Card>
        </div>
    );
}

function EditUserModal({ user, onSave, onClose }: {
    user: UserRecord | null;
    onSave: (p: Partial<UserRecord>) => void;
    onClose: () => void;
}) {
    const [form, setForm] = useState({
        name: user?.name ?? "",
        email: user?.email ?? "",
        role: user?.role ?? "CORRETOR",
        plan: user?.plan ?? "Trial",
        status: user?.status ?? "active",
        simulatorLevel: user?.simulatorLevel ?? "",
    });
    const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm((p) => ({ ...p, [k]: e.target.value === "" ? null : e.target.value }));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <Card padding="none" className="w-full max-w-md bg-white shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-display font-bold text-slate-900">{user ? "Editar Usuário" : "Novo Usuário"}</h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-lg"><X className="h-4 w-4 text-slate-400" /></button>
                </div>
                <div className="p-6 space-y-4">
                    {[
                        { key: "name", label: "Nome completo", type: "text" },
                        { key: "email", label: "E-mail", type: "email" },
                    ].map(({ key, label, type }) => (
                        <div key={key}>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</label>
                            <input
                                type={type}
                                value={(form as any)[key]}
                                onChange={f(key)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                            />
                        </div>
                    ))}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { key: "role", label: "Role", opts: ["CORRETOR", "ADMIN", "ADMIN_MASTER"] },
                            { key: "plan", label: "Plano", opts: PLANS },
                            { key: "status", label: "Status", opts: ["active", "inactive", "suspended"] },
                        ].map(({ key, label, opts }) => (
                            <div key={key}>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</label>
                                <select
                                    value={(form as any)[key]}
                                    onChange={f(key)}
                                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                >
                                    {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        ))}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nível do Simulador</label>
                            <select
                                value={form.simulatorLevel || ""}
                                onChange={f("simulatorLevel")}
                                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                            >
                                <option value="">Padrão do Plano</option>
                                <option value="basic">Simples</option>
                                <option value="advanced">Inteligente</option>
                                <option value="professional">Profissional</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 px-6 pb-6">
                    <Button variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
                    <Button onClick={() => onSave({ ...form, simulatorLevel: form.simulatorLevel === "" ? undefined : form.simulatorLevel as any })} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                        {user ? "Salvar" : "Criar Usuário"}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
