"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth-provider";
import { rtdb } from "@/lib/firebase";
import { ref, push, set } from "firebase/database";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Save, Link2, Sparkles, Plus, Trash2, Image as ImageIcon, Info, Loader2, Eye, MapPin, CheckCircle2, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { triggerHaptic } from "@/lib/haptic";
import { useToolAccess } from "@/hooks/use-tool-access";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";

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
    const [showPreview, setShowPreview] = useState(false);
    const [activePhoto, setActivePhoto] = useState(0);

    const planId = (user?.planId || user?.plan || "").toLowerCase();
    const isProOrMax = planId === "pro" || planId === "max";
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
                            {landingEnabled && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        triggerHaptic('light');
                                        setShowPreview(true);
                                    }}
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-[10px] font-black uppercase tracking-widest border border-slate-200"
                                >
                                    <Eye className="h-3 w-3" /> Pré-visualizar
                                </button>
                            )}
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

            </form>

            <Modal 
                isOpen={showPreview} 
                onClose={() => setShowPreview(false)} 
                className="max-w-md p-0 overflow-hidden bg-slate-50"
                showClose={false}
            >
                <div className="relative h-screen max-h-[85vh] overflow-y-auto scrollbar-hide pb-32">
                    {/* Header / Navigation Overlay */}
                    <div className="absolute top-0 inset-x-0 z-50 p-4 flex items-center justify-between pointer-events-none">
                        <button 
                             onClick={() => setShowPreview(false)}
                             className="w-10 h-10 rounded-full bg-slate-900/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10 pointer-events-auto"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Hero / Cover Photo */}
                    <div className="relative h-[55vh] w-full bg-slate-200">
                        {landingPhotos.length > 0 ? (
                            <img 
                                src={landingPhotos[activePhoto]} 
                                className="w-full h-full object-cover" 
                                alt="Preview" 
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2 bg-slate-100">
                                <ImageIcon className="h-8 w-8 opacity-20" />
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Sem fotos</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />
                        
                        <div className="absolute bottom-8 left-0 right-0 px-6 space-y-2">
                            <Badge className="bg-brand-600 border-none px-3 py-1 text-white">Oportunidade</Badge>
                            <h1 className="text-2xl font-black text-white font-display leading-tight">{form.title || "Título do Imóvel"}</h1>
                            <div className="flex items-center gap-2 text-white/80 text-xs">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>Excelente localização</span>
                            </div>
                        </div>
                    </div>

                    {/* Photo Gallery (Carousel) */}
                    {landingPhotos.length > 0 && (
                        <div className="px-4 -mt-6 relative z-10 flex gap-2 overflow-x-auto pb-4 pt-2 scrollbar-hide snap-x">
                            {landingPhotos.map((photo, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setActivePhoto(i)}
                                    className={`relative w-20 aspect-video rounded-xl overflow-hidden shrink-0 border-2 transition-all snap-start ${activePhoto === i ? "border-brand-500 scale-105" : "border-white"}`}
                                >
                                    <img src={photo} className="w-full h-full object-cover" alt={`Miniatura ${i}`} />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Content Section */}
                    <main className="px-6 space-y-6 mt-4">
                        {/* Price & Badge */}
                        <div className="flex items-center justify-between">
                            {form.price ? (
                                <div>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Investimento</p>
                                    <p className="text-xl font-black text-brand-600">R$ {Number(form.price).toLocaleString("pt-BR")}</p>
                                </div>
                            ) : (
                                <div className="h-10" />
                            )}
                            <div className="flex flex-col items-end">
                                <p className="text-[9px] text-slate-400 font-medium tracking-tight">Anunciado por</p>
                                <p className="font-bold text-slate-800 text-xs">{user?.name || "Corretor"}</p>
                            </div>
                        </div>

                        {/* IA Description */}
                        <div className="space-y-3">
                            <h2 className="text-lg font-black text-slate-900 leading-tight uppercase italic tracking-tighter">{landingHeadline || "Headline do Imóvel"}</h2>
                            <p className="text-slate-500 leading-relaxed text-xs font-medium">{landingDescription || "Descrição persuasiva gerada pela IA..."}</p>
                        </div>

                        {/* Bullets */}
                        <div className="grid grid-cols-1 gap-2.5">
                            {landingBullets.filter(b => b.trim() !== "").map((bullet, i) => (
                                <div key={i} className="flex items-start gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                    </div>
                                    <span className="text-slate-700 font-bold text-xs leading-snug">{bullet}</span>
                                </div>
                            ))}
                        </div>

                        {/* Broker Info Card */}
                        <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                                <Home className="h-5 w-5 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">Fale com o corretor</p>
                                <p className="font-bold text-slate-900 text-sm tracking-tight">{user?.name || "Seu Nome"}</p>
                            </div>
                        </div>
                    </main>

                    {/* Sticky Bottom CTA */}
                    <div className="absolute bottom-0 inset-x-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50">
                        <Button 
                            className="w-full h-12 text-sm font-black rounded-xl shadow-xl shadow-brand-500/10 uppercase tracking-widest"
                        >
                            {landingCTA === "Personalizado" ? customCTA : (landingCTA || "Quero saber mais")}
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                        <p className="text-center text-[9px] text-slate-400 mt-3 font-bold uppercase tracking-widest">
                            Respondemos em segundos por IA
                        </p>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowPreview(false); }}
                            className="w-full mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
                        >
                            Fechar Prévia
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
