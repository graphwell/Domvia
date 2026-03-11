"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import {
    ChevronRight, ChevronLeft, CheckCircle2,
    AlertCircle, Share2, Info, Building2, UserCircle2, Calculator
} from "lucide-react";

type CivilStatus = "solteiro" | "casado" | "uniao_estavel";
type FgtsTime = "menos_3_anos" | "mais_3_anos";
type PropertyType = "residencial_urbano" | "rural" | "comercial";
type PropertyState = "novo" | "usado";

export function SmartSimulator() {
    const [step, setStep] = useState(1);

    // Profile Inputs
    const [netIndividualIncome, setNetIndividualIncome] = useState("");
    const [netFamilyIncome, setNetFamilyIncome] = useState("");
    const [civilStatus, setCivilStatus] = useState<CivilStatus>("solteiro");
    const [hasFgts, setHasFgts] = useState(false);
    const [fgtsBalance, setFgtsBalance] = useState("");
    const [fgtsTime, setFgtsTime] = useState<FgtsTime>("menos_3_anos");
    const [hadSfh, setHadSfh] = useState(false);
    const [stateLocation, setStateLocation] = useState("CE");

    // Property Inputs
    const [propertyValue, setPropertyValue] = useState("");
    const [propertyType, setPropertyType] = useState<PropertyType>("residencial_urbano");
    const [propertyState, setPropertyState] = useState<PropertyState>("novo");

    // Result calculation
    const calculations = useMemo(() => {
        const netFamInc = Number(netFamilyIncome) || 0;
        const grossFamInc = netFamInc / 0.75;
        const propValue = Number(propertyValue) || 0;
        const fgts = Number(fgtsBalance) || 0;

        let mcmvBand = "Acima";
        let maxFedSubsidy = 0;
        let interestRate = 10.99; // Default SFH rate

        if (grossFamInc <= 2640 && grossFamInc > 0) {
            mcmvBand = "Faixa 1";
            maxFedSubsidy = 55000;
            interestRate = 4.5;
        } else if (grossFamInc <= 4400 && grossFamInc > 0) {
            mcmvBand = "Faixa 2";
            maxFedSubsidy = 29000;
            interestRate = 4.5;
        } else if (grossFamInc <= 8000 && grossFamInc > 0) {
            mcmvBand = "Faixa 3";
            maxFedSubsidy = 8000;
            interestRate = 7.66;
        }

        let ceSubsidy = 0;
        if (stateLocation === "CE" && (mcmvBand === "Faixa 1" || mcmvBand === "Faixa 2") && propertyState === "novo") {
            ceSubsidy = 10000; // Estimated 10k as default
        }

        let usableFgts = 0;
        if (hasFgts && fgtsTime === "mais_3_anos" && !hadSfh && propertyType === "residencial_urbano") {
            usableFgts = fgts;
        }

        const effectiveFedSubsidy = Math.min(maxFedSubsidy, propValue * 0.2); // Just an estimate logic
        const totalSubsidies = effectiveFedSubsidy + ceSubsidy;

        // Ensure we don't finance a negative amount
        let financedAmount = propValue - usableFgts - effectiveFedSubsidy - ceSubsidy;
        if (financedAmount < 0) financedAmount = 0;

        // PRICE Table calculation
        const i = (interestRate / 100) / 12;
        const n = 360; // 30 anos
        const monthlyInstallment = financedAmount > 0 ? (financedAmount * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1) : 0;

        const commitment = (monthlyInstallment / grossFamInc) * 100;

        const maxInstallmentPossible = grossFamInc * 0.3;
        const maxFinancableAmount = (maxInstallmentPossible * (Math.pow(1 + i, n) - 1)) / (i * Math.pow(1 + i, n));
        const totalBuyingPower = maxFinancableAmount + usableFgts + effectiveFedSubsidy + ceSubsidy;

        const totalInterest = (monthlyInstallment * n) - financedAmount;

        return {
            grossFamInc,
            mcmvBand,
            fedSubsidy: effectiveFedSubsidy,
            ceSubsidy,
            usableFgts,
            financedAmount,
            interestRate,
            monthlyInstallment,
            commitment,
            totalBuyingPower,
            totalInterest,
            isValid: propValue > 0 && grossFamInc > 0
        };
    }, [netFamilyIncome, propertyValue, fgtsBalance, hasFgts, fgtsTime, hadSfh, stateLocation, propertyType, propertyState]);

    const handleInputNumber = (setter: (val: string) => void, val: string) => {
        setter(val.replace(/[^0-9.]/g, ""));
    };

    const nextStep = () => {
        if (step < 3) setStep(s => s + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(s => s - 1);
    };

    const shareResults = () => {
        const text = `*Minha Simulação Inteligente (Domvia)*\n\n` +
            `🏠 Imóvel de: ${formatCurrency(Number(propertyValue) || 0)}\n` +
            `💡 Posso comprar até: ${formatCurrency(calculations.totalBuyingPower)}\n\n` +
            `*Benefícios Aplicados:*\n` +
            (calculations.fedSubsidy > 0 ? `🏦 Subsídio MCMV: ${formatCurrency(calculations.fedSubsidy)}\n` : "") +
            (calculations.ceSubsidy > 0 ? `🏠 Subsídio CE: ${formatCurrency(calculations.ceSubsidy)} (estimativa)\n` : "") +
            (calculations.usableFgts > 0 ? `💰 FGTS Utilizado: ${formatCurrency(calculations.usableFgts)}\n` : "") +
            `\n*Parcela Estimada:*\n` +
            `💵 Apenas ${formatCurrency(calculations.monthlyInstallment)} por mês\n` +
            `📊 ${calculations.commitment.toFixed(1)}% da renda (dentro do limite saudável)\n\n` +
            `Financiamento: ${formatCurrency(calculations.financedAmount)} em até 360 meses.`;

        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank");
    };

    const getMcmvColor = (band: string) => {
        if (band === "Faixa 1") return "bg-blue-100 text-blue-800 border-blue-200";
        if (band === "Faixa 2") return "bg-sky-100 text-sky-800 border-sky-200";
        if (band === "Faixa 3") return "bg-indigo-100 text-indigo-800 border-indigo-200";
        return "bg-slate-100 text-slate-500 border-slate-200";
    };

    return (
        <div className="space-y-6">
            {/* Stepper Header */}
            <div className="flex items-center justify-between relative mb-8">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
                <div className="absolute top-1/2 left-0 h-0.5 bg-brand-500 transition-all duration-500 -translate-y-1/2 z-0" style={{ width: `${(step - 1) * 50}%` }}></div>

                {[1, 2, 3].map((s) => (
                    <div key={s} className={`relative z-10 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${step >= s ? "opacity-100" : "opacity-40"}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-300 ${step >= s ? "bg-brand-600 text-white" : "bg-white text-slate-400 border-2 border-slate-200"}`}>
                            {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                        </div>
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${step >= s ? "text-brand-700" : "text-slate-400"}`}>
                            {s === 1 ? "Perfil" : s === 2 ? "Imóvel" : "Resultados"}
                        </span>
                    </div>
                ))}
            </div>

            <Card padding="lg" className="border-slate-200/60 shadow-md">
                {/* ---------- STEP 1: PERFIL ---------- */}
                {step === 1 && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="h-10 w-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                                <UserCircle2 className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-lg text-slate-800">Perfil do Comprador</h3>
                                <p className="text-xs text-slate-500 font-medium">Preencha os dados de renda para descobrir os benefícios</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Renda Mensal Líquida Individual</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-brand-600 transition-colors">R$</span>
                                    <input type="text" value={netIndividualIncome} onChange={(e) => handleInputNumber(setNetIndividualIncome, e.target.value)} className="w-full bg-slate-50 rounded-xl border border-slate-200 px-10 py-3 text-sm font-bold text-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:bg-white outline-none transition-all" placeholder="Ex: 3500.00" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Renda Líquida Familiar (Soma)</label>
                                <div className="relative group flex flex-col">
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-brand-600 transition-colors">R$</span>
                                        <input type="text" value={netFamilyIncome} onChange={(e) => handleInputNumber(setNetFamilyIncome, e.target.value)} className="w-full bg-slate-50 rounded-xl border border-slate-200 px-10 py-3 text-sm font-bold text-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:bg-white outline-none transition-all" placeholder="Ex: 4500.00" />
                                    </div>
                                    {netFamilyIncome && (
                                        <div className="mt-2 animate-fade-in flex">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${getMcmvColor(calculations.mcmvBand)}`}>
                                                Renda Bruta: {formatCurrency(calculations.grossFamInc)} | {calculations.mcmvBand}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estado Civil</label>
                                <select value={civilStatus} onChange={(e) => setCivilStatus(e.target.value as CivilStatus)} className="w-full bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20">
                                    <option value="solteiro">Solteiro</option>
                                    <option value="casado">Casado</option>
                                    <option value="uniao_estavel">União Estável</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estado de Compra</label>
                                <select value={stateLocation} onChange={(e) => setStateLocation(e.target.value)} className="w-full bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20">
                                    <option value="CE">Ceará (CE)</option>
                                    <option value="SP">São Paulo (SP)</option>
                                    <option value="RJ">Rio de Janeiro (RJ)</option>
                                    <option value="OUTRO">Outro</option>
                                </select>
                            </div>

                            <div className="space-y-1.5 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Possui FGTS?</label>
                                    <div className="flex gap-2">
                                        <button onClick={() => setHasFgts(true)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${hasFgts ? "bg-brand-50 border-brand-200 text-brand-700" : "bg-white border-slate-200 text-slate-500"}`}>Sim</button>
                                        <button onClick={() => setHasFgts(false)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${!hasFgts ? "bg-slate-100 border-slate-300 text-slate-700" : "bg-white border-slate-200 text-slate-500"}`}>Não</button>
                                    </div>
                                </div>

                                {hasFgts && (
                                    <div className="space-y-3 animate-fade-in mt-1 sm:mt-0">
                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-brand-600 transition-colors">R$</span>
                                            <input type="text" value={fgtsBalance} onChange={(e) => handleInputNumber(setFgtsBalance, e.target.value)} placeholder="Saldo do FGTS" className="w-full bg-slate-50 rounded-xl border border-slate-200 px-10 py-2.5 text-sm font-bold text-slate-800 outline-none" />
                                        </div>
                                        <select value={fgtsTime} onChange={(e) => setFgtsTime(e.target.value as FgtsTime)} className="w-full bg-slate-50 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 outline-none">
                                            <option value="menos_3_anos">Menos de 3 anos de trabalho</option>
                                            <option value="mais_3_anos">3 anos ou mais (ativos/inativos)</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Já teve imóvel financiado pelo SFH?</label>
                                <div className="flex gap-2 max-w-xs">
                                    <button onClick={() => setHadSfh(true)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${hadSfh ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-white border-slate-200 text-slate-500"}`}>Sim</button>
                                    <button onClick={() => setHadSfh(false)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${!hadSfh ? "bg-brand-50 border-brand-200 text-brand-700" : "bg-white border-slate-200 text-slate-500"}`}>Não</button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button onClick={nextStep} disabled={!netFamilyIncome} rightIcon={<ChevronRight className="h-4 w-4" />}>Avançar para Imóvel</Button>
                        </div>
                    </div>
                )}

                {/* ---------- STEP 2: IMÓVEL ---------- */}
                {step === 2 && (
                    <div className="space-y-6 animate-fade-in text-left">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-lg text-slate-800">Dados do Imóvel</h3>
                                <p className="text-xs text-slate-500 font-medium">Informações básicas do bem a ser financiado</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Valor do Imóvel Simulado</label>
                                <div className="relative group max-w-md">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-indigo-600 transition-colors">R$</span>
                                    <input type="text" value={propertyValue} onChange={(e) => handleInputNumber(setPropertyValue, e.target.value)} className="w-full bg-slate-50/50 rounded-2xl border-2 border-slate-200 px-12 py-4 text-2xl font-display font-black text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all" placeholder="Ex: 250000" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Condição do Imóvel</label>
                                <div className="flex gap-2">
                                    <button onClick={() => setPropertyState("novo")} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border-2 ${propertyState === "novo" ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"}`}>Novo ou na Planta</button>
                                    <button onClick={() => setPropertyState("usado")} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border-2 ${propertyState === "usado" ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"}`}>Usado</button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Tipo do Imóvel</label>
                                <div className="flex gap-2">
                                    <button onClick={() => setPropertyType("residencial_urbano")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${propertyType === "residencial_urbano" ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-500"}`}>Residencial Urbano</button>
                                    <button onClick={() => setPropertyType("comercial")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${propertyType === "comercial" ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-500"}`}>Comercial / Outro</button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="ghost" onClick={prevStep} leftIcon={<ChevronLeft className="h-4 w-4" />}>Voltar</Button>
                            <Button onClick={nextStep} disabled={!propertyValue} rightIcon={<ChevronRight className="h-4 w-4" />} className="bg-indigo-600 hover:bg-indigo-700">Calcular Financiamento</Button>
                        </div>
                    </div>
                )}

                {/* ---------- STEP 3: RESULTADOS ---------- */}
                {step === 3 && (
                    <div className="space-y-6 animate-fade-up">
                        {!calculations.isValid ? (
                            <div className="text-center py-10">
                                <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-800">Dados Incompletos</h3>
                                <p className="text-sm text-slate-500 mb-6">Preencha a renda e o valor do imóvel corretamente.</p>
                                <Button onClick={() => setStep(1)}>Voltar para Perfil</Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                                {/* Left Column: Positive Summary */}
                                <div className="space-y-4">
                                    <Card padding="md" className="bg-emerald-500 border-emerald-600 shadow-xl shadow-emerald-500/20 text-white overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <CheckCircle2 className="h-32 w-32" />
                                        </div>
                                        <div className="relative z-10 space-y-4">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-6 w-6 text-emerald-100" />
                                                <h2 className="font-display font-black text-2xl">Você pode financiar!</h2>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-emerald-100 font-bold uppercase tracking-wider text-[10px]">Parcela Mensal Estimada (Fixa PRE)</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-emerald-200 text-xl font-bold">R$</span>
                                                    <span className="text-4xl sm:text-5xl font-black tracking-tighter">{formatCurrency(calculations.monthlyInstallment).replace("R$", "").trim()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card padding="md" className="bg-white border-slate-200">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Benefícios e Composição</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <span className="text-sm font-bold text-slate-600 flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-400" /> Valor Original</span>
                                                <span className="text-sm font-black text-slate-800">{formatCurrency(Number(propertyValue))}</span>
                                            </div>

                                            {calculations.fedSubsidy > 0 && (
                                                <div className="flex justify-between items-center text-sm px-3 text-emerald-600 font-bold">
                                                    <span>− Subsídio Federal (MCMV)</span>
                                                    <span>{formatCurrency(calculations.fedSubsidy)}</span>
                                                </div>
                                            )}

                                            {calculations.ceSubsidy > 0 && (
                                                <div className="flex justify-between items-center text-sm px-3 text-emerald-600 font-bold">
                                                    <span>− Subsídio Estadual (CE) <span className="text-[10px] text-emerald-400/80 font-normal ml-1">estimado</span></span>
                                                    <span>{formatCurrency(calculations.ceSubsidy)}</span>
                                                </div>
                                            )}

                                            {calculations.usableFgts > 0 && (
                                                <div className="flex justify-between items-center text-sm px-3 text-blue-600 font-bold">
                                                    <span>− Saldo FGTS Utilizado</span>
                                                    <span>{formatCurrency(calculations.usableFgts)}</span>
                                                </div>
                                            )}

                                            <div className="h-px bg-slate-200 my-2"></div>

                                            <div className="flex justify-between items-center px-3">
                                                <span className="text-[11px] font-bold text-slate-400 uppercase">Valor Real a Financiar</span>
                                                <span className="text-lg font-black text-slate-800">{formatCurrency(calculations.financedAmount)}</span>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Right Column: Insights */}
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100 flex gap-4 items-start">
                                        <div className="h-10 w-10 shrink-0 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600">
                                            <Calculator className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-indigo-900 mb-1">Capacidade de Compra Máxima</h4>
                                            <p className="text-[11px] text-indigo-700/80 font-medium mb-2 leading-relaxed">
                                                Considerando sua renda e os benefícios aplicados, você tem potencial para comprar imóveis de até:
                                            </p>
                                            <span className="text-xl font-black text-indigo-800">{formatCurrency(calculations.totalBuyingPower)}</span>
                                        </div>
                                    </div>

                                    <Card padding="md" className="border-slate-200 relative overflow-hidden">
                                        <div className={`absolute top-0 left-0 w-1.5 h-full ${calculations.commitment <= 30 ? "bg-brand-500" : "bg-rose-500"}`}></div>
                                        <div className="pl-4">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Comprometimento de Renda</h4>
                                            <div className="flex items-end gap-2 mb-2">
                                                <span className={`text-2xl font-black ${calculations.commitment <= 30 ? "text-slate-800" : "text-rose-600"}`}>
                                                    {calculations.commitment.toFixed(1)}%
                                                </span>
                                                <span className="text-xs text-slate-400 pb-1 font-medium">da renda familiar</span>
                                            </div>

                                            {calculations.commitment <= 30 ? (
                                                <p className="text-[11px] font-bold text-brand-600 flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" /> Dentro do limite saudável (até 30%)
                                                </p>
                                            ) : (
                                                <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" /> Acima do limite de 30%. Pode ser necessário maior entrada.
                                                </p>
                                            )}
                                        </div>
                                    </Card>

                                    <details className="group border border-slate-200 rounded-xl bg-slate-50 [&_summary::-webkit-details-marker]:hidden">
                                        <summary className="flex items-center justify-between cursor-pointer p-4 select-none">
                                            <span className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                                <Info className="h-4 w-4" /> Detalhes Técnicos
                                            </span>
                                            <ChevronRight className="h-4 w-4 text-slate-400 group-open:rotate-90 transition-transform" />
                                        </summary>
                                        <div className="px-4 pb-4 pt-1 space-y-2 text-[10px] sm:text-xs text-slate-500 font-medium">
                                            <div className="flex justify-between border-b border-slate-200/60 pb-1">
                                                <span>Taxa de Juros Aplicada</span>
                                                <span className="font-bold text-slate-700">{calculations.interestRate}% a.a.</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-200/60 pb-1">
                                                <span>Prazo Estimado</span>
                                                <span className="font-bold text-slate-700">360 meses (30 anos)</span>
                                            </div>
                                            <div className="flex justify-between pb-1">
                                                <span>Total Financiado</span>
                                                <span className="font-bold text-slate-700">{formatCurrency(calculations.financedAmount)}</span>
                                            </div>
                                        </div>
                                    </details>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-100">
                            <Button variant="ghost" className="w-full sm:w-auto" onClick={() => setStep(1)}>Nova Simulação</Button>
                            <Button variant="whatsapp" className="w-full shadow-lg shadow-emerald-500/20 text-sm font-bold" onClick={shareResults} leftIcon={<Share2 className="h-4 w-4" />}>
                                Enviar Resumo no WhatsApp
                            </Button>
                        </div>

                        <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100 mt-6 flex gap-3 text-left">
                            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                            <p className="text-[10px] leading-relaxed text-amber-700/80 font-medium">
                                <strong className="text-amber-800">Aviso legal:</strong> Esta simulação possui caráter informativo.
                                Os valores de subsídio estadual (CE) e federal variam conforme disponibilidade de cotas.
                                As taxas e condições dependem de análise de crédito e política do agente financeiro vigente no ato da contratação.
                                Consulte um representante comercial oficial para detalhes.
                            </p>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}

// Temporary variant mapping missing from my context
// I will just use className to enforce whatsapp variant styling if it doesn't exist
