"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";

const PHRASES_PT = [
  "Capture imóveis || apenas fotografando placas",
  "Crie links inteligentes || para captar clientes",
  "Gere simulações || de financiamento em segundos",
  "Tire dúvidas || com o assistente IA imobiliário",
  "Venda mais || enquanto você dorme",
];

const PHRASES_EN = [
  "Capture properties || just by photographing signs",
  "Create smart links || to capture clients",
  "Generate financing || simulations in seconds",
  "Get answers || from the AI assistant",
  "Sell more || while you sleep",
];

const PHRASES_ES = [
  "Captura inmuebles || solo fotografiando carteles",
  "Crea enlaces inteligentes || para captar clientes",
  "Genera simulaciones || de financiación em segundos",
  "Resuelve dudas || con el asistente de IA",
  "Venda más || mientras usted duerme",
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

  const currentPhrase = phrases[index];
  const [part1, part2] = currentPhrase.split(" || ");

  return (
    <div className="h-16 flex items-center justify-center overflow-hidden">
      <h2
        className={cn(
          "text-lg sm:text-2xl font-black transition-all duration-700 text-center tracking-tight leading-tight",
          isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
        )}
      >
        <span className="text-slate-800">{part1} </span>
        {part2 && <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">{part2}</span>}
      </h2>
    </div>
  );
}
