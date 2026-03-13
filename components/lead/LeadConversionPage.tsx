"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { CampaignLink, ChatMessage } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatCurrency, buildWhatsAppLink } from "@/lib/utils";
import { calculateFinancing } from "@/lib/financing";
import {
    Brain, Send, Calculator, Phone, X,
    Building2, ChevronDown, ChevronUp,
    MessageSquare, Sparkles, Sliders,
    CheckCircle2, Info, Camera
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { LeadCaptureForm } from "./LeadCaptureForm";
import MarzipanoViewer from "@/components/tours/MarzipanoViewer";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, query, orderByChild, equalTo } from "firebase/database";
import Image from "next/image";
import { PropertyLandingPage } from "./PropertyLandingPage";
import { triggerHaptic } from "@/lib/haptic";

interface Props {
    link: CampaignLink;
}

const QUICK_QUESTIONS = [
    "Como usar o FGTS?",
    "Qual a entrada mínima?",
    "Tem subsídio disponível?",
    "Qual a documentação?",
];

export function LeadConversionPage({ link }: Props) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "1",
            role: "assistant",
            content: `Olá! 👋 Sou seu assistente de financiamento. Como posso ajudar você hoje?\n\nPosso tirar dúvidas sobre **FGTS, MCMV, documentação** ou ajudar com a **simulação** ao lado.`,
            timestamp: new Date().toISOString(),
        },
    ]);
    const [isRegistered, setIsRegistered] = useState(false);
    const [leadData, setLeadData] = useState<{ name: string; lastName: string; phone: string } | null>(null);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [showTour, setShowTour] = useState(false);
    const [brokerBranding, setBrokerBranding] = useState<{ logoURL?: string; useLogoInDocs?: boolean }>({});

    // Tour State
    const [tour, setTour] = useState<any>(null);
    const [currentRoomIdx, setCurrentRoomIdx] = useState(0);
    const [showLanding, setShowLanding] = useState(link.landing_enabled || false);

    // Buscar tour associado no Firebase
    useEffect(() => {
        const toursRef = ref(rtdb, "tours");
        const unsubscribe = onValue(toursRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const tourList = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));
                const foundTour = tourList.find(t => t.linkId === link.id || t.title === link.title) || tourList[0];
                setTour(foundTour);
            }
        });

        // Buscar branding do corretor
        const brokerRef = ref(rtdb, `users/${link.userId}`);
        const unsubBroker = onValue(brokerRef, (snap) => {
            if (snap.exists()) {
                const data = snap.val();
                setBrokerBranding({
                    logoURL: data.logoURL,
                    useLogoInDocs: data.useLogoInDocs
                });
            }
        });

        return () => {
            unsubscribe();
            unsubBroker();
        };
    }, [link]);

    // Calculadora States
    const [calcMode, setCalcMode] = useState<"simple" | "complete">("simple");
    const [calc, setCalc] = useState({
        propertyValue: link.price ?? 500_000,
        downPayment: link.price ? Math.round(link.price * 0.2) : 100_000,
        years: 30,
        annualRate: 10.99,
        subsidio: 0,
        itbi: 0,
        seguro: 0,
    });

    const calcResult = calculateFinancing({
        propertyValue: calc.propertyValue,
        downPayment: calc.downPayment,
        years: calc.years,
        annualRate: calc.annualRate,
    });

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const sendMessage = useCallback(async (text?: string) => {
        const question = text ?? inputValue.trim();
        if (!question) return;
        setInputValue("");

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: "user",
            content: question,
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setIsTyping(true);

        const history = messages
            .slice(-10)
            .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question,
                    history,
                    brokerName: link.brokerName
                }),
            });
            const data = await res.json();
            setMessages((prev) => [...prev, {
                id: Date.now() + "_r",
                role: "assistant",
                content: data.answer ?? "Desculpe, houve um problema. Tente novamente!",
                timestamp: new Date().toISOString(),
            }]);
        } catch {
            setMessages((prev) => [...prev, {
                id: Date.now() + "_e",
                role: "assistant",
                content: "Houve um problema técnico. Clique em **Falar com o Corretor** para uma resposta imediata!",
                timestamp: new Date().toISOString(),
            }]);
        } finally {
            setIsTyping(false);
        }
    }, [inputValue, messages, link.brokerName]);

    const whatsappLink = buildWhatsAppLink(
        link.whatsapp,
        `Olá! Vi seu anúncio *${link.title}* e tenho interesse.\n\nSimulação:\n- Valor: ${formatCurrency(calc.propertyValue)}\n- Entrada: ${formatCurrency(calc.downPayment)}\n- Parcela: ${formatCurrency(calcResult.monthlyInstallment)}`
    );

    const handleCaptureSuccess = async (data: { name: string; lastName: string; phone: string }) => {
        try {
            // Registrar o lead na API com todos os dados de rastreamento
            await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    linkId: link.id,
                    linkTitle: link.title,
                    userId: link.userId,   // atribui o lead ao dono do link
                    brokerName: link.brokerName,
                }),
            });

            setLeadData(data);
            setIsRegistered(true);
        } catch (error) {
            console.error("Erro ao registrar lead:", error);
            // Mesmo se houver erro no registro, permitimos o acesso
            setIsRegistered(true);
        }
    };

    if (showLanding && link.landing_enabled) {
        return (
            <PropertyLandingPage 
                link={link} 
                onContinue={() => {
                    triggerHaptic('medium');
                    setShowLanding(false);
                }}
                brokerLogo={brokerBranding.logoURL}
            />
        );
    }

    if (!isRegistered) {
        return <LeadCaptureForm
            onSuccess={handleCaptureSuccess}
            brokerName={link.brokerName}
            brokerLogo={brokerBranding.logoURL}
            useLogo={brokerBranding.useLogoInDocs}
        />;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Minimal Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative h-8 w-32">
                            <Image
                                src={(brokerBranding.useLogoInDocs && brokerBranding.logoURL) ? brokerBranding.logoURL : "/logo-domvia.png?v=202603092100"}
                                alt="Logo"
                                fill
                                unoptimized
                                className="object-contain"
                            />
                        </div>
                    </div>
                    <Badge variant="brand" className="text-[10px] hidden sm:flex">Link Verificado</Badge>
                </div>
            </header>

            <main className="flex-1 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 lg:p-8">
                {/* ── Esquerda: Info & Calculadora (7 Colunas) ───────────────── */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Header do Imóvel/Anúncio */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <h1 className="font-display text-2xl lg:text-4xl font-black text-slate-900 leading-tight">
                                {link.title}
                            </h1>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-black text-brand-600">
                                    {link.price ? formatCurrency(link.price) : "Preço sob consulta"}
                                </span>
                                <Badge variant="success" dot>Oportunidade</Badge>
                                {tour && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full border-brand-200 text-brand-700 bg-brand-50/50 hover:bg-brand-50 shadow-sm transition-all hover:scale-105"
                                        leftIcon={<Camera className="h-4 w-4" />}
                                        onClick={() => setShowTour(true)}
                                    >
                                        Ver Tour 360°
                                    </Button>
                                )}
                            </div>
                        </div>
                        {link.description && (
                            <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
                                {link.description}
                            </p>
                        )}
                    </div>

                    {/* Calculadora Integrada (Ambiente Único) */}
                    <Card padding="lg" className="border-emerald-100 shadow-xl shadow-emerald-900/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4">
                            <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                <Calculator className="h-6 w-6" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-6">
                            <div className="space-y-0.5">
                                <h2 className="font-display text-xl font-bold text-slate-900">Simulador de Financiamento</h2>
                                <p className="text-xs text-slate-500">Ajuste os valores para ver sua parcela ideal</p>
                            </div>
                        </div>

                        {/* Toggle de Modo */}
                        <div className="flex p-1 bg-slate-100 rounded-xl w-fit mb-6">
                            <button
                                onClick={() => setCalcMode("simple")}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${calcMode === "simple" ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                Simples
                            </button>
                            <button
                                onClick={() => setCalcMode("complete")}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${calcMode === "complete" ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                Completa
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5 text-left">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Valor do Imóvel</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">R$</span>
                                        <input
                                            type="number"
                                            value={calc.propertyValue}
                                            onChange={(e) => setCalc({ ...calc, propertyValue: Number(e.target.value) })}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5 text-left">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Entrada Desejada</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">R$</span>
                                        <input
                                            type="number"
                                            value={calc.downPayment}
                                            onChange={(e) => setCalc({ ...calc, downPayment: Number(e.target.value) })}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 px-1 italic">
                                        {Math.round((calc.downPayment / calc.propertyValue) * 100)}% do valor total
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5 text-left">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Prazo de Pagamento</label>
                                    <select
                                        value={calc.years}
                                        onChange={(e) => setCalc({ ...calc, years: Number(e.target.value) })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                    >
                                        {[10, 15, 20, 25, 30, 35].map((y) => (
                                            <option key={y} value={y}>{y} anos ({y * 12} meses)</option>
                                        ))}
                                    </select>
                                </div>

                                {calcMode === "complete" ? (
                                    <div className="space-y-1.5 text-left animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Taxa de Juros (Anual)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={calc.annualRate}
                                                onChange={(e) => setCalc({ ...calc, annualRate: Number(e.target.value) })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Info className="h-3 w-3" />
                                            <span>Média de mercado: **{calc.annualRate}%** a.a.</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Banner de Resultado */}
                        <div className="mt-8 p-6 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-10">
                                <Sparkles className="h-20 w-20" />
                            </div>
                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                <div className="space-y-1">
                                    <p className="text-emerald-100/80 text-xs font-bold uppercase tracking-widest">Sua Parcela Estimada</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black">{formatCurrency(calcResult.monthlyInstallment)}</span>
                                        <span className="text-emerald-100 text-sm">/mês</span>
                                    </div>
                                    <p className="text-emerald-100/60 text-[10px] italic">*Cálculo baseado no sistema Price</p>
                                    <p className="text-emerald-100/60 text-[9px] mt-1 leading-tight">
                                        As informações apresentadas são apenas uma base de cálculo simulativo e estão sujeitas à análise de crédito e aprovação pela instituição financeira.
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-bold">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                                        Financiado: {formatCurrency(calcResult.totalFinanced)}
                                    </div>
                                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block">
                                        <Button variant="whatsapp" className="w-full bg-white text-emerald-700 hover:bg-emerald-50 border-none shadow-none">
                                            Aprovar meu Crédito
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* ── Direita: IA Conversacional (5 Colunas) ──────────────────── */}
                <div className="lg:col-span-5 h-[600px] lg:h-auto flex flex-col">
                    <Card padding="none" className="flex-1 flex flex-col overflow-hidden border-brand-100 shadow-xl shadow-brand-900/5 bg-white">
                        {/* Header do Chat */}
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-200">
                                    <Brain className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">Assistente de Financiamento</h3>
                                    <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Disponível Agora
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-[10px] h-7 px-2">Limpar Chat</Button>
                        </div>

                        {/* Feed de Mensagens */}
                        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user"
                                            ? "bg-brand-600 text-white rounded-br-sm shadow-md"
                                            : "bg-slate-100 text-slate-800 rounded-bl-sm border border-slate-200 shadow-sm"
                                            }`}
                                        dangerouslySetInnerHTML={{
                                            __html: msg.content
                                                .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                                                .replace(/\n/g, "<br/>"),
                                        }}
                                    />
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                                        <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Perguntas Rápidas */}
                        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Perguntas Frequentes</p>
                            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                                {QUICK_QUESTIONS.map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => sendMessage(q)}
                                        disabled={isTyping}
                                        className="shrink-0 text-[11px] font-bold rounded-lg border border-slate-200 bg-white text-slate-700 px-3 py-1.5 hover:border-brand-300 hover:text-brand-600 transition-all disabled:opacity-50"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Input de Mensagem */}
                        <div className="p-4 bg-white border-t border-slate-100">
                            <form
                                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                                className="flex gap-2"
                            >
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Escreva sua dúvida aqui..."
                                    className="flex-1 rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all outline-none"
                                />
                                <Button type="submit" size="icon" disabled={!inputValue.trim() || isTyping} className="bg-brand-600 rounded-xl h-11 w-11">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </Card>
                </div>
            </main>

            {/* Sticky Mobile/Desktop Footer Action */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 lg:hidden safe-area-bottom">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <Button variant="whatsapp" size="xl" className="w-full" leftIcon={<Phone className="h-5 w-5" />}>
                        Falar com o Corretor
                    </Button>
                </a>
            </div>
            {/* 360 Tour Modal */}
            {showTour && tour && (
                <div className="fixed inset-0 z-[60] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
                    <div className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh]">
                        <div className="flex items-center justify-between p-4 border-b">
                            <div>
                                <h3 className="font-bold text-slate-900">Tour Virtual 360°</h3>
                                <p className="text-xs text-slate-500">{tour.title}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowTour(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="flex-1 bg-slate-100 relative">
                            <MarzipanoViewer
                                key={currentRoomIdx} // Forçar re-render ao trocar de sala
                                imageUrl={tour.rooms[currentRoomIdx].imageUrl}
                                className="w-full h-full"
                                title={tour.rooms[currentRoomIdx].label}
                            />

                            {/* Room selector chips */}
                            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 px-4 pointer-events-none">
                                {tour.rooms.map((room: any, idx: number) => (
                                    <button
                                        key={room.id}
                                        onClick={() => setCurrentRoomIdx(idx)}
                                        className={`pointer-events-auto px-4 py-2 backdrop-blur shadow-lg rounded-full text-xs font-bold transition-all border ${currentRoomIdx === idx
                                            ? "bg-brand-600 text-white border-brand-500 scale-110"
                                            : "bg-white/90 text-slate-700 border-slate-200 hover:bg-white"
                                            }`}
                                    >
                                        {room.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
