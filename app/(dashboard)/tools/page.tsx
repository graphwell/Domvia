"use client";

import { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FileText, Type, Instagram, Calculator, Camera, ArrowRight, Key, Ruler, TrendingUp, FolderOpen, Bot, Coins } from "lucide-react";
import { useAuth } from "@/hooks/auth-provider";
import { useState, useEffect } from "react";
import { getToolCostDynamic } from "@/lib/billing";

const tools = [
    {
        id: "doc_gen",
        icon: FolderOpen,
        name: "Gerador de Documentos",
        description: "10 documentos imobiliários pré-prontos: recibos, autorizações, propostas, fichas e mais. Via formulário ou Inteligência Artificial.",
        badge: "10 Docs + IA",
        badgeVariant: "brand" as const,
        href: "/tools/docs",
        color: "text-brand-600 bg-brand-50",
    },
    {
        id: "description_gen",
        icon: FileText,
        name: "Gerador de Descrição",
        description: "IA gera uma descrição profissional e persuasiva para o seu imóvel com base nas características principais.",
        badge: "IA",
        badgeVariant: "brand" as const,
        href: "/tools/description",
        color: "text-brand-600 bg-brand-50",
    },
    {
        id: "title_gen",
        icon: Type,
        name: "Sugestão de Títulos",
        description: "Gere títulos de alto impacto para anúncios no Zap, VivaReal, Instagram e outros portais.",
        badge: "IA",
        badgeVariant: "brand" as const,
        href: "/tools/title",
        color: "text-purple-600 bg-purple-50",
    },
    {
        id: "social_gen",
        icon: Instagram,
        name: "Texto para Redes Sociais",
        description: "Crie captions completos para Instagram, Facebook e WhatsApp, com hashtags e emojis incluídos.",
        badge: "IA",
        badgeVariant: "brand" as const,
        href: "/tools/social",
        color: "text-pink-600 bg-pink-50",
    },
    {
        id: "finance",
        icon: Calculator,
        name: "Simulador de Financiamento",
        description: "Calcule parcelas e cenários de financiamento. Perfeito para enviar para clientes via WhatsApp.",
        badge: "Grátis",
        badgeVariant: "success" as const,
        href: "/tools/simulator",
        color: "text-emerald-600 bg-emerald-50",
    },
    {
        id: "tour_360",
        icon: Camera,
        name: "Tour Virtual 360°",
        description: "Crie tours virtuais imersivos por ambiente. Clientes visitam o imóvel sem sair de casa.",
        badge: "1 Crédito",
        badgeVariant: "gold" as const,
        href: "/tours/new",
        color: "text-gold-600 bg-gold-50",
    },
    {
        id: "terrain",
        icon: Ruler,
        name: "Calculadora de Terreno",
        description: "Calcule a área de terrenos em qualquer formato: retangular, triangular, trapézio ou irregular (fórmula de Gauss). Converte para hectares, alqueires e pés quadrados.",
        badge: "Grátis",
        badgeVariant: "success" as const,
        href: "/tools/land",
        color: "text-lime-600 bg-lime-50",
    },
    {
        id: "captacao",
        icon: Camera,
        name: "Captação Inteligente",
        description: "Capture fotos de placas e a IA identifica telefones e cria registros automáticos com localização.",
        badge: "Novo + IA",
        badgeVariant: "brand" as const,
        href: "/tools/captacao",
        color: "text-brand-600 bg-brand-50",
    },
    {
        id: "rentability",
        icon: TrendingUp,
        name: "Rentabilidade do Imóvel",
        description: "Simule o retorno real de um imóvel para aluguel (yield, payback, valorização) ou compra e venda (ROI, IRPF, lucro líquido).",
        badge: "Grátis",
        badgeVariant: "success" as const,
        href: "/tools/investment",
        color: "text-teal-600 bg-teal-50",
    },
];

function ToolBadge({ toolId, fallbackBadge, fallbackVariant }: { toolId: string, fallbackBadge: string, fallbackVariant: any }) {
    const { user } = useAuth();
    const [cost, setCost] = useState<number | null>(null);

    useEffect(() => {
        if (user?.planId) {
            getToolCostDynamic(toolId, user.planId).then(setCost);
        }
    }, [toolId, user?.planId]);

    if (cost === null) return <Badge variant={fallbackVariant}>{fallbackBadge}</Badge>;
    if (cost === 0) return <Badge variant="success">Grátis</Badge>;

    return (
        <Badge variant="gold" className="flex items-center gap-1">
            <Coins className="h-3 w-3" />
            {cost} {cost === 1 ? 'Crédito' : 'Créditos'}
        </Badge>
    );
}

export default function ToolsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">Ferramentas de IA</h1>
                <p className="text-slate-500 text-sm mt-1">Ferramentas inteligentes para acelerar sua rotina</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {tools.map((tool) => (
                    <Link key={tool.name} href={tool.href} className="group block">
                        <Card hover className="h-full transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${tool.color}`}>
                                    <tool.icon className="h-6 w-6" />
                                </div>
                                <ToolBadge 
                                    toolId={tool.id} 
                                    fallbackBadge={tool.badge} 
                                    fallbackVariant={tool.badgeVariant} 
                                />
                            </div>
                            <h2 className="font-display text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                                {tool.name}
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed">{tool.description}</p>
                            <div className="mt-4 flex items-center gap-1 text-brand-600 text-sm font-semibold">
                                Usar ferramenta <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
