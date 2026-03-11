"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth-provider";
import { createSuggestion } from "@/lib/suggestions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/hooks/use-language";
import { ChevronLeft, MessageSquare, Send, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function SuggestionsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: "",
        category: "suggestion" as any,
        description: "",
        priority: "medium" as any,
        city: "",
        phone: "",
        country: "",
        allowReply: true,
    });

    useEffect(() => {
        // Auto-detect country/language context
        const browserLang = navigator.language;
        if (browserLang.includes("-")) {
            setForm(prev => ({ ...prev, country: browserLang.split("-")[1] }));
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            await createSuggestion({
                userId: user.id,
                userEmail: user.email || "anon",
                title: form.title,
                category: form.category === "suggestion" ? "improvement" : form.category,
                description: form.description,
                priority: form.priority,
                city: form.city,
                phone: form.phone,
                country: form.country,
                allowReply: form.allowReply,
            });
            setSuccess(true);
            setTimeout(() => {
                router.push("/settings");
            }, 3000);
        } catch (err) {
            console.error(err);
            setError(t("common.error"));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-2xl mx-auto py-12 text-center animate-fade-in">
                <div className="bg-emerald-50 h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 font-display">{t("settings.items.suggestions.success_title")}</h2>
                <p className="text-slate-500 mt-2">{t("settings.items.suggestions.success_desc")}</p>
                <div className="mt-8">
                    <Link href="/settings">
                        <Button variant="secondary" className="gap-2">
                            <ChevronLeft className="h-4 w-4" />
                            {t("common.back")}
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <Link href="/settings" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group">
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                {t("common.back")}
            </Link>

            <div className="flex items-center gap-4">
                <div className="bg-brand-50 p-3 rounded-2xl">
                    <MessageSquare className="h-6 w-6 text-brand-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 font-display">{t("settings.items.suggestions.label")}</h1>
                    <p className="text-slate-500">{t("settings.items.suggestions.desc")}</p>
                </div>
            </div>

            <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">{t("settings.items.suggestions.title_label")}</label>
                        <input
                            required
                            type="text"
                            placeholder="Ex: Novo campo no Gerador de Documentos"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all font-medium"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">{t("settings.items.suggestions.category_label")}</label>
                            <select
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all font-medium"
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                            >
                                <option value="suggestion">💡 {t("settings.items.suggestions.category_label")}</option>
                                <option value="improvement">⚙️ {t("settings.items.suggestions.improvement_label") || "Melhoria"}</option>
                                <option value="bug">🐛 {t("settings.items.suggestions.bug_label") || "Bug"}</option>
                                <option value="feature">🚀 {t("settings.items.suggestions.feature_label") || "Nova Funcionalidade"}</option>
                                <option value="other">💬 {t("settings.items.suggestions.other_label") || "Outro"}</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">{t("settings.items.suggestions.priority_label")}</label>
                            <select
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all font-medium"
                                value={form.priority}
                                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                            >
                                <option value="low">Baixa</option>
                                <option value="medium">Média</option>
                                <option value="high">Alta</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <input
                            type="checkbox"
                            id="allowReply"
                            className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                            checked={form.allowReply}
                            onChange={(e) => setForm({ ...form, allowReply: e.target.checked })}
                        />
                        <label htmlFor="allowReply" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                            {t("settings.items.suggestions.allow_reply", "Permitir réplica (Autorizo o time Somar a me contatar sobre este feedback)")}
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">{t("settings.items.suggestions.city")}</label>
                            <input
                                type="text"
                                placeholder="Cidade - UF"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all font-medium"
                                value={form.city}
                                onChange={(e) => setForm({ ...form, city: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">{t("settings.items.suggestions.phone")}</label>
                            <input
                                type="tel"
                                placeholder="+55 (00) 00000-0000"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all font-medium"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">{t("settings.items.suggestions.desc_label")}</label>
                        <textarea
                            required
                            rows={5}
                            placeholder="..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all font-medium resize-none"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                        <p className="text-[10px] text-slate-400 italic mt-1 leading-tight">
                            {t("settings.items.suggestions.location_info")}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 animate-shake">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p className="text-sm font-bold">{error}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        loading={loading}
                        className="w-full py-6 text-lg font-bold gap-2"
                    >
                        <Send className="h-5 w-5" />
                        {t("settings.items.suggestions.btn_send")}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
