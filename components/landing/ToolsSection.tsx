"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FileText, Type, Instagram, Camera, Calculator, Link2, ArrowRight, FileSignature, Ruler, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";

export function ToolsSection() {
    const { t } = useLanguage();

    const tools = [
        {
            icon: FileSignature,
            name: t("tools_section.items.docs.name"),
            heroTitle: t("tools_section.items.docs.hero"),
            description: t("tools_section.items.docs.desc"),
            badge: t("tools_section.items.docs.badge"),
            badgeVariant: "brand" as const,
            color: "text-indigo-600 bg-indigo-50",
        },
        {
            icon: FileText,
            name: t("tools_section.items.desc.name"),
            heroTitle: t("tools_section.items.desc.hero"),
            description: t("tools_section.items.desc.desc"),
            badge: t("tools_section.items.desc.badge"),
            badgeVariant: "brand" as const,
            color: "text-purple-600 bg-purple-50",
        },
        {
            icon: Type,
            name: t("tools_section.items.titles.name"),
            heroTitle: t("tools_section.items.titles.hero"),
            description: t("tools_section.items.titles.desc"),
            badge: t("tools_section.items.titles.badge"),
            badgeVariant: "brand" as const,
            color: "text-indigo-600 bg-indigo-50",
        },
        {
            icon: Instagram,
            name: t("tools_section.items.social.name"),
            heroTitle: t("tools_section.items.social.hero"),
            description: t("tools_section.items.social.desc"),
            badge: t("tools_section.items.social.badge"),
            badgeVariant: "brand" as const,
            color: "text-pink-600 bg-pink-50",
        },
        {
            icon: Calculator,
            name: t("tools_section.items.finance.name"),
            heroTitle: t("tools_section.items.finance.hero"),
            description: t("tools_section.items.finance.desc"),
            badge: t("tools_section.items.finance.badge"),
            badgeVariant: "success" as const,
            color: "text-emerald-600 bg-emerald-50",
        },
        {
            icon: Camera,
            name: t("tools_section.items.tour.name"),
            heroTitle: t("tools_section.items.tour.hero"),
            description: t("tools_section.items.tour.desc"),
            badge: t("tools_section.items.tour.badge"),
            badgeVariant: "gold" as const,
            color: "text-gold-600 bg-gold-50",
        },
        {
            icon: Ruler,
            name: t("tools_section.items.terrain.name"),
            heroTitle: t("tools_section.items.terrain.hero"),
            description: t("tools_section.items.terrain.desc"),
            badge: t("tools_section.items.terrain.badge"),
            badgeVariant: "success" as const,
            color: "text-amber-600 bg-amber-50",
        },
        {
            icon: TrendingUp,
            name: t("tools_section.items.roi.name"),
            heroTitle: t("tools_section.items.roi.hero"),
            description: t("tools_section.items.roi.desc"),
            badge: t("tools_section.items.roi.badge"),
            badgeVariant: "success" as const,
            color: "text-teal-600 bg-teal-50",
        },
    ];

    return (
        <section id="ferramentas" className="py-24 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-brand-600 font-semibold text-sm uppercase tracking-wider mb-3">
                        {t("tools_section.badge") || "Ferramentas Domvia"}
                    </p>
                    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900">
                        {t("tools_section.title_start") || "Ferramentas que "}{" "}
                        <span className="gradient-text">{t("tools_section.title_highlight") || "economizam horas todo dia"}</span>
                    </h2>
                    <p className="mt-4 mx-auto max-w-xl text-slate-600">
                        {t("tools_section.subtitle") || "IA generativa integrada para cada etapa da rotina do corretor — do anúncio ao documento assinado."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tools.map((tool, i) => (
                        <Link key={tool.name} href="/register" className="group block">
                            <Card hover className={`h-full animate-fade-up delay-${(i % 3) * 100} p-8`}>
                                <div className="flex items-start justify-between mb-6">
                                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${tool.color}`}>
                                        <tool.icon className="h-7 w-7" />
                                    </div>
                                    <Badge variant={tool.badgeVariant} className="shrink-0">{tool.badge}</Badge>
                                </div>
                                <h3 className="font-display text-xl sm:text-2xl font-black text-slate-900 mb-3 group-hover:text-brand-600 transition-colors leading-[1.2]">
                                    {tool.heroTitle}
                                </h3>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                    {tool.description}
                                </p>
                                <div className="mt-6 flex items-center gap-1 text-brand-600 text-sm font-bold uppercase tracking-wide">
                                    {t("tools_section.use_tool") || "Usar ferramenta"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
