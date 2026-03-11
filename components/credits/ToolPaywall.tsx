"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Lock, Zap, ArrowRight, UserPlus, Coins, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/auth-provider";
import { consumeCredits } from "@/lib/credits";

interface ToolPaywallProps {
    toolId: string;
    toolName: string;
    description: string;
    creditCost: number;
    durationDays?: number; // e.g., 30 for 30 days unlock
    onUnlockSuccess: () => void;
}

export function ToolPaywall({ toolId, toolName, description, creditCost, durationDays, onUnlockSuccess }: ToolPaywallProps) {
    const { user } = useAuth();
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const availableCredits = user?.credits || 0;
    const canAfford = availableCredits >= creditCost;

    const handleUnlock = async () => {
        if (!user || !canAfford) return;
        setIsUnlocking(true);
        setError(null);
        try {
            await consumeCredits(user.id, creditCost, `Acesso: ${toolName}`, toolId, durationDays);
            onUnlockSuccess();
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro ao desbloquear a ferramenta.");
            setIsUnlocking(false);
        }
    };

    return (
        <Card padding="lg" className="w-full max-w-2xl mx-auto shadow-2xl relative overflow-hidden border-slate-200">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

            <div className="flex flex-col items-center text-center pb-8 border-b border-slate-100">
                <div className="h-20 w-20 rounded-3xl bg-slate-900 shadow-xl flex items-center justify-center mb-6 relative">
                    <Lock className="h-10 w-10 text-white" />
                    <div className="absolute -bottom-2 -right-2 bg-indigo-500 rounded-full p-1.5 shadow-lg shadow-indigo-500/40">
                        <Zap className="h-4 w-4 text-white" fill="currentColor" />
                    </div>
                </div>

                <h2 className="font-display text-2xl font-black text-slate-900 mb-2">
                    {toolName} Exclusivo
                </h2>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                    {description}
                </p>
            </div>

            <div className="py-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl mb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <Coins className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Seu Saldo</p>
                            <p className="font-display font-bold text-2xl text-slate-900 leading-none">
                                {availableCredits} <span className="text-sm font-medium text-slate-500">créditos</span>
                            </p>
                        </div>
                    </div>

                    <div className="hidden sm:block h-12 w-px bg-slate-200" />

                    <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Custo de Liberação</p>
                        <p className="font-display font-bold text-2xl text-indigo-600 leading-none">
                            {creditCost} <span className="text-sm font-medium text-slate-500">créditos</span>
                        </p>
                        {durationDays && (
                            <p className="text-[10px] text-slate-500 mt-1 font-medium bg-slate-200/60 px-2 py-0.5 rounded-md">Válido por {durationDays} dias</p>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl mb-6 font-medium">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                <div className="space-y-4 max-w-md mx-auto">
                    <Button
                        size="xl"
                        loading={isUnlocking}
                        onClick={handleUnlock}
                        disabled={!canAfford}
                        className={`w-full rounded-2xl font-bold text-md h-14 shadow-xl ${canAfford
                                ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
                                : "bg-slate-200 text-slate-500 cursor-not-allowed border-none shadow-none"
                            }`}
                    >
                        {!canAfford ? "Saldo Insuficiente" : "Usar Créditos e Liberar"}
                    </Button>

                    {!canAfford && (
                        <div className="flex flex-col gap-3 pt-2">
                            <Link href="/credits">
                                <Button variant="outline" className="w-full h-12 rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50" leftIcon={<UserPlus className="h-4 w-4" />}>
                                    Ganhar créditos grátis indicando
                                </Button>
                            </Link>

                            <div className="flex items-center gap-3">
                                <div className="h-px bg-slate-200 flex-1" />
                                <span className="text-[10px] tracking-widest uppercase font-bold text-slate-400">ou</span>
                                <div className="h-px bg-slate-200 flex-1" />
                            </div>

                            <Link href="/plans">
                                <Button variant="ghost" className="w-full h-12 rounded-xl text-slate-600 hover:bg-slate-100" rightIcon={<ArrowRight className="h-4 w-4" />}>
                                    Assinar um Plano Premium
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
