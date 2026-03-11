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
import { NextRequest, NextResponse } from "next/server";
import { getRealEstateChatResponse } from "@/lib/ai";

export async function POST(req: NextRequest) {
    try {
        const { question, brokerName, history, language } = await req.json();

        if (!question) {
            return NextResponse.json({ error: "Missing question" }, { status: 400 });
        }

        const answer = await getRealEstateChatResponse(
            question,
            brokerName ?? "seu corretor",
            history ?? [],
            language ?? "pt"
        );

        return NextResponse.json({ answer });
    } catch (error) {
        console.error("AI chat error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
