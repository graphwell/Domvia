"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Phone, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { triggerHaptic } from "@/lib/haptic";

interface Props {
    onSuccess: (data: { name: string; lastName: string; phone: string }) => void;
    brokerName: string;
    brokerLogo?: string;
    useLogo?: boolean;
}

export function LeadCaptureForm({ onSuccess, brokerName, brokerLogo, useLogo }: Props) {
    const [formData, setFormData] = useState({
        name: "",
        lastName: "",
        phone: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 11) {
            let formatted = numbers;
            if (numbers.length > 2) {
                formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
            }
            if (numbers.length > 7) {
                formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
            }
            return formatted;
        }
        return value.slice(0, 15);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value);
        setFormData({ ...formData, phone: formatted });
        if (error) setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validação básica
        if (!formData.name || !formData.lastName) {
            setError("Por favor, preencha seu nome completo.");
            return;
        }

        const phoneDigits = formData.phone.replace(/\D/g, "");
        if (phoneDigits.length < 10) {
            setError("Por favor, insira um telefone válido com DDD.");
            return;
        }

        setIsLoading(true);
        triggerHaptic('medium');

        try {
            // Em produção, isso chamaria a API /api/leads/register
            // Simulando um pequeno delay de rede
            await new Promise(resolve => setTimeout(resolve, 1000));
            onSuccess(formData);
        } catch (err) {
            setError("Ocorreu um erro ao registrar. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <Card padding="lg" className="w-full max-w-md border-slate-200 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-600" />

                <div className="flex flex-col items-center text-center mb-8 pt-4">
                    <div className="relative h-16 w-48 mb-6 mx-auto">
                        <Image
                            src={(useLogo && brokerLogo) ? brokerLogo : "/logo-domvia.png?v=202603092100"}
                            alt="Logo"
                            fill
                            priority
                            unoptimized
                            className="object-contain"
                        />
                    </div>
                    <h2 className="font-display text-2xl font-black text-slate-900 leading-tight">
                        Falar com o Corretor
                    </h2>
                    <p className="text-slate-500 text-sm mt-2">
                        Identifique-se para iniciar seu atendimento com <span className="font-bold text-slate-900 capitalize">{brokerName}</span>.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome</label>
                            <input
                                required
                                type="text"
                                placeholder="Ex: João"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Sobrenome</label>
                            <input
                                required
                                type="text"
                                placeholder="Ex: Silva"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">WhatsApp</label>
                        <div className="relative">
                            <input
                                required
                                type="text"
                                placeholder="(00) 00000-0000"
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Phone className="h-4 w-4 text-slate-300" />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-[11px] font-bold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        size="xl"
                        loading={isLoading}
                        className="w-full rounded-2xl shadow-lg shadow-brand-500/20 text-md font-bold h-14"
                    >
                        Iniciar Atendimento
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        Ambiente Seguro e Criptografado
                    </p>
                </div>
            </Card>

            <p className="mt-8 text-[11px] text-slate-400 text-center max-w-xs leading-relaxed">
                Ao continuar, você concorda que o corretor responsável poderá entrar em contato via WhatsApp para fornecer detalhes do imóvel.
            </p>
        </div>
    );
}
