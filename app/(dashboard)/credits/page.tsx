"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth-provider";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, query, orderByChild } from "firebase/database";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Coins, UserPlus, ArrowUpRight, ArrowDownRight, Clock, Copy, CheckCircle } from "lucide-react";
import { CreditTransaction } from "@/lib/credits";

export default function CreditsPage() {
    const { user } = useAuth();
    const [history, setHistory] = useState<(CreditTransaction & { key: string })[]>([]);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!user) return;
        const histRef = query(ref(rtdb, `credit_history/${user.id}`), orderByChild('timestamp'));

        const unsub = onValue(histRef, (snap) => {
            if (snap.exists()) {
                const data = snap.val();
                const arr = Object.keys(data).map(k => ({
                    key: k,
                    ...data[k]
                })).sort((a, b) => b.timestamp - a.timestamp); // newest first
                setHistory(arr);
            } else {
                setHistory([]);
            }
        });
        return () => unsub();
    }, [user]);

    if (!user) return null;

    const inviteLink = `${window.location.origin}/login?invite=${user.inviteCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-24 lg:pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl font-bold text-slate-900 leading-tight">Meus Créditos</h1>
                    <p className="text-slate-500 text-sm">Gerencie seu saldo e histórico de uso</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Balance Card */}
                <Card padding="lg" className="md:col-span-1 bg-gradient-to-br from-indigo-600 to-brand-700 text-white border-none shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-indigo-100 font-medium text-sm mb-4">
                                <Coins className="h-5 w-5" />
                                Saldo Atual
                            </div>
                            <div className="font-display font-black text-5xl mb-1">
                                {user.credits || 0}
                            </div>
                            <p className="text-indigo-200 text-xs">Créditos disponíveis</p>
                        </div>
                        <div className="mt-8">
                            <Button
                                variant="outline"
                                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                                onClick={() => {
                                    document.getElementById('invite-section')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                Ganhar mais créditos
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Invite Section */}
                <Card padding="lg" id="invite-section" className="md:col-span-2 border-slate-200">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                            <UserPlus className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="font-display font-bold text-lg text-slate-900">Indique e Ganhe</h2>
                            <p className="text-slate-500 text-sm mt-1 max-w-md">
                                Aproveite as vantagens de indicar o Domvia! Ganhe bônus por cada novo corretor que começar a usar o sistema.
                                <ul className="mt-2 space-y-1 text-xs">
                                    <li className="flex items-center gap-2 font-bold text-emerald-600"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> **Você ganha 10 créditos** por cada indicação.</li>
                                    <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> **Seu amigo ganha 5 créditos** imediatos para começar.</li>
                                </ul>
                            </p>

                            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full overflow-hidden">
                                <div className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[11px] sm:text-sm font-medium text-slate-600 break-all font-mono">
                                    {inviteLink}
                                </div>
                                <Button
                                    onClick={handleCopy}
                                    className={`w-full sm:w-auto h-11 shrink-0 ${copied ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-900 hover:bg-slate-800'}`}
                                >
                                    {copied ? (
                                        <><CheckCircle className="h-4 w-4 mr-2" /> Copiado</>
                                    ) : (
                                        <><Copy className="h-4 w-4 mr-2" /> Copiar Link</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* History Table */}
            <Card padding="none" className="border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <Clock className="h-5 w-5 text-slate-400" />
                    <h3 className="font-display font-bold text-slate-900">Histórico de Transações</h3>
                </div>

                {history.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-sm">
                        Nenhuma movimentação de crédito ainda.
                    </div>
                ) : (
                    <div className="overflow-x-auto w-full pb-4 scrollbar-hide">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase tracking-wider font-black text-slate-400">
                                    <th className="p-4 pl-6 font-medium">Data</th>
                                    <th className="p-4 font-medium">Operação</th>
                                    <th className="p-4 font-medium">Descrição</th>
                                    <th className="p-4 font-medium">Validade</th>
                                    <th className="p-4 pr-6 text-right font-medium">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-100">
                                {history.map((tx) => (
                                    <tr key={tx.key} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 pl-6 whitespace-nowrap text-slate-500 text-xs">
                                            {new Date(tx.timestamp).toLocaleString("pt-BR", {
                                                day: '2-digit', month: '2-digit', year: 'numeric'
                                            })}
                                        </td>
                                        <td className="p-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${tx.amount > 0
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : tx.type === 'admin_adjustment' ? 'bg-slate-100 text-slate-600' : 'bg-rose-50 text-rose-600'
                                                }`}>
                                                {tx.amount > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                                {tx.type === 'earned' && 'Ganho'}
                                                {tx.type === 'referral' && 'Indicação'}
                                                {tx.type === 'spent' && 'Uso'}
                                                {tx.type === 'admin_adjustment' && 'Ajuste'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-700 font-medium">
                                            {tx.description}
                                        </td>
                                        <td className="p-4 text-slate-500 text-xs whitespace-nowrap">
                                            {tx.expiresAt ? (
                                                <span className={Date.now() > tx.expiresAt ? "text-rose-500 font-bold" : "text-slate-500"}>
                                                    {new Date(tx.expiresAt).toLocaleDateString("pt-BR")}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">—</span>
                                            )}
                                        </td>
                                        <td className={`p-4 pr-6 text-right font-display font-bold whitespace-nowrap ${tx.amount > 0 ? 'text-emerald-500' : 'text-slate-900'
                                            }`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}
