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
    BarChart2, Save, Undo, Info, Users,
    Clock, Smartphone
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
    { id: 'captacao', name: 'Captação Inteligente (OCR)', icon: Camera },
    { id: 'doc_gen', name: 'Gerador de Documentos', icon: FileText },
    { id: 'terrain', name: 'Pesquisa de Terrenos', icon: FileText },
    { id: 'description_gen', name: 'Gerador de Descrição', icon: Edit2 },
    { id: 'title_gen', name: 'Sugestão de Títulos', icon: TrendingUp },
    { id: 'social_gen', name: 'Texto para Redes Sociais', icon: BarChart2 },
    { id: 'tour_360', name: 'Tour Virtual 360°', icon: Camera },
    { id: 'link_gen', name: 'Links Inteligentes', icon: Link2 },
    { id: 'finance', name: 'Simulação de Financiamento', icon: Calculator },
    { id: 'rentability', name: 'Cálculo de Rentabilidade', icon: Calculator },
    { id: 'landing_page', name: 'Landing Pages', icon: Smartphone },
];

export default function CreditSettingsPage() {
    const [costs, setCosts] = useState<Record<string, { free: number, pro: number, max: number }>>({});
    const [referralRules, setReferralRules] = useState({
        reward_referrer: 10,
        reward_referred: 5,
        limit_per_user: 5,
        expiration_days: 30
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const costsRef = ref(rtdb, "settings/tool_costs");
        const rulesRef = ref(rtdb, "settings/referral_rules");
        
        onValue(costsRef, (snap) => {
            if (snap.exists()) {
                setCosts(snap.val());
            } else {
                const defaults: any = {};
                TOOL_DEFINITIONS.forEach(t => {
                    defaults[t.id] = { free: 2, pro: 1, max: 0 };
                });
                setCosts(defaults);
            }
        });

        onValue(rulesRef, (snap) => {
            if (snap.exists()) {
                setReferralRules(snap.val());
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

    const handleRuleChange = (key: string, value: string) => {
        const num = parseInt(value) || 0;
        setReferralRules(prev => ({ ...prev, [key]: num }));
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            await update(ref(rtdb, "settings"), {
                tool_costs: costs,
                referral_rules: referralRules
            });
            
            // Sync to the legacy/simple config for backward compatibility
            const simpleCosts: any = {};
            Object.entries(costs).forEach(([id, val]) => {
                simpleCosts[id] = val.free;
            });
            await update(ref(rtdb, "settings"), { tool_credit_costs: simpleCosts });
            
            toast.success("Configurações salvas com sucesso!");
        } catch (err) {
            toast.error("Erro ao salvar configurações.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Carregando configurações...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-black text-slate-900 tracking-tight">
                        Monetização e <span className="text-brand-600">Créditos</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Controle de custos por ferramenta e regras de indicação.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" leftIcon={<Undo className="h-4 w-4" />} onClick={() => window.location.reload()}>
                        Descartar
                    </Button>
                    <Button 
                        onClick={saveSettings} 
                        loading={saving}
                        className="bg-brand-600 hover:bg-brand-700 shadow-xl shadow-brand-500/20" 
                        leftIcon={<Save className="h-4 w-4" />}
                    >
                        Salvar Alterações
                    </Button>
                </div>
            </div>

            {/* Referral Rules Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card padding="lg" className="border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Users className="h-24 w-24" />
                    </div>
                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <Users className="h-5 w-5 text-brand-600" />
                            <h2 className="font-bold text-slate-800">Regras de Indicação</h2>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reco. Quem Indica</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={referralRules.reward_referrer}
                                        onChange={(e) => handleRuleChange('reward_referrer', e.target.value)}
                                        className="w-full bg-slate-50 rounded-xl border-slate-200 py-3 px-4 font-bold text-slate-700 focus:ring-brand-500" 
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">CR</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reco. Indicado</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={referralRules.reward_referred}
                                        onChange={(e) => handleRuleChange('reward_referred', e.target.value)}
                                        className="w-full bg-slate-50 rounded-xl border-slate-200 py-3 px-4 font-bold text-slate-700 focus:ring-brand-500" 
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">CR</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card padding="lg" className="border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Clock className="h-24 w-24" />
                    </div>
                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <Clock className="h-5 w-5 text-amber-600" />
                            <h2 className="font-bold text-slate-800">Limites e Validade</h2>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Limite por Usuário</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={referralRules.limit_per_user}
                                        onChange={(e) => handleRuleChange('limit_per_user', e.target.value)}
                                        className="w-full bg-slate-50 rounded-xl border-slate-200 py-3 px-4 font-bold text-slate-700 focus:ring-brand-500" 
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">MAX</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Validade (Dias)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={referralRules.expiration_days}
                                        onChange={(e) => handleRuleChange('expiration_days', e.target.value)}
                                        className="w-full bg-slate-50 rounded-xl border-slate-200 py-3 px-4 font-bold text-slate-700 focus:ring-brand-500" 
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">DIAS</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <Card padding="none" className="border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <Info className="h-4 w-4 text-slate-400" />
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Custo por Ferramenta (Consumo de Saldo)</h2>
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200">
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ferramenta</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center bg-slate-100/50">TRIAL / FREE</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center bg-brand-50 text-brand-600 font-display">PRO PLAN</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center bg-amber-50 text-amber-600 font-display">MAX PLAN</th>
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
                                            <p className="font-bold text-slate-900 text-sm whitespace-nowrap">{tool.name}</p>
                                            <p className="text-[10px] text-slate-400 font-mono leading-none">{tool.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 bg-slate-100/10">
                                    <div className="flex justify-center">
                                        <input 
                                            type="number"
                                            value={costs[tool.id]?.free ?? 0}
                                            onChange={(e) => handleChange(tool.id, 'free', e.target.value)}
                                            className="w-20 text-center py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20"
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4 bg-brand-50/10">
                                    <div className="flex justify-center">
                                        <input 
                                            type="number"
                                            value={costs[tool.id]?.pro ?? 0}
                                            onChange={(e) => handleChange(tool.id, 'pro', e.target.value)}
                                            className="w-20 text-center py-2 bg-white border border-brand-200 rounded-xl text-sm font-bold text-brand-700 focus:ring-2 focus:ring-brand-500/20"
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4 bg-amber-50/5">
                                    <div className="flex justify-center">
                                        <input 
                                            type="number"
                                            value={costs[tool.id]?.max ?? 0}
                                            onChange={(e) => handleChange(tool.id, 'max', e.target.value)}
                                            className="w-20 text-center py-2 bg-white border border-amber-200 rounded-xl text-sm font-bold text-amber-700 focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <Card padding="md" className="bg-slate-900 border-slate-800 text-slate-300">
                <div className="flex gap-4">
                    <Info className="h-5 w-5 text-brand-500 shrink-0 mt-1" />
                    <div>
                        <h4 className="text-sm font-bold text-white">Hierarquia de Custos</h4>
                        <p className="text-xs mt-1 leading-relaxed">
                            O sistema aplica primeiro os limites mensais do plano. Quando o limite acaba, o custo configurado aqui é debitado do saldo de créditos. 
                            Geralmente os custos para o <strong>MAX PLAN</strong> são zerados, pois o plano é considerado ilimitado.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
