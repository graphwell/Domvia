"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, set, update } from "firebase/database";
import { toast } from "sonner";
import { 
    Coins, FileText, MessageSquare, Link2, 
    Calculator, Camera, Edit2, TrendingUp, 
    BarChart2, Save, Undo, Info
} from "lucide-react";

interface CreditCost {
    id: string;
    name: string;
    icon: any;
    free: number;
    pro: number;
    max: number;
}

const TOOL_DEFINITIONS = [
    { id: 'ai_chat', name: 'IA Conversacional', icon: MessageSquare },
    { id: 'captacao', name: 'Documento de Captação', icon: FileText },
    { id: 'doc_gen', name: 'Gerador de Documentos', icon: FileText },
    { id: 'terrain', name: 'Documento de Terreno', icon: FileText },
    { id: 'description_gen', name: 'Gerador de Descrição', icon: Edit2 },
    { id: 'title_gen', name: 'Sugestão de Títulos', icon: TrendingUp },
    { id: 'social_gen', name: 'Texto para Redes Sociais', icon: BarChart2 },
    { id: 'tour_360', name: 'Tour 360°', icon: Camera },
    { id: 'link_gen', name: 'Links Inteligentes', icon: Link2 },
    { id: 'finance', name: 'Simulação de Financiamento', icon: Calculator },
];

export default function CreditSettingsPage() {
    const [costs, setCosts] = useState<Record<string, { free: number, pro: number, max: number }>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const costsRef = ref(rtdb, "settings/tool_costs");
        return onValue(costsRef, (snap) => {
            if (snap.exists()) {
                setCosts(snap.val());
            } else {
                // Initialize with defaults if empty
                const defaults: any = {};
                TOOL_DEFINITIONS.forEach(t => {
                    defaults[t.id] = { free: 2, pro: 1, max: 0 };
                });
                setCosts(defaults);
            }
            setLoading(false);
        });
    }, []);

    const handleChange = (toolId: string, plan: 'free' | 'pro' | 'max', value: string) => {
        const num = parseInt(value) || 0;
        setCosts(prev => ({
            ...prev,
            [toolId]: {
                ...prev[toolId],
                [plan]: num
            }
        }));
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            await set(ref(rtdb, "settings/tool_costs"), costs);
            // Also sync to the legacy/simple config for backward compatibility if needed
            const simpleCosts: any = {};
            Object.entries(costs).forEach(([id, val]) => {
                simpleCosts[id] = val.free; // Use free as default
            });
            await update(ref(rtdb, "settings"), { tool_credit_costs: simpleCosts });
            
            toast.success("Configurações de crédito salvas!");
        } catch (err) {
            toast.error("Erro ao salvar configurações.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Carregando configurações...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-black text-slate-900 tracking-tight">
                        Controle de <span className="text-brand-600">Créditos</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Configure quanto cada ferramenta consome por plano.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" leftIcon={<Undo className="h-4 w-4" />} onClick={() => window.location.reload()}>
                        Descartar
                    </Button>
                    <Button 
                        onClick={saveSettings} 
                        loading={saving}
                        className="bg-brand-600 hover:bg-brand-700 shadow-brand-500/20" 
                        leftIcon={<Save className="h-4 w-4" />}
                    >
                        Salvar Alterações
                    </Button>
                </div>
            </div>

            <Card padding="none" className="border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ferramenta / Documento</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center bg-slate-100/50">FREE / TRIAL</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center bg-brand-50 text-brand-600">PRO</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center bg-amber-50 text-amber-600">MAX</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {TOOL_DEFINITIONS.map((tool) => (
                            <tr key={tool.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                                            <tool.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{tool.name}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">{tool.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 bg-slate-100/20">
                                    <div className="flex justify-center">
                                        <input 
                                            type="number"
                                            value={costs[tool.id]?.free ?? 0}
                                            onChange={(e) => handleChange(tool.id, 'free', e.target.value)}
                                            className="w-20 text-center py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-brand-500/20"
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4 bg-brand-50/20">
                                    <div className="flex justify-center">
                                        <input 
                                            type="number"
                                            value={costs[tool.id]?.pro ?? 0}
                                            onChange={(e) => handleChange(tool.id, 'pro', e.target.value)}
                                            className="w-20 text-center py-2 bg-white border border-brand-200 rounded-lg text-sm font-bold text-brand-700 focus:ring-2 focus:ring-brand-500/20"
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4 bg-amber-50/10">
                                    <div className="flex justify-center">
                                        <input 
                                            type="number"
                                            value={costs[tool.id]?.max ?? 0}
                                            onChange={(e) => handleChange(tool.id, 'max', e.target.value)}
                                            className="w-20 text-center py-2 bg-white border border-amber-200 rounded-lg text-sm font-bold text-amber-700 focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <Card padding="md" className="bg-blue-50 border-blue-100">
                <div className="flex gap-4">
                    <Info className="h-5 w-5 text-blue-500 shrink-0" />
                    <div>
                        <h4 className="text-sm font-bold text-blue-900">Como funciona o custo diferenciado?</h4>
                        <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                            Quando um usuário utiliza uma ferramenta, o sistema verifica o plano dele e subtrai a quantidade de créditos correspondente configurada acima. 
                            Geralmente o plano <strong>MAX</strong> tem custo <strong>0</strong> para a maioria das ferramentas, incentivando o upgrade.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
