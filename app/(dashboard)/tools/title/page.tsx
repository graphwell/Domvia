"use client";

import { Type, ArrowLeft, Copy, CheckCheck, Sparkles, Coins } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/auth-provider";
import { getToolCostDynamic } from "@/lib/billing";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function TitlePage() {
    const [title, setTitle] = useState("");
    const [results, setResults] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const { user } = useAuth();
    const [toolCost, setToolCost] = useState<number | null>(null);

    useEffect(() => {
        if (user?.planId) {
            getToolCostDynamic('title_gen', user.planId).then(setToolCost);
        }
    }, [user?.planId]);

    const generate = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/ai/tools/title", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title }),
            });
            const data = await res.json();
            setResults(data.result || []);
        } catch (e) {
            console.error(e);
            setResults(["Erro ao gerar títulos."]);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
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
                    <h1 className="font-display text-2xl font-bold text-slate-900">Sugestão de Títulos</h1>
                    <p className="text-slate-500 text-sm">Gere títulos de alto impacto para seus anúncios</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card padding="md" className="space-y-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">O que é o imóvel? (Curto)</label>
                            <input
                                type="text"
                                placeholder="Ex: Cobertura 4 suítes com piscina na Barra"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:outline-none"
                            />
                        </div>
                        <Button
                            className="w-full"
                            disabled={!title || loading}
                            onClick={generate}
                            loading={loading}
                            leftIcon={<Sparkles className="h-4 w-4" />}
                        >
                            Gerar Sugestões
                        </Button>
                        {toolCost !== null && toolCost > 0 && (
                            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-brand-600 animate-pulse">
                                <Coins className="h-2.5 w-2.5" />
                                Custará {toolCost} créditos
                            </div>
                        )}
                    </div>
                </Card>

                {results.length > 0 && (
                    <div className="space-y-3 animate-fade-up">
                        <h3 className="text-sm font-bold text-slate-700 ml-1">Opções de Título</h3>
                        {results.map((res, i) => (
                            <Card key={i} padding="md" className="group border-slate-100 hover:border-brand-200 transition-colors">
                                <div className="flex items-center justify-between gap-4">
                                    <p className="text-sm font-medium text-slate-700">{res}</p>
                                    <button
                                        onClick={() => copyToClipboard(res, i)}
                                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-brand-600 transition-colors shrink-0"
                                    >
                                        {copiedIndex === i ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
