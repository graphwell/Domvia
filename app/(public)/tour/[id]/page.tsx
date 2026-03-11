"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Tour } from "@/types";
import { rtdb } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import MarzipanoViewer from "@/components/tours/MarzipanoViewer";
import { Loader2, AlertCircle, Share2, Home, Phone, User as UserIcon, Award, MessageCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { User } from "@/types";
import { get, update, increment } from "firebase/database";

export default function PublicTourPage() {
    const params = useParams();
    const id = params.id as string;
    const [tour, setTour] = useState<Tour | null>(null);
    const [broker, setBroker] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [views, setViews] = useState(0);

    useEffect(() => {
        if (!id) return;

        // Increment views
        const viewsRef = ref(rtdb, `tours/${id}`);
        update(viewsRef, {
            viewCount: increment(1)
        });

        const tourRef = ref(rtdb, `tours/${id}`);
        const unsubscribe = onValue(tourRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setTour(data);
                setViews(data.viewCount || 0);

                // Fetch broker info
                if (data.userId) {
                    const userRef = ref(rtdb, `users/${data.userId}`);
                    get(userRef).then(snap => {
                        if (snap.exists()) setBroker(snap.val());
                    });
                }
            } else {
                setError("O tour solicitado não está disponível ou não foi encontrado.");
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching public tour:", err);
            setError("Erro de conexão ao carregar o tour.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id]);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: tour?.title,
                text: "Confira este tour virtual incrível!",
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copiado para a área de transferência!");
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center gap-4 text-white">
                <div className="h-12 w-12 border-4 border-brand-500 border-t-transparent animate-spin rounded-full" />
                <p className="font-display font-medium text-slate-400">Preparando experiência imersiva...</p>
            </div>
        );
    }

    if (error || !tour) {
        return (
            <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="h-16 w-16 text-slate-200 mb-4" />
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Ops! Link Inválido</h1>
                <p className="text-slate-500 max-w-sm mb-6">{error}</p>
                <Link href="/">
                    <Button variant="primary">Voltar para o Início</Button>
                </Link>
            </div>
        );
    }

    const whatsappUrl = broker?.whatsapp || broker?.phone || "";
    const tourTitle = tour?.title || "Imóvel 360°";
    const waMessage = encodeURIComponent(`Olá ${broker?.name || "Corretor"}, acabei de ver o tour virtual do imóvel "${tourTitle}" e gostaria de mais informações.`);
    const waLink = `https://wa.me/${whatsappUrl.replace(/\D/g, '')}?text=${waMessage}`;

    return (
        <div className="fixed inset-0 bg-slate-950 overflow-hidden flex flex-col font-sans">
            {/* Header / Broker Branding - Premium Glass Effect */}
            <div className="absolute top-0 left-0 right-0 z-50 p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
                <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
                    {/* Broker Profile */}
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl p-2 pr-5 rounded-full border border-white/20 shadow-2xl transition-all hover:bg-white/15">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden border-2 border-brand-500 shadow-glow relative bg-slate-800">
                            {broker?.photoURL || broker?.avatarUrl ? (
                                <img src={broker.photoURL || broker.avatarUrl} alt={broker.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/40">
                                    <UserIcon className="h-5 w-5" />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-display font-bold text-sm sm:text-base leading-tight tracking-tight">
                                {broker?.name || "Corretor"}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <Award className="h-3 w-3 text-brand-400" />
                                <span className="text-[10px] text-white/70 uppercase font-bold tracking-widest leading-none">
                                    CRECI {broker?.creci || "---"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Property Status/Title - Desktop only or small mobile version */}
                    <div className="hidden md:flex flex-col items-end text-right">
                        <h1 className="font-display font-bold text-xl text-white drop-shadow-lg tracking-tight">{tour.title}</h1>
                        <span className="text-xs text-white/60 font-medium uppercase tracking-[0.2em]">{tour.address || "Localização não informada"}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-10 w-10 sm:h-12 sm:w-12 bg-white/5 backdrop-blur-md border-white/20 hover:bg-brand-600 text-white transition-all shadow-xl"
                            onClick={handleShare}
                        >
                            <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                        <a href={waLink} target="_blank" rel="noopener noreferrer">
                            <Button
                                className="rounded-full h-10 sm:h-12 px-4 sm:px-6 bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-glow flex items-center gap-2 group"
                            >
                                <MessageCircle className="h-5 w-5 animate-bounce group-hover:animate-none" />
                                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">WhatsApp</span>
                            </Button>
                        </a>
                    </div>
                </div>
            </div>

            <div className="flex-1 relative">
                <MarzipanoViewer
                    tour={tour}
                    className="w-full h-full"
                    showControls={true}
                />
            </div>

            {/* Footer / Stats & Branding */}
            <div className="absolute bottom-6 left-6 right-6 z-40 pointer-events-none flex items-end justify-between">
                {/* Stats */}
                <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3 pointer-events-auto shadow-lg">
                    <div className="flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5 text-white/60" />
                        <span className="text-[11px] font-bold text-white tracking-tight">{views + 1}</span>
                    </div>
                    <div className="h-3 w-px bg-white/10" />
                    <span className="text-[10px] font-medium text-white/50 uppercase tracking-widest">Visualizações</span>
                </div>
            </div>

            {/* Mobile Property Title Overly (Bottom) */}
            <div className="md:hidden absolute bottom-[80px] left-6 right-6 z-50 pointer-events-none text-center">
                <h1 className="font-display font-black text-2xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-tight">{tour.title}</h1>
            </div>
        </div>
    );
}
