"use client";

import { CampaignLink } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { 
    ChevronRight, 
    CheckCircle2, 
    Building2, 
    Image as ImageIcon,
    Sparkles,
    ArrowRight
} from "lucide-react";
import Image from "next/image";

interface Props {
    link: CampaignLink;
    onContinue: () => void;
    brokerLogo?: string;
}

export function PropertyLandingPage({ link, onContinue, brokerLogo }: Props) {
    const photos = link.landing_photos || [];
    const mainPhoto = photos[0] || "/placeholder-property.jpg";
    const bullets = link.landing_bullets || [];

    return (
        <div className="min-h-screen bg-white flex flex-col animate-fade-in">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="relative h-8 w-28">
                        <Image
                            src={brokerLogo || "/logo-domvia.png?v=202603092100"}
                            alt="Logo"
                            fill
                            className="object-contain object-left"
                            unoptimized
                        />
                    </div>
                    <Badge variant="brand" className="text-[10px]">Imóvel Exclusivo</Badge>
                </div>
            </header>

            <main className="flex-1 pb-24">
                {/* Hero / Main Photo */}
                <div className="relative aspect-[16/10] md:aspect-[21/9] w-full overflow-hidden bg-slate-900 group">
                    <img
                        src={mainPhoto}
                        alt={link.title}
                        className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white max-w-5xl mx-auto w-full">
                        <div className="animate-fade-up">
                            <Badge className="bg-brand-600 border-none mb-3 text-[10px] uppercase font-black tracking-widest px-3 py-1">
                                {link.price ? "Oportunidade Única" : "Sob Consulta"}
                            </Badge>
                            <h1 className="font-display text-3xl md:text-5xl font-black leading-tight drop-shadow-lg">
                                {link.landing_headline || link.title}
                            </h1>
                            <div className="flex items-center gap-4 mt-4">
                                <span className="text-2xl md:text-3xl font-black text-brand-400">
                                    {link.price ? formatCurrency(link.price) : "Preço sob consulta"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Side: Content */}
                    <div className="lg:col-span-7 space-y-10">
                        {/* Description */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <div className="h-1.5 w-6 bg-brand-600 rounded-full" />
                                Sobre o Imóvel
                            </h2>
                            <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                                {link.landing_description || link.description}
                            </p>
                        </div>

                        {/* Bullets / Features */}
                        {bullets.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {bullets.map((b, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-brand-200 transition-colors">
                                        <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{b}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Secondary Photos */}
                        {photos.length > 1 && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                    <div className="h-1.5 w-6 bg-brand-600 rounded-full" />
                                    Galeria de Fotos
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {photos.slice(1).map((photo, i) => (
                                        <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-100 group">
                                            <img
                                                src={photo}
                                                alt={`Property ${i + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Action Card */}
                    <div className="lg:col-span-5 relative">
                        <div className="sticky top-24">
                            <Card padding="lg" className="border-brand-100 shadow-2xl shadow-brand-900/10 overflow-hidden relative">
                                <div className="absolute -top-10 -right-10 h-32 w-32 bg-brand-500/5 rounded-full blur-3xl" />
                                
                                <div className="relative space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
                                            <Sparkles className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Tecnologia Domvia</p>
                                            <h3 className="font-display font-bold text-slate-900">IA Especialista</h3>
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        Tire todas as suas dúvidas sobre este imóvel e faça simulações de financiamento personalizadas com nossa Inteligência Artificial imobiliária.
                                    </p>

                                    <div className="space-y-3 pt-4">
                                        <Button 
                                            size="xl" 
                                            className="w-full text-sm font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 group h-14"
                                            onClick={onContinue}
                                            rightIcon={<ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                                        >
                                            {link.landing_cta || "Quero Saber Mais"}
                                        </Button>
                                        
                                        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Atendimento 24h via IA
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            
                            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                                    <Building2 className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div className="text-xs text-emerald-900">
                                    <p className="font-bold">Financiamento Facilitado</p>
                                    <p className="opacity-70">Aprovamos seu crédito com as melhores taxas do mercado.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Footer CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 md:hidden z-50 safe-area-bottom">
                <Button 
                    size="xl" 
                    className="w-full text-sm font-black uppercase tracking-widest shadow-lg shadow-brand-500/20"
                    onClick={onContinue}
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                    {link.landing_cta || "Quero Saber Mais"}
                </Button>
            </div>
        </div>
    );
}
