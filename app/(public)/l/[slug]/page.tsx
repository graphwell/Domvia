"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, runTransaction } from "firebase/database";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
    ChevronRight, MapPin, Home, 
    CheckCircle2, Loader2, Share2, ArrowLeft
} from "lucide-react";
import { triggerHaptic } from "@/lib/haptic";
import type { CampaignLink } from "@/types";

export default function PublicLandingPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
    const params = use(paramsPromise);
    const slug = params.slug;
    const router = useRouter();
    const [link, setLink] = useState<CampaignLink | null>(null);
    const [loading, setLoading] = useState(true);
    const [activePhoto, setActivePhoto] = useState(0);

    useEffect(() => {
        if (!slug) return;

        const linksRef = ref(rtdb, "links");
        const unsub = onValue(linksRef, (snap) => {
            const data = snap.val();
            if (data) {
                const found = Object.values(data).find((l: any) => l.slug === slug) as CampaignLink;
                if (found) {
                    setLink(found);
                    if (found.landing_enabled) {
                        // Increment views
                        const linkRef = ref(rtdb, `links/${found.id}/landing_views`);
                        runTransaction(linkRef, (curr) => (curr || 0) + 1);
                    } else {
                        // If not enabled, redirect to IA directly
                        router.push(`/lead/${slug}`);
                    }
                }
            }
            setLoading(false);
        });

        return () => unsub();
    }, [slug, router]);

    const handleCTA = async () => {
        if (!link) return;
        triggerHaptic('medium');
        
        // Track click
        const clickRef = ref(rtdb, `links/${link.id}/landing_cta_clicks`);
        runTransaction(clickRef, (curr) => (curr || 0) + 1);

        router.push(`/lead/${slug}`);
    };

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-3 bg-slate-50">
                <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
                <p className="text-slate-500 text-sm">Carregando imóvel...</p>
            </div>
        );
    }

    if (!link || !link.landing_enabled) {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-xl font-bold text-slate-900">Imóvel não encontrado</h1>
                <p className="text-slate-500 mt-2">Este link pode ter sido removido ou está temporariamente offline.</p>
                <Button className="mt-6" onClick={() => router.push("/")}>Voltar para o Início</Button>
            </div>
        );
    }

    const photos = link.landing_photos || [];

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            {/* Header / Navigation Overlay */}
            <div className="fixed top-0 inset-x-0 z-50 p-4 flex items-center justify-between">
                <button 
                   onClick={() => router.back()}
                   className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex gap-2">
                     <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
                        <Share2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Hero / Cover Photo */}
            <div className="relative h-[65vh] w-full bg-slate-200">
                <img 
                    src={photos[activePhoto]} 
                    className="w-full h-full object-cover" 
                    alt={link.title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />
                
                <div className="absolute bottom-10 left-0 right-0 px-6 space-y-2">
                    <Badge className="bg-brand-600 border-none px-3 py-1 text-white">Oportunidade</Badge>
                    <h1 className="text-3xl font-black text-white font-display leading-tight">{link.title}</h1>
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                        <MapPin className="h-4 w-4" />
                        <span>Excelente localização</span>
                    </div>
                </div>
            </div>

            {/* Photo Gallery (Carousel) */}
            <div className="px-4 -mt-6 relative z-10 flex gap-2 overflow-x-auto pb-4 pt-2 scrollbar-hide snap-x">
                {photos.map((photo, i) => (
                    <button 
                        key={i} 
                        onClick={() => {
                            triggerHaptic('light');
                            setActivePhoto(i);
                        }}
                        className={`relative w-24 aspect-video rounded-xl overflow-hidden shrink-0 border-2 transition-all snap-start ${activePhoto === i ? "border-brand-500 scale-105" : "border-white"}`}
                    >
                        <img src={photo} className="w-full h-full object-cover" alt={`Miniatura ${i}`} />
                    </button>
                ))}
            </div>

            {/* Content Section */}
            <main className="px-6 space-y-8 mt-4">
                {/* Price & Badge */}
                <div className="flex items-center justify-between">
                    {link.price && (
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Investimento</p>
                            <p className="text-2xl font-black text-brand-600">R$ {link.price.toLocaleString("pt-BR")}</p>
                        </div>
                    )}
                    <div className="flex flex-col items-end">
                        <p className="text-[10px] text-slate-400 font-medium">Anunciado por</p>
                        <p className="font-bold text-slate-800">{link.brokerName}</p>
                    </div>
                </div>

                {/* IA Description */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 leading-snug">{link.landing_headline}</h2>
                    <p className="text-slate-600 leading-relaxed text-sm">{link.landing_description}</p>
                </div>

                {/* Bullets */}
                <div className="grid grid-cols-1 gap-3">
                    {(link.landing_bullets || []).map((bullet, i) => (
                        <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            </div>
                            <span className="text-slate-700 font-medium text-sm">{bullet}</span>
                        </div>
                    ))}
                </div>

                {/* Broker Info Card */}
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                        <Home className="h-6 w-6 text-slate-400" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-medium">Fale com o corretor</p>
                        <p className="font-bold text-slate-900">{link.brokerName}</p>
                    </div>
                </div>
            </main>

            {/* Sticky Bottom CTA */}
            <div className="fixed bottom-0 inset-x-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50">
                <Button 
                    className="w-full h-14 text-lg font-black rounded-2xl shadow-xl shadow-brand-500/20"
                    onClick={handleCTA}
                >
                    {link.landing_cta || "Quero saber mais"}
                    <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">
                    Tire suas dúvidas com nossa IA — responde em segundos
                </p>
            </div>
        </div>
    );
}
