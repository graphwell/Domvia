"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Lead } from "@/types";
import { Users, MessageSquare, Calculator, Clock, Phone, Trash2, Printer, Download } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";
import { triggerHaptic } from "@/lib/haptic";
import { rtdb } from "@/lib/firebase";
import { ref, set } from "firebase/database";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

export function LeadsList({ leads }: { leads: Lead[] }) {
    const totalLeads = leads.length;
    const chatLeads = leads.filter((l) => l.usedChat).length;
    const calcLeads = leads.filter((l) => l.usedCalculator).length;
    const avgTime = Math.round(leads.reduce((s, l) => s + (l.timeOnPage || 0), 0) / (leads.length || 1));

    const stats = [
        { label: "Total de Leads", value: totalLeads, icon: Users, color: "text-brand-600 bg-brand-50" },
        { label: "Usaram a IA", value: chatLeads, icon: MessageSquare, color: "text-purple-600 bg-purple-50" },
        { label: "Simularam Financ.", value: calcLeads, icon: Calculator, color: "text-emerald-600 bg-emerald-50" },
        { label: "Tempo Médio", value: `${avgTime}s`, icon: Clock, color: "text-gold-600 bg-gold-50" },
    ];

    const handleDeleteLead = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir o lead "${name || 'Visitante'}"?`)) return;
        
        triggerHaptic('medium');
        try {
            await set(ref(rtdb, `leads/${id}`), null);
            toast.success("Lead excluído com sucesso.");
        } catch (err) {
            toast.error("Erro ao excluir lead.");
            console.error(err);
        }
    };

    const handlePrint = () => {
        triggerHaptic('light');
        window.print();
    };

    const handleExportCSV = () => {
        if (leads.length === 0) return;
        triggerHaptic('light');

        const headers = ["Nome", "WhatsApp", "Anúncio", "Status", "Interações", "Data"];
        const rows = leads.map(l => {
            const interactions = [
                l.usedChat ? 'IA' : '',
                l.usedCalculator ? 'Simulador' : ''
            ].filter(Boolean).join(" | ");

            return [
                `"${(l.name ?? 'Visitante') + ' ' + (l.lastName ?? '')}"`,
                l.phone ?? "N/I",
                `"${(l.linkTitle ?? '').replace(/"/g, '""')}"`,
                l.status === 'new' ? 'Novo' : l.status === 'qualified' ? 'Qualificado' : 'Contatado',
                `"${interactions}"`,
                new Date(l.createdAt).toLocaleString('pt-BR')
            ].join(",");
        });

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `leads_domvia_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Lista de leads exportada!");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between print:hidden">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">Leads</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrint} className="hidden sm:flex" leftIcon={<Printer className="h-4 w-4" />}>
                        Imprimir / PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportCSV} className="hidden sm:flex" leftIcon={<Download className="h-4 w-4" />}>
                        Exportar CSV
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
                {stats.map((s) => (
                    <Card key={s.label} padding="md">
                        <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl mb-2 ${s.color}`}>
                            <s.icon className="h-4 w-4" />
                        </div>
                        <p className="font-display text-2xl font-black text-slate-900">{s.value}</p>
                        <p className="text-xs text-slate-500">{s.label}</p>
                    </Card>
                ))}
            </div>

            <Card padding="none" className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Lead</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">WhatsApp</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden sm:table-cell">Anúncio</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Status</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Interações</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Data</th>
                                <th className="text-center px-4 py-3 font-medium text-slate-600 print:hidden">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map((lead) => (
                                <tr 
                                    key={lead.id} 
                                    onClick={() => triggerHaptic('light')}
                                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                {lead.name ? lead.name.charAt(0).toUpperCase() : "?"}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{lead.name ? `${lead.name} ${lead.lastName ?? ""}` : "Visitante"}</p>
                                                <p className="text-xs text-slate-400">{(lead.questions || []).length} perguntas</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                                            <Phone className="h-3 w-3 text-emerald-500" />
                                            {lead.phone ?? "Não informado"}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell">
                                        <p className="text-slate-700 truncate max-w-[180px]">{lead.linkTitle}</p>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <Badge variant={lead.status === "new" ? "brand" : lead.status === "qualified" ? "success" : "warning"} dot>
                                            {lead.status === "new" ? "Novo" : lead.status === "qualified" ? "Qualificado" : "Contatado"}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <div className="flex gap-2 text-xs text-slate-500">
                                            {lead.usedChat && <span className="flex items-center gap-1 bg-purple-50 text-purple-600 rounded px-1.5 py-0.5"><MessageSquare className="h-3 w-3" />IA</span>}
                                            {lead.usedCalculator && <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 rounded px-1.5 py-0.5"><Calculator className="h-3 w-3" />Calc</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-400">
                                        {formatRelativeDate(lead.createdAt)}
                                    </td>
                                    <td className="px-4 py-3 text-center print:hidden">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteLead(lead.id, `${lead.name ?? ''} ${lead.lastName ?? ''}`.trim());
                                            }}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
