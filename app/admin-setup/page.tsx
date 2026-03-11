"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth-provider";
import { rtdb } from "@/lib/firebase";
import { ref, update } from "firebase/database";
import { ShieldCheck, Key, CheckCircle2, AlertTriangle, Copy, Check } from "lucide-react";

const BOOTSTRAP_SECRET = "domvia-admin-2024";

export default function AdminSetupPage() {
    const { user, isLoading } = useAuth();
    const [secret, setSecret] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const [copied, setCopied] = useState(false);

    const copyUID = () => {
        if (!user?.id) return;
        navigator.clipboard.writeText(user.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePromote = async () => {
        if (!user) {
            setErrorMsg("Você precisa estar logado.");
            setStatus("error");
            return;
        }
        if (secret !== BOOTSTRAP_SECRET) {
            setErrorMsg("Código secreto incorreto.");
            setStatus("error");
            return;
        }
        setStatus("loading");
        try {
            await update(ref(rtdb, `users/${user.id}`), { role: "ADMIN_MASTER" });
            setStatus("success");
        } catch (e) {
            setErrorMsg("Erro ao atualizar o banco. Verifique as regras do Firebase.");
            setStatus("error");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-600/30">
                        <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Setup de Administrador</h1>
                    <p className="text-slate-400 text-sm mt-1">Promova sua conta para ADMIN_MASTER</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-5">
                    {/* User Info */}
                    {user ? (
                        <div className="bg-white/5 rounded-xl p-4 space-y-2">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Usuário logado</p>
                            <p className="text-white font-semibold">{user.name}</p>
                            <p className="text-slate-400 text-sm">{user.email}</p>
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Seu UID</p>
                                <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2">
                                    <code className="text-indigo-300 text-xs flex-1 break-all">{user.id}</code>
                                    <button onClick={copyUID} className="shrink-0 text-slate-400 hover:text-white transition-colors">
                                        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] text-slate-500">Role atual:</p>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${user.role.startsWith("ADMIN") ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"}`}>
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
                            <div>
                                <p className="text-amber-300 font-semibold text-sm">Não logado</p>
                                <a href="/login" className="text-indigo-400 text-xs underline">Fazer login primeiro →</a>
                            </div>
                        </div>
                    )}

                    {/* Secret Code Input */}
                    {status !== "success" && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Key className="h-3 w-3" />
                                Código Secreto de Bootstrap
                            </label>
                            <input
                                type="password"
                                value={secret}
                                onChange={(e) => { setSecret(e.target.value); setStatus("idle"); }}
                                placeholder="Digite o código secreto..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                                onKeyDown={(e) => e.key === "Enter" && handlePromote()}
                            />
                            {status === "error" && (
                                <p className="text-red-400 text-xs flex items-center gap-1.5">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    {errorMsg}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Action */}
                    {status === "success" ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-center space-y-3">
                            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                            <div>
                                <p className="text-emerald-300 font-bold">Conta promovida a ADMIN_MASTER!</p>
                                <p className="text-slate-400 text-sm mt-1">Faça logout e login novamente para acessar o painel.</p>
                            </div>
                            <a
                                href="/login"
                                onClick={async () => {
                                    const { signOut } = await import("firebase/auth");
                                    const { auth } = await import("@/lib/firebase");
                                    await signOut(auth);
                                }}
                                className="block w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors text-center"
                            >
                                Fazer logout e entrar como Admin
                            </a>
                        </div>
                    ) : (
                        <button
                            onClick={handlePromote}
                            disabled={status === "loading" || !user}
                            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-all flex items-center justify-center gap-2"
                        >
                            {status === "loading" ? (
                                <>
                                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    Promovendo...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="h-4 w-4" />
                                    Tornar-me ADMIN_MASTER
                                </>
                            )}
                        </button>
                    )}

                    <p className="text-center text-[11px] text-slate-600">
                        Esta página deve ser removida em produção.
                    </p>
                </div>
            </div>
        </div>
    );
}
