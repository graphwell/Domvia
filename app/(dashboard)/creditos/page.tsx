"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/auth-provider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Coins, Zap, Trophy, ShieldCheck, History } from "lucide-react";
import { cn } from "@/lib/utils";

const CREDIT_PACKAGES = [
    {
        id: 'starter',
        name: 'Starter',
        credits: 100,
        price: 19,
        description: 'Ideal para experimentação pontual.',
        highlight: false,
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER
    },
    {
        id: 'popular',
        name: 'Popular',
        credits: 300,
        price: 49,
        description: 'Melhor custo-benefício para corretores ativos.',
        highlight: true,
        badge: 'Mais Vendido',
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_POPULAR
    },
    {
        id: 'professional',
        name: 'Profissional',
        credits: 1000,
        price: 129,
        description: 'Para imobiliárias e alta demanda.',
        highlight: false,
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL
    }
];

export default function CreditsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState<string | null>(null);

    const handleBuy = async (pkg: typeof CREDIT_PACKAGES[0]) => {
        if (!user) return;
        setLoading(pkg.id);
        
        try {
            const response = await fetch("/api/billing/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    mode: "payment",
                    priceId: pkg.priceId,
                    metadata: { 
                        credits: pkg.credits.toString(),
                        package: pkg.id 
                    }
                }),
            });

            const { url, error } = await response.json();
            if (error) throw new Error(error);
            if (url) window.location.href = url;
        } catch (error) {
            console.error("Purchase error:", error);
            setLoading(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="text-center space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 border border-brand-100 mb-2">
                    <Coins className="h-6 w-6 text-brand-600" />
                </div>
                <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">Recarregue sua <span className="text-brand-600">Carteira.</span></h1>
                <p className="text-slate-500 font-medium">Créditos não expiram. Use quando quiser, em qualquer ferramenta.</p>
            </div>

            {/* Current Balance Card */}
            <Card padding="md" className="bg-gradient-to-br from-slate-900 to-indigo-950 border-none shadow-xl text-white">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Saldo Atual Total</p>
                        <div className="flex items-center gap-2">
                            <span className="text-4xl font-black tracking-tighter">{(user as any)?.credits ?? 0}</span>
                            <span className="text-sm font-bold text-slate-400 capitalize">Créditos</span>
                        </div>
                    </div>
                    <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                        <Zap className="h-7 w-7 text-brand-400 animate-pulse" />
                    </div>
                </div>
            </Card>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {CREDIT_PACKAGES.map((pkg) => (
                    <Card 
                        key={pkg.id} 
                        padding="lg"
                        className={cn(
                            "flex flex-col relative transition-all duration-300",
                            pkg.highlight ? "border-brand-500 shadow-lg scale-105 z-10 bg-brand-50/20" : "hover:border-slate-300"
                        )}
                    >
                        {pkg.badge && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                                {pkg.badge}
                            </div>
                        )}
                        
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white shadow-sm mx-auto mb-2 text-brand-600">
                                {pkg.id === 'starter' ? <Coins className="h-6 w-6" /> : pkg.id === 'popular' ? <Zap className="h-6 w-6" /> : <Trophy className="h-6 w-6" />}
                            </div>
                            <div className="text-center">
                                <h3 className="font-display font-black text-slate-900 uppercase tracking-tight">{pkg.name}</h3>
                                <div className="flex items-center justify-center gap-1.5 mt-2">
                                    <span className="text-2xl font-black text-slate-900">{pkg.credits}</span>
                                    <span className="text-xs font-bold text-slate-500 uppercase">créditos</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 text-center font-medium leading-relaxed">{pkg.description}</p>
                        </div>

                        <div className="mt-8 space-y-3">
                            <div className="text-center">
                                <span className="text-sm font-bold text-slate-400">R$</span>
                                <span className="text-2xl font-black text-slate-900 ml-1">{pkg.price}</span>
                                <span className="text-xs font-bold text-slate-400 ml-1">à vista</span>
                            </div>
                            <Button 
                                className="w-full text-xs font-black uppercase tracking-widest" 
                                variant={pkg.highlight ? 'primary' : 'outline'}
                                loading={loading === pkg.id}
                                onClick={() => handleBuy(pkg)}
                            >
                                Comprar agora
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Trust Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card padding="md" className="flex items-center gap-4 bg-slate-50 border-none">
                    <History className="h-5 w-5 text-slate-400" />
                    <p className="text-xs font-medium text-slate-500">Histórico de compras disponível no Painel Administrativo e por e-mail.</p>
                </Card>
                <Card padding="md" className="flex items-center gap-4 bg-slate-50 border-none">
                    <ShieldCheck className="h-5 w-5 text-brand-600" />
                    <p className="text-xs font-medium text-slate-500">Pagamentos processados com segurança pelo Stripe™.</p>
                </Card>
            </div>
        </div>
    );
}
