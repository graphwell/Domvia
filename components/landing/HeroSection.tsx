"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRight, Zap, CheckCircle, Star, Users } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";

function RotatingHeadline() {
    const { t, language } = useLanguage();
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);

    const headlines = t("hero.headlines") || [];

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setIndex((prev) => (prev + 1) % headlines.length);
                setFade(true);
            }, 500); // fade out duration
        }, 5000); // change every 5 seconds

        return () => clearInterval(interval);
    }, [headlines.length]);

    // Reset index if headlines change (language change)
    useEffect(() => {
        setIndex(0);
    }, [language]);

    if (!headlines.length || !headlines[index]) return null;

    return (
        <div className={`space-y-8 transition-all duration-500 ${fade ? 'opacity-100 blur-0 translate-y-0' : 'opacity-0 blur-sm translate-y-4'}`}>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 leading-[1.05]">
                {headlines[index].start}
                <span className="gradient-text">{headlines[index].highlight}</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-600 leading-relaxed font-medium">
                {headlines[index].sub}
            </p>
        </div>
    );
}

export function HeroSection() {
    const { t } = useLanguage();
    return (
        <section className="relative overflow-hidden hero-bg">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl" />
                <div className="absolute top-1/2 -left-40 h-72 w-72 rounded-full bg-purple-500/8 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-gold-400/8 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-16 md:pt-20 md:pb-24">
                <div className="text-center space-y-8">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200 px-4 py-1.5 text-sm font-medium text-brand-700 animate-fade-up">
                        <Zap className="h-3.5 w-3.5 fill-brand-500 text-brand-500" />
                        {t("hero.badge") || "Plataforma #1 para corretores que querem vender mais com IA"}
                    </div>

                    {/* Headline Carousel */}
                    <div className="min-h-[220px] sm:min-h-[280px] lg:min-h-[340px] flex items-center justify-center">
                        <RotatingHeadline />
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center animate-fade-up delay-300">
                        <Link href="/register">
                            <Button size="xl" className="min-w-[220px] shadow-glow">
                                {t("auth.start_free") || "Começar Grátis Agora"}
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </Link>
                    </div>

                    {/* Social proof */}
                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500 animate-fade-up delay-400">
                        <div className="flex items-center gap-1.5">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            {t("hero.no_card") || "Sem cartão de crédito"}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            {t("hero.ready_fast") || "Pronto em 30 segundos"}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Star className="h-4 w-4 text-gold-500 fill-gold-500" />
                            <Star className="h-4 w-4 text-gold-500 fill-gold-500" />
                            <Star className="h-4 w-4 text-gold-500 fill-gold-500" />
                            <Star className="h-4 w-4 text-gold-500 fill-gold-500" />
                            <Star className="h-4 w-4 text-gold-500 fill-gold-500" />
                            <span className="ml-1">{t("hero.social_proof") || "4.9/5 de 500+ corretores"}</span>
                        </div>
                    </div>

                    {/* Mock browser preview */}
                    <div className="relative mx-auto mt-12 max-w-3xl animate-fade-up delay-500">
                        <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_32px_80px_-12px_rgba(0,0,0,0.15)] overflow-hidden">
                            <div className="flex items-center gap-2 bg-slate-100 px-4 py-3 border-b border-slate-200">
                                <span className="h-3 w-3 rounded-full bg-red-400" />
                                <span className="h-3 w-3 rounded-full bg-amber-400" />
                                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                                <div className="flex-1 mx-4 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs text-slate-500 text-left truncate">
                                    domvia.ai/imovel/apartamento-moderno-itaim
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[240px]">
                                <div
                                    className="bg-slate-200 flex items-end p-4"
                                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600')", backgroundSize: "cover", backgroundPosition: "center" }}
                                >
                                    <div className="rounded-xl bg-white/90 backdrop-blur px-3 py-2 text-left">
                                        <p className="font-display font-bold text-slate-900 text-sm">Apto Itaim Bibi</p>
                                        <p className="text-brand-600 font-bold text-base">R$ 1.850.000</p>
                                    </div>
                                </div>
                                <div className="p-4 space-y-2 text-left bg-white">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">IA Domvia • online agora</p>
                                    <div className="rounded-xl bg-brand-50 px-3 py-2 max-w-[90%]">
                                        <p className="text-xs text-slate-700">Olá! Posso calcular o financiamento para você agora 😊</p>
                                    </div>
                                    <div className="rounded-xl bg-slate-100 px-3 py-2 max-w-[90%] ml-auto">
                                        <p className="text-xs text-slate-700">Qual seria a parcela com 20% de entrada?</p>
                                    </div>
                                    <div className="rounded-xl bg-brand-50 px-3 py-2 max-w-[90%]">
                                        <p className="text-xs text-slate-700">Com R$ 370k de entrada, ~R$ 9.800/mês em 30 anos 🏠</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
