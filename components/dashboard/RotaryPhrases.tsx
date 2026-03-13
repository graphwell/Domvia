"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";

const PHRASES_PT = [
  "Capture imóveis apenas fotografando placas",
  "Crie links inteligentes para captar clientes",
  "Gere simulações de financiamento em segundos",
  "Tire dúvidas com o assistente IA imobiliário",
  "Transforme placas de imóveis em novos clientes",
];

const PHRASES_EN = [
  "Capture properties just by photographing signs",
  "Create smart links to capture clients",
  "Generate financing simulations in seconds",
  "Get answers from the AI real estate assistant",
  "Turn property signs into new clients",
];

const PHRASES_ES = [
  "Captura inmuebles solo fotografiando carteles",
  "Crea enlaces inteligentes para captar clientes",
  "Genera simulaciones de financiación em segundos",
  "Resuelve dudas con el asistente de IA inmobiliaria",
  "Convierte carteles de inmuebles en nuevos clientes",
];

export function RotaryPhrases() {
  const { language } = useLanguage();
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const phrases = language === "en" ? PHRASES_EN : language === "es" ? PHRASES_ES : PHRASES_PT;

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % phrases.length);
        setIsVisible(true);
      }, 500); // Transition time
    }, 4000); // Display time

    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <div className="h-8 flex items-center justify-center overflow-hidden">
      <p
        className={cn(
          "text-sm font-medium text-slate-500 transition-all duration-500 text-center animate-fade-in",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}
      >
        {phrases[index]}
      </p>
    </div>
  );
}
