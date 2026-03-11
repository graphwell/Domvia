"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Lead } from "@/types";
import { Users, MessageSquare, Calculator, Clock, Phone } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";

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

    return (
        <div className="space-y-6">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">Leads</h1>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map((lead) => (
                                <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
