"use client";

import { useState } from "react";
import Link from "next/link";
import { PLANS } from "@/lib/mock-data";

import { CheckCircle, X, Zap, Crown, Building2, User, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/auth-provider";
import { cn } from "@/lib/utils";

export default function PlansPage() {
    const { user } = useAuth();
    const [view, setView] = useState<"individual" | "agency">("individual");
    const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

    const filteredPlans = PLANS.filter(p => p.type === view);

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            <div className="text-center space-y-2">
                <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-900">Impulsione seu Negócio</h1>
                <p className="text-slate-500 text-base max-w-2xl mx-auto">
                    Kits de ferramentas inteligentes para corretores independentes e imobiliárias de alta performance.
                </p>
            </div>

            {/* View Toggle (Individual / Agency) */}
            <div className="flex justify-center p-1 bg-slate-100 rounded-2xl w-fit mx-auto border border-slate-200">
                <button
                    onClick={() => setView("individual")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                        view === "individual" ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <User className="h-4 w-4" />
                    Para Você
                </button>
                <button
                    onClick={() => setView("agency")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                        view === "agency" ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <Building2 className="h-4 w-4" />
                    Para Empresas
                </button>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
                <span className={cn("text-sm font-bold transition-colors", billing === "monthly" ? "text-slate-900" : "text-slate-400")}>
                    Mensal
                </span>
                <button
                    onClick={() => setBilling(billing === "monthly" ? "annual" : "monthly")}
                    className="relative w-12 h-6 bg-slate-200 rounded-full transition-colors border border-slate-300"
                >
                    <div className={cn(
                        "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm",
                        billing === "annual" ? "translate-x-6 bg-brand-600" : ""
                    )} />
                </button>
                <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-bold transition-colors", billing === "annual" ? "text-slate-900" : "text-slate-400")}>
                        Anual
                    </span>
                    <Badge variant="success" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] py-0 px-2 font-black uppercase">
                        -20% OFF
                    </Badge>
                </div>
            </div>

            {/* Plans Grid */}
            <div className={cn(
                "grid gap-6",
                filteredPlans.length === 1 ? "max-w-md mx-auto" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            )}>
                {filteredPlans.map((plan) => {
                    const isCurrent = user?.planId === plan.id;
                    const price = billing === "annual" ? Math.floor(plan.price * 0.8) : plan.price;

                    return (
                        <Card
                            key={plan.id}
                            className={cn(
                                "relative flex flex-col p-8 transition-all duration-300",
                                plan.highlighted
                                    ? "border-brand-500 shadow-xl shadow-brand-500/10 scale-105 z-10"
                                    : "border-slate-200 hover:border-brand-200"
                            )}
                        >
                            {plan.highlighted && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <Badge variant="gold" className="bg-gold-400 text-gold-950 font-black px-4 py-1 uppercase tracking-wider text-[10px]">
                                        Melhor Custo Benefício
                                    </Badge>
                                </div>
                            )}

                            {isCurrent && (
                                <div className="absolute top-4 right-4">
                                    <Badge variant="brand" className="text-[10px] font-black uppercase">Plano Ativo</Badge>
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="font-display text-xl font-black text-slate-900">{plan.name}</h3>
                                <div className="mt-4 flex items-baseline gap-1">
                                    <span className="text-slate-500 text-sm font-bold">R$</span>
                                    <span className="text-4xl font-black text-slate-900 leading-none">
                                        {price}
                                    </span>
                                    <span className="text-slate-400 text-sm font-medium">/mês</span>
                                </div>
                                <p className="mt-2 text-brand-600 text-xs font-bold uppercase tracking-tight">
                                    {plan.creditsPerMonth} Créditos Inclusos
                                </p>
                            </div>

                            <ul className="space-y-4 mb-10 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        {feature.included ? (
                                            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                        ) : (
                                            <X className="h-5 w-5 text-slate-300 shrink-0 mt-0.5" />
                                        )}
                                        <span className={cn(
                                            "text-sm",
                                            feature.included ? "text-slate-600" : "text-slate-400"
                                        )}>
                                            {feature.label}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={cn(
                                    "w-full h-12 text-sm font-black uppercase tracking-wider",
                                    plan.highlighted ? "bg-brand-600 hover:bg-brand-700 text-white" : "bg-white border-2 border-slate-200 text-slate-900 hover:bg-slate-50"
                                )}
                                disabled={isCurrent || plan.id === 'trial'}
                            >
                                {isCurrent ? "Plano Atual" : `Assinar ${plan.name}`}
                            </Button>
                        </Card>
                    );
                })}
            </div>

            {/* FAQ / Credits Hint */}
            <div className="mt-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-slate-500 text-sm">
                    <HelpCircle className="h-4 w-4" />
                    Precisa de uma solução customizada? <Link href="/settings/suggestions" className="text-brand-600 font-bold hover:underline">Fale conosco</Link>
                </div>
            </div>
        </div>
    );
}
