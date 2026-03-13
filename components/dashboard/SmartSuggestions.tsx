"use client";

import { useAuth } from "@/hooks/auth-provider";
import { Card } from "../ui/Card";
import { MessageSquare, Link2, Camera, Lightbulb, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { rtdb } from "@/lib/firebase";

export function SmartSuggestions() {
    const { user } = useAuth();
    const [suggestion, setSuggestion] = useState<{
        title: string;
        desc: string;
        icon: any;
        href: string;
        color: string;
    } | null>(null);

    useEffect(() => {
        if (!user) return;

        const checkUsage = async () => {
            const statsRef = ref(rtdb, `usage_stats/${user.id}`);
            const snap = await get(statsRef);
            const stats = snap.val() || {};

            // Logic for suggestions
            if (!stats.link_created) {
                setSuggestion({
                    title: "Crie um Link",
                    desc: "Sugestão: crie seu primeiro link inteligente para começar a captar leads.",
                    icon: Link2,
                    href: "/links/new",
                    color: "text-emerald-600 bg-emerald-50"
                });
            } else if (!stats.ai_chat_message) {
                setSuggestion({
                    title: "Assistente IA",
                    desc: "Sugestão: experimente o assistente IA para tirar dúvidas do mercado imobiliário.",
                    icon: MessageSquare,
                    href: "/tools/chat",
                    color: "text-brand-600 bg-brand-50"
                });
            } else if (!stats.property_captured) {
                setSuggestion({
                    title: "Captar Imóveis",
                    desc: "Sugestão: use a ferramenta de captação fotografando placas.",
                    icon: Camera,
                    href: "/tools/captacao",
                    color: "text-blue-600 bg-blue-50"
                });
            }
        };

        checkUsage();
    }, [user]);

    if (!suggestion) return null;

    return (
        <Card hover padding="none" className="overflow-hidden border-brand-100 bg-gradient-to-r from-brand-50/50 to-transparent">
            <Link href={suggestion.href} className="flex items-center gap-4 p-4 group">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", suggestion.color)}>
                    <suggestion.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <Lightbulb className="h-3 w-3 text-amber-500" />
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Sugestão</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{suggestion.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{suggestion.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
            </Link>
        </Card>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
