"use client";

import { useAuth } from "@/hooks/auth-provider";
import { Badge } from "@/components/ui/Badge";
import { Coins, Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { User } from "@/types";
import { rtdb } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import Link from "next/link";

export function CreditCounter() {
    const { user: authUser } = useAuth();
    const user = authUser as unknown as User;
    const [showPanel, setShowPanel] = useState(false);
    const [creditsData, setCreditsData] = useState<{ plan_credits: number, bonus_credits: number, total_credits: number } | null>(null);

    useEffect(() => {
        if (!user?.id) return;
        const creditsRef = ref(rtdb, `user_credits/${user.id}`);
        const unsubscribe = onValue(creditsRef, (snap) => {
            if (snap.exists()) {
                setCreditsData(snap.val());
            } else {
                // Fallback for migration
                setCreditsData({
                    plan_credits: (user as any).credits || 0,
                    bonus_credits: (user as any).bonusCredits || 0,
                    total_credits: ((user as any).credits || 0) + ((user as any).bonusCredits || 0)
                });
            }
        });
        return () => unsubscribe();
    }, [user?.id, (user as any)?.credits, (user as any)?.bonusCredits]);

    if (!user) return null;

    const total = creditsData?.total_credits ?? 0;
    const bonus = creditsData?.bonus_credits ?? 0;
    const planCredits = creditsData?.plan_credits ?? 0;

    // Pulse/Color logic
    const isLow = total < 100;
    const isCritical = total < 50;

    return (
        <div className="relative">
            <button 
                onClick={() => setShowPanel(!showPanel)}
                className={cn(
                    "flex items-center gap-1.5 transition-all px-2.5 py-1.5 rounded-xl border group active:scale-95 duration-150 shadow-sm",
                    isCritical 
                        ? "bg-red-50 border-red-200 animate-pulse shadow-red-100" 
                        : isLow 
                            ? "bg-amber-50 border-amber-200" 
                            : "bg-brand-50 border-brand-100 hover:bg-brand-100"
                )}
            >
                <div className="flex -space-x-1">
                    <Coins className={cn("h-4 w-4 relative z-10", isCritical ? "text-red-600" : "text-brand-600")} />
                    {bonus > 0 && <Flame className="h-4 w-4 text-amber-500 animate-pulse" />}
                </div>
                <span className={cn("text-xs font-black tracking-tight", isCritical ? "text-red-700" : "text-brand-700")}>{total}</span>
            </button>

            {showPanel && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowPanel(false)} />
                    <Card className="absolute top-full right-0 mt-2 w-64 z-50 animate-fade-in shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-4 border-slate-100 overflow-hidden" glass>
                        <div className="absolute -top-10 -right-10 h-32 w-32 bg-brand-500/5 rounded-full blur-2xl" />
                        
                        <div className="relative space-y-4">
                            <div>
                                <h4 className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2">Plano Atual</h4>
                                <Badge variant={user.planId === 'max' ? "success" : "brand"} className="w-full justify-center py-1.5 text-xs uppercase font-black tracking-widest shadow-sm">
                                    {user.planId === 'max' ? 'Domvia MAX' : user.planId === 'pro' ? 'Domvia PRO' : 'Trial Ativo'}
                                </Badge>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Distribuição</span>
                                    <span className="text-[10px] font-black text-brand-600">{total} Total</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-white/80 backdrop-blur-sm p-2 rounded-xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Plano</p>
                                        <p className="text-xl font-black text-slate-900 leading-none mt-1">{planCredits}</p>
                                    </div>
                                    <div className="bg-brand-50/50 backdrop-blur-sm p-2 rounded-xl border border-brand-100 shadow-sm transition-transform hover:scale-[1.02]">
                                        <p className="text-[9px] text-brand-600 font-bold uppercase tracking-tight">Bônus</p>
                                        <p className="text-xl font-black text-brand-700 leading-none mt-1">{bonus}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-2">
                                <Link href="/creditos" onClick={() => setShowPanel(false)}>
                                    <Button size="sm" className="w-full text-[10px] font-black uppercase tracking-widest py-5 rounded-xl transition-all hover:shadow-lg hover:shadow-brand-500/20" variant="primary">
                                        <Zap className="h-3 w-3 mr-2" />
                                        Recarregar Créditos
                                    </Button>
                                </Link>
                                <Link href="/planos" onClick={() => setShowPanel(false)} className="block mt-2 text-center text-[10px] font-bold text-slate-400 hover:text-brand-600 transition-colors">
                                    Ver todos os planos
                                </Link>
                            </div>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}
