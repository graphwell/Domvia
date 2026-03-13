"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useBranding } from "@/hooks/use-branding";
import { useAuth } from "@/hooks/auth-provider";
import { useLanguage } from "@/hooks/use-language";
import { DOCUMENT_TEMPLATES } from "@/lib/document-templates";
import {
    ArrowLeft, Sparkles, Printer, Share2, RotateCcw,
    Send, Loader2, PenLine, FileEdit, CheckCircle2
} from "lucide-react";

type Stage = "prompt" | "preview" | "refine";

function AIDocPageContent() {
    const { user } = useAuth();
    const { branding } = useBranding();
    const { t, language } = useLanguage();
    const searchParams = useSearchParams();
    const initialDoc = searchParams.get("doc") ?? "";

    const [prompt, setPrompt] = useState("");
    const [selectedDoc, setSelectedDoc] = useState(initialDoc);
    const [docText, setDocText] = useState("");
    const [loading, setLoading] = useState(false);
    const [stage, setStage] = useState<Stage>("prompt");
    const [refineText, setRefineText] = useState("");
    const [error, setError] = useState<string | null>(null);

    const brokerData = {
        name: branding.brandName || user?.name,
        creci: branding.creci,
        phone: branding.phone,
    };

    const generate = async (isRefinement = false) => {
        if (!isRefinement && !prompt.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/ai/tools/document", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: isRefinement ? "" : prompt,
                    previousDocument: isRefinement ? docText : undefined,
                    observations: isRefinement ? refineText : undefined,
                    brokerData,
                    docType: selectedDoc || undefined,
                    language,
                }),
            });
            if (!res.ok) throw new Error(t("common.error"));
            const data = await res.json();
            setDocText(data.text);
            setStage("preview");
            setRefineText("");
        } catch (e: any) {
            setError(e.message ?? t("common.error"));
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => window.print();

    const handleShare = () => {
        const lines = docText.split("\n").slice(0, 10).join("\n");
        const waText = language === "en" ? "*Real Estate Document*" : language === "es" ? "*Documento Inmobiliario*" : "*Documento Imobiliário*";
        const waFooter = language === "en" ? "_Generated on Domvia_" : language === "es" ? "_Generado en Domvia_" : "_Gerado no Domvia_";
        window.open(`https://wa.me/?text=${encodeURIComponent(`${waText}\n\n${lines}\n\n${waFooter}`)}`, "_blank");
    };

    const hasBrand = branding.logoBase64 || branding.brandName;

    return (
        <>
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #ai-doc-preview, #ai-doc-preview * { visibility: visible; }
                    #ai-doc-preview { position: fixed; top: 0; left: 0; width: 100%; padding: 32px; font-family: Georgia, serif; }
                }
            `}</style>

            <div className="max-w-5xl mx-auto space-y-6 pb-24">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/tools/docs">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-brand-500" /> {t("docs.ai_gen.title")}
                        </h1>
                        <p className="text-xs text-slate-500">{t("docs.ai_gen.subtitle")}</p>
                    </div>
                    {stage === "preview" && (
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm" leftIcon={<Share2 className="h-3.5 w-3.5" />} onClick={handleShare}>WhatsApp</Button>
                            <Button size="sm" leftIcon={<Printer className="h-3.5 w-3.5" />} onClick={handlePrint}>PDF</Button>
                        </div>
                    )}
                </div>

                <div className={`grid gap-6 ${stage === "preview" ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1"}`}>
                    {/* Left panel */}
                    <div className="space-y-4">
                        {stage === "prompt" && (
                            <Card padding="md" className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        {t("docs.ai_gen.doc_type_label")}
                                    </label>
                                    <select
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:outline-none bg-white"
                                        value={selectedDoc}
                                        onChange={e => setSelectedDoc(e.target.value)}
                                    >
                                        <option value="">{t("docs.ai_gen.doc_type_auto")}</option>
                                        {DOCUMENT_TEMPLATES.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        {t("docs.ai_gen.prompt_label")} <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:outline-none bg-white resize-none"
                                        rows={6}
                                        placeholder={t("docs.ai_gen.prompt_placeholder")}
                                        value={prompt}
                                        onChange={e => setPrompt(e.target.value)}
                                    />
                                </div>

                                {error && (
                                    <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
                                )}

                                <div className="flex gap-3">
                                    <Button
                                        className="flex-1"
                                        leftIcon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                        onClick={() => generate(false)}
                                        disabled={loading || !prompt.trim()}
                                    >
                                        {loading ? t("docs.ai_gen.generating") : t("docs.ai_gen.generate_btn")}
                                    </Button>
                                </div>

                                {/* Examples */}
                                <div className="border-t pt-4">
                                    <p className="text-xs text-slate-400 font-medium mb-3">{t("docs.ai_gen.examples_title")}</p>
                                    <div className="flex flex-col gap-2">
                                        {(language === "en"
                                            ? [
                                                "Sinal receipt of $10,000 for apt 302 of Ed. Solar. Buyer: John Smith. Today's date.",
                                                "Visit authorization for the property at 100 Flowers St, for client Charles Souza, today at 3 PM.",
                                                "Visit declaration for apt 52 of Ed. Parque Verde, with client Ana Lima, ID 555.555.555-00.",
                                            ] : language === "es"
                                                ? [
                                                    "Recibo de señal de $10.000 para el ap. 302 del Ed. Solar. Comprador: Juan Perez. Fecha de hoy.",
                                                    "Autorización de visita al inmueble en la Calle de las Flores, 100, para el cliente Carlos Souza, hoy a las 15h.",
                                                    "Declaración de visita al ap. 52 del Ed. Parque Verde, con la cliente Ana Lima, ID 555.555.555-00.",
                                                ] : [
                                                    "Recibo de sinal de R$ 10.000 para o ap. 302 do Ed. Solar. Comprador: João Silva. Data de hoje.",
                                                    "Autorização de visita ao imóvel na Rua das Flores, 100, para o cliente Carlos Souza, hoje às 15h.",
                                                    "Declaração de visita ao ap. 52 do Ed. Parque Verde, com o cliente Ana Lima, CPF 555.555.555-00.",
                                                ]
                                        ).map((ex, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                className="text-left text-xs text-slate-500 hover:text-brand-600 hover:bg-brand-50 px-3 py-2 rounded-lg border border-slate-100 hover:border-brand-200 transition-all"
                                                onClick={() => setPrompt(ex)}
                                            >
                                                &ldquo;{ex}&rdquo;
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        )}

                        {stage === "preview" && (
                            <Card padding="md" className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    <h2 className="font-display font-bold text-slate-800">{t("docs.ai_gen.success_title")}</h2>
                                </div>
                                <p className="text-xs text-slate-500">{t("docs.ai_gen.success_subtitle")}</p>

                                <div className="grid gap-3">
                                    <Button leftIcon={<Printer className="h-4 w-4" />} onClick={handlePrint} className="w-full justify-center">
                                        {t("docs.ai_gen.btn_print")}
                                    </Button>
                                    <Button variant="secondary" leftIcon={<Share2 className="h-4 w-4" />} onClick={handleShare} className="w-full justify-center">
                                        {t("docs.ai_gen.btn_whatsapp")}
                                    </Button>
                                    <Button variant="outline" leftIcon={<FileEdit className="h-4 w-4" />} onClick={() => setStage("refine")} className="w-full justify-center">
                                        {t("docs.ai_gen.btn_refine")}
                                    </Button>
                                    <Button variant="ghost" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => setStage("prompt")} className="w-full justify-center">
                                        {t("docs.ai_gen.btn_new")}
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {stage === "refine" && (
                            <Card padding="md" className="space-y-4">
                                <h2 className="font-display font-bold text-slate-800 flex items-center gap-2">
                                    <PenLine className="h-4 w-4 text-brand-500" /> {t("docs.ai_gen.refine_title")}
                                </h2>
                                <p className="text-xs text-slate-500">{t("docs.ai_gen.refine_subtitle")}</p>
                                <textarea
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:outline-none bg-white resize-none"
                                    rows={5}
                                    placeholder={t("docs.ai_gen.refine_placeholder")}
                                    value={refineText}
                                    onChange={e => setRefineText(e.target.value)}
                                />
                                {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>}
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={() => setStage("preview")}>{t("common.cancel")}</Button>
                                    <Button
                                        className="flex-1"
                                        leftIcon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        onClick={() => generate(true)}
                                        disabled={loading || !refineText.trim()}
                                    >
                                        {loading ? t("docs.ai_gen.btn_refining") : t("docs.ai_gen.btn_refine")}
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Right: A4 Preview */}
                    {stage !== "prompt" && (
                        <div className="sticky top-20">
                            <p className="text-sm font-semibold text-slate-600 mb-3">{t("docs.ai_gen.preview_title")}</p>
                            <div className="bg-slate-200 rounded-2xl p-3 overflow-auto max-h-[75vh]">
                                <div
                                    id="ai-doc-preview"
                                    className="bg-white shadow-2xl rounded-sm p-8 min-h-[600px]"
                                    style={{ maxWidth: 794, margin: "0 auto", fontFamily: "Georgia, serif" }}
                                >
                                    {/* Branding header */}
                                    {hasBrand && (
                                        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 mb-6">
                                            <div style={{ minWidth: 120 }}>
                                                {branding.logoBase64
                                                    ? <img src={branding.logoBase64} alt="Logo" style={{ maxHeight: 56, maxWidth: 140, objectFit: "contain" }} />
                                                    : <p className="font-bold text-slate-900 text-lg">{branding.brandName}</p>
                                                }
                                            </div>
                                            <div className="text-center flex-1 px-4">
                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">
                                                    {language === "en" ? "Real Estate Document" : language === "es" ? "Documento Inmobiliario" : "Documento Imobiliário"}
                                                </p>
                                            </div>
                                            <div style={{ minWidth: 120 }} />
                                        </div>
                                    )}
                                    <pre className="whitespace-pre-wrap font-serif text-sm text-slate-800 leading-relaxed">{docText}</pre>
                                    <div className="mt-8 text-center text-[10px] text-slate-400 border-t pt-4">
                                        {t("docs.ai_gen.footer_generated")} {new Date().toLocaleDateString(language === "en" ? "en-US" : language === "es" ? "es-ES" : "pt-BR")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default function AIDocPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-slate-500">Caregando ferramentas de IA...</div>}>
            <AIDocPageContent />
        </Suspense>
    );
}
