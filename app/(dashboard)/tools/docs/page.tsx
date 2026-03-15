"use client";

import { useState } from "react";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/hooks/use-language";
import { DOCUMENT_TEMPLATES, DocumentTemplate } from "@/lib/document-templates";
import {
    FileText, Key, Banknote, Receipt, FileSignature,
    DoorOpen, ClipboardCheck, UserCheck, Handshake,
    Home, CalendarClock, Bot, ArrowRight, Sparkles, History,
    Building2, Store, Map as LandPlot, Plus
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
    Key, Banknote, Receipt, FileSignature,
    DoorOpen, ClipboardCheck, UserCheck, Handshake,
    Home, CalendarClock, FileText, History,
    Building2, Store, LandPlot
};

const CATEGORY_COLORS: Record<string, string> = {
    recibo: "bg-emerald-100 text-emerald-700",
    autorizacao: "bg-blue-100 text-blue-700",
    declaracao: "bg-teal-100 text-teal-700",
    proposta: "bg-violet-100 text-violet-700",
    ficha: "bg-indigo-100 text-indigo-700",
    termo: "bg-cyan-100 text-cyan-700",
};

function DocCard({ template }: { template: DocumentTemplate }) {
    const Icon = ICON_MAP[template.icon] ?? FileText;
    const { t } = useLanguage();

    return (
        <Card padding="md" hover className="flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${template.color}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${CATEGORY_COLORS[template.category]}`}>
                    {t(`docs.hub.categories.${template.category}`)}
                </span>
            </div>
            <div className="flex-1">
                <h2 className="font-display font-bold text-slate-900 text-base leading-tight mb-1">
                    {t(`docs.hub.templates.${template.id}.name`, template.name)}
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                    {t(`docs.hub.templates.${template.id}.desc`, template.description)}
                </p>
            </div>
            <div className="flex gap-2">
                <Link href={`/tools/docs/${template.id}?mode=form`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full" leftIcon={<FileText className="h-3.5 w-3.5" />}>
                        {t("docs.hub.btn_form")}
                    </Button>
                </Link>
                <Link href={`/tools/docs/ai?doc=${template.id}`} className="flex-1">
                    <Button size="sm" className="w-full" leftIcon={<Bot className="h-3.5 w-3.5" />}>
                        {t("docs.hub.btn_ai")}
                    </Button>
                </Link>
            </div>
        </Card>
    );
}

export default function DocsHubPage() {
    const { t, language } = useLanguage();
    const [activeCategory, setActiveCategory] = useState<string>("all");

    const categoryCounts = DOCUMENT_TEMPLATES.reduce((acc, template) => {
        acc[template.category] = (acc[template.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const categories = Object.keys(categoryCounts);

    const filteredTemplates = activeCategory === "all"
        ? DOCUMENT_TEMPLATES
        : DOCUMENT_TEMPLATES.filter((t) => t.category === activeCategory);

    return (
        <div className="space-y-8 pb-24">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">{t("docs.title")}</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {t("docs.hub.subtitle")}
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative group flex-1 sm:flex-none">
                        <Button leftIcon={<Plus className="h-4 w-4" />} className="w-full">
                            Novo Documento
                        </Button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 hidden group-hover:block z-50">
                            <Link href="/tools/docs/casa?mode=form" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                <Home className="h-4 w-4 text-blue-500" /> Casa
                            </Link>
                            <Link href="/tools/docs/apartamento?mode=form" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                <Building2 className="h-4 w-4 text-indigo-500" /> Apartamento
                            </Link>
                            <Link href="/tools/docs/comercial?mode=form" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                <Store className="h-4 w-4 text-orange-500" /> Comercial
                            </Link>
                            <Link href="/tools/docs/terreno?mode=form" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                <LandPlot className="h-4 w-4 text-emerald-500" /> Terreno
                            </Link>
                        </div>
                    </div>
                    <Link href="/tools/docs/history" className="flex-1 sm:flex-none">
                        <Button variant="outline" leftIcon={<History className="h-4 w-4" />} className="w-full">
                            Ver Histórico
                        </Button>
                    </Link>
                </div>
            </div>

            {/* How to use */}
            <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-purple-600 p-5 text-white flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex gap-3 sm:gap-6 text-sm flex-wrap">
                    {[t("docs.hub.step1"), t("docs.hub.step2"), t("docs.hub.step3"), t("docs.hub.step4")].map((step, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                            <span className="text-white/90">{step}</span>
                            {i < 3 && <ArrowRight className="h-3.5 w-3.5 text-white/40 hidden sm:block" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Category Filters */}
            <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 gap-2 scrollbar-hide">
                <button
                    onClick={() => setActiveCategory("all")}
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeCategory === "all" ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
                >
                    {t("docs.hub.categories.all", "Todos os Templates")}
                    <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${activeCategory === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                        {DOCUMENT_TEMPLATES.length}
                    </span>
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${activeCategory === cat ? "bg-slate-900 text-white shadow-md relative after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-slate-900" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
                    >
                        {t(`docs.hub.categories.${cat}`, cat)}
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest ${activeCategory === cat ? "opacity-90" : CATEGORY_COLORS[cat]}`}>
                            {categoryCounts[cat]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTemplates.map((template) => (
                    <DocCard key={template.id} template={template} />
                ))}
            </div>

            {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-slate-500">Nenhum template encontrado nesta categoria.</p>
                </div>
            )}
        </div>
    );
}
