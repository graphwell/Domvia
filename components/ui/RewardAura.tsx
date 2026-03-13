"use client";

import { useState, useEffect } from "react";
import { Coins, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "../ui/Card";

interface RewardAuraProps {
    amount: number;
    description: string;
    onClose: () => void;
}

export function RewardAura({ amount, description, onClose }: RewardAuraProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        // Haptic feedback simulation
        if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate([30, 50, 30]);
        }

        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 500); // Wait for fade out
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div 
            className={cn(
                "fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-6",
                isVisible ? "animate-in fade-in duration-300" : "animate-out fade-out duration-500"
            )}
        >
            <div className="absolute inset-0 bg-brand-900/40 backdrop-blur-sm pointer-events-auto" onClick={() => setIsVisible(false)} />
            
            <Card className="relative w-full max-w-xs animate-reward pointer-events-auto border-none shadow-[0_20px_60px_-15px_rgba(32,87,245,0.6)] py-8 px-6 text-center bg-gradient-to-b from-white to-brand-50">
                <div className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer" onClick={() => setIsVisible(false)}>
                    <X className="h-4 w-4" />
                </div>

                <div className="mx-auto h-20 w-20 rounded-full bg-brand-100 flex items-center justify-center mb-4 relative">
                    <div className="absolute inset-0 rounded-full bg-brand-500/20 animate-ping" />
                    <Coins className="h-10 w-10 text-brand-600" />
                </div>

                <h3 className="font-display text-2xl font-black text-slate-900 mb-1">Parabéns!</h3>
                <p className="text-brand-600 font-bold text-lg mb-4">Você ganhou +{amount} créditos</p>
                <p className="text-slate-500 text-sm italic">{description}</p>
                
                <div className="mt-6">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 animate-[shimmer_2s_infinite]" style={{ width: '40%' }} />
                    </div>
                </div>
            </Card>
        </div>
    );
}
