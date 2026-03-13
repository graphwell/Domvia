"use client";

import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreditNotificationProps {
    amount: number;
    onClose: () => void;
}

export function CreditNotification({ amount, onClose }: CreditNotificationProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger entrance animation
        setIsVisible(true);
        
        // Auto-dismiss after 4 seconds
        const timer = setTimeout(() => {
            setIsVisible(false);
            // Allow exit animation to complete
            setTimeout(onClose, 500);
        }, 3500);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={cn(
            "fixed top-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none transition-all duration-500 ease-out",
            isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-8 scale-90"
        )}>
            <div className="bg-white/90 backdrop-blur-md border border-brand-200 shadow-[0_8px_32px_rgba(32,87,245,0.2)] px-4 py-3 rounded-2xl flex items-center gap-3 animate-glow">
                <div className="h-10 w-10 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg transform rotate-12">
                    <Coins className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-800 tracking-tight">+{amount} créditos recebidos!</span>
                    <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">Recompensa Domvia</span>
                </div>
            </div>
            
            {/* Soft glow underlying effect */}
            <div className="absolute inset-0 -z-10 bg-brand-400/20 blur-2xl rounded-full scale-150 animate-pulse" />
        </div>
    );
}

// Global styles for the notification
const style = `
@keyframes glow {
    0%, 100% { box-shadow: 0 8px 32px rgba(32,87,245,0.2); }
    50% { box-shadow: 0 8px 48px rgba(32,87,245,0.4); }
}
.animate-glow {
    animation: glow 2s ease-in-out infinite;
}
`;

if (typeof document !== 'undefined') {
    const s = document.createElement('style');
    s.innerHTML = style;
    document.head.appendChild(s);
}
