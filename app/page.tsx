import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
/**
 * ============================================================
 * DOMVIA — Ecossistema Inteligente para o Mercado Imobiliário
 * ============================================================
 * Produto Original: Domvia
 * Autor: Francisco Einstein Albuquerque Barbosa
 * Empresa: Somar.IA
 * País de Origem: Brasil — Fortaleza, Ceará
 * Ano de Criação: 2026
 *
 * Módulos Proprietários:
 * - Smart Capture (Visão-Laser Multi-Placas com GenAI)
 * - Detetive de CRECI (Visão de Parceria)
 * - Extrator de Ficha Técnica via OCR
 * - Auto GPS Traduzido via OpenStreetMap
 * - Hub de Campanhas & Links Inteligentes
 * - Gerador de Copys Imobiliários por IA
 * - Smart CRM com Chatbot de Qualificação Financeira
 * - Gerador Unificado de Documentos Oficiais
 * - Assinatura Digital com Signature Pad
 * - Motor de Governança com Credits Wallet
 *
 * Todos os direitos reservados.
 * A reprodução parcial ou total deste sistema,
 * sua arquitetura, fluxos ou nomenclaturas proprietárias
 * sem autorização expressa é vedada.
 *
 * All rights reserved. Unauthorized reproduction prohibited.
 * ============================================================
 */
import { HeroSection } from "@/components/landing/HeroSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ToolsSection } from "@/components/landing/ToolsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { CTASection } from "@/components/landing/CTASection";
import { PLANS } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Domvia — Plataforma de IA para Corretores de Imóveis",
  description:
    "Link inteligente por imóvel com IA conversacional 24h, captação automática de leads, calculadora de financiamento e ferramentas de IA para corretores e imobiliárias.",
};


export default function Home() {
  return (
    <>
      <Header />
      <main className="space-y-0">
        <HeroSection />
        <BenefitsSection />
        <HowItWorksSection />
        <ToolsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
