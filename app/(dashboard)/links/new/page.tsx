"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth-provider";
import { rtdb } from "@/lib/firebase";
import { ref, push, set } from "firebase/database";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Save, Link2 } from "lucide-react";
import Link from "next/link";

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 40) +
        "-" + Math.random().toString(36).slice(2, 6);
}

export default function NewLinkPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        title: "", whatsapp: "", price: "", description: "",
    });
    const [previewSlug, setPreviewSlug] = useState("");

    const setField = (k: string, v: string) => {
        setForm((f) => ({ ...f, [k]: v }));
        if (k === "title") setPreviewSlug(generateSlug(v));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError("Você precisa estar logado para criar um link.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const linksRef = ref(rtdb, "links");
            const newLinkRef = push(linksRef);
            const now = new Date().toISOString();

            await set(newLinkRef, {
                slug: previewSlug,
                title: form.title,
                whatsapp: form.whatsapp,
                price: form.price ? Number(form.price) : null,
                description: form.description || null,
                brokerName: user.name,
                userId: user.id,
                visits: 0,
                aiQuestions: 0,
                simulations: 0,
                status: "active",
                createdAt: now,
                updatedAt: now,
            });

            router.push("/links");
        } catch (err: any) {
            setError(`Erro ao criar link: ${err.message}`);
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/links">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <div>
                    <h1 className="font-display text-2xl font-bold text-slate-900">Criar Novo Link</h1>
                    <p className="text-slate-500 text-sm">Gere um link inteligente para compartilhar no Instagram e redes sociais</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* How it works */}
            <Card padding="md" className="bg-brand-50 border-brand-200">
                <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
                        <Link2 className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-sm text-brand-800">
                        <p className="font-semibold mb-1">Como funciona este link</p>
                        <p>Quem acessar o link verá uma <strong>IA especialista</strong> para tirar dúvidas de financiamento, uma <strong>calculadora de parcelas</strong> e o botão para falar com você pelo <strong>WhatsApp</strong>.</p>
                    </div>
                </div>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-5">
                <Card padding="md" className="space-y-4">
                    <h2 className="font-display font-bold text-slate-800">Informações do Anúncio</h2>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Título do Anúncio <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            value={form.title}
                            onChange={(e) => setField("title", e.target.value)}
                            placeholder="Ex: Apartamento 3 quartos no Leblon"
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                        />
                    </div>

                    {/* Preview do link */}
                    {previewSlug && (
                        <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                            <p className="text-xs text-slate-500 font-medium mb-1">Seu link vai ser:</p>
                            <p className="text-sm font-mono text-brand-600 font-semibold">
                                {typeof window !== "undefined" ? window.location.origin : "https://leadbroker.ai"}/lead/<strong>{previewSlug}</strong>
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                WhatsApp <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                type="tel"
                                value={form.whatsapp}
                                onChange={(e) => setField("whatsapp", e.target.value)}
                                placeholder="21999999999"
                                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                            />
                            <p className="text-xs text-slate-400 mt-1">Sem máscara, com DDD</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Valor do Imóvel (opcional)
                            </label>
                            <input
                                type="number"
                                value={form.price}
                                onChange={(e) => setField("price", e.target.value)}
                                placeholder="850000"
                                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                            />
                            <p className="text-xs text-slate-400 mt-1">Pré-preenche calculadora</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Descrição breve (opcional)
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setField("description", e.target.value)}
                            placeholder="Ex: Apartamento com 3 quartos, 2 banheiros, 1 vaga. Próximo à praia."
                            rows={3}
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none resize-none"
                        />
                        <p className="text-xs text-slate-400 mt-1">Aparece no cabeçalho da página do lead</p>
                    </div>
                </Card>

                <div className="flex gap-3 justify-end">
                    <Link href="/links">
                        <Button variant="outline" type="button">Cancelar</Button>
                    </Link>
                    <Button type="submit" loading={loading} leftIcon={<Save className="h-4 w-4" />}>
                        Criar Link
                    </Button>
                </div>
            </form>
        </div>
    );
}
