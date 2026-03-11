"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, set, push } from "firebase/database";
import {
    Bot, Save, RotateCcw, Info, ShieldCheck,
    Sparkles, Database, MessageSquare, AlertTriangle,
    History, Send, CheckCircle2, Clock
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────
interface PromptVersion {
    prompt: string;
    savedAt: number;
    label?: string;
}

const DEFAULT_PROMPT = `Você é um assistente especialista em financiamento imobiliário no Brasil, integrado à plataforma Domvia.

## Seu objetivo
Ajudar clientes que estão vendo anúncios de imóveis a entender o processo de compra, especialmente financiamento, FGTS e subsídios. Você não vende o imóvel — quem faz isso é o corretor.

## Contexto
O cliente que está conversando com você chegou através de um anúncio criado pelo corretor. Sempre mencione o nome do corretor quando for apropriado.

## Regras
- Seja objetivo e didático
- Use valores e taxas reais do mercado brasileiro
- Nunca invente dados ou simule cálculos sem base real
- Nunca substitua a orientação de um corretor ou especialista financeiro`;

// ─── Component ───────────────────────────────────────────────────
export default function AdminAiPage() {
    const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
    const [savedPrompt, setSavedPrompt] = useState(DEFAULT_PROMPT);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [history, setHistory] = useState<(PromptVersion & { id: string })[]>([]);
    const [activeTab, setActiveTab] = useState<"personality" | "history" | "sandbox">("personality");
    // Sandbox state
    const [sandboxMsg, setSandboxMsg] = useState("");
    const [sandboxHistory, setSandboxHistory] = useState<{ role: "user" | "ai"; text: string }[]>([]);
    const [sandboxLoading, setSandboxLoading] = useState(false);
    const sandboxRef = useRef<HTMLDivElement>(null);

    // ── Load from Firebase ────────────────────────────────────────
    useEffect(() => {
        const off1 = onValue(ref(rtdb, "config/ai_prompt"), (snap) => {
            if (snap.exists()) {
                const p = snap.val() as string;
                setPrompt(p);
                setSavedPrompt(p);
            }
        });
        const off2 = onValue(ref(rtdb, "config/ai_prompt_history"), (snap) => {
            const raw = snap.val() ?? {};
            const list = Object.entries(raw)
                .map(([id, v]: [string, any]) => ({ id, ...v } as PromptVersion & { id: string }))
                .sort((a, b) => b.savedAt - a.savedAt)
                .slice(0, 5);
            setHistory(list);
        });
        return () => { off1(); off2(); };
    }, []);

    // ── Save ──────────────────────────────────────────────────────
    const handleSave = async () => {
        setIsSaving(true);
        // Save history entry first
        await push(ref(rtdb, "config/ai_prompt_history"), {
            prompt: savedPrompt,
            savedAt: Date.now(),
            label: `Versão de ${new Date().toLocaleString("pt-BR")}`,
        });
        // Save current prompt
        await set(ref(rtdb, "config/ai_prompt"), prompt);
        setSavedPrompt(prompt);
        setIsSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    // ── Restore version ───────────────────────────────────────────
    const restoreVersion = (v: PromptVersion) => {
        setPrompt(v.prompt);
        setActiveTab("personality");
    };

    // ── Sandbox send ──────────────────────────────────────────────
    const sandboxSend = async () => {
        if (!sandboxMsg.trim()) return;
        const userMsg = sandboxMsg;
        setSandboxMsg("");
        setSandboxHistory((h) => [...h, { role: "user", text: userMsg }]);
        setSandboxLoading(true);
        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: userMsg,
                    brokerName: "Admin Sandbox",
                    history: sandboxHistory.map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] })),
                }),
            });
            const data = await res.json();
            setSandboxHistory((h) => [...h, { role: "ai", text: data.answer ?? data.reply ?? data.message ?? "(sem resposta)" }]);
        } catch {
            setSandboxHistory((h) => [...h, { role: "ai", text: "Erro ao conectar à API de IA." }]);
        }
        setSandboxLoading(false);
        setTimeout(() => sandboxRef.current?.scrollTo(0, 9999), 100);
    };

    const isDirty = prompt !== savedPrompt;

    return (
        <div className="space-y-6 animate-fade-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold text-slate-900 flex items-center gap-3">
                        Gestão da IA
                        <Badge variant="brand" className="text-[10px] uppercase tracking-widest bg-indigo-600 text-white">Master</Badge>
                    </h1>
                    <p className="text-slate-500 text-sm">Controle a personalidade e o conhecimento do assistente</p>
                </div>
                <div className="flex items-center gap-2">
                    {saved && (
                        <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold">
                            <CheckCircle2 className="h-4 w-4" />
                            Prompt salvo!
                        </span>
                    )}
                    <Button variant="secondary" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => setPrompt(savedPrompt)} disabled={!isDirty}>
                        Descartar
                    </Button>
                    <Button
                        loading={isSaving}
                        onClick={handleSave}
                        className={`${isDirty ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-300 cursor-default"}`}
                        leftIcon={<Save className="h-4 w-4" />}
                        disabled={!isDirty}
                    >
                        Salvar Alterações
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Tabs */}
                <div className="lg:col-span-2 space-y-6">
                    <Card padding="none" className="border-slate-200 overflow-hidden shadow-sm">
                        <div className="flex border-b border-slate-100 px-2 bg-slate-50/50">
                            {([
                                { id: "personality", label: "Prompt Principal", icon: Sparkles },
                                { id: "history", label: "Histórico", icon: History },
                                { id: "sandbox", label: "🧪 Sandbox", icon: MessageSquare },
                            ] as const).map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id
                                        ? "border-indigo-600 text-indigo-600 bg-white"
                                        : "border-transparent text-slate-400 hover:text-slate-600"
                                        }`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Prompt Editor */}
                        {activeTab === "personality" && (
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Prompt</label>
                                    {isDirty && (
                                        <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                            Alterações não salvas
                                        </span>
                                    )}
                                </div>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="w-full h-[420px] p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
                                />
                                <p className="text-xs text-slate-400 mt-2">{prompt.length} caracteres · {prompt.split(/\s+/).length} palavras</p>
                            </div>
                        )}

                        {/* History */}
                        {activeTab === "history" && (
                            <div className="p-6 space-y-3">
                                {history.length === 0 && (
                                    <div className="py-10 text-center text-slate-400 text-sm">
                                        <History className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                        Nenhum histórico ainda. Salve o prompt para criar a primeira versão.
                                    </div>
                                )}
                                {history.map((v) => (
                                    <div key={v.id} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-200 transition-colors">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{v.label ?? "Versão salva"}</p>
                                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(v.savedAt).toLocaleString("pt-BR")}
                                                </p>
                                            </div>
                                            <Button size="sm" variant="ghost" onClick={() => restoreVersion(v)} className="text-indigo-600 hover:bg-indigo-50">
                                                Restaurar
                                            </Button>
                                        </div>
                                        <p className="text-xs text-slate-500 font-mono bg-slate-50 rounded-lg p-3 line-clamp-3">
                                            {v.prompt}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Sandbox */}
                        {activeTab === "sandbox" && (
                            <div className="p-6 flex flex-col gap-4">
                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-xs text-indigo-700">
                                    Teste o prompt atual sem afetar usuários reais. As mensagens são enviadas à API real de IA.
                                </div>
                                <div ref={sandboxRef} className="h-[340px] overflow-y-auto space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-200">
                                    {sandboxHistory.length === 0 && (
                                        <div className="h-full flex items-center justify-center text-slate-300 text-sm">
                                            Faça sua primeira pergunta de teste →
                                        </div>
                                    )}
                                    {sandboxHistory.map((m, i) => (
                                        <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.role === "user"
                                                ? "bg-indigo-600 text-white rounded-br-none"
                                                : "bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm"
                                                }`}>
                                                {m.text}
                                            </div>
                                        </div>
                                    ))}
                                    {sandboxLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm">
                                                <div className="flex gap-1">
                                                    {[0, 1, 2].map((i) => (
                                                        <div key={i} className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={sandboxMsg}
                                        onChange={(e) => setSandboxMsg(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sandboxSend()}
                                        placeholder="Digite uma mensagem de teste..."
                                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                                    />
                                    <Button onClick={sandboxSend} loading={sandboxLoading} className="bg-indigo-600 hover:bg-indigo-700" leftIcon={<Send className="h-4 w-4" />}>
                                        Enviar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Warning */}
                    <Card padding="md" className="border-amber-100 bg-amber-50/30 flex items-start gap-4">
                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-amber-900">Atenção com as Regras de Negócio</p>
                            <p className="text-[11px] text-amber-700 mt-1">
                                Alterações no prompt afetam todos os corretores em tempo real após salvar. Teste no Sandbox antes.
                                Mantenha variáveis como <code className="bg-amber-100 px-1 rounded">brokerName</code> para personalização por corretor.
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Right: Info Panel */}
                <div className="space-y-6">
                    <Card padding="lg" className="border-slate-200 shadow-sm">
                        <h3 className="font-display font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Info className="h-4 w-4 text-indigo-600" />
                            Status da IA
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                <span className="text-xs text-slate-500">Modelo Ativo</span>
                                <Badge variant="default" className="bg-slate-100">Gemini 2.0 Flash</Badge>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                <span className="text-xs text-slate-500">Prompt salvo em</span>
                                <span className="text-xs font-bold text-slate-700">Firebase RTDB</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                <span className="text-xs text-slate-500">Versões salvas</span>
                                <span className="text-sm font-bold text-slate-700">{history.length}</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-xs text-slate-500">Latência (est.)</span>
                                <span className="text-sm font-bold text-emerald-600">~850ms</span>
                            </div>
                        </div>
                    </Card>

                    <Card padding="lg" className="border-indigo-100 bg-indigo-50/50">
                        <Database className="h-6 w-6 text-indigo-600 mb-4" />
                        <h4 className="text-sm font-bold text-indigo-900">Caminho no Firebase</h4>
                        <p className="text-xs text-indigo-700 mb-3 leading-relaxed">
                            O prompt é lido de <code className="bg-indigo-100 px-1 rounded">config/ai_prompt</code> por todos os chats em tempo real.
                        </p>
                        <div className="bg-indigo-100 rounded-xl p-3 text-[11px] font-mono text-indigo-800 leading-relaxed">
                            config/<br />
                            ├── ai_prompt ✓<br />
                            └── ai_prompt_history/
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
