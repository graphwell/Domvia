"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, TrendingUp, Info, Share2 } from "lucide-react";

const fmt = (v: number, style: "currency" | "percent" | "decimal" = "currency") =>
    v.toLocaleString("pt-BR", {
        style,
        currency: "BRL",
        minimumFractionDigits: style === "percent" ? 2 : 0,
        maximumFractionDigits: style === "percent" ? 2 : 0,
    });

const fmtPct = (v: number) => `${v.toFixed(2).replace(".", ",")}%`;

const inputCls = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:outline-none bg-white";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
            {children}
            {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
        </div>
    );
}

function MetricRow({ label, value, highlight, sub }: { label: string; value: string; highlight?: boolean; sub?: string }) {
    return (
        <div className={`flex items-center justify-between py-3 border-b border-slate-100 last:border-0 ${highlight ? "font-bold" : ""}`}>
            <div>
                <p className={`text-sm ${highlight ? "text-slate-900" : "text-slate-600"}`}>{label}</p>
                {sub && <p className="text-xs text-slate-400">{sub}</p>}
            </div>
            <p className={`text-sm tabular-nums ${highlight ? "text-emerald-600 text-base" : "text-slate-800"}`}>{value}</p>
        </div>
    );
}

export default function InvestmentSimulatorPage() {
    const [mode, setMode] = useState<"aluguel" | "compra_venda">("aluguel");

    // Inputs
    const [propertyValue, setPropertyValue] = useState("500000");
    const [monthlyRent, setMonthlyRent] = useState("2500");
    const [condoFee, setCondoFee] = useState("600");
    const [iptu, setIptu] = useState("2400");
    const [vacancyRate, setVacancyRate] = useState("8");
    const [maintenanceRate, setMaintenanceRate] = useState("1");
    const [administrationFee, setAdministrationFee] = useState("10");
    const [appreciationRate, setAppreciationRate] = useState("6");
    const [years, setYears] = useState("5");
    const [purchasePrice, setPurchasePrice] = useState("400000");
    const [salePrice, setSalePrice] = useState("500000");
    const [purchaseCost, setPurchaseCost] = useState("4");
    const [saleCost, setSaleCost] = useState("6");

    const result = useMemo(() => {
        if (mode === "aluguel") {
            const pv = Number(propertyValue);
            const rent = Number(monthlyRent);
            const condo = Number(condoFee);
            const annualIptu = Number(iptu);
            const vacancy = Number(vacancyRate) / 100;
            const maintenance = (Number(maintenanceRate) / 100) * pv;
            const adminFee = (Number(administrationFee) / 100) * rent * 12;
            const appreciation = Number(appreciationRate) / 100;
            const yrs = Number(years);

            const effectiveRent = rent * 12 * (1 - vacancy);
            const totalExpenses = condo * 12 + annualIptu + maintenance + adminFee;
            const netAnnualIncome = effectiveRent - totalExpenses;
            const grossYield = (rent * 12 / pv) * 100;
            const netYield = (netAnnualIncome / pv) * 100;

            // Future value with appreciation
            const futureValue = pv * Math.pow(1 + appreciation, yrs);
            const capitalGain = futureValue - pv;
            const totalRentReceived = netAnnualIncome * yrs;
            const totalReturn = capitalGain + totalRentReceived;
            const totalReturnPct = (totalReturn / pv) * 100;
            const annualizedReturn = (Math.pow((1 + totalReturnPct / 100), 1 / yrs) - 1) * 100;
            const payback = netAnnualIncome > 0 ? pv / netAnnualIncome : 0;

            return {
                effectiveRent,
                totalExpenses,
                netAnnualIncome,
                netMonthlyIncome: netAnnualIncome / 12,
                grossYield,
                netYield,
                futureValue,
                capitalGain,
                totalRentReceived,
                totalReturn,
                totalReturnPct,
                annualizedReturn,
                payback,
            };
        } else {
            const pp = Number(purchasePrice);
            const sp = Number(salePrice);
            const pc = (Number(purchaseCost) / 100) * pp;
            const sc = (Number(saleCost) / 100) * sp;
            const totalCost = pp + pc;
            const netSale = sp - sc;
            const profit = netSale - totalCost;
            const roi = (profit / totalCost) * 100;
            const irpf = profit > 35000 ? profit * 0.15 : 0; // simplified IRPF
            const netProfit = profit - irpf;

            return { totalCost, netSale, profit, roi, irpf, netProfit };
        }
    }, [mode, propertyValue, monthlyRent, condoFee, iptu, vacancyRate, maintenanceRate, administrationFee, appreciationRate, years, purchasePrice, salePrice, purchaseCost, saleCost]);

    const handleShare = () => {
        let text = "";
        if (mode === "aluguel") {
            const r = result as any;
            text = `*Simulação de Rentabilidade — Aluguel* 📊\n\nImóvel: ${fmt(Number(propertyValue))}\nAluguel bruto: ${fmt(Number(monthlyRent))}/mês\nRenda líq. mensal: ${fmt(r.netMonthlyIncome)}/mês\nYield bruto: ${fmtPct(r.grossYield)} a.a.\nYield líquido: ${fmtPct(r.netYield)} a.a.\nPayback: ${r.payback.toFixed(1)} anos\n\n_Gerado pelo Domvia_`;
        } else {
            const r = result as any;
            text = `*Simulação de Rentabilidade — Compra e Venda* 📊\n\nCompra + custos: ${fmt(r.totalCost)}\nVenda líquida: ${fmt(r.netSale)}\nLucro bruto: ${fmt(r.profit)}\nROI: ${fmtPct(r.roi)}\nLucro líq. (pós IRPF): ${fmt(r.netProfit)}\n\n_Gerado pelo Domvia_`;
        }
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/tools"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
                <div className="flex-1">
                    <h1 className="font-display text-2xl font-bold text-slate-900">Simulador de Rentabilidade</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Para investidores: calcule yield, ROI, payback e retorno total</p>
                </div>
                <Button variant="secondary" leftIcon={<Share2 className="h-4 w-4" />} onClick={handleShare}>
                    WhatsApp
                </Button>
            </div>

            {/* Mode Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-2xl">
                <button
                    onClick={() => setMode("aluguel")}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${mode === "aluguel" ? "bg-white text-brand-600 shadow-sm" : "text-slate-500"}`}
                >
                    🏠 Renda de Aluguel
                </button>
                <button
                    onClick={() => setMode("compra_venda")}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${mode === "compra_venda" ? "bg-white text-brand-600 shadow-sm" : "text-slate-500"}`}
                >
                    📈 Compra e Venda (Flip)
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ── INPUTS ── */}
                <div className="space-y-4">
                    {mode === "aluguel" ? (
                        <>
                            <Card padding="md" className="space-y-4">
                                <h2 className="font-display font-bold text-slate-800">Dados do Imóvel</h2>
                                <Field label="Valor do Imóvel (R$)">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">R$</span>
                                        <input type="number" className={`${inputCls} pl-9`} value={propertyValue} onChange={e => setPropertyValue(e.target.value)} />
                                    </div>
                                </Field>
                                <Field label="Aluguel Mensal Estimado (R$)">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">R$</span>
                                        <input type="number" className={`${inputCls} pl-9`} value={monthlyRent} onChange={e => setMonthlyRent(e.target.value)} />
                                    </div>
                                </Field>
                            </Card>

                            <Card padding="md" className="space-y-4">
                                <h2 className="font-display font-bold text-slate-800">Despesas Anuais</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Condomínio (R$/mês)" hint="Deixe 0 se não houver">
                                        <input type="number" className={inputCls} value={condoFee} onChange={e => setCondoFee(e.target.value)} />
                                    </Field>
                                    <Field label="IPTU (R$/ano)">
                                        <input type="number" className={inputCls} value={iptu} onChange={e => setIptu(e.target.value)} />
                                    </Field>
                                    <Field label="Vacância (%/ano)" hint="Média: 8% = ~1 mês vago">
                                        <input type="number" className={inputCls} value={vacancyRate} onChange={e => setVacancyRate(e.target.value)} />
                                    </Field>
                                    <Field label="Manutenção (%/ano)" hint="Sobre valor do imóvel">
                                        <input type="number" className={inputCls} value={maintenanceRate} onChange={e => setMaintenanceRate(e.target.value)} />
                                    </Field>
                                    <Field label="Taxa Adm. (%/mês)" hint="Se usar imobiliária">
                                        <input type="number" className={inputCls} value={administrationFee} onChange={e => setAdministrationFee(e.target.value)} />
                                    </Field>
                                </div>
                            </Card>

                            <Card padding="md" className="space-y-4">
                                <h2 className="font-display font-bold text-slate-800">Valorização</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Valorização Anual (%)" hint="Histórico imóveis: 6-8%/ano">
                                        <input type="number" className={inputCls} value={appreciationRate} onChange={e => setAppreciationRate(e.target.value)} />
                                    </Field>
                                    <Field label="Horizonte de Investimento (anos)">
                                        <input type="number" min="1" max="30" className={inputCls} value={years} onChange={e => setYears(e.target.value)} />
                                    </Field>
                                </div>
                            </Card>
                        </>
                    ) : (
                        <Card padding="md" className="space-y-4">
                            <h2 className="font-display font-bold text-slate-800">Compra e Venda</h2>
                            <Field label="Preço de Compra (R$)">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">R$</span>
                                    <input type="number" className={`${inputCls} pl-9`} value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} />
                                </div>
                            </Field>
                            <Field label="Custos de Aquisição (%)" hint="ITBI + escritura + registro: ~4%">
                                <input type="number" className={inputCls} value={purchaseCost} onChange={e => setPurchaseCost(e.target.value)} />
                            </Field>
                            <Field label="Preço de Venda (R$)">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">R$</span>
                                    <input type="number" className={`${inputCls} pl-9`} value={salePrice} onChange={e => setSalePrice(e.target.value)} />
                                </div>
                            </Field>
                            <Field label="Custos de Venda (%)" hint="Comissão corretor + impostos: ~6%">
                                <input type="number" className={inputCls} value={saleCost} onChange={e => setSaleCost(e.target.value)} />
                            </Field>
                            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl text-xs text-amber-700">
                                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                <span>IRPF sobre ganho de capital estimado em 15% (simplificado). Para valores reais, consulte um contador.</span>
                            </div>
                        </Card>
                    )}
                </div>

                {/* ── RESULTS ── */}
                <div>
                    <Card padding="lg" className="sticky top-20 border-emerald-100 shadow-lg shadow-emerald-900/5">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="font-display font-bold text-slate-900">Resultado da Análise</h2>
                                <p className="text-xs text-slate-500">Atualizado em tempo real</p>
                            </div>
                        </div>

                        {mode === "aluguel" ? (
                            (() => {
                                const r = result as any;
                                return (
                                    <>
                                        {/* Hero metric */}
                                        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white mb-5">
                                            <p className="text-emerald-100/70 text-xs font-bold uppercase tracking-widest mb-1">Renda Líquida Mensal</p>
                                            <p className="text-3xl font-black">{fmt(r.netMonthlyIncome)}<span className="text-sm font-normal text-emerald-100 ml-1">/mês</span></p>
                                            <div className="flex gap-4 mt-3">
                                                <div>
                                                    <p className="text-emerald-200/70 text-[10px] uppercase font-bold">Yield Bruto</p>
                                                    <p className="font-bold text-lg">{fmtPct(r.grossYield)} a.a.</p>
                                                </div>
                                                <div>
                                                    <p className="text-emerald-200/70 text-[10px] uppercase font-bold">Yield Líquido</p>
                                                    <p className="font-bold text-lg">{fmtPct(r.netYield)} a.a.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="divide-y divide-slate-100">
                                            <MetricRow label="Receita Efetiva Anual" value={fmt(r.effectiveRent)} sub={`Descontada vacância de ${vacancyRate}%`} />
                                            <MetricRow label="Total de Despesas Anual" value={fmt(r.totalExpenses)} />
                                            <MetricRow label="Renda Líquida Anual" value={fmt(r.netAnnualIncome)} highlight />
                                            <MetricRow label="Payback simples" value={`${r.payback.toFixed(1)} anos`} sub="Tempo para recuperar o investimento" />
                                            <MetricRow label={`Valorização em ${years} anos`} value={fmt(r.capitalGain)} sub={`Imóvel → ${fmt(r.futureValue)}`} />
                                            <MetricRow label={`Total aluguel em ${years} anos`} value={fmt(r.totalRentReceived)} />
                                            <MetricRow label="Retorno Total" value={`${fmtPct(r.totalReturnPct)}`} highlight sub={`${fmt(r.totalReturn)} em ${years} anos`} />
                                            <MetricRow label="Retorno Anualizado" value={`${fmtPct(r.annualizedReturn)} a.a.`} highlight />
                                        </div>
                                    </>
                                );
                            })()
                        ) : (
                            (() => {
                                const r = result as any;
                                const profitable = r.profit > 0;
                                return (
                                    <>
                                        <div className={`rounded-2xl p-5 text-white mb-5 ${profitable ? "bg-gradient-to-br from-emerald-600 to-teal-700" : "bg-gradient-to-br from-red-500 to-rose-700"}`}>
                                            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Lucro Bruto</p>
                                            <p className="text-3xl font-black">{fmt(r.profit)}</p>
                                            <p className="text-white/70 text-sm mt-1">ROI: <strong>{fmtPct(r.roi)}</strong></p>
                                        </div>
                                        <div className="divide-y divide-slate-100">
                                            <MetricRow label="Preço de Compra" value={fmt(Number(purchasePrice))} />
                                            <MetricRow label="Custos de Aquisição" value={fmt((Number(purchaseCost) / 100) * Number(purchasePrice))} />
                                            <MetricRow label="Custo Total" value={fmt(r.totalCost)} highlight />
                                            <MetricRow label="Preço de Venda" value={fmt(Number(salePrice))} />
                                            <MetricRow label="Custos de Venda" value={fmt((Number(saleCost) / 100) * Number(salePrice))} />
                                            <MetricRow label="Receita Líquida" value={fmt(r.netSale)} highlight />
                                            <MetricRow label="IRPF Estimado (15%)" value={fmt(r.irpf)} sub="Sobre lucro > R$ 35.000" />
                                            <MetricRow label="Lucro Líquido Final" value={fmt(r.netProfit)} highlight />
                                        </div>
                                    </>
                                );
                            })()
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
