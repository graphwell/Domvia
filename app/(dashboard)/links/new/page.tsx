"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth-provider";
import { rtdb } from "@/lib/firebase";
import { ref, push, set } from "firebase/database";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Save, Link2, Sparkles, Plus, Trash2, Image as ImageIcon, Info, Loader2 } from "lucide-react";
import Link from "next/link";
import { triggerHaptic } from "@/lib/haptic";
import { useToolAccess } from "@/hooks/use-tool-access";
import { toast } from "sonner";

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

    // Landing Page States
    const [landingEnabled, setLandingEnabled] = useState(false);
    const [landingPhotos, setLandingPhotos] = useState<string[]>([]);
    const [landingCTA, setLandingCTA] = useState("Quero saber mais");
    const [customCTA, setCustomCTA] = useState("");
    const [landingHeadline, setLandingHeadline] = useState("");
    const [landingDescription, setLandingDescription] = useState("");
    const [landingBullets, setLandingBullets] = useState<string[]>(["", "", ""]);
    const [landingShowLogo, setLandingShowLogo] = useState(true);
    const [generatingCopy, setGeneratingCopy] = useState(false);

    const isProOrMax = user?.planId === "pro" || user?.planId === "max";
    const toolAccess = useToolAccess("landing_page");

    const setField = (k: string, v: string) => {
        setForm((f) => ({ ...f, [k]: v }));
        if (k === "title") setPreviewSlug(generateSlug(v));
    };

    const handleGenerateAICopy = async () => {
        if (!form.title) {
            toast.error("Preencha o título do imóvel primeiro.");
            return;
        }
        setGeneratingCopy(true);
        triggerHaptic('medium');
        try {
            const res = await fetch("/api/ai/generate-property-copy", {
                method: "POST",
                body: JSON.stringify({ title: form.title, price: form.price ? Number(form.price) : undefined }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            
            setLandingHeadline(data.headline);
            setLandingDescription(data.description);
            setLandingBullets(data.bullets);
            toast.success("Copy gerado com sucesso!");
        } catch (err) {
            toast.error("Erro ao gerar copy com IA.");
        } finally {
            setGeneratingCopy(false);
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (landingPhotos.length + files.length > 6) {
            toast.error("Máximo de 6 fotos permitidas.");
            return;
        }

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                setLandingPhotos(prev => [...prev, event.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removePhoto = (index: number) => {
        setLandingPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError("Você precisa estar logado para criar um link.");
            return;
        }
        setLoading(true);
        setError(null);
        triggerHaptic('medium');
        try {
            // Debitar créditos se a landing estiver ativada
            if (landingEnabled) {
                if (landingPhotos.length < 3) {
                    toast.error("Para a landing page, você precisa de pelo menos 3 fotos.");
                    setLoading(false);
                    return;
                }
                const consumed = await toolAccess.useTool(`Landing Page: ${form.title}`);
                if (!consumed) {
                    toast.error("Saldo insuficiente ou erro ao debitar créditos da Landing Page.");
                    setLoading(false);
                    return;
                }
            }

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
                // Landing Page Data
                landing_enabled: landingEnabled,
                landing_photos: landingEnabled ? landingPhotos : null,
                landing_cta: landingEnabled ? (landingCTA === "Personalizado" ? customCTA : landingCTA) : null,
                landing_headline: landingEnabled ? landingHeadline : null,
                landing_description: landingEnabled ? landingDescription : null,
                landing_bullets: landingEnabled ? landingBullets.filter(b => b.trim() !== "") : null,
                landing_show_logo: landingEnabled ? landingShowLogo : null,
                landing_views: 0,
                landing_cta_clicks: 0,
                landing_avg_time: 0,
            });

            toast.success(landingEnabled ? "Link e Landing Page criados com sucesso!" : "Link criado com sucesso!");
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
                                {typeof window !== "undefined" ? window.location.origin : "https://domvia.ai"}/lead/<strong>{previewSlug}</strong>
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

                {/* Seção Landing Page */}
                <Card padding="md" className={`space-y-6 transition-all duration-300 ${!isProOrMax && "opacity-80"}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h2 className="font-display font-bold text-slate-800">Página de Destino (Landing Page)</h2>
                            {!isProOrMax && (
                                <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-amber-100">
                                    <Info className="h-3 w-3" /> PRO/MAX
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            disabled={!isProOrMax}
                            onClick={() => {
                                triggerHaptic('light');
                                setLandingEnabled(!landingEnabled);
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${landingEnabled ? "bg-brand-600" : "bg-slate-200"} ${!isProOrMax && "cursor-not-allowed grayscale"}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${landingEnabled ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                    </div>

                    {!isProOrMax ? (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                            <p className="text-xs text-slate-500 text-center">A Landing Page profissional do imóvel está disponível apenas nos planos <strong>Pro e Max</strong>.</p>
                        </div>
                    ) : landingEnabled ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            {/* Photos */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-700">Explorar Fotos (3 a 6)</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {landingPhotos.map((photo, i) => (
                                        <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group">
                                            <img src={photo} className="w-full h-full object-cover" alt={`Imóvel ${i}`} />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(i)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                            {i === 0 && <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-brand-600 text-white text-[8px] rounded font-bold uppercase">Capa</span>}
                                        </div>
                                    ))}
                                    {landingPhotos.length < 6 && (
                                        <label className="aspect-video rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                                            <ImageIcon className="h-5 w-5 text-slate-400" />
                                            <span className="text-[10px] text-slate-400 mt-1">Add Foto</span>
                                            <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Copy via IA */}
                            <div className="space-y-4 pt-2 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-medium text-slate-700">Conteúdo Persuasivo</label>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="h-8 text-xs gap-1.5 border-brand-200 text-brand-600 hover:bg-brand-50"
                                        onClick={handleGenerateAICopy}
                                        loading={generatingCopy}
                                    >
                                        <Sparkles className="h-3 w-3" /> Gerar com IA
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    <input
                                        placeholder="Headline principal..."
                                        className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                                        value={landingHeadline}
                                        onChange={(e) => setLandingHeadline(e.target.value)}
                                    />
                                    <textarea
                                        placeholder="Descrição persuasiva da landing page..."
                                        rows={3}
                                        className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none resize-none"
                                        value={landingDescription}
                                        onChange={(e) => setLandingDescription(e.target.value)}
                                    />
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destaques (Bullets)</p>
                                        {landingBullets.map((bullet, i) => (
                                            <input
                                                key={i}
                                                placeholder={`Destaque ${i + 1}`}
                                                className="w-full rounded-xl border border-slate-300 px-4 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                                                value={bullet}
                                                onChange={(e) => {
                                                    const newBullets = [...landingBullets];
                                                    newBullets[i] = e.target.value;
                                                    setLandingBullets(newBullets);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="space-y-3 pt-2 border-t border-slate-100">
                                <label className="block text-sm font-medium text-slate-700">Call to Action (Botão)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {["Quero saber mais", "Quero visitar o imóvel", "Me chama no WhatsApp", "Personalizado"].map(opt => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setLandingCTA(opt)}
                                            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${landingCTA === opt ? "bg-brand-50 border-brand-300 text-brand-700" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                                {landingCTA === "Personalizado" && (
                                    <input
                                        placeholder="Texto do botão (máx 30 caracteres)"
                                        maxLength={30}
                                        className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                                        value={customCTA}
                                        onChange={(e) => setCustomCTA(e.target.value)}
                                    />
                                )}
                            </div>

                            <div className="flex items-center justify-between p-3 bg-brand-50 rounded-xl border border-brand-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                        <ImageIcon className="h-4 w-4 text-brand-600" />
                                    </div>
                                    <div className="text-[10px] text-brand-800">
                                        <p className="font-bold">Custo de ativação</p>
                                        <p>Esta landing page consome 2 créditos.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-brand-700 font-black">
                                    -2 <Badge className="bg-brand-600">créditos</Badge>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 text-center py-2 italic">Ative para configurar a página profissional do imóvel.</p>
                    )}
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
