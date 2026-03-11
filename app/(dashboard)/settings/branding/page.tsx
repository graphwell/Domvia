"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth-provider";
import { rtdb } from "@/lib/firebase";
import { ref, update } from "firebase/database";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/hooks/use-language";
import { ChevronLeft, AppWindow, Upload, Image as ImageIcon, Trash2, CheckCircle2, Save, Info, Loader2 } from "lucide-react";
import Link from "next/link";

export default function BrandingPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const [branding, setBranding] = useState({
        logoURL: "",
        useLogoInDocs: true,
    });

    useEffect(() => {
        if (user) {
            setBranding({
                logoURL: user.logoURL || "",
                useLogoInDocs: user.useLogoInDocs !== false, // default true
            });
        }
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const userRef = ref(rtdb, `users/${user.id}`);
            await update(userRef, {
                logoURL: branding.logoURL,
                useLogoInDocs: branding.useLogoInDocs,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Error updating branding:", error);
        } finally {
            setLoading(false);
        }
    };

    const [isProcessing, setIsProcessing] = useState(false);
    const [localSuccess, setLocalSuccess] = useState(false);

    // Redimensionar imagem no lado do cliente
    const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    try {
                        const canvas = document.createElement("canvas");
                        let width = img.width;
                        let height = img.height;
                        const max_size = 800;

                        if (width > height) {
                            if (width > max_size) {
                                height *= max_size / width;
                                width = max_size;
                            }
                        } else {
                            if (height > max_size) {
                                width *= max_size / height;
                                height = max_size;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext("2d");
                        if (!ctx) {
                            reject(new Error("Não foi possível obter o contexto do canvas"));
                            return;
                        }
                        ctx.drawImage(img, 0, 0, width, height);
                        resolve(canvas.toDataURL("image/webp", 0.8));
                    } catch (err) {
                        reject(err);
                    }
                };
                img.onerror = () => reject(new Error("Erro ao carregar imagem"));
                img.src = e.target?.result as string;
            };
            reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
            reader.readAsDataURL(file);
        });
    };

    // Handle file upload
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        setLocalSuccess(false);
        try {
            if (file.type === "image/svg+xml") {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result as string;
                    setBranding(prev => ({ ...prev, logoURL: result }));
                    setIsProcessing(false);
                    setLocalSuccess(true);
                    setTimeout(() => setLocalSuccess(false), 3000);
                };
                reader.readAsDataURL(file);
            } else {
                const resized = await resizeImage(file);
                if (resized) {
                    setBranding(prev => ({ ...prev, logoURL: resized }));
                    setIsProcessing(false);
                    setLocalSuccess(true);
                    setTimeout(() => setLocalSuccess(false), 3000);
                } else {
                    throw new Error("Falha ao redimensionar");
                }
            }
        } catch (err) {
            console.error("Erro ao processar imagem:", err);
            alert("Ocorreu um erro ao processar sua imagem. Tente uma foto diferente.");
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <Link href="/settings" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group">
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                {t("common.back", "Voltar")}
            </Link>

            <div className="flex items-center gap-4">
                <div className="bg-purple-50 p-3 rounded-2xl">
                    <AppWindow className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 font-display">{t("settings.items.branding.label", "Identidade Visual")}</h1>
                    <p className="text-slate-500">{t("settings.items.branding.desc", "Personalize documentos e links com sua marca")}</p>
                </div>
            </div>

            <Card className="p-8 space-y-8">
                {/* Logo Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-slate-400" />
                            Sua Logomarca
                        </label>
                        {branding.logoURL && (
                            <button
                                onClick={() => setBranding({ ...branding, logoURL: "" })}
                                className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Remover
                            </button>
                        )}
                    </div>

                    <div className="relative group">
                        <input
                            type="file"
                            id="logo-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        {isProcessing ? (
                            <div className="h-48 w-full bg-slate-50 border-2 border-dashed border-purple-200 rounded-2xl flex flex-col items-center justify-center gap-3 animate-pulse">
                                <div className="p-4 bg-purple-100 rounded-full">
                                    <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-sm font-bold text-purple-700">Processando...</p>
                                    <p className="text-xs text-purple-500 mt-1">Aguarde, nosso sistema está preparando seu arquivo...</p>
                                </div>
                            </div>
                        ) : localSuccess ? (
                            <div className="h-48 w-full bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-2xl flex flex-col items-center justify-center gap-3 animate-in zoom-in-95 duration-300">
                                <div className="p-4 bg-white rounded-full shadow-sm text-emerald-500">
                                    <CheckCircle2 className="h-8 w-8" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-emerald-700">Pronto!</p>
                                    <p className="text-xs text-emerald-600 mt-1">Sua logo foi ajustada com sucesso.</p>
                                </div>
                            </div>
                        ) : branding.logoURL ? (
                            <div className="h-48 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center p-8 group-hover:border-purple-300 transition-colors">
                                <img src={branding.logoURL} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                    <label htmlFor="logo-upload" className="cursor-pointer">
                                        <Button asChild variant="secondary" size="sm">
                                            <span className="flex items-center gap-2">
                                                <Upload className="h-4 w-4" />
                                                Trocar Logo
                                            </span>
                                        </Button>
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <label
                                htmlFor="logo-upload"
                                className="h-48 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-slate-100 hover:border-purple-300 transition-all group cursor-pointer"
                            >
                                <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                    <Upload className="h-6 w-6 text-slate-400" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-slate-600">Clique para enviar sua logo</p>
                                    <p className="text-xs text-slate-400 mt-1">Qualquer tamanho - Ajustamos para você!</p>
                                </div>
                            </label>
                        )}
                    </div>
                </div>

                <hr className="border-slate-100" />

                {/* Preference Toggle */}
                <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <input
                            type="checkbox"
                            id="useLogo"
                            className="mt-1 h-5 w-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                            checked={branding.useLogoInDocs}
                            onChange={(e) => setBranding({ ...branding, useLogoInDocs: e.target.checked })}
                        />
                        <div className="flex-1 cursor-pointer select-none" onClick={() => setBranding({ ...branding, useLogoInDocs: !branding.useLogoInDocs })}>
                            <label htmlFor="useLogo" className="block text-sm font-bold text-slate-900 cursor-pointer">
                                Usar minha logomarca nos documentos gerados
                            </label>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                Se ativado, sua logo aparecerá no cabeçalho de todos os documentos (Recibos, Autorizações, etc) e na página de login dos seus leads.
                            </p>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handleSave}
                    loading={loading}
                    className="w-full py-6 text-lg font-bold gap-2"
                    leftIcon={saved ? <CheckCircle2 className="h-5 w-5" /> : <Save className="h-5 w-5" />}
                >
                    {saved ? t("common.saved", "Salvo!") : t("common.save", "Salvar Preferências")}
                </Button>
            </Card>
        </div>
    );
}
