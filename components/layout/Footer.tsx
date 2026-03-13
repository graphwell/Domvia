"use client";
import { Mail, Phone, Instagram, Facebook } from "lucide-react";
import Link from "next/link";
import { DomviaLogo } from "@/components/layout/Header";
import { useLanguage } from "@/hooks/use-language";

export function Footer() {
    const { t } = useLanguage();

    const platformLinks = t("footer.platform_links") || [];
    const plansLinks = t("footer.plans_links") || [];

    return (
        <footer className="bg-surface-900 text-slate-300">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4">
                        <DomviaLogo dark />
                        <p className="text-sm text-slate-400 leading-relaxed">
                            {t("footer.tagline") || "Plataforma de IA para corretores de imóveis que querem vender mais, atender melhor e perder menos tempo."}
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                <Instagram className="h-4 w-4" />
                            </a>
                            <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                <Facebook className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Platform */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">{t("footer.platform") || "Plataforma"}</h4>
                        <ul className="space-y-2 text-sm">
                            {platformLinks.map((item: string) => (
                                <li key={item}>
                                    <Link href="#" className="text-slate-400 hover:text-white transition-colors">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Plans */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">{t("footer.plans") || "Planos"}</h4>
                        <ul className="space-y-2 text-sm">
                            {plansLinks.map((item: string) => (
                                <li key={item}>
                                    <Link href="#" className="text-slate-400 hover:text-white transition-colors">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">{t("footer.contact") || "Contato"}</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-2 text-slate-400">
                                <Mail className="h-4 w-4 text-brand-400 shrink-0" />
                                somarsuporte@gmail.com
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>© 2026 Domvia. {t("footer.rights") || "Todos os direitos reservados."}</p>
                    <p className="text-slate-600">{t("footer.developed_by") || "Desenvolvido por Somar.IA"}</p>
                    <div className="flex gap-4">
                        <Link href="#" className="hover:text-slate-300 transition-colors">{t("footer.privacy") || "Privacidade"}</Link>
                        <Link href="#" className="hover:text-slate-300 transition-colors">{t("footer.terms") || "Termos de Uso"}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
