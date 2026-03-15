"use client";

import { Modal } from "./Modal";
import { Button } from "./Button";
import { Coins, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreditConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    cost: number;
    balance: number;
    toolName: string;
    isLoading?: boolean;
}

export function CreditConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    cost,
    balance,
    toolName,
    isLoading
}: CreditConfirmationModalProps) {
    const hasEnough = balance >= cost;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Confirmação de Uso"
            className="max-w-md"
        >
            <div className="flex flex-col items-center text-center space-y-4">
                <div className={cn(
                    "p-4 rounded-full bg-slate-100",
                    !hasEnough && "bg-amber-50 text-amber-600"
                )}>
                    {hasEnough ? (
                        <Coins className="h-10 w-10 text-brand-500" />
                    ) : (
                        <AlertTriangle className="h-10 w-10" />
                    )}
                </div>

                <div className="space-y-2">
                    <h4 className="text-lg font-bold text-slate-900">
                        {toolName}
                    </h4>
                    <p className="text-slate-500 text-sm">
                        Esta ação consumirá <span className="font-bold text-slate-900">{cost} crédito{cost > 1 ? 's' : ''}</span>.
                    </p>
                </div>

                <div className="w-full bg-slate-50 rounded-2xl p-4 flex justify-between items-center border border-slate-100">
                    <div className="text-left">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Saldo Atual</p>
                        <p className="text-lg font-black text-slate-700">{balance} créditos</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Após Uso</p>
                        <p className={cn(
                            "text-lg font-black",
                            hasEnough ? "text-brand-600" : "text-red-500"
                        )}>
                            {balance - cost} créditos
                        </p>
                    </div>
                </div>

                {!hasEnough && (
                    <div className="w-full p-3 bg-red-50 rounded-xl border border-red-100 text-red-600 text-xs flex gap-2 items-start text-left">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <p>
                            Você não possui créditos suficientes para esta ferramenta. 
                            Indique um colega ou assine um plano para continuar.
                        </p>
                    </div>
                )}

                <div className="flex flex-col w-full gap-2 pt-2">
                    <Button 
                        onClick={onConfirm} 
                        disabled={!hasEnough || isLoading}
                        loading={isLoading}
                        className="w-full rounded-2xl py-6 text-base shadow-lg shadow-brand-500/20"
                    >
                        {hasEnough ? "Confirmar e Deduzir" : "Saldo Insuficiente"}
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full rounded-2xl"
                    >
                        Cancelar
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
