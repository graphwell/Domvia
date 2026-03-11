"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { calculateFinancing } from "@/lib/financing";
import { formatCurrency } from "@/lib/utils";
import {
    Calculator, ArrowLeft, Share2, Info,
    Settings2, ChevronRight, Lock,
    CheckCircle2, AlertCircle, Sparkles
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { getPermissions, SimulatorLevel, canAccessLevel } from "@/lib/permissions";
import { useAuth } from "@/hooks/auth-provider";
import { SmartSimulator } from "./SmartSimulator";
import { ToolPaywall } from "@/components/credits/ToolPaywall";
import { hasToolUnlocked } from "@/lib/credits";
import { useEffect } from "react";

export default function SimulatorPage() {
    const { user, isLoading } = useAuth();

    // Auto-grant full access to admins, otherwise check perms
    const isAdmin = user?.role === "ADMIN_MASTER" || user?.role === "ADMIN";
    const basePermissions = getPermissions(user?.planId || "starter");
    const simulatorLevelFromPerms = user?.simulatorLevel || (isAdmin ? "professional" : basePermissions.simulatorLevel);

    // Auto-select based on max available permissions
    const [selectedLevel, setSelectedLevel] = useState<SimulatorLevel>(simulatorLevelFromPerms);
    const [unlockedTemporarily, setUnlockedTemporarily] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!user) return;
        async function checkUnlocks() {
            const adv = await hasToolUnlocked(user!.id, "simulator_advanced");
            const pro = await hasToolUnlocked(user!.id, "simulator_professional");
            setUnlockedTemporarily({ advanced: adv, professional: pro });
        }
        checkUnlocks();
    }, [user, selectedLevel]);

    // Inputs como strings para evitar o bug do "zero fixo" e permitir edição fluida
    const [inputs, setInputs] = useState({
        propertyValue: "500000",
        downPayment: "100000",
        years: "30",
        annualRate: "10.99",
        amortization: "price" as "price" | "sac",
        itbiRate: "2.0",
        registryRate: "1.0",
    });

    const calcResult = useMemo(() => {
        return calculateFinancing({
            propertyValue: Number(inputs.propertyValue) || 0,
            downPayment: Number(inputs.downPayment) || 0,
            years: Number(inputs.years) || 0,
            annualRate: Number(inputs.annualRate) || 0,
            amortization: inputs.amortization,
            itbiRate: Number(inputs.itbiRate) || 0,
            registryRate: Number(inputs.registryRate) || 0,
        });
    }, [inputs]);

    const handleInputChange = (field: keyof typeof inputs, value: string) => {
        // Aceita apenas números e um ponto decimal
        const sanitized = value.replace(/[^0-9.]/g, "");
        setInputs(prev => ({ ...prev, [field]: sanitized }));
    };

    const shareResults = () => {
        const text = `*Simulação de Financiamento*\n\n` +
            `🏠 Imóvel: ${formatCurrency(calcResult.totalFinanced + Number(inputs.downPayment))}\n` +
            `💰 Entrada: ${formatCurrency(Number(inputs.downPayment))}\n` +
            `📅 Prazo: ${calcResult.months / 12} anos (${inputs.amortization.toUpperCase()})\n` +
            `📊 Taxa: ${inputs.annualRate}% a.a.\n\n` +
            `*Resultado Estimado:*\n` +
            `💵 ${inputs.amortization === "sac" ? "1ª Parcela" : "Parcela Fixa"}: ${formatCurrency(calcResult.monthlyInstallment)}\n` +
            (inputs.amortization === "sac" ? `📉 Última Parcela: ${formatCurrency(calcResult.lastInstallment || 0)}\n` : "") +
            `🏦 Custo Total: ${formatCurrency(calcResult.totalPaid)}\n\n` +
            `*Taxas e Impostos:*\n` +
            `📝 ITBI: ${formatCurrency(calcResult.itbiCost)}\n` +
            `🏢 Registro: ${formatCurrency(calcResult.registryCost)}\n\n` +
            `Simulado via Domvia`;

        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank");
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Carregando permissões...</div>;
    }

    const isLocked = !canAccessLevel(selectedLevel, simulatorLevelFromPerms) && !unlockedTemporarily[selectedLevel];

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-24 lg:pb-12">
            {/* Header com Seletor de Nível */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/tools">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-display text-2xl font-bold text-slate-900 leading-tight">Simulador</h1>
                        <p className="text-slate-500 text-xs">Precisão total no cálculo imobiliário</p>
                    </div>
                </div>

                <div className="inline-flex p-1 bg-slate-100 rounded-2xl self-start sm:self-center">
                    {(["basic", "advanced", "professional"] as const).map((level) => (
                        <button
                            key={level}
                            onClick={() => setSelectedLevel(level)}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${selectedLevel === level
                                ? "bg-white text-brand-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            {level === "basic" && "Simples"}
                            {level === "advanced" && "Inteligente"}
                            {level === "professional" && "Profissional"}
                            {!canAccessLevel(level, simulatorLevelFromPerms) && !unlockedTemporarily[level] && (
                                <Lock className="h-3 w-3 opacity-50" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {isLocked ? (
                <ToolPaywall
                    toolId={`simulator_${selectedLevel}`}
                    toolName={`Simulador ${selectedLevel === "advanced" ? "Inteligente" : "Profissional"}`}
                    description={`Desbloqueie o simulador de alta performance para mostrar aos seus clientes de forma clara as vantagens do financiamento e os subsídios aplicáveis. Liberação válida por 30 dias.`}
                    creditCost={selectedLevel === "advanced" ? 25 : 50}
                    durationDays={30}
                    onUnlockSuccess={() => setUnlockedTemporarily(prev => ({ ...prev, [selectedLevel]: true }))}
                />
            ) : selectedLevel === "advanced" ? (
                <SmartSimulator />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Coluna de Inputs — Mobile Optimized */}
                    <div className="lg:col-span-7 space-y-4">
                        <Card padding="md" className="space-y-5 border-slate-200/60 shadow-sm">
                            <h2 className="font-display font-bold text-slate-800 flex items-center gap-2 text-sm border-b border-slate-100 pb-3">
                                <Settings2 className="h-4 w-4 text-brand-600" />
                                Configurações do Financiamento
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Valor do Imóvel</label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-brand-600 transition-colors">R$</span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={inputs.propertyValue}
                                            onChange={(e) => handleInputChange("propertyValue", e.target.value)}
                                            className="w-full bg-slate-50/50 rounded-2xl border-2 border-transparent border-slate-100 px-10 py-3 text-lg font-display font-bold text-slate-800 focus:border-brand-500/20 focus:bg-white focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Entrada</label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-brand-600 transition-colors">R$</span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={inputs.downPayment}
                                            onChange={(e) => handleInputChange("downPayment", e.target.value)}
                                            className="w-full bg-slate-50/50 rounded-2xl border-2 border-transparent border-slate-100 px-10 py-3 text-lg font-display font-bold text-slate-800 focus:border-brand-500/20 focus:bg-white focus:outline-none transition-all"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 px-1">
                                        {Math.round((Number(inputs.downPayment) / (Number(inputs.propertyValue) || 1)) * 100)}% do valor total
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Prazo (anos)</label>
                                    <select
                                        value={inputs.years}
                                        onChange={(e) => handleInputChange("years", e.target.value)}
                                        className="w-full bg-slate-50/50 rounded-2xl border-2 border-transparent border-slate-100 px-4 py-3 text-sm font-bold text-slate-700 appearance-none focus:border-brand-500/20 focus:bg-white focus:outline-none transition-all"
                                    >
                                        {[10, 15, 20, 25, 30, 35].map(y => (
                                            <option key={y} value={y}>{y} anos ({y * 12} meses)</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Taxa de Juros Anual</label>
                                    <div className="relative group">
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-brand-600 transition-colors">%</span>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={inputs.annualRate}
                                            onChange={(e) => handleInputChange("annualRate", e.target.value)}
                                            className="w-full bg-slate-50/50 rounded-2xl border-2 border-transparent border-slate-100 px-4 py-3 text-sm font-bold text-slate-700 focus:border-brand-500/20 focus:bg-white focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Controles Avançados */}
                            {selectedLevel === "professional" && (
                                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-up">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sistema de Amortização</label>
                                        <div className="flex bg-slate-100 p-1 rounded-xl">
                                            <button
                                                onClick={() => setInputs(prev => ({ ...prev, amortization: "price" }))}
                                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${inputs.amortization === "price" ? "bg-white text-brand-600 shadow-sm" : "text-slate-500"}`}
                                            >
                                                PRICE
                                            </button>
                                            <button
                                                onClick={() => setInputs(prev => ({ ...prev, amortization: "sac" }))}
                                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${inputs.amortization === "sac" ? "bg-white text-brand-600 shadow-sm" : "text-slate-500"}`}
                                            >
                                                SAC
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Taxa ITBI (%)</label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={inputs.itbiRate}
                                            onChange={(e) => handleInputChange("itbiRate", e.target.value)}
                                            className="w-full bg-slate-50/50 rounded-2xl border-2 border-transparent border-slate-100 px-4 py-1.5 text-sm font-bold text-slate-700 focus:border-brand-500/20 focus:bg-white focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedLevel === "professional" && (
                                <div className="pt-4 border-t border-slate-100 space-y-4 animate-fade-up">
                                    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                                        <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                                            Modo Profissional ativo. Incluindo cálculos de Registro e ITBI no custo total.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Coluna de Resultados — Mobile First Sticky Result */}
                    <div className="lg:col-span-5 space-y-5">
                        <Card padding="none" className="bg-slate-900 text-white border-slate-800 shadow-xl overflow-hidden rounded-[2rem]">
                            <div className="p-6 sm:p-8 space-y-6">
                                <div className="space-y-1 text-center sm:text-left">
                                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em]">
                                        {inputs.amortization === "sac" ? "1ª Parcela Estimada" : "Parcela Fixa Mensal"}
                                    </p>
                                    <div className="flex items-baseline justify-center sm:justify-start gap-2">
                                        <span className="text-2xl font-display font-medium text-slate-500">R$</span>
                                        <span className="text-5xl font-display font-black tracking-tight text-white animate-fade-up" key={calcResult.monthlyInstallment}>
                                            {formatCurrency(calcResult.monthlyInstallment).replace("R$", "").trim()}
                                        </span>
                                    </div>
                                    {inputs.amortization === "sac" && (
                                        <div className="flex items-center justify-center sm:justify-start gap-2 pt-2 text-emerald-400">
                                            <ChevronRight className="h-4 w-4 rotate-90" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Caindo para {formatCurrency(calcResult.lastInstallment || 0)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                                    <div className="space-y-1">
                                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest leading-none">Total Financiado</p>
                                        <p className="text-sm font-bold truncate leading-tight">{formatCurrency(calcResult.totalFinanced)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest leading-none">Imposto (ITBI+Reg)</p>
                                        <p className="text-sm font-bold truncate leading-tight text-amber-400">{formatCurrency(calcResult.totalExtraCosts)}</p>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <div className="rounded-2xl bg-brand-500/10 border border-brand-500/20 p-4 flex items-center gap-3">
                                        <Sparkles className="h-5 w-5 text-brand-400 shrink-0" />
                                        <p className="text-xs text-brand-100 font-medium leading-relaxed">
                                            Dica: O imóvel do seu cliente está a poucos passos. Ajuste o valor da entrada se necessário para aprovação!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="flex flex-col gap-3">
                            <Button
                                variant="whatsapp"
                                className="w-full h-14 rounded-2xl shadow-lg shadow-emerald-500/20 text-md font-bold"
                                onClick={shareResults}
                                leftIcon={<Share2 className="h-5 w-5" />}
                            >
                                Compartilhar no WhatsApp
                            </Button>

                            <Card padding="md" className="bg-slate-50 border-slate-100 flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                                    Cálculo realizado com base na taxa de **{inputs.annualRate}% a.a.** válida para propostas enviadas hoje.
                                </p>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
