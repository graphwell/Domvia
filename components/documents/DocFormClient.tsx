"use client";

import { useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useBranding } from "@/hooks/use-branding";
import { useAuth } from "@/hooks/auth-provider";
import { SignaturePad, SignaturePadRef } from "@/components/documents/SignaturePad";
import { getTemplate } from "@/lib/document-templates";
import { useLanguage } from "@/hooks/use-language";
import {
    ArrowLeft, Printer, Share2, ChevronRight,
    CheckCircle2, FileText, PenLine, Download
} from "lucide-react";
import { toast } from "sonner";
import { rtdb } from "@/lib/firebase";
import { ref, push, set } from "firebase/database";
import { notFound } from "next/navigation";

function toTitleCase(str: string) {
    if (!str) return "";
    return str.toLowerCase().split(' ').map(word => {
        return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
}

// ── Step indicator ────────────────────────────────────────
const STEPS = ["Preencher", "Assinar", "Exportar"] as const;

function StepBar({ step }: { step: number }) {
    const { t } = useLanguage();
    const STEPS = [t("docs.step_fill"), t("docs.step_sign"), t("docs.step_export")];

    return (
        <div className="flex items-center gap-2 mb-6">
            {STEPS.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? "bg-emerald-500 text-white" : i === step ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-400"}`}>
                        {i < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    <span className={`text-sm font-medium ${i === step ? "text-slate-900" : "text-slate-400"}`}>{s}</span>
                    {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-slate-300" />}
                </div>
            ))}
        </div>
    );
}

// ── Field renderer ────────────────────────────────────────
function renderField(field: any, value: string, onChange: (v: string) => void, lang: string) {
    const cls = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:outline-none bg-white";
    if (field.type === "textarea") {
        return <textarea className={cls} rows={3} placeholder={field.placeholder} value={value} onChange={e => onChange(e.target.value)} />;
    }
    if (field.type === "select" && field.options) {
        return (
            <select className={cls} value={value} onChange={e => onChange(e.target.value)}>
                <option value="">{lang === "en" ? "Select..." : lang === "es" ? "Seleccione..." : "Selecione..."}</option>
                {field.options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        );
    }
    const inputType = field.type === "date" ? "date" : field.type === "phone" ? "tel" : field.type === "number" || field.type === "currency" ? "number" : "text";
    return (
        <input
            type={inputType}
            className={cls}
            placeholder={field.placeholder ?? field.label}
            value={value}
            onChange={e => onChange(e.target.value)}
            min={field.type === "number" || field.type === "currency" ? "0" : undefined}
        />
    );
}

// ── Document renderer (A4 preview) ───────────────────────
function A4Preview({ text, logoBase64, brandName, creci, signatures, lang }: {
    text: string;
    logoBase64?: string;
    brandName?: string;
    creci?: string;
    signatures: { broker?: string | null; client?: string | null; witness1?: string | null; witness2?: string | null };
    lang: string;
}) {
    const hasBrand = logoBase64 || brandName;
    const isEn = lang === "en";
    const isEs = lang === "es";

    const locale = isEn ? "en-US" : isEs ? "es-ES" : "pt-BR";

    return (
        <div
            id="doc-preview"
            className="bg-white text-slate-900 text-sm leading-relaxed"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
            {/* Header */}
            <div className={`${hasBrand ? "flex items-center justify-between" : "text-center"} border-b-2 border-slate-800 pb-4 mb-6`}>
                {hasBrand && (
                    <div className="flex-1">
                        {logoBase64 ? (
                            <img src={logoBase64} alt="Company Logo" className="max-h-16 max-w-[180px] object-contain" />
                        ) : (
                            <div>
                                <h3 className="font-display font-black text-slate-900 text-xl tracking-tight uppercase leading-tight">
                                    {toTitleCase(brandName || "")}
                                </h3>
                                {creci && <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">CRECI {creci}</p>}
                            </div>
                        )}
                    </div>
                )}
                <div className={hasBrand ? "text-center flex-1 px-4" : ""}>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">
                        {isEn ? "Real Estate Document" : isEs ? "Documento Inmobiliario" : "Documento Imobiliário"}
                    </p>
                    <p className="text-xs text-slate-500">{new Date().toLocaleDateString(locale)}</p>
                </div>
                {hasBrand && <div style={{ minWidth: 120 }} />}
            </div>

            {/* Document body */}
            <pre className="whitespace-pre-wrap font-serif text-sm text-slate-800 leading-relaxed">{text}</pre>

            {/* Signatures */}
            {(signatures.broker || signatures.client || signatures.witness1 || signatures.witness2) && (
                <div className="mt-10 border-t pt-6">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-6">
                        {isEn ? "Signatures" : isEs ? "Firmas" : "Assinaturas"}
                    </p>
                    <div className="grid grid-cols-2 gap-10">
                        {signatures.broker && (
                            <div className="text-center">
                                <img src={signatures.broker} alt="Assinatura Corretor" className="max-h-12 mx-auto" />
                                <div className="border-t border-slate-800 mt-2 pt-1">
                                    <p className="text-xs text-slate-500">
                                        {isEn ? "Responsible Broker" : isEs ? "Corredor Responsable" : "Corretor Responsável"}
                                    </p>
                                </div>
                            </div>
                        )}
                        {signatures.client && (
                            <div className="text-center">
                                <img src={signatures.client} alt="Assinatura Cliente" className="max-h-12 mx-auto" />
                                <div className="border-t border-slate-800 mt-2 pt-1">
                                    <p className="text-xs text-slate-500">
                                        {isEn ? "Client" : isEs ? "Cliente" : "Cliente"}
                                    </p>
                                </div>
                            </div>
                        )}
                        {signatures.witness1 && (
                            <div className="text-center">
                                <img src={signatures.witness1} alt="Testemunha 1" className="max-h-12 mx-auto" />
                                <div className="border-t border-slate-800 mt-2 pt-1">
                                    <p className="text-xs text-slate-500">
                                        {isEn ? "Witness 1" : isEs ? "Testigo 1" : "Testemunha 1"}
                                    </p>
                                </div>
                            </div>
                        )}
                        {signatures.witness2 && (
                            <div className="text-center">
                                <img src={signatures.witness2} alt="Testemunha 2" className="max-h-12 mx-auto" />
                                <div className="border-t border-slate-800 mt-2 pt-1">
                                    <p className="text-xs text-slate-500">
                                        {isEn ? "Witness 2" : isEs ? "Testigo 2" : "Testemunha 2"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="mt-8 text-center text-[10px] text-slate-400 border-t pt-4">
                {isEn ? "Generated by Domvia" : isEs ? "Generado por Domvia" : "Gerado pelo Domvia"} — {new Date().toLocaleDateString(locale)} — {isEn ? "Valid upon signature of parties" : isEs ? "Válido mediante firma de las partes" : "Válido mediante assinatura das partes"}
            </div>
        </div>
    );
}

// ── Main component (used inside [docType]/page.tsx) ───────
interface DocFormClientProps {
    templateId: string;
}

export function DocFormClient({ templateId }: DocFormClientProps) {
    const template = getTemplate(templateId);

    if (!template) {
        notFound();
        return null; // Ensure we returned something
    }

    const { user } = useAuth();
    const { branding } = useBranding();
    const { t, language: lang } = useLanguage();
    const [step, setStep] = useState(0);
    const [data, setData] = useState<Record<string, string>>({
        data: new Date().toISOString().slice(0, 10),
    });
    const [signatures, setSignatures] = useState<{
        broker?: string | null; client?: string | null;
        witness1?: string | null; witness2?: string | null;
    }>({});
    const [saved, setSaved] = useState(false);
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [showWitness2, setShowWitness2] = useState(false);

    const brokerRef = useRef<SignaturePadRef>(null);
    const clientRef = useRef<SignaturePadRef>(null);
    const witness1Ref = useRef<SignaturePadRef>(null);
    const witness2Ref = useRef<SignaturePadRef>(null);

    const setValue = (k: string, v: string) => {
        setData(prev => ({ ...prev, [k]: v }));
        if (errors[k]) setErrors(prev => ({ ...prev, [k]: false }));
    };

    const handleNextStep = () => {
        const newErrors: Record<string, boolean> = {};
        template.fields.forEach(f => {
            if (f.required && !data[f.key]) {
                newErrors[f.key] = true;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            const firstErrorField = document.getElementById(`field-${Object.keys(newErrors)[0]}`);
            firstErrorField?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        setStep(1);
    };

    const brokerData = {
        name: branding.brandName || user?.name,
        creci: branding.creci,
        phone: branding.phone,
        email: branding.email,
        company: branding.company,
    };

    const docText = template.generateText(data, brokerData, lang);

    // Group fields by section
    const sections = template.fields.reduce((acc, f) => {
        const s = f.section ?? "Dados";
        if (!acc[s]) acc[s] = [];
        acc[s].push(f);
        return acc;
    }, {} as Record<string, typeof template.fields>);

    const collectSignatures = () => {
        setSignatures({
            broker: brokerRef.current?.getSignature(),
            client: clientRef.current?.getSignature(),
            witness1: witness1Ref.current?.getSignature(),
            witness2: witness2Ref.current?.getSignature(),
        });
    };

    const handlePrint = () => window.print();

    const handleDownloadPDF = async () => {
        try {
            toast.loading("Gerando PDF...");
            // @ts-ignore
            const html2pdf = (await import("html2pdf.js")).default;
            const element = document.getElementById("doc-preview");
            
            // Remove border for PDF generation specifically if needed, but styling is mostly ok
            const opt = {
                margin:       15,
                filename:     `${template.shortName.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(element).save();
            toast.dismiss();
            toast.success("PDF baixado com sucesso!");
        } catch (err) {
            console.error(err);
            toast.dismiss();
            toast.error("Erro ao gerar o PDF.");
        }
    }

    const handleShare = () => {
        const text = `📄 *${t(`docs.hub.templates.${template.id}.name`, template.name).toUpperCase()}*\n\nDocumento gerado por: *${brokerData.name || "Consultor"}*\n\nInformações do documento:\n${docText.split("\n").slice(0, 5).filter(l => l.trim().length > 0).map(l => `• ${l}`).join("\n")}\n\nEntre em contato ou solicite o arquivo em anexo para o documento na íntegra.\n\n_Gerado pelo Domvia_`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    };

    return (
        <>
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #doc-preview, #doc-preview * { visibility: visible; }
                    #doc-preview { position: fixed; top: 0; left: 0; width: 100%; padding: 32px; font-family: Georgia, serif; }
                }
            `}</style>

            <div className="max-w-5xl mx-auto space-y-6 pb-24">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/tools/docs"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
                    <div className="flex-1">
                        <h1 className="font-display text-xl font-bold text-slate-900">
                            {t(`docs.hub.templates.${template.id}.name`, template.name)}
                        </h1>
                        <p className="text-xs text-slate-500">
                            {t(`docs.hub.templates.${template.id}.desc`, template.description)}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" leftIcon={<Share2 className="h-3.5 w-3.5" />} onClick={handleShare}>WhatsApp</Button>
                        <Button variant="outline" size="sm" leftIcon={<Printer className="h-3.5 w-3.5" />} onClick={handlePrint}>Imprimir</Button>
                        <Button size="sm" leftIcon={<Download className="h-3.5 w-3.5" />} onClick={handleDownloadPDF}>Salvar PDF</Button>
                    </div>
                </div>

                <StepBar step={step} />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Left: Form / Signatures / Export */}
                    <div className="space-y-4">
                        {step === 0 && (
                            <>
                                {Object.entries(sections).map(([section, fields]) => (
                                    <Card key={section} padding="md" className="space-y-4">
                                        <h2 className="font-display font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">{section}</h2>
                                        {fields.filter(f => {
                                            if (f.key.includes("testemunha2") && !showWitness2) return false;
                                            return true;
                                        }).map(f => (
                                            <div key={f.key} id={`field-${f.key}`}>
                                                <label className={`block text-sm font-medium mb-1.5 transition-colors ${errors[f.key] ? "text-red-500" : "text-slate-700"}`}>
                                                    {t(`docs.hub.fields.${f.key}`, f.label).replace(" 1", showWitness2 ? " 1" : "")} {f.required && <span className="text-red-400">*</span>}
                                                </label>
                                                <div className={errors[f.key] ? "ring-2 ring-red-400 rounded-xl" : ""}>
                                                    {renderField(f, data[f.key] ?? "", v => setValue(f.key, v), lang)}
                                                </div>
                                                {errors[f.key] && (
                                                    <p className="text-[10px] text-red-500 mt-1 font-medium">{t("docs.field_required") || "Este campo é obrigatório"}</p>
                                                )}
                                            </div>
                                        ))}
                                        {section === "Testemunhas" && !showWitness2 && fields.some(f => f.key.includes("testemunha2")) && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full border-2 border-dashed border-slate-200 text-slate-500 hover:border-brand-300 hover:text-brand-600"
                                                onClick={() => setShowWitness2(true)}
                                                leftIcon={<PenLine className="h-3.5 w-3.5" />}
                                            >
                                                {t("docs.btn_add_witness")}
                                            </Button>
                                        )}
                                    </Card>
                                ))}
                                <Button className="w-full" rightIcon={<ChevronRight className="h-4 w-4" />} onClick={handleNextStep}>
                                    {t("docs.btn_next_sign")}
                                </Button>
                            </>
                        )}

                        {step === 1 && (
                            <Card padding="md" className="space-y-6">
                                <h2 className="font-display font-bold text-slate-800">{t("docs.sign_title")}</h2>
                                <p className="text-xs text-slate-500">{t("docs.sign_subtitle")}</p>
                                <SignaturePad ref={brokerRef} label={t("docs.sign_broker")} />
                                <SignaturePad ref={clientRef} label={t("docs.sign_client")} />
                                <SignaturePad ref={witness1Ref} label={t("docs.sign_witness1")} />
                                <SignaturePad ref={witness2Ref} label={t("docs.sign_witness2")} />
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={() => setStep(0)}>{t("common.back")}</Button>
                                    <Button className="flex-1" rightIcon={<ChevronRight className="h-4 w-4" />}
                                        onClick={() => { collectSignatures(); setStep(2); }}>
                                        {t("docs.btn_next_export")}
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {step === 2 && (
                            <Card padding="md" className="space-y-4">
                                <h2 className="font-display font-bold text-slate-800">{t("docs.export_title")}</h2>
                                <p className="text-xs text-slate-500">{t("docs.export_subtitle")}</p>
                                <div className="grid grid-cols-1 gap-3">
                                    <Button leftIcon={<Download className="h-4 w-4" />} onClick={handleDownloadPDF} className="w-full justify-center">
                                        {t("docs.btn_pdf", "Baixar PDF")}
                                    </Button>
                                    <Button variant="secondary" leftIcon={<Share2 className="h-4 w-4" />} onClick={handleShare} className="w-full justify-center">
                                        {t("docs.btn_whatsapp")}
                                    </Button>
                                    <Button variant="outline" leftIcon={<Printer className="h-4 w-4" />} onClick={handlePrint} className="w-full justify-center">
                                        {t("docs.btn_print", "Imprimir")}
                                    </Button>
                                </div>
                                <div className="flex items-start gap-2 mt-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-slate-400">{t("docs.print_tip")}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>← {t("docs.back_to_sign")}</Button>
                            </Card>
                        )}
                    </div>

                    {/* Right: A4 Preview */}
                    <div className="sticky top-20">
                        <div className="flex items-center gap-2 mb-3">
                            <FileText className="h-4 w-4 text-brand-500" />
                            <p className="text-sm font-semibold text-slate-600">{t("docs.preview")}</p>
                        </div>
                        <div className="bg-slate-200 rounded-2xl p-3 overflow-auto max-h-[75vh]">
                            <div className="bg-white shadow-2xl rounded-sm p-8 min-h-[600px]" style={{ maxWidth: 794, margin: "0 auto" }}>
                                <A4Preview
                                    text={docText}
                                    logoBase64={(user?.useLogoInDocs !== false) ? (user?.logoURL || branding.logoBase64) : undefined}
                                    brandName={branding.brandName || user?.name}
                                    creci={user?.creci || branding.creci}
                                    signatures={step === 2 ? signatures : {}}
                                    lang={lang}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
