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
        const hasKey = !!process.env.GROQ_API_KEY;
        const keyPrefix = process.env.GROQ_API_KEY?.substring(0, 8) || "NÃO DEFINIDA";
        const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

        console.log(`[AI Chat] GROQ_API_KEY presente: ${hasKey}, prefixo: ${keyPrefix}, modelo: ${model}`);

        if (!hasKey) {
            return NextResponse.json({
                error: "GROQ_API_KEY não está configurada no servidor",
                debug: { hasKey, keyPrefix, model }
            }, { status: 500 });
        }

        const { question, brokerName, history, language } = await req.json();

        if (!question) {
            return NextResponse.json({ error: "Pergunta não enviada" }, { status: 400 });
        }

        const historyLen = (history ?? []).length;
        console.log(`[AI Chat] Pergunta recebida: "${question.substring(0, 50)}...", histórico: ${historyLen} msgs`);

        // After 4 exchanges (8 history items = 4 user + 4 assistant), close the session
        const MAX_EXCHANGES = 4;
        if (historyLen >= MAX_EXCHANGES * 2) {
            const broker = brokerName ?? "seu corretor";
            const closing: Record<string, string> = {
                pt: `Foi um prazer conversar! Para dar o próximo passo, fale diretamente com **${broker}** — clique em "Falar com o Corretor". 😊`,
                en: `Great talking with you! To move forward, speak directly with **${broker}** — click "Talk to the Realtor". 😊`,
                es: `¡Un placer conversar! Para avanzar, hable directamente con **${broker}** — haga clic en "Hablar con el Corredor". 😊`,
            };
            const lang = (language ?? "pt") as string;
            return NextResponse.json({
                answer: closing[lang] ?? closing.pt,
                sessionEnded: true,
            });
        }

        const answer = await getRealEstateChatResponse(
            question,
            brokerName ?? "seu corretor",
            history ?? [],
            language ?? "pt"
        );

        return NextResponse.json({ answer, turnsLeft: MAX_EXCHANGES - Math.floor(historyLen / 2) - 1 });
    } catch (error: any) {
        console.error("[AI Chat] ERRO DETALHADO:", error?.message, error?.stack);
        return NextResponse.json({ 
            error: "Erro no servidor de IA",
            detail: error?.message || String(error),
        }, { status: 500 });
    }
}
