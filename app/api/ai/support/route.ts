import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

const SUPPORT_SYSTEM_PROMPT = `Você é o Assistente de Suporte da plataforma Domvia.

FORMATO OBRIGATÓRIO — sem exceções:
- Máximo 3 frases por resposta.
- NUNCA use introduções ("Claro!", "Ótima pergunta!", "Com certeza!").
- NUNCA use despedidas ou fechamentos ("Espero ter ajudado!", "Qualquer dúvida...").
- Direto ao ponto. Se for passo a passo, use no máximo 3 itens curtos.

ESCOPO — responda APENAS sobre o Domvia:
- Captação: fotografar placas para extrair contatos (botão de câmera).
- Links Inteligentes: "Meus Links" → "Novo Link". Landing Page custa 2 créditos.
- Leads: contatos que interagiram com seus links.
- IA Conversacional: chat de dúvidas imobiliárias (menu lateral).
- Simulação de Financiamento: calculadora para clientes.
- Créditos: moeda do sistema para usar as ferramentas.
- Tour 360°: criação de tours virtuais.

Se a pergunta estiver fora do escopo, responda apenas: "Essa funcionalidade não faz parte do Domvia ainda."
Não invente funcionalidades.`;

export async function POST(req: Request) {
    try {
        const { question, history } = await req.json();

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ answer: "Serviço de suporte temporariamente indisponível." });
        }

        const client = new Groq({ apiKey });

        const messages: Groq.Chat.ChatCompletionMessageParam[] = [
            { role: "system", content: SUPPORT_SYSTEM_PROMPT },
            ...(history || []).map((msg: { role: string; content: string }) => ({
                role: msg.role === "assistant" ? "assistant" as const : "user" as const,
                content: msg.content,
            })),
            { role: "user", content: question },
        ];

        const response = await client.chat.completions.create({
            model: MODEL,
            messages,
            max_tokens: 200,
            temperature: 0.3,
        });

        const answer = response.choices[0]?.message?.content ?? "";
        return NextResponse.json({ answer });
    } catch (error) {
        console.error("Support AI Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
