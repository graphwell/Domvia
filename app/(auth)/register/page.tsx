"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/auth-provider";
import { useLanguage } from "@/hooks/use-language";

const GoogleLogo = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { loginWithGoogle, registerWithEmail } = useAuth();
    const { t } = useLanguage();

    const handleGoogleLogin = async () => {
        if (!acceptedTerms) {
            toast.error(t("auth.errors.terms_required"));
            return;
        }
        setLoading(true);
        try {
            await loginWithGoogle();
        } catch (error) {
            setLoading(false);
        }
    };

    const handleEmailRegister = async () => {
        if (!acceptedTerms) {
            toast.error(t("auth.errors.terms_required"));
            return;
        }
        if (!name || !email || !password) {
            toast.error(t("auth.errors.fields_required"));
            return;
        }
        setLoading(true);
        try {
            await registerWithEmail(email, password, name);
        } catch (error: any) {
            console.error("Register failed:", error);
            toast.error(t("auth.errors.register_failed"));
            setLoading(false);
        }
    };

    const perks = [
        { label: t("auth.perks.trial"), active: true },
        { label: t("auth.perks.tour"), active: true },
        { label: t("auth.perks.no_card"), active: true }
    ];

    return (
        <div className="glass-dark rounded-3xl p-8 border border-white/10 shadow-2xl w-full max-w-md animate-fade-in">
            {/* Logo */}
            <div className="text-center mb-8">
                <Link href="/" className="inline-block group mb-6">
                    <div className="relative h-14 w-52 md:h-20 md:w-64 mx-auto">
                        <Image
                            src="/logo-domvia.png?v=202603092100"
                            alt="Domvia Logo"
                            fill
                            className="object-contain brightness-0 invert"
                            priority
                            unoptimized
                        />
                    </div>
                </Link>
                <h1 className="mt-6 font-display text-2xl font-bold text-white">{t("auth.create_free")}</h1>
                <p className="text-slate-400 text-sm mt-1">{t("auth.start_capturing")}</p>

                <div className="flex justify-center flex-wrap gap-4 mt-4">
                    {perks.map((perk) => (
                        <div key={perk.label} className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-1.5 opacity-80">
                            <span className="h-1 w-1 bg-emerald-400 rounded-full" />
                            {perk.label}
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <Button
                    onClick={handleGoogleLogin}
                    loading={loading}
                    className="w-full h-12 flex items-center justify-center gap-3 bg-white text-slate-800 hover:bg-slate-50 border-none shadow-xl transition-all hover:scale-[1.01]"
                >
                    <GoogleLogo />
                    <span className="font-semibold">{t("auth.google_register")}</span>
                </Button>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-[10px] tracking-widest uppercase">
                        <span className="bg-[#0f172a] px-3 text-slate-500 font-bold">{t("auth.or_email")}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t("auth.name_placeholder")}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500/50 outline-none transition-all"
                    />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t("auth.email_placeholder")}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500/50 outline-none transition-all"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t("auth.password_placeholder")}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500/50 outline-none transition-all"
                    />
                    <Button onClick={handleEmailRegister} loading={loading} className="w-full h-12">
                        {t("auth.register_btn")}
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>

                <label className="flex items-start gap-2 pt-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-0.5 min-w-3 min-h-3 accent-brand-500 rounded border-slate-600 focus:ring-brand-500 transition-all cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 leading-tight group-hover:text-slate-300 transition-colors">
                        Declaro que li e concordo com os <span className="underline text-brand-400">Termos de Uso</span> e estou ciente da <span className="underline text-brand-400">Política de Privacidade</span>, incluindo o tratamento de dados conforme a LGPD.
                    </p>
                </label>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
                <p className="text-center text-sm text-slate-400">
                    {t("auth.footer_login")}{" "}
                    <Link href="/login" className="text-brand-400 font-bold hover:text-brand-300">{t("auth.login")}</Link>
                </p>
            </div>
        </div>
    );
}
