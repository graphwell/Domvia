"use client";

import { useState, useEffect } from "react";
import { X, Share, PlusSquare, Download, Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { triggerHaptic } from "@/lib/haptic";
import { cn } from "@/lib/utils";

export function InstallPWA() {
    const [show, setShow] = useState(false);
    const [platform, setPlatform] = useState<'ios' | 'android' | 'other' | null>(null);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        // 1. Detect platform
        const ua = window.navigator.userAgent.toLowerCase();
        const isIos = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const isAndroid = /android/.test(ua);
        
        console.log("PWA Detection:", { ua, isIos, isAndroid, standalone: (window.navigator as any).standalone });

        // 2. Check if already installed (standalone)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
            || (window.navigator as any).standalone 
            || document.referrer.includes('android-app://');

        if (isStandalone) return;

        // 3. Check dismissal logic (7 days)
        const lastDismissed = localStorage.getItem("pwa_install_dismissed");
        if (lastDismissed) {
            const dismissedDate = new Date(lastDismissed);
            const now = new Date();
            const diffDays = Math.ceil((now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays < 7) return;
        }

        // 4. Set platform and show after a short delay
        if (isIos) setPlatform('ios');
        else if (isAndroid) setPlatform('android');
        else return; // Only show on mobile

        // 5. Handle beforeinstallprompt for Android/Chrome
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Show prompt logic here if needed
        };

        window.addEventListener('beforeinstallprompt', handler);

        const timer = setTimeout(() => setShow(true), 3000);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleDismiss = () => {
        triggerHaptic('light');
        localStorage.setItem("pwa_install_dismissed", new Date().toISOString());
        setShow(false);
    };

    const handleInstall = async () => {
        triggerHaptic('medium');
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setShow(false);
            }
            setDeferredPrompt(null);
        } else if (platform === 'ios') {
            // iOS instructions are already shown in the modal content
        }
    };

    if (!show || !platform) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <Card className="w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom duration-500 shadow-2xl rounded-3xl" padding="none">
                <div className="p-6 space-y-6">
                    {/* Icon & Close */}
                    <div className="flex items-start justify-between">
                        <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                            <img src="/apple-touch-icon.png" className="w-12 h-12" alt="Domvia" />
                        </div>
                        <button onClick={handleDismiss} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight">Instale o Domvia no seu celular</h2>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            Acesse o Domvia mais rápido diretamente da tela inicial do seu celular e tenha uma experiência semelhante a um aplicativo.
                        </p>
                    </div>

                    {/* Platform Specific Guide */}
                    {platform === 'ios' ? (
                        <div className="space-y-4 py-4 border-y border-slate-100 italic">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-black">1</span>
                                </div>
                                <p className="text-xs text-slate-600">Toque no botão de compartilhamento do navegador <Share className="inline h-3 w-3 text-blue-500" /> abaixo.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-black">2</span>
                                </div>
                                <p className="text-xs text-slate-600">Selecione a opção <PlusSquare className="inline h-3 w-3" /> <strong>"Adicionar à Tela de Início"</strong>.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-black">3</span>
                                </div>
                                <p className="text-xs text-slate-600">Confirme no canto superior para concluir.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="py-4 flex items-center justify-center gap-4 text-slate-400">
                             <div className="flex flex-col items-center gap-1 opacity-20">
                                <Monitor className="h-6 w-6" />
                                <span className="text-[8px] font-bold">WEB</span>
                             </div>
                             <ArrowRight className="h-4 w-4 opacity-10" />
                             <div className="flex flex-col items-center gap-1 text-brand-600">
                                <Smartphone className="h-8 w-8" />
                                <span className="text-[8px] font-black">APP</span>
                             </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="space-y-3">
                        {platform === 'android' && (
                            <Button className="w-full h-12 text-sm font-black uppercase tracking-widest" onClick={handleInstall}>
                                Instalar aplicativo
                            </Button>
                        )}
                        <Button variant="ghost" className="w-full h-12 text-xs font-bold text-slate-400 uppercase tracking-widest" onClick={handleDismiss}>
                            Agora não
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

function ArrowRight({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
        </svg>
    );
}
