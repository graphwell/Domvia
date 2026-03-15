"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { CampaignLink } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
    Plus, Link2, Copy, Eye, Users, MessageSquare,
    Calculator, ExternalLink, MoreVertical, Search, CheckCheck, 
    MousePointer2, LayoutTemplate, Trash2, Printer, Download
} from "lucide-react";
import Link from "next/link";
import { triggerHaptic } from "@/lib/haptic";
import { rtdb } from "@/lib/firebase";
import { ref, remove } from "firebase/database";
import { toast } from "sonner";

export function LinksList({ links }: { links: CampaignLink[] }) {
    const [search, setSearch] = useState("");
    const [copied, setCopied] = useState<string | null>(null);

    const handleDeleteLink = async (id: string, title: string) => {
        if (!confirm(`Tem certeza que deseja excluir o link "${title}"? Esta ação não pode ser desfeita.`)) return;
        
        triggerHaptic('medium');
        try {
            await remove(ref(rtdb, `links/${id}`));
            toast.success("Link excluído com sucesso.");
        } catch (err) {
            toast.error("Erro ao excluir link.");
            console.error(err);
        }
    };

    const filtered = links.filter((l) =>
        l.title.toLowerCase().includes(search.toLowerCase())
    );

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://domvia.ai";

    const copyLink = (path: string, id: string) => {
        triggerHaptic('light');
        navigator.clipboard.writeText(`${baseUrl}${path}`);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const handlePrint = () => {
        triggerHaptic('light');
        window.print();
    };

    const handleExportCSV = () => {
        if (links.length === 0) return;
        triggerHaptic('light');

        const headers = ["Título", "Preço", "Slug", "IA Visitas", "IA Perguntas", "Status", "LP Ativa", "LP Visitas", "LP Cliques"];
        const rows = filtered.map(l => [
            `"${l.title.replace(/"/g, '""')}"`,
            l.price || 0,
            l.slug,
            l.visits || 0,
            l.aiQuestions || 0,
            l.status === 'active' ? 'Ativo' : 'Pausado',
            l.landing_enabled ? 'Sim' : 'Não',
            l.landing_views || 0,
            l.landing_cta_clicks || 0
        ].join(","));

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `meus_links_domvia_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Planilha exportada com sucesso!");
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between print:hidden">
                <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">Meus Links</h1>
                    <p className="text-slate-500 text-sm mt-1">{links.length} link(s) ativo(s)</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrint} className="hidden sm:flex" leftIcon={<Printer className="h-4 w-4" />}>
                        Imprimir / PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportCSV} className="hidden sm:flex" leftIcon={<Download className="h-4 w-4" />}>
                        Exportar CSV
                    </Button>
                    <Link href="/links/new" onClick={() => triggerHaptic('light')}>
                        <Button leftIcon={<Plus className="h-4 w-4" />}>Criar Novo Link</Button>
                    </Link>
                </div>
            </div>

            {/* Instrução */}
            <div className="rounded-2xl bg-brand-50 border border-brand-200 p-4 text-sm text-brand-800 print:hidden">
                <p className="font-semibold mb-1">💡 Como funciona</p>
                <p className="text-brand-700">Crie um link para cada anúncio e compartilhe no Instagram, WhatsApp ou qualquer rede social. Quando o cliente acessar, verá a IA especialista + calculadora + botão de contato.</p>
            </div>

            {/* Search */}
            <div className="relative print:hidden">
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
                                    <div className="flex flex-col gap-1 mt-2">
                                        <div className="flex items-center gap-1.5">
                                            <code className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg font-mono truncate max-w-[200px]">
                                                /lead/{link.slug}
                                            </code>
                                            <button
                                                onClick={() => copyLink(`/lead/${link.slug}`, link.id)}
                                                className="p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                                            >
                                                {copied === link.id
                                                    ? <CheckCheck className="h-3 w-3 text-emerald-500" />
                                                    : <Copy className="h-3 w-3" />
                                                }
                                            </button>
                                        </div>
                                        
                                        {link.landing_enabled && (
                                            <div className="flex items-center gap-1.5 group/lp">
                                                <Badge variant="brand" className="text-[9px] h-4 py-0 flex items-center gap-1 border-brand-100">
                                                    <LayoutTemplate className="h-2 w-2" /> LANDING
                                                </Badge>
                                                <code className="text-[10px] text-brand-600 bg-brand-50 px-2 py-0.5 rounded-lg font-mono truncate max-w-[200px]">
                                                    /l/{link.slug}
                                                </code>
                                                <button
                                                    onClick={() => copyLink(`/l/${link.slug}`, link.id + 'lp')}
                                                    className="p-1 rounded-md hover:bg-brand-100 text-brand-400 hover:text-brand-600 transition-colors"
                                                >
                                                    {copied === link.id + 'lp'
                                                        ? <CheckCheck className="h-3 w-3 text-emerald-500" />
                                                        : <Copy className="h-3 w-3" />
                                                    }
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-4 sm:ml-auto">
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[9px] uppercase font-bold text-slate-400 mb-0.5">IA Chat</span>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1" title="Visitas no Chat">
                                                <Eye className="h-3.5 w-3.5 text-slate-400" />
                                                <span className="font-bold">{link.visits}</span>
                                            </div>
                                            <div className="flex items-center gap-1" title="Perguntas feitas">
                                                <Users className="h-3.5 w-3.5 text-brand-400" />
                                                <span className="font-bold">{link.aiQuestions}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {link.landing_enabled && (
                                        <div className="flex flex-col items-center border-l border-slate-100 pl-4">
                                            <span className="text-[9px] uppercase font-bold text-slate-400 mb-0.5">Landing Page</span>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1" title="Visitas na Landing">
                                                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                                                    <span className="font-bold text-slate-900">{link.landing_views || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1" title="Cliques no Botão">
                                                    <MousePointer2 className="h-3.5 w-3.5 text-brand-500" />
                                                    <span className="font-bold text-brand-600">{link.landing_cta_clicks || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 sm:ml-2">
                                <Link href={`/lead/${link.slug}`} target="_blank">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-brand-600">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </Button>
                                </Link>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleDeleteLink(link.id, link.title);
                                    }}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
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
