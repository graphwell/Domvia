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
        // Diagnóstico: verificar se a chave está configurada
        const hasKey = !!process.env.GEMINI_API_KEY;
        const keyPrefix = process.env.GEMINI_API_KEY?.substring(0, 8) || "NÃO DEFINIDA";
        const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

        console.log(`[AI Chat] GEMINI_API_KEY presente: ${hasKey}, prefixo: ${keyPrefix}, modelo: ${model}`);

        if (!hasKey) {
            return NextResponse.json({ 
                error: "GEMINI_API_KEY não está configurada no servidor",
                debug: { hasKey, keyPrefix, model }
            }, { status: 500 });
        }

        const { question, brokerName, history, language } = await req.json();

        if (!question) {
            return NextResponse.json({ error: "Pergunta não enviada" }, { status: 400 });
        }

        console.log(`[AI Chat] Pergunta recebida: "${question.substring(0, 50)}...", histórico: ${(history || []).length} msgs`);

        const answer = await getRealEstateChatResponse(
            question,
            brokerName ?? "seu corretor",
            history ?? [],
            language ?? "pt"
        );

        return NextResponse.json({ answer });
    } catch (error: any) {
        console.error("[AI Chat] ERRO DETALHADO:", error?.message, error?.stack);
        return NextResponse.json({ 
            error: "Erro no servidor de IA",
            detail: error?.message || String(error),
        }, { status: 500 });
    }
}
