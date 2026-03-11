"use client";

import { useLanguage } from "@/hooks/use-language";
import { Globe, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const LANGUAGES = [
    { code: "pt", label: "Português", flag: "🇧🇷" },
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "es", label: "Español", flag: "🇪🇸" },
];

export function LanguageSelector({ variant = "default" }: { variant?: "default" | "minimal" | "dark" }) {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl transition-all font-medium text-sm",
                    variant === "dark"
                        ? "text-white hover:bg-white/10"
                        : "text-slate-600 hover:bg-slate-100"
                )}
            >
                <span className="text-base leading-none">{currentLang.flag}</span>
                {variant !== "minimal" && <span>{currentLang.label}</span>}
                <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className={cn(
                    "absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200",
                    variant === "dark"
                        ? "bg-slate-900 border-white/10 text-white"
                        : "bg-white border-slate-100 text-slate-900"
                )}>
                    <div className="p-1.5 space-y-1">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code as any);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                                    language === lang.code
                                        ? (variant === "dark" ? "bg-white/10 text-white" : "bg-brand-50 text-brand-700")
                                        : (variant === "dark" ? "hover:bg-white/5 text-slate-300" : "hover:bg-slate-50 text-slate-600")
                                )}
                            >
                                <span className="text-lg leading-none">{lang.flag}</span>
                                {lang.label}
                                {language === lang.code && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
