"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/auth-provider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/hooks/use-language";
import { ChevronLeft, Bell, Smartphone, Mail, Globe, Save, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const [prefs, setPrefs] = useState({
        leads: true,
        credits: true,
        system: false,
        emailSummary: true,
    });

    const handleSave = () => {
        setLoading(true);
        // Simulate save
        setTimeout(() => {
            setLoading(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }, 1000);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <Link href="/settings" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group">
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                {t("common.back", "Voltar")}
            </Link>

            <div className="flex items-center gap-4">
                <div className="bg-amber-50 p-3 rounded-2xl">
                    <Bell className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 font-display">{t("settings.items.notifications.label", "Notificações")}</h1>
                    <p className="text-slate-500">{t("settings.items.notifications.desc", "Ajuste como você quer ser avisado")}</p>
                </div>
            </div>

            <Card className="p-8 space-y-8">
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Alertas na Plataforma
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                                <p className="text-sm font-bold text-slate-900">Novos Leads</p>
                                <p className="text-xs text-slate-500">Notificar quando um cliente entrar pelo seu link</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={prefs.leads}
                                onChange={(e) => setPrefs({ ...prefs, leads: e.target.checked })}
                                className="h-6 w-11 rounded-full bg-slate-200 border-none appearance-none cursor-pointer checked:bg-amber-500 transition-colors relative after:content-[''] after:absolute after:h-4 after:w-4 after:bg-white after:rounded-full after:top-1 after:left-1 checked:after:left-6 after:transition-all"
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                                <p className="text-sm font-bold text-slate-900">Uso de Créditos</p>
                                <p className="text-xs text-slate-500">Avisar quando créditos forem consumidos ou ganhos</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={prefs.credits}
                                onChange={(e) => setPrefs({ ...prefs, credits: e.target.checked })}
                                className="h-6 w-11 rounded-full bg-slate-200 border-none appearance-none cursor-pointer checked:bg-amber-500 transition-colors relative after:content-[''] after:absolute after:h-4 after:w-4 after:bg-white after:rounded-full after:top-1 after:left-1 checked:after:left-6 after:transition-all"
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 opacity-50">
                            <div>
                                <p className="text-sm font-bold text-slate-900 italic">Notícias e Novidades</p>
                                <p className="text-xs text-slate-500">Avisos sobre novas ferramentas (Desativado)</p>
                            </div>
                            <input
                                type="checkbox"
                                disabled
                                className="h-6 w-11 rounded-full bg-slate-200 border-none appearance-none cursor-not-allowed relative after:content-[''] after:absolute after:h-4 after:w-4 after:bg-white after:rounded-full after:top-1 after:left-1"
                            />
                        </div>
                    </div>
                </div>

                <hr className="border-slate-100" />

                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Comunicações por E-mail
                    </h3>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                            <p className="text-sm font-bold text-slate-900">Resumo Semanal</p>
                            <p className="text-xs text-slate-500">Receba estatísticas dos seus imóveis no e-mail</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={prefs.emailSummary}
                            onChange={(e) => setPrefs({ ...prefs, emailSummary: e.target.checked })}
                            className="h-6 w-11 rounded-full bg-slate-200 border-none appearance-none cursor-pointer checked:bg-brand-600 transition-colors relative after:content-[''] after:absolute after:h-4 after:w-4 after:bg-white after:rounded-full after:top-1 after:left-1 checked:after:left-6 after:transition-all"
                        />
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
