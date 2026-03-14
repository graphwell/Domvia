"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, set } from "firebase/database";
import {
    CreditCard, Save, CheckCircle2, X,
    MessageSquare, Link2, FileText, Calculator,
    Camera, TrendingUp, Crown, Edit3, Sparkles
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────
interface PlanConfig {
    name: string;
    price: number;
    durationDays: number; // 0 = vitalício
    maxLinks: number;
    maxLeadsPerMonth: number;
    maxAiMessages: number;
    features: {
        ai_chat: boolean;
        links: boolean;
        docs: boolean;
        simulator: boolean;
        tours: boolean;
        description_gen: boolean;
        title_gen: boolean;
        social_gen: boolean;
    };
}

const FEATURE_META: { key: keyof PlanConfig["features"]; label: string; icon: React.ElementType }[] = [
    { key: "ai_chat", label: "IA Conversacional", icon: MessageSquare },
    { key: "links", label: "Links Inteligentes", icon: Link2 },
    { key: "docs", label: "Gerador de Documentos", icon: FileText },
    { key: "simulator", label: "Simulador", icon: Calculator },
    { key: "tours", label: "Tour 360°", icon: Camera },
    { key: "description_gen", label: "Gerador de Descrição", icon: TrendingUp },
    { key: "title_gen", label: "Sugestão de Títulos", icon: TrendingUp },
    { key: "social_gen", label: "Texto para Redes Sociais", icon: Sparkles },
];

const PLAN_DEFAULTS: Record<string, PlanConfig> = {
    Trial: {
        name: "Trial",
        price: 0,
        durationDays: 7,
        maxLinks: 5,
        maxLeadsPerMonth: 20,
        maxAiMessages: 30,
        features: { ai_chat: true, links: true, docs: false, simulator: true, tours: false, description_gen: false, title_gen: false, social_gen: false },
    },
    "Corretor Pró": {
        name: "Corretor Pró",
        price: 97,
        durationDays: 30,
        maxLinks: 50,
        maxLeadsPerMonth: 200,
        maxAiMessages: 1000,
        features: { ai_chat: true, links: true, docs: true, simulator: true, tours: false, description_gen: true, title_gen: true, social_gen: true },
    },
    "Imobiliária Start": {
        name: "Imobiliária Start",
        price: 297,
        durationDays: 30,
        maxLinks: 150,
        maxLeadsPerMonth: 500,
        maxAiMessages: 2500,
        features: { ai_chat: true, links: true, docs: true, simulator: true, tours: true, description_gen: true, title_gen: true, social_gen: true },
    },
    "Imobiliária Pró": {
        name: "Imobiliária Pró",
        price: 497,
        durationDays: 30,
        maxLinks: -1,
        maxLeadsPerMonth: -1,
        maxAiMessages: -1,
        features: { ai_chat: true, links: true, docs: true, simulator: true, tours: true, description_gen: true, title_gen: true, social_gen: true },
    },
    Elite: {
        name: "Elite",
        price: 997,
        durationDays: 30,
        maxLinks: -1,
        maxLeadsPerMonth: -1,
        maxAiMessages: -1,
        features: { ai_chat: true, links: true, docs: true, simulator: true, tours: true, description_gen: true, title_gen: true, social_gen: true },
    },
    Lifetime: {
        name: "Lifetime",
        price: 0,
        durationDays: 0,
        maxLinks: -1,
        maxLeadsPerMonth: -1,
        maxAiMessages: -1,
        features: { ai_chat: true, links: true, docs: true, simulator: true, tours: true, description_gen: true, title_gen: true, social_gen: true },
    },
};

const PLAN_ACCENT: Record<string, { gradient: string; badge: string; crown: string }> = {
    Trial: { gradient: "from-slate-500 to-slate-700", badge: "bg-slate-100 text-slate-600", crown: "text-slate-400" },
    "Corretor Pró": { gradient: "from-blue-500 to-blue-700", badge: "bg-blue-50 text-blue-700", crown: "text-blue-500" },
    "Imobiliária Start": { gradient: "from-indigo-500 to-indigo-700", badge: "bg-indigo-50 text-indigo-700", crown: "text-indigo-500" },
    "Imobiliária Pró": { gradient: "from-violet-500 to-violet-700", badge: "bg-violet-50 text-violet-700", crown: "text-violet-500" },
    Elite: { gradient: "from-amber-500 to-orange-600", badge: "bg-amber-50 text-amber-700", crown: "text-amber-500" },
    Lifetime: { gradient: "from-emerald-500 to-teal-700", badge: "bg-emerald-50 text-emerald-700", crown: "text-emerald-500" },
};

function fmtLimit(n: number, label: string) {
    return n === -1 ? `∞ ${label}` : `${n} ${label}`;
}

// ─── Component ───────────────────────────────────────────────────
export default function AdminPlansPage() {
    const [plans, setPlans] = useState<Record<string, PlanConfig>>({ ...PLAN_DEFAULTS });
    const [editing, setEditing] = useState<string | null>(null);
    const [draft, setDraft] = useState<PlanConfig | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const off = onValue(ref(rtdb, "config/plans"), (snap) => {
            if (snap.exists()) {
                const loaded = snap.val() as Record<string, PlanConfig>;
                setPlans((prev) => ({ ...PLAN_DEFAULTS, ...loaded }));
            }
        });
        return off;
    }, []);

    const startEdit = (key: string) => {
        setEditing(key);
        setDraft({ ...plans[key] });
    };

    const saveAll = async () => {
        if (!editing || !draft) return;
        setSaving(true);
        const updated = { ...plans, [editing]: draft };
        setPlans(updated);
        await set(ref(rtdb, "config/plans"), updated);
        setSaving(false);
        setSaved(true);
        setEditing(null);
        setDraft(null);
        setTimeout(() => setSaved(false), 2000);
    };

    const updateDraft = (field: keyof Omit<PlanConfig, "features">, val: string | number) => {
        if (!draft) return;
        setDraft({ ...draft, [field]: val });
    };

    const toggleFeature = (k: keyof PlanConfig["features"]) => {
        if (!draft) return;
        setDraft({ ...draft, features: { ...draft.features, [k]: !draft.features[k] } });
    };

    return (
        <div className="space-y-6 animate-fade-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold text-slate-900">Planos &amp; Preços</h1>
                    <p className="text-slate-500 text-sm">Gerencie limites, preços e funcionalidades de cada plano</p>
                </div>
                {saved && (
                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                        <CheckCircle2 className="h-4 w-4" />
                        Configurações salvas!
                    </div>
                )}
            </div>

            {/* Plan Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Object.entries(plans).map(([key, plan]) => {
                    const accent = PLAN_ACCENT[key] ?? PLAN_ACCENT.Trial;
                    const isEditing = editing === key;

                    return (
                        <Card key={key} padding="none" className={`border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow ${isEditing ? "ring-2 ring-indigo-500" : ""}`}>
                            {/* Header */}
                            <div className={`bg-gradient-to-br ${accent.gradient} p-6 text-white`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Crown className="h-5 w-5 text-white/80" />
                                        <span className="font-display font-black text-lg tracking-tight">{plan.name}</span>
                                    </div>
                                    <button
                                        onClick={() => isEditing ? setEditing(null) : startEdit(key)}
                                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                                    </button>
                                </div>
                                {isEditing && draft ? (
                                    <div className="space-y-2">
                                        <div>
                                            <label className="text-[10px] text-white/60 font-black uppercase tracking-widest">Preço (R$)</label>
                                            <input
                                                type="number"
                                                value={draft.price}
                                                onChange={(e) => updateDraft("price", +e.target.value)}
                                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm font-bold mt-1 focus:outline-none focus:bg-white/20"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-3xl font-display font-black">
                                            {plan.price === 0 ? "Gratuito" : `R$ ${plan.price.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`}
                                        </p>
                                        {plan.price > 0 && <p className="text-white/60 text-xs">/mês</p>}
                                    </div>
                                )}
                            </div>

                            {/* Limits */}
                            <div className="p-6 border-b border-slate-100 space-y-3">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Limites</p>
                                {isEditing && draft ? (
                                    <div className="space-y-3">
                                        {([
                                            { key: "durationDays", label: "Duração (dias, 0=vitalício)" },
                                            { key: "maxLinks", label: "Max. Links (-1=ilimitado)" },
                                            { key: "maxLeadsPerMonth", label: "Max. Leads/mês (-1=ilimitado)" },
                                            { key: "maxAiMessages", label: "Max. IA msgs (-1=ilimitado)" },
                                        ] as const).map(({ key: fkey, label }) => (
                                            <div key={fkey}>
                                                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{label}</label>
                                                <input
                                                    type="number"
                                                    value={(draft as any)[fkey]}
                                                    onChange={(e) => updateDraft(fkey, +e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm mt-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-1.5 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Duração</span>
                                            <span className="font-semibold text-slate-800">{plan.durationDays === 0 ? "Vitalício" : `${plan.durationDays} dias`}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Links</span>
                                            <span className="font-semibold text-slate-800">{fmtLimit(plan.maxLinks, "links")}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Leads/mês</span>
                                            <span className="font-semibold text-slate-800">{fmtLimit(plan.maxLeadsPerMonth, "leads")}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Msgs IA</span>
                                            <span className="font-semibold text-slate-800">{fmtLimit(plan.maxAiMessages, "msgs")}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Features */}
                            <div className="p-6 space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Funcionalidades</p>
                                {FEATURE_META.map(({ key: fkey, label, icon: Icon }) => {
                                    const enabled = isEditing && draft ? draft.features[fkey] : plan.features[fkey];
                                    return (
                                        <div
                                            key={fkey}
                                            onClick={() => isEditing && toggleFeature(fkey)}
                                            className={`flex items-center gap-2.5 py-1.5 px-2 rounded-lg transition-all ${isEditing ? "cursor-pointer hover:bg-slate-50" : ""} ${enabled ? "" : "opacity-40"}`}
                                        >
                                            {enabled
                                                ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                                : <X className="h-4 w-4 text-slate-300 shrink-0" />
                                            }
                                            <Icon className={`h-3.5 w-3.5 shrink-0 ${enabled ? "text-slate-600" : "text-slate-300"}`} />
                                            <span className="text-xs font-medium text-slate-600">{label}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Save button */}
                            {isEditing && (
                                <div className="px-6 pb-6">
                                    <Button
                                        onClick={saveAll}
                                        loading={saving}
                                        leftIcon={<Save className="h-4 w-4" />}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        Salvar Plano
                                    </Button>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            {/* Info note */}
            <Card padding="md" className="border-blue-100 bg-blue-50/40 flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                    <p className="text-xs font-bold text-blue-900">Sobre os Planos</p>
                    <p className="text-[11px] text-blue-700 mt-0.5">
                        As configurações são salvas no Firebase e são lidas pelo sistema para controlar os acessos. Valores <strong>-1</strong> significam ilimitado.
                        Alterar preços aqui não afeta cobranças existentes (Stripe ou manual).
                    </p>
                </div>
            </Card>
        </div>
    );
}
