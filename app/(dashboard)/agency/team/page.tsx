"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth-provider";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, push, set, update } from "firebase/database";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Users, UserPlus, Mail, Shield, Coins, Trash2, ArrowRight, X } from "lucide-react";
import { User } from "@/types";

export default function AgencyTeamPage() {
    const { user } = useAuth();
    const [members, setMembers] = useState<User[]>([]);
    const [inviting, setInviting] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");

    useEffect(() => {
        if (!user || (user.role !== "AGENCY_ADMIN" && user.role !== "ADMIN_MASTER")) return;

        // Fetch all users that belong to this agency
        const usersRef = ref(rtdb, "users");
        const unsub = onValue(usersRef, (snap) => {
            if (snap.exists()) {
                const allUsers = snap.val();
                const agencyMembers = Object.keys(allUsers)
                    .map(id => ({ id, ...allUsers[id] }))
                    .filter(u => u.agencyId === user.id || u.id === user.id); // Show self and members
                setMembers(agencyMembers);
            }
        });

        return () => unsub();
    }, [user]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        // In a real system, this would send an email. 
        // For now, we'll just log it or prepare a mock invite system.
        alert(`Convite enviado para ${inviteEmail}. (Simulação de Produção)`);
        setInviteEmail("");
        setInviting(false);
    };

    if (user?.role !== "AGENCY_ADMIN" && user?.role !== "ADMIN_MASTER") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <Shield className="h-16 w-16 text-slate-200" />
                <h2 className="text-xl font-bold text-slate-900">Acesso Restrito</h2>
                <p className="text-slate-500 max-w-xs">Esta página é exclusiva para administradores de imobiliárias parceiras.</p>
                <Button onClick={() => window.history.back()}>Voltar</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl font-bold text-slate-900">Equipe e Corretores</h1>
                    <p className="text-slate-500 text-sm">Gerencie os membros da sua imobiliária e distribua créditos.</p>
                </div>
                <Button
                    leftIcon={<UserPlus className="h-4 w-4" />}
                    onClick={() => setInviting(true)}
                >
                    Adicionar Corretor
                </Button>
            </div>

            {/* Agency Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4 flex items-center gap-4 border-slate-200">
                    <div className="h-12 w-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Total de Membros</p>
                        <p className="text-2xl font-black text-slate-900">{members.length}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 border-slate-200">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Coins className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Créditos da Equipe</p>
                        <p className="text-2xl font-black text-slate-900">{user.credits || 0}</p>
                    </div>
                </Card>
            </div>

            {/* Members List */}
            <Card padding="none" className="border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider font-black text-slate-400">
                                <th className="p-4 pl-6">Corretor</th>
                                <th className="p-4">Cargo</th>
                                <th className="p-4">Créditos Solicitados</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 pr-6 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {members.map((member) => (
                                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 uppercase border border-slate-200 overflow-hidden">
                                                {member.photoURL ? (
                                                    <img src={member.photoURL} alt={member.name} className="h-full w-full object-cover" />
                                                ) : member.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{member.name}</p>
                                                <p className="text-slate-400 text-xs">{member.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant={member.role === "AGENCY_ADMIN" ? "brand" : "default"} className="text-[10px] font-black uppercase">
                                            {member.role === "AGENCY_ADMIN" ? "Administrador" : "Corretor"}
                                        </Badge>
                                    </td>
                                    <td className="p-4 grayscale">
                                        <div className="flex items-center gap-1 text-slate-400 text-sm italic">
                                            Nenhuma pendência
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant="success" dot className="text-[10px] font-black uppercase">Ativo</Badge>
                                    </td>
                                    <td className="p-4 pr-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-brand-600">
                                                <Coins className="h-4 w-4" />
                                            </Button>
                                            {member.id !== user.id && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Invite Modal (Simple) */}
            {inviting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <Card className="w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900">Convidar Corretor</h3>
                            <Button variant="ghost" size="icon" onClick={() => setInviting(false)}><X className="h-4 w-4" /></Button>
                        </div>
                        <p className="text-sm text-slate-500">O corretor receberá um e-mail com as instruções para se juntar à sua imobiliária.</p>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">E-mail do Corretor</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-sm"
                                    placeholder="exemplo@imobiliaria.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full h-12 uppercase tracking-wider font-black">Enviar Convite</Button>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
