"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth-provider";
import { rtdb } from "@/lib/firebase";
import { ref, update } from "firebase/database";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/hooks/use-language";
import { ChevronLeft, User, Mail, Phone, Hash, Save, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        creci: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                creci: user.creci || "",
            });
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            const userRef = ref(rtdb, `users/${user.id}`);
            await update(userRef, {
                name: formData.name,
                phone: formData.phone,
                creci: formData.creci,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <Link href="/settings" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group">
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                {t("common.back", "Voltar")}
            </Link>

            <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-2xl">
                    <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 font-display">{t("settings.items.profile.label", "Meu Perfil")}</h1>
                    <p className="text-slate-500">{t("settings.items.profile.desc", "Gerencie suas informações de contato")}</p>
                </div>
            </div>

            <Card className="p-8">
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1 flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            {t("auth.name", "Nome Completo")}
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="Seu nome"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* Email (Read Only) */}
                    <div className="space-y-2 opacity-70">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1 flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            Email
                        </label>
                        <input
                            disabled
                            type="email"
                            className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-medium cursor-not-allowed"
                            value={formData.email}
                        />
                        <p className="text-[10px] text-slate-500 italic ml-1">O email não pode ser alterado pois está vinculado ao seu login Google.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1 flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-slate-400" />
                                {t("common.phone", "Telefone/WhatsApp")}
                            </label>
                            <input
                                type="tel"
                                placeholder="(00) 00000-0000"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        {/* CRECI */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1 flex items-center gap-2">
                                <Hash className="h-3.5 w-3.5 text-slate-400" />
                                CRECI
                            </label>
                            <input
                                type="text"
                                placeholder="00000-F"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                                value={formData.creci}
                                onChange={(e) => setFormData({ ...formData, creci: e.target.value })}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        loading={loading}
                        className="w-full py-6 text-lg font-bold gap-2"
                        leftIcon={saved ? <CheckCircle2 className="h-5 w-5" /> : <Save className="h-5 w-5" />}
                    >
                        {saved ? t("common.saved", "Salvo!") : t("common.save", "Salvar Alterações")}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
