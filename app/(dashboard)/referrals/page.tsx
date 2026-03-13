"use client";

import { useAuth } from "@/hooks/auth-provider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Share2, Users, Coins, Gift, Copy, CheckCheck, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";

export default function ReferralPage() {
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);

    if (!user) return null;

    const referralLink = `${window.location.origin}/register?invite=${user.inviteCode}`;

    const copyLink = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Hero Header */}
            <div className="text-center space-y-2 py-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 mb-2">
                    <Gift className="h-6 w-6 text-brand-600" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Indique e Ganhe</h1>
                <p className="text-slate-500 max-w-md mx-auto">
                    Compartilhe o Domvia com seus colegas corretores e ganhe créditos para turbinar suas captações.
                </p>
            </div>

            {/* Invite Card */}
            <Card hover className="overflow-hidden border-brand-200">
                <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
                    <div className="flex-1 space-y-4 text-center sm:text-left">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Seu Link de Convite</h3>
                            <p className="text-sm text-slate-500 mt-1">Copie o link abaixo e envie pelo WhatsApp.</p>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <code className="flex-1 text-xs text-brand-700 font-mono truncate">{referralLink}</code>
                            <button 
                                onClick={copyLink}
                                className="p-2 rounded-lg bg-white border border-slate-200 hover:border-brand-300 transition-colors"
                            >
                                {copied ? <CheckCheck className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-slate-400" />}
                            </button>
                        </div>

                        <Button className="w-full gap-2" variant="whatsapp">
                            <Share2 className="h-4 w-4" /> Compartilhar no WhatsApp
                        </Button>
                    </div>

                    <div className="w-full sm:w-48 aspect-square bg-brand-50 rounded-3xl flex flex-col items-center justify-center border border-brand-100 p-4">
                        <p className="text-[10px] font-black uppercase text-brand-400 tracking-widest mb-1">Total Ganho</p>
                        <div className="flex items-center gap-2">
                            <Coins className="h-6 w-6 text-brand-600" />
                            <span className="text-4xl font-black text-brand-700">{user.referredCount ? user.referredCount * 5 : 0}</span>
                        </div>
                        <p className="text-[10px] font-bold text-brand-600 mt-1">CRÉDITOS</p>
                    </div>
                </div>
            </Card>

            {/* Rules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="flex flex-col items-center text-center p-6 space-y-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h4 className="font-bold text-slate-800">Cadastro do Indicado</h4>
                    <p className="text-xs text-slate-500">Você e o indicado ganham <b>+5 créditos</b> assim que ele criar a conta.</p>
                </Card>

                <Card className="flex flex-col items-center text-center p-6 space-y-3">
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-amber-600" />
                    </div>
                    <h4 className="font-bold text-slate-800">Assinatura do Indicado</h4>
                    <p className="text-xs text-slate-500">Ganhe <b>+50 créditos</b> de bônus quando o indicado assinar qualquer plano Pro.</p>
                </Card>
            </div>

            {/* My Referrals Table */}
            <div className="space-y-4 pt-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    Minhas Indicações 
                    <Badge variant="brand" className="text-[10px] py-0">{user.referredCount || 0}</Badge>
                </h3>
                
                <Card padding="none" className="divide-y divide-slate-100">
                    {user.referredCount ? (
                        <div className="p-8 text-center text-slate-400 text-sm">
                            Em breve: lista de usuários indicados.
                        </div>
                    ) : (
                        <div className="p-12 text-center text-slate-400 text-sm italic">
                            Você ainda não indicou nenhum colega. Comece agora!
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
