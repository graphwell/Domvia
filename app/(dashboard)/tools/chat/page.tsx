"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/auth-provider";
import { trackUsage } from "@/lib/usage-tracking";
import { Send, Loader2, Bot, User, Sparkles, RefreshCw, Share2, Coins } from "lucide-react";
import { getToolCostDynamic } from "@/lib/billing";
import { useLanguage } from "@/hooks/use-language";
import { triggerHaptic } from "@/lib/haptic";

interface Message {
    role: "assistant" | "user";
    content: string;
    ts: number;
}

export default function ChatPage() {
    const { user } = useAuth();
    const { t, language } = useLanguage();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [toolCost, setToolCost] = useState<number | null>(null);

    useEffect(() => {
        if (user?.planId) {
            getToolCostDynamic('ai_chat', user.planId).then(setToolCost);
        }
    }, [user?.planId]);

    // Initial message
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                role: "assistant",
                content: "Olá! Sou a IA da Domvia 🏠\nEspecialista em imóveis, financiamento e captação.\nComo posso te ajudar hoje?",
                ts: Date.now()
            }]);
        }
    }, [t, messages.length]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const send = async (text: string) => {
        if (!text.trim() || loading) return;
        const userMsg: Message = { role: "user", content: text.trim(), ts: Date.now() };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);
        triggerHaptic('light');

        // Track usage
        if (user?.id) trackUsage(user.id, "ai_chat_message", { chars: text.length });

        try {
            // Build conversation history for the API
            const history = messages.slice(-10).map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: text.trim(),
                    history,
                    brokerName: user?.name ?? "Corretor",
                    language, // Pass current language to AI
                }),
            });

            if (!res.ok) throw new Error("Erro na resposta da IA");
            const data = await res.json();
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.answer ?? t("chat.error_processing"), ts: Date.now() },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: t("chat.error_connection"), ts: Date.now() },
            ]);
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleShare = () => {
        triggerHaptic('light');
        const text = messages
            .slice(1, 6)
            .map((m) => `${m.role === "user" ? "Você" : "IA Domvia"}: ${m.content}`)
            .join("\n\n");
        window.open(`https://wa.me/?text=${encodeURIComponent(`*Consulta Imobiliária — IA Domvia*\n\n${text}\n\n_Domvia.ai_`)}`, "_blank");
    };

    const restart = () => {
        setMessages([{
            role: "assistant",
            content: t("chat.welcome"),
            ts: Date.now()
        }]);
        setInput("");
    };

    const allQuickPrompts = [
        "Calcular financiamento de R$ 400.000 com 20% de entrada",
        "Quanto de ITBI vou pagar num imóvel de R$ 600.000?",
        "Como funciona o subsídio Minha Casa Minha Vida?",
        "Qual a diferença entre SAC e Price?",
        "Como usar o FGTS na compra do imóvel?",
        "Quanto custa escritura e registro de imóvel?",
        "Como fazer uma boa captação de imóvel?",
        "Quais documentos preciso para vender um imóvel?"
    ];

    const [quickPrompts, setQuickPrompts] = useState<string[]>([]);
    const [rotationIndex, setRotationIndex] = useState(0);
    const rotationTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (allQuickPrompts.length > 0) {
            setQuickPrompts(allQuickPrompts.slice(0, 2));
        }
    }, []);

    useEffect(() => {
        if (messages.length > 2 || allQuickPrompts.length <= 2) return;
        
        rotationTimer.current = setInterval(() => {
            setRotationIndex((prev) => {
                const step = 2;
                const next = (prev + step) % allQuickPrompts.length;
                setQuickPrompts(allQuickPrompts.slice(next, next + step));
                return next;
            });
        }, 4000);

        return () => {
            if (rotationTimer.current) clearInterval(rotationTimer.current);
        };
    }, [messages.length]);

    const stopRotation = () => {
        if (rotationTimer.current) {
            clearInterval(rotationTimer.current);
            rotationTimer.current = null;
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between py-4 px-1 shrink-0">
                <div>
                    <h1 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl flex items-center justify-center text-white shrink-0"
                            style={{ background: "linear-gradient(135deg,#1E3A8A,#6366F1)" }}>
                            <Bot className="h-4 w-4" />
                        </div>
                        {t("chat.title")}
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5 ml-10">{t("chat.subtitle")}</p>
                </div>
                <div className="flex gap-2">
                    {messages.length > 2 && (
                        <Button variant="ghost" size="sm" leftIcon={<Share2 className="h-3.5 w-3.5" />} onClick={handleShare}>
                            {t("chat.share")}
                        </Button>
                    )}
                    <Button variant="ghost" size="sm" leftIcon={<RefreshCw className="h-3.5 w-3.5" />} onClick={restart}>
                        {t("chat.new_chat")}
                    </Button>
                </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto space-y-4 pb-4 px-1">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                        {/* Avatar */}
                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role === "assistant"
                            ? "text-white"
                            : "bg-slate-200 text-slate-600"
                            }`} style={msg.role === "assistant" ? { background: "linear-gradient(135deg,#1E3A8A,#6366F1)" } : {}}>
                            {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </div>

                        {/* Bubble */}
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "assistant"
                            ? "bg-white border border-slate-200 text-slate-800 shadow-sm"
                            : "text-white"
                            }`} style={msg.role === "user" ? { background: "linear-gradient(135deg,#1E3A8A,#6366F1)" } : {}}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                    <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-xl flex items-center justify-center text-white shrink-0"
                            style={{ background: "linear-gradient(135deg,#1E3A8A,#6366F1)" }}>
                            <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                            <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Quick prompts (only when fresh) */}
            {messages.length <= 2 && (
                <div className="shrink-0 pb-3">
                    <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> {t("chat.quick_prompts_title") || "Perguntas frequentes"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {quickPrompts.map((p: string) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => { send(p); stopRotation(); }}
                                className="text-xs bg-slate-100 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 text-slate-600 border border-slate-200 rounded-full px-3 py-1.5 transition-all duration-300 animate-fade-in"
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input bar */}
            <div className="shrink-0 pb-2">
                <Card padding="sm" className={cn(
                    "flex items-end gap-2 border transition-all duration-300",
                    input === "" && messages.length <= 2 ? "animate-pulse-blue border-brand-400" : "border-slate-200"
                )}>
                    <textarea
                        ref={inputRef}
                        className="flex-1 resize-none text-sm bg-transparent outline-none placeholder-slate-400 max-h-32 leading-relaxed py-1"
                        placeholder={t("chat.input_placeholder")}
                        rows={1}
                        value={input}
                        onFocus={() => {
                            stopRotation();
                        }}
                        onChange={(e) => {
                            setInput(e.target.value);
                            e.target.style.height = "auto";
                            e.target.style.height = e.target.scrollHeight + "px";
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                send(input);
                            }
                        }}
                    />
                    <Button
                        size="sm"
                        onClick={() => send(input)}
                        disabled={!input.trim() || loading}
                        className="shrink-0"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </Card>
                <div className="flex items-center justify-between mt-1 px-2">
                    <p className="text-[10px] text-slate-400">{t("common.ia_trained")}</p>
                    {toolCost !== null && toolCost > 0 && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-brand-600 animate-pulse">
                            <Coins className="h-2.5 w-2.5" />
                            {toolCost} créditos por mensagem
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
