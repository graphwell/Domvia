"use client";

import { FileText, ArrowLeft, Copy, CheckCheck, Sparkles, Coins } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/auth-provider";
import { getToolCostDynamic } from "@/lib/billing";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function DescriptionPage() {
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [details, setDetails] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const { user } = useAuth();
    const [toolCost, setToolCost] = useState<number | null>(null);

    useEffect(() => {
        if (user?.planId) {
            getToolCostDynamic('description_gen', user.planId).then(setToolCost);
        }
    }, [user?.planId]);

    const generate = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/ai/tools/description", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, price: Number(price), description: details }),
            });
            const data = await res.json();
            setResult(data.result);
        } catch (e) {
            console.error(e);
            setResult("Erro ao gerar descrição. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <Link href="/tools">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="font-display text-2xl font-bold text-slate-900">Gerador de Descrição</h1>
                    <p className="text-slate-500 text-sm">IA cria textos persuasivos para seus anúncios</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card padding="md" className="space-y-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Título do Imóvel</label>
                            <input
                                type="text"
                                placeholder="Ex: Apartamento 3 quartos no Leblon"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Valor (R$)</label>
                            <input
                                type="number"
                                placeholder="850000"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Características / Detalhes</label>
                            <textarea
                                placeholder="Ex: 3 suítes, varanda gourmet, lazer completo, 2 vagas, sol da manhã..."
                                rows={4}
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:outline-none resize-none"
                            />
                        </div>
                        <Button
                            className="w-full"
                            disabled={!title || loading}
                            onClick={generate}
                            loading={loading}
                            leftIcon={<Sparkles className="h-4 w-4" />}
                        >
                            Gerar Descrição IA
                        </Button>
                        {toolCost !== null && toolCost > 0 && (
                            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-brand-600 animate-pulse">
                                <Coins className="h-2.5 w-2.5" />
                                Custará {toolCost} créditos
                            </div>
                        )}
                    </div>
                </Card>

                {result && (
                    <Card padding="md" className="animate-fade-up bg-brand-50 border-brand-200">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-brand-800">Resultado Gerado</h3>
                            <button
                                onClick={copyToClipboard}
                                className="p-2 rounded-lg hover:bg-brand-100 text-brand-600 transition-colors"
                            >
                                {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </button>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {result}
                        </p>
                    </Card>
                )}
            </div>
        </div>
    );
}
