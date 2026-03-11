"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import pt from "../locales/pt.json";
import en from "../locales/en.json";
import es from "../locales/es.json";

type Language = "pt" | "en" | "es";

const translations: Record<Language, any> = { pt, en, es };

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, defaultValue?: string) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("pt");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Load from localStorage
        const savedLang = localStorage.getItem("domvia-lang") as Language;
        if (savedLang && translations[savedLang]) {
            setLanguageState(savedLang);
        } else {
            // Auto-detect browser language
            const browserLang = navigator.language.split("-")[0];
            if (browserLang === "en") setLanguageState("en");
            else if (browserLang === "es") setLanguageState("es");
            else setLanguageState("pt");
        }
        setMounted(true);
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("domvia-lang", lang);
        // We could also sync with Firebase here if the user is authenticated
    };

    const t = (key: string, defaultValue?: string) => {
        const keys = key.split(".");
        let value = translations[language];
        for (const k of keys) {
            value = value?.[k];
        }
        return value || defaultValue || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {mounted ? children : <div className="hidden">{children}</div>}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
