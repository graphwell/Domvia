"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useAuth } from "@/hooks/auth-provider";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Check, Zap, Star, ShieldCheck, ArrowRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLAN_CONFIG } from "@/lib/billing";
import { toast } from "sonner";

export default function PricingPage() {
    const { user } = useAuth();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
    const [loading, setLoading] = useState<string | null>(null);

    const handleSubscribe = async (planId: string) => {
        if (!user) {
            window.location.href = "/login";
            return;
        }

        setLoading(planId);
        try {
            const priceId = planId === 'pro' 
                ? (billingCycle === 'monthly' ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY)
                : (billingCycle === 'monthly' ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MAX_MONTHLY : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MAX_YEARLY);

            if (!priceId) {
                console.error("Price ID not configured for:", planId, billingCycle);
                toast.error("Configuração de preço incompleta no servidor.");
                setLoading(null);
                return;
            }
            
            const response = await fetch("/api/billing/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    mode: "subscription",
                    planId,
                    billingCycle,
                    priceId,
                    metadata: { plan_type: planId, billing_cycle: billingCycle }
                }),
            });

            const { url, error } = await response.json();
            if (error) throw new Error(error);
            if (url) window.location.href = url;
        } catch (error) {
            console.error("Checkout error:", error);
            setLoading(null);
        }
    };

    const plans = [
        {
            ...PLAN_CONFIG.trial,
            price: 0,
            description: "Grátis por 14 dias — sem cartão",
            features: [
                "100 créditos para começar",
                "15 captações inteligentes",
                "5 documentos oficiais",
                "10 links de campanha",
                "IA especialista (10 sessões)",
            ],
            cta: "Começar grátis",
            highlight: false,
        },
        {
            ...PLAN_CONFIG.pro,
            price: billingCycle === 'monthly' ? 49 : 36.75, // R$ 441/12
            description: "Para corretores em crescimento",
            features: [
                "500 créditos mensais",
                "150 captações/mês",
                "50 documentos/mês",
                "100 links de campanha",
                "IA especialista (100 sessões)",
                "Créditos do plano expiram no ciclo",
            ],
            cta: "Assinar Pro",
            highlight: true,
            badge: "Mais Popular",
        },
        {
            ...PLAN_CONFIG.max,
            price: billingCycle === 'monthly' ? 89 : 66.58, // R$ 799/12
            description: "Para quem não para de vender",
            features: [
                "Tudo ILIMITADO",
                "Sem cobrança de créditos",
                "Prioridade no suporte",
                "Acesso antecipado a novas IAs",
                "Suporte humanizado em Fortaleza",
            ],
            cta: "Quero o Max",
            highlight: false,
            badge: "Elite",
        }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="text-center space-y-4">
                <Badge variant="brand" className="px-4 py-1 text-xs uppercase font-black tracking-widest">Planos Domvia</Badge>
                <h1 className="text-4xl sm:text-5xl font-display font-black text-slate-900 tracking-tight">
                    Escolha o motor da sua <span className="text-brand-600">produtividade.</span>
                </h1>
                <p className="text-slate-500 max-w-2xl mx-auto font-medium">
                    Domvia substitui 4 ferramentas que custam R$ 300/mês por apenas R$ 49. 
                    Sem contrato. Cancele quando quiser.
                </p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 pt-6">
                    <span className={cn("text-sm font-bold transition-colors", billingCycle === 'monthly' ? "text-slate-900" : "text-slate-400")}>Mensal</span>
                    <button 
                        onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                        className="h-8 w-14 rounded-full bg-slate-200 p-1 transition-colors relative"
                    >
                        <div className={cn(
                            "h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300",
                            billingCycle === 'annual' ? "translate-x-6" : "translate-x-0"
                        )} />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-bold transition-colors", billingCycle === 'annual' ? "text-slate-900" : "text-slate-400")}>Anual</span>
                        <Badge variant="success" className="text-[10px] animate-pulse">3 MESES GRÁTIS</Badge>
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {plans.map((plan) => (
                    <Card 
                        key={plan.id} 
                        className={cn(
                            "relative flex flex-col transition-all duration-300",
                            plan.highlight ? "border-brand-500 shadow-[0_0_40px_rgba(32,87,245,0.15)] scale-100 md:scale-105 z-10" : "hover:border-brand-200"
                        )}
                        padding="lg"
                    >
                        {(plan as any).badge && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                {(plan as any).badge}
                            </div>
                        )}

                        <div className="flex-1 space-y-6">
                            <div>
                                <h3 className="text-xl font-display font-black text-slate-900 uppercase">{plan.name}</h3>
                                <p className="text-xs text-slate-500 font-medium mt-1">{plan.description}</p>
                            </div>

                            <div className="flex items-baseline gap-1">
                                <span className="text-sm font-bold text-slate-400">R$</span>
                                <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                                <span className="text-sm font-bold text-slate-400">/{billingCycle === 'monthly' ? 'mês' : 'mês*'}</span>
                            </div>
                            {billingCycle === 'annual' && plan.price > 0 && (
                                <p className="text-[10px] text-slate-400 font-medium">* Cobrado anualmente (R$ {plan.id === 'pro' ? '441' : '799'})</p>
                            )}

                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3 text-sm">
                                        <div className="h-5 w-5 rounded-full bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check className="h-3 w-3 text-brand-600" />
                                        </div>
                                        <span className="text-slate-600 font-medium leading-tight">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button 
                            className="w-full mt-8 h-[48px] text-sm font-black uppercase tracking-widest" 
                            variant={plan.highlight ? 'primary' : 'outline'}
                            loading={loading === plan.id}
                            onClick={() => handleSubscribe(plan.id)}
                        >
                            {plan.cta}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Card>
                ))}
            </div>

            {/* Comparison Table Section (Simplified for now) */}
            <div className="pt-10">
                <Card padding="lg" className="bg-slate-50 border-none">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-600">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Segurança Domvia</h4>
                                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Sem multas. Sem fidelidade. 100% transparente.</p>
                            </div>
                        </div>
                        <Link href="/manual/planos">
                            <Button variant="ghost" className="text-xs font-bold uppercase tracking-widest" rightIcon={<Info className="h-4 w-4" />}>
                                Ver tabela comparativa completa
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
            {/* Footer context */}
            <div className="text-center pt-8 border-t border-slate-100 italic font-medium">
                <p className="text-sm text-slate-500">
                    Precisa de créditos avulsos? <Link href="/creditos" className="text-brand-600 hover:underline">Veja nossos pacotes</Link>.
                </p>
            </div>
        </div>
    );
}
