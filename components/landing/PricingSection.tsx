"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle, X, Sparkles, CreditCard, ShoppingCart } from "lucide-react";
import type { Plan, TopUp } from "@/types";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

export function PricingSection({ plans, topups }: { plans: Plan[], topups: TopUp[] }) {
    const [view, setView] = useState<"monthly" | "extra">("monthly");

    return (
        <section id="planos" className="py-24 bg-slate-50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center mb-16">
                    <p className="text-brand-600 font-semibold text-sm uppercase tracking-wider mb-3">Preços Transparentes</p>
                    <h2 className="font-display text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
                        Escolha o plano ideal para{" "}
                        <span className="text-brand-600">acelerar suas vendas</span>
                    </h2>
                    
                    {/* View Toggle */}
                    <div className="mt-10 inline-flex items-center p-1 bg-slate-200/50 backdrop-blur rounded-2xl border border-slate-200">
                        <button
                            onClick={() => setView("monthly")}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                view === "monthly" 
                                ? "bg-white text-slate-900 shadow-md" 
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            Mensal
                        </button>
                        <button
                            onClick={() => setView("extra")}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                view === "extra" 
                                ? "bg-white text-slate-900 shadow-md" 
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            Créditos Avulsos
                        </button>
                    </div>
                </div>

                {view === "monthly" ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`flex flex-col relative rounded-[2.5rem] border p-8 transition-all duration-300 hover:shadow-2xl ${
                                    plan.highlighted
                                        ? "border-brand-500 bg-white ring-4 ring-brand-500/5 shadow-xl scale-[1.02] z-10"
                                        : "border-slate-200 bg-white/80 backdrop-blur-sm"
                                }`}
                            >
                                {plan.badge && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <Badge variant="brand" className="px-5 py-1.5 text-[10px] uppercase font-black bg-brand-600 text-white shadow-lg ring-2 ring-white">
                                            {plan.highlighted ? "Mais Popular" : plan.badge}
                                        </Badge>
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="font-display text-2xl font-black text-slate-900 mb-1 italic">
                                        {plan.name.toUpperCase()}
                                    </h3>
                                    <p className="text-slate-500 text-sm font-medium mb-6">
                                        {plan.description}
                                    </p>
                                    
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-slate-400 text-lg font-bold">R$</span>
                                        <span className="font-display text-5xl font-black text-slate-900 tracking-tighter">
                                            {plan.price === 0 ? "0,00" : plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                        {plan.price > 0 && <span className="text-slate-400 font-bold ml-1">/mês</span>}
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-10 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-[13px] leading-tight">
                                            <div className={`mt-0.5 rounded-full p-0.5 ${plan.highlighted ? "bg-brand-100" : "bg-slate-100"}`}>
                                                <CheckCircle className={`h-3.5 w-3.5 ${plan.highlighted ? "text-brand-600" : "text-slate-400"}`} />
                                            </div>
                                            <span className="text-slate-600 font-medium">{feature.label}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link href="/register" className="mt-auto">
                                    <Button
                                        size="xl"
                                        variant={plan.highlighted ? "primary" : "secondary"}
                                        className={`w-full font-black text-xs uppercase tracking-widest rounded-2xl h-14 ${
                                            plan.highlighted ? "bg-brand-600 hover:bg-brand-700 shadow-glow" : ""
                                        }`}
                                        rightIcon={<Sparkles className="h-4 w-4" />}
                                    >
                                        {plan.price === 0 ? "Começar Grátis" : `Assinar ${plan.name}`}
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start max-w-5xl mx-auto">
                        {topups.map((pkg) => (
                            <div
                                key={pkg.id}
                                className={`flex flex-col relative rounded-[2.5rem] border p-8 bg-white transition-all duration-300 hover:shadow-2xl ${
                                    pkg.highlighted
                                        ? "border-brand-500 ring-4 ring-brand-500/5 shadow-xl scale-[1.02] z-10"
                                        : "border-slate-200"
                                }`}
                            >
                                <div className="mb-8">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${pkg.highlighted ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                                        <CreditCard className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-display text-xl font-black text-slate-900 mb-1">
                                        {pkg.credits} CRÉDITOS
                                    </h3>
                                    <p className="text-slate-500 text-sm font-medium">Uso sob demanda</p>
                                </div>

                                <div className="mb-10">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-slate-400 text-lg font-bold">R$</span>
                                        <span className="font-display text-5xl font-black text-slate-900 tracking-tighter">
                                            {pkg.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Pagamento único</p>
                                </div>

                                <Link href="/register" className="mt-auto">
                                    <Button
                                        size="xl"
                                        variant={pkg.highlighted ? "primary" : "outline"}
                                        className={`w-full font-black text-xs uppercase tracking-widest rounded-2xl h-14 ${
                                            pkg.highlighted ? "bg-brand-600 hover:bg-brand-700 shadow-glow" : ""
                                        }`}
                                        leftIcon={<ShoppingCart className="h-4 w-4" />}
                                    >
                                        Comprar Pacote
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="mt-20 text-center">
                    <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
                        Precisa de um plano para imobiliária? 
                        <Link href="/contact" className="text-brand-600 font-bold hover:underline">Fale com nosso time</Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
