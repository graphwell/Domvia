"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/hooks/auth-provider";
import { 
    LifeBuoy, MessageSquare, Send, Loader2, Bot, User, 
    Lightbulb, HelpCircle, CheckCircle2, ChevronRight,
    Camera, Link2, Calculator, Zap, Trash2, AlertCircle
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface Message {
    role: "assistant" | "user";
    content: string;
}

const QUICK_TIPS = [
    {
        title: "Captar Imóveis com Placas",
        desc: "Use a câmera do celular para fotografar placas de venda. Nossa IA extrai o telefone automaticamente.",
        icon: Camera,
        color: "text-blue-600 bg-blue-50"
    },
    {
        title: "Gerar Leads com Links",
        desc: "Crie links inteligentes para seus imóveis e compartilhe. Quando o cliente clica, você recebe o contato.",
        icon: Link2,
        color: "text-emerald-600 bg-emerald-50"
    },
    {
        title: "Usar o Assistente IA",
        desc: "Tire dúvidas sobre contratos, mercado imobiliário ou peça ajuda para descrever um imóvel.",
        icon: Bot,
        color: "text-brand-600 bg-brand-50"
    },
    {
        title: "Organizar Captações",
        desc: "Mantenha o histórico de todas as placas fotografadas e o status de cada abordagem.",
        icon: CheckCircle2,
        color: "text-purple-600 bg-purple-50"
    }
];

export default function HelpCenterPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Olá! Sou o assistente de suporte do Domvia. Como posso ajudar você hoje com as funcionalidades da plataforma?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        
        const userMsg = { role: "user" as const, content: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/ai/support", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    question: userMsg.content,
                    history: messages.slice(-5)
                }),
            });

            const data = await res.json();
            setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: "assistant", content: "Desculpe, tive um problema ao processar sua dúvida. Tente novamente em instantes." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="font-display text-3xl font-black text-slate-900 flex items-center gap-3">
                    <LifeBuoy className="h-8 w-8 text-brand-600" />
                    Central de Ajuda
                </h1>
                <p className="text-slate-500 mt-2">Tudo o que você precisa para dominar o Domvia e acelerar suas vendas.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Quick Tips */}
                <div className="lg:col-span-2 space-y-6">
                    <section>
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Zap className="h-5 w-5 text-amber-500" />
                            Dicas Rápidas
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {QUICK_TIPS.map((tip, i) => (
                                <Card key={i} hover padding="md" className="flex flex-col gap-3">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${tip.color}`}>
                                        <tip.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{tip.title}</h4>
                                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">{tip.desc}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* FAQ-like section or additional resources could go here */}
                    <Card className="bg-brand-600 text-white border-none p-6 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-2">Novo por aqui?</h3>
                            <p className="text-brand-100 text-sm mb-4 max-w-md">Assista ao nosso guia rápido de 2 minutos e aprenda a captar seu primeiro imóvel hoje mesmo.</p>
                            <Button variant="gold" size="sm">Ver Tutorial</Button>
                        </div>
                        <HelpCircle className="absolute -right-4 -bottom-4 h-32 w-32 text-brand-500/20 rotate-12" />
                    </Card>
                </div>

                {/* Right: AI Support Chat */}
                <div className="lg:col-span-1">
                    <Card className="h-[600px] flex flex-col border-slate-200 shadow-xl overflow-hidden" padding="none">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-brand-600 flex items-center justify-center text-white">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">Suporte Inteligente</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Online agora</span>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                                        m.role === "user" 
                                        ? "bg-brand-600 text-white" 
                                        : "bg-slate-100 text-slate-800"
                                    }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-100 rounded-2xl px-4 py-2.5">
                                        <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-slate-100 bg-white">
                            <div className="relative">
                                <input 
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Tire sua dúvida..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                />
                                <button 
                                    onClick={sendMessage}
                                    disabled={!input.trim() || loading}
                                    className="absolute right-2 top-1.5 h-9 w-9 bg-brand-600 text-white rounded-lg flex items-center justify-center hover:bg-brand-700 disabled:opacity-50 transition-colors"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-[10px] text-center text-slate-400 mt-3 leading-relaxed">
                                IA treinada em funcionalidades do Domvia.<br/>
                                Como toda IA, posso cometer erros. Revise informações críticas.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Account Deletion - Discrete at footer */}
            <div className="pt-12 border-t border-slate-100 flex justify-center">
                <AccountDeletionFlow />
            </div>
        </div>
    );
}

function AccountDeletionFlow() {
    const [step, setStep] = useState(0); // 0: Idle, 1: Warning, 2: Final Confirmation
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleDelete = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/user/delete-account", {
                method: "POST",
                headers: { "x-user-id": user?.id || "" }
            });
            if (res.ok) {
                window.location.href = "/";
            } else {
                alert("Erro ao excluir conta. Tente novamente.");
            }
        } catch (e) {
            alert("Erro de conexão.");
        } finally {
            setLoading(false);
        }
    };

    if (step === 0) {
        return (
            <button 
                onClick={() => setStep(1)}
                className="text-[11px] text-slate-400 hover:text-red-400 transition-colors uppercase tracking-widest font-bold"
            >
                Excluir minha conta e dados
            </button>
        );
    }

    return (
        <Card className="max-w-md w-full border-red-100 bg-red-50/30 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center p-2">
                <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                    <Trash2 className="h-6 w-6" />
                </div>
                
                {step === 1 ? (
                    <>
                        <h3 className="font-bold text-slate-900">Tem certeza que deseja sair?</h3>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                            Esta ação é **permanente**. Você perderá acesso a todos os seus leads, 
                            captações, documentos e créditos restantes.
                        </p>
                        <div className="flex gap-3 w-full mt-6">
                            <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>Cancelar</Button>
                            <Button variant="danger" className="flex-1" onClick={() => setStep(2)}>Entendi, prosseguir</Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-2 text-red-600 mb-2">
                            <AlertCircle className="h-4 w-4" />
                            <h3 className="font-bold">Confirmação Final</h3>
                        </div>
                        <p className="text-sm text-slate-600">
                            Ao clicar no botão abaixo, sua conta e **todos os seus dados** serão apagados 
                            imediatamente do nosso banco de dados.
                        </p>
                        <div className="flex flex-col gap-2 w-full mt-6">
                            <Button 
                                variant="danger" 
                                className="w-full" 
                                loading={loading}
                                onClick={handleDelete}
                            >
                                Sim, desejo apagar todos os meus dados
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setStep(0)} disabled={loading}>
                                Desistir e Voltar
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </Card>
    );
}
