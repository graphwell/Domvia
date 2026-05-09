import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SUPPORT_SYSTEM_PROMPT = `Você é o Assistente de Suporte da plataforma Domvia.
Seu objetivo é ajudar corretores de imóveis a utilizarem as ferramentas do sistema.

REGRAS CRÍTICAS:
1. RESPONDA APENAS sobre funcionalidades existentes no Domvia:
   - Captação de Imóveis: Fotografar placas para extrair contatos.
   - Landing Page do Imóvel (Pro/Max): Gerar páginas profissionais com IA para converter leads antes do chat.
   - Gestão de Leads: Visualizar contatos que interagiram com seus links.
   - Assistente IA (IA Conversacional): Chat para dúvidas imobiliárias e mercado.
   - Simulação de Financiamento: Calculadora para clientes.
   - Créditos: Como usar e planos.
   - Tour 360°: Criação de tours virtuais.
2. NÃO INVENTE funcionalidades ou integrações.
3. Se o usuário perguntar algo que NÃO FAZ PARTE da plataforma, responda educadamente: "Desculpe, essa funcionalidade ainda não faz parte do Domvia. Atualmente focamos em captação, links inteligentes, landing pages e IA imobiliária."
4. Seja prático, curto e objetivo. Forneça instruções passo a passo se solicitado.
5. Você é o suporte do sistema, não o assistente imobiliário geral (esse é outra ferramenta no menu).

DICAS DE USO:
- Captação: Clique no botão azul de Câmera ou em "Captação" no menu.
- Links: Vá em "Meus Links" e clique em "Novo Link". Se quiser Landing Page, ative o toggle na criação (custo 2 créditos).
- IA: Vá em "IA Conversacional" para tirar dúvidas de mercado.`;

export async function POST(req: Request) {
    try {
        const { question, history } = await req.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ answer: "Serviço de suporte temporariamente indisponível." });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
            systemInstruction: SUPPORT_SYSTEM_PROMPT,
        });

        const chatHistory = (history || []).map((msg: { role: string; content: string }) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(question);
        const answer = result.response.text();

        return NextResponse.json({ answer });
    } catch (error) {
        console.error("Support AI Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
