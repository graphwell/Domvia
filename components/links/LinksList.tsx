"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { CampaignLink } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
    Plus, Link2, Copy, Eye, Users, MessageSquare,
    Calculator, ExternalLink, MoreVertical, Search, CheckCheck
} from "lucide-react";
import Link from "next/link";

export function LinksList({ links }: { links: CampaignLink[] }) {
    const [search, setSearch] = useState("");
    const [copied, setCopied] = useState<string | null>(null);

    const filtered = links.filter((l) =>
        l.title.toLowerCase().includes(search.toLowerCase())
    );

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://domvia.ai";

    const copyLink = (slug: string) => {
        navigator.clipboard.writeText(`${baseUrl}/lead/${slug}`);
        setCopied(slug);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">Meus Links</h1>
                    <p className="text-slate-500 text-sm mt-1">{links.length} link(s) ativo(s)</p>
                </div>
                <Link href="/links/new">
                    <Button leftIcon={<Plus className="h-4 w-4" />}>Criar Novo Link</Button>
                </Link>
            </div>

            {/* Instrução */}
            <div className="rounded-2xl bg-brand-50 border border-brand-200 p-4 text-sm text-brand-800">
                <p className="font-semibold mb-1">💡 Como funciona</p>
                <p className="text-brand-700">Crie um link para cada anúncio e compartilhe no Instagram, WhatsApp ou qualquer rede social. Quando o cliente acessar, verá a IA especialista + calculadora + botão de contato.</p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="search"
                    placeholder="Buscar link..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:outline-none"
                />
            </div>

            {/* Links */}
            <div className="space-y-3">
                {filtered.map((link) => (
                    <Card key={link.id} padding="md" hover className="group">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            {/* Icon + Info */}
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="h-10 w-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
                                    <Link2 className="h-5 w-5 text-brand-600" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-semibold text-slate-900 truncate">{link.title}</h3>
                                        <Badge variant={link.status === "active" ? "success" : "warning"} dot className="text-[10px]">
                                            {link.status === "active" ? "Ativo" : "Pausado"}
                                        </Badge>
                                    </div>
                                    {link.price && (
                                        <p className="text-xs text-brand-600 font-semibold mt-0.5">{formatCurrency(link.price)}</p>
                                    )}
                                    {/* URL do link */}
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <code className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg font-mono truncate max-w-[200px]">
                                            /lead/{link.slug}
                                        </code>
                                        <button
                                            onClick={() => copyLink(link.slug)}
                                            className="p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                                        >
                                            {copied === link.slug
                                                ? <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                                                : <Copy className="h-3.5 w-3.5" />
                                            }
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-4 text-xs text-slate-500 sm:justify-end">
                                <div className="flex items-center gap-1">
                                    <Eye className="h-3.5 w-3.5" />
                                    <span>{link.visits}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5 text-brand-400" />
                                    <span>{link.aiQuestions}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calculator className="h-3.5 w-3.5 text-emerald-400" />
                                    <span>{link.simulations}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 sm:ml-2">
                                <Link href={`/lead/${link.slug}`} target="_blank">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                ))}

                {/* Empty add card */}
                <Link href="/links/new">
                    <div className="flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 transition-all cursor-pointer p-6 group">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                            <Plus className="h-5 w-5 text-slate-400 group-hover:text-brand-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-500 group-hover:text-brand-600">Criar novo link de campanha</p>
                    </div>
                </Link>
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-xs text-slate-400 justify-center">
                <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> Visitas</span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-brand-400" /> Perguntas IA</span>
                <span className="flex items-center gap-1"><Calculator className="h-3.5 w-3.5 text-emerald-400" /> Simulações</span>
            </div>
        </div>
    );
}
