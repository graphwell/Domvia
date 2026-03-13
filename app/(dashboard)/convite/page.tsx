"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
    UserPlus, Copy, Share2, MessageCircle, 
    CheckCheck, Gift, Users, Trophy
} from "lucide-react";
import { triggerHaptic } from "@/lib/haptic";
import { useAuth } from "@/hooks/auth-provider";
import { toast } from "sonner";
import Image from "next/image";

export default function InvitePage() {
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);

    const inviteLink = typeof window !== "undefined" 
        ? `${window.location.origin}/register?ref=${user?.id || 'domvia'}`
        : "https://domvia.ai/register";

    const copyLink = () => {
        triggerHaptic('light');
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        toast.success("Link de convite copiado!");
        setTimeout(() => setCopied(false), 2000);
    };

    const shareWhatsApp = () => {
        triggerHaptic('medium');
        const text = encodeURIComponent(`Olá! Estou usando o Domvia para acelerar minhas vendas com IA e ferramentas inteligentes. Use meu convite para começar grátis: ${inviteLink}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            {/* Hero Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 mb-2">
                    <UserPlus className="h-8 w-8" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
                    Convidar <span className="text-brand-600">Corretores</span>
                </h1>
                <p className="text-slate-500 max-w-xl mx-auto font-medium">
                    Ajude outros corretores a entrarem na era da IA e ganhe recompensas exclusivas por cada indicação ativa.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Invite Card */}
                <Card padding="lg" className="flex flex-col justify-between border-brand-200 bg-white shadow-xl shadow-brand-500/5">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Badge variant="brand" className="font-black uppercase tracking-widest px-3 py-1">Seu Link</Badge>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Link de Indicação</p>
                            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                <code className="text-xs text-slate-500 font-mono truncate flex-1">
                                    {inviteLink}
                                </code>
                                <button onClick={copyLink} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                                    {copied ? <CheckCheck className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-slate-400" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 flex flex-col gap-3">
                        <Button onClick={shareWhatsApp} className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" leftIcon={<Share2 className="h-4 w-4" />}>
                            Compartilhar no WhatsApp
                        </Button>
                        <Button variant="outline" onClick={copyLink} className="w-full">
                            Copiar Link
                        </Button>
                    </div>
                </Card>

                {/* Rewards Info */}
                <div className="space-y-4">
                    <Card padding="md" className="bg-slate-50 border-none">
                        <div className="flex gap-4">
                            <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand-600 shrink-0">
                                <Gift className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 leading-tight">Ganhe Créditos Extras</h4>
                                <p className="text-xs text-slate-500 mt-1">A cada 3 corretores convidados que realizarem o primeiro acesso, você ganha 50 créditos extras.</p>
                            </div>
                        </div>
                    </Card>

                    <Card padding="md" className="bg-slate-50 border-none">
                        <div className="flex gap-4">
                            <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-amber-500 shrink-0">
                                <Trophy className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 leading-tight">Desconto Vitalício</h4>
                                <p className="text-xs text-slate-500 mt-1">Se 5 convidados assinarem o plano Pro, sua mensalidade terá 20% de desconto enquanto eles estiverem ativos.</p>
                            </div>
                        </div>
                    </Card>

                    <Card padding="md" className="bg-slate-50 border-none">
                        <div className="flex gap-4">
                            <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand-400 shrink-0">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 leading-tight">Comunidade VIP</h4>
                                <p className="text-xs text-slate-500 mt-1">Acesso ao grupo exclusivo de corretores no WhatsApp para troca de experiências e feedback direto.</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Steps Section */}
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                    <Badge variant="default" className="w-8 h-8 rounded-full flex items-center justify-center p-0 mx-auto border-2 border-slate-200 bg-white text-slate-400">1</Badge>
                    <p className="text-sm font-bold text-slate-900">Copie o link</p>
                    <p className="text-xs text-slate-500">Gere seu link único de indicação acima.</p>
                </div>
                <div className="space-y-2">
                    <Badge variant="default" className="w-8 h-8 rounded-full flex items-center justify-center p-0 mx-auto border-2 border-slate-200 bg-white text-slate-400">2</Badge>
                    <p className="text-sm font-bold text-slate-900">Compartilhe</p>
                    <p className="text-xs text-slate-500">Envie no WhatsApp, grupos ou redes sociais.</p>
                </div>
                <div className="space-y-2">
                    <Badge variant="default" className="w-8 h-8 rounded-full flex items-center justify-center p-0 mx-auto border-2 border-slate-200 bg-white text-slate-400">3</Badge>
                    <p className="text-sm font-bold text-slate-900">Ganhe bônus</p>
                    <p className="text-xs text-slate-500">Receba suas recompensas automaticamente.</p>
                </div>
            </div>
        </div>
    );
}
