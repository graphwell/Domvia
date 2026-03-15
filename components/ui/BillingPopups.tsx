"use client";

import { Modal } from "./Modal";
import { Button } from "./Button";
import { Zap, AlertTriangle, Clock, Rocket, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/auth-provider";

interface BillingPopupProps {
    type: 'credits_exhausted' | 'trial_expiring' | 'limit_reached';
    isOpen: boolean;
    onClose: () => void;
    data?: any;
}

export function BillingPopups({ type, isOpen, onClose, data }: BillingPopupProps) {
    const { user } = useAuth();

    // Bypass trial expiration popup if user has significant credits
    if (type === 'trial_expiring' && (user?.credits || 0) > 100) {
        return null;
    }

    if (type === 'credits_exhausted') {
        return (
            <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
                <div className="text-center space-y-6">
                    <div className="mx-auto w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center animate-pulse">
                        <Zap className="h-10 w-10 text-amber-500 fill-amber-500" />
                    </div>
                    
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-slate-900 font-display">Créditos Esgotados!</h2>
                        <p className="text-slate-500 text-sm">
                            Você utilizou todos os seus créditos e limites do plano. Para continuar usando nossas ferramentas de IA, recarregue agora.
                        </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left space-y-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Recomendado</p>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-slate-900">Pacote 500 Créditos</p>
                                <p className="text-xs text-slate-500">Ideal para corretores ativos</p>
                            </div>
                            <p className="font-black text-brand-600 font-display text-lg">R$ 49</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link href="/creditos" onClick={onClose}>
                            <Button className="w-full py-6 rounded-2xl text-base font-black uppercase tracking-wider" variant="primary">
                                Recarregar Agora
                            </Button>
                        </Link>
                        <button onClick={onClose} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
                            Talvez mais tarde
                        </button>
                    </div>
                </div>
            </Modal>
        );
    }

    if (type === 'trial_expiring') {
        return (
            <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
                <div className="text-center space-y-6">
                    <div className="mx-auto w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center">
                        <Clock className="h-10 w-10 text-brand-500" />
                    </div>
                    
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-slate-900 font-display">Seu Teste Grátis está acabando!</h2>
                        <p className="text-slate-500 text-sm">
                            Faltam menos de 48 horas para o fim do seu trial. Garanta seu acesso ilimitado e ferramentas premium migrando para o PRO.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-left">
                        <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100">
                            <Rocket className="h-4 w-4 text-brand-600 mb-2" />
                            <p className="text-[10px] font-bold text-brand-700 uppercase">Acesso Total</p>
                            <p className="text-[9px] text-brand-600/70">Todas as ferramentas liberadas</p>
                        </div>
                        <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                            <Zap className="h-4 w-4 text-indigo-600 mb-2" />
                            <p className="text-[10px] font-bold text-indigo-700 uppercase">Créditos Mensais</p>
                            <p className="text-[9px] text-indigo-600/70">500 créditos todo mês</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link href="/planos" onClick={onClose}>
                            <Button className="w-full py-6 rounded-2xl text-base font-black uppercase tracking-wider gap-2" variant="primary">
                                Assinar Plano PRO <ArrowRight className="h-5 w-5" />
                            </Button>
                        </Link>
                        <button onClick={onClose} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
                            Continuar no trial por enquanto
                        </button>
                    </div>
                </div>
            </Modal>
        );
    }

    if (type === 'limit_reached') {
        return (
            <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
                <div className="text-center space-y-6">
                    <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-10 w-10 text-red-500" />
                    </div>
                    
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-slate-900 font-display">Limite do Plano Atingido</h2>
                        <p className="text-slate-500 text-sm">
                            Você atingiu o limite mensal de <strong>{data?.toolName || 'ferramenta'}</strong> incluído no seu plano atual.
                        </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                        <p className="text-sm text-slate-700">
                            Você ainda pode usar esta ferramenta consumindo créditos do seu saldo ou fazendo upgrade para o plano <strong>MAX</strong> (Ilimitado).
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link href="/planos" onClick={onClose}>
                            <Button className="w-full py-6 rounded-2xl text-base font-black uppercase tracking-wider" variant="primary">
                                Ver Planos Ilimitados
                            </Button>
                        </Link>
                        <Link href="/creditos" onClick={onClose}>
                            <Button className="w-full py-6 rounded-2xl text-base font-bold" variant="outline">
                                Comprar Créditos Avulsos
                            </Button>
                        </Link>
                    </div>
                </div>
            </Modal>
        );
    }

    return null;
}
