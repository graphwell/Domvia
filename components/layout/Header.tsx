"use client";

import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/auth-provider";

// ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────
//  Domvia Logo — Image Version
// ─────────────────────────────────────────────────────────────────
export function DomviaLogo({ collapsed = false, dark = false }: { collapsed?: boolean; dark?: boolean }) {
    const timestamp = "202603092100"; // Novo timestamp pós-crop

    if (collapsed) {
        return (
            <Link href="/" className="flex items-center group select-none relative h-8 w-8">
                <Image
                    src={`/icon.png?v=${timestamp}`}
                    alt="Domvia Icon"
                    fill
                    unoptimized
                    className="object-contain transition-transform duration-200 group-hover:scale-105"
                />
            </Link>
        );
    }

    return (
        <Link href="/" className="flex items-center group select-none relative h-10 w-40 md:h-14 md:w-56">
            <Image
                src={`/logo-domvia.png?v=${timestamp}`}
                alt="Domvia Logo"
                fill
                priority
                unoptimized
                className={cn(
                    "object-contain object-left transition-transform duration-200 group-hover:opacity-90",
                    dark && "brightness-0 invert"
                )}
            />
        </Link>
    );
}

// ─────────────────────────────────────────────────────────────────
//  Public site Header
// ─────────────────────────────────────────────────────────────────
export function Header() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const { t } = useLanguage();

    const navLinks = [
        { label: t("nav.benefits") || "Benefícios", href: "#beneficios" },
        { label: t("nav.how_it_works") || "Como Funciona", href: "#como-funciona" },
        { label: t("nav.tools") || "Ferramentas", href: "#ferramentas" },
        { label: t("nav.plans") || "Planos", href: "#planos" },
        { label: t("nav.help") || "Ajuda", href: "/help" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full glass border-b border-slate-200/60">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <DomviaLogo />

                    <nav className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center gap-3">
                        <LanguageSelector variant="minimal" />
                        <div className="h-4 w-px bg-slate-200 mx-1" />
                        <Link href="/login"><Button variant="ghost" size="sm">{t("auth.login") || "Entrar"}</Button></Link>
                        <Link href="/register"><Button size="sm">{t("auth.start_free") || "Começar Grátis"}</Button></Link>
                    </div>

                    <button
                        className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                        onClick={() => setOpen(!open)}
                        aria-label="Toggle menu"
                    >
                        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {open && (
                <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-fade-in">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="block text-sm font-medium text-slate-700 py-2 hover:text-brand-600"
                            onClick={() => setOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {user && (
                        <Link
                            href="/convite"
                            className="block text-sm font-bold text-brand-600 py-2"
                            onClick={() => setOpen(false)}
                        >
                            {t("nav.invite") || "Convidar Corretores"}
                        </Link>
                    )}
                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                        <div className="flex justify-center py-2">
                            <LanguageSelector />
                        </div>
                        <Link href="/login" className="w-full">
                            <Button variant="outline" size="md" className="w-full">{t("auth.login") || "Entrar"}</Button>
                        </Link>
                        <Link href="/register" className="w-full">
                            <Button size="md" className="w-full">{t("auth.start_free") || "Começar Grátis"}</Button>
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
