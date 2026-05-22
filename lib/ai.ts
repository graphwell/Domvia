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
 * Todos os direitos reservados.
 * ============================================================
 */
// ──────────────────────────────────────────────────────────────
//  AI Wrapper — Groq (llama-3.3-70b-versatile)
//  Agente especialista em financiamento imobiliário no Brasil
// ──────────────────────────────────────────────────────────────

import Groq from "groq-sdk";

export interface ChatTurn {
    role: "user" | "assistant";
    content: string;
}

const MODEL        = process.env.GROQ_MODEL        ?? "llama-3.3-70b-versatile";
const VISION_MODEL = process.env.GROQ_VISION_MODEL ?? "meta-llama/llama-4-scout-17b-16e-instruct";

function getClient() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY não definida em .env.local");
    return new Groq({ apiKey });
}

// ── Prompt do Agente Imobiliário ──────────────
function buildSystemPrompt(brokerName: string, language: string = "pt") {
    const langNames: Record<string, string> = {
        pt: "Português",
        en: "English",
        es: "Español",
    };
    const targetLang = langNames[language] || "Português";

    return `Você é um assistente especialista em financiamento imobiliário no Brasil, integrado à plataforma Domvia.
Você deve responder OBRIGATORIAMENTE em **${targetLang}**.

## Seu objetivo
Ajudar clientes que estão vendo anúncios de imóveis a entender o processo de compra, especialmente financiamento, FGTS e subsídios. Você não vende o imóvel — quem faz isso é o corretor.

## Contexto
O cliente que está conversando com você chegou através de um anúncio criado pelo corretor **${brokerName}**. Sempre que mencionar o corretor, use o nome **${brokerName}**.

---

## Base de conhecimento — você pode responder sobre:

### Financiamento imobiliário
- Como funciona o financiamento imobiliário no Brasil (SFH e SFI)
- Sistemas de amortização: SAC (Sistema de Amortização Constante) e Price (parcelas fixas)
- Como calcular parcelas estimadas
- Prazo máximo: até 420 meses (35 anos) na Caixa
- Entrada mínima: geralmente 20% do valor do imóvel (pode variar)
- Taxa máxima de comprometimento de renda: 30% da renda bruta familiar

### Caixa Econômica Federal
- Programas: Minha Casa Minha Vida (MCMV), habitação urbana e rural
- Faixas do MCMV (2024): Faixa 1 (até R$ 2.640), Faixa 2 (até R$ 4.400), Faixa 3 (até R$ 8.000)
- Cotista FGTS tem condições especiais na Caixa
- Taxa de juros da Caixa varia por faixa de renda e modalidade
- Avaliação do imóvel é obrigatória e paga pelo comprador

### FGTS
- Requisitos básicos: mínimo 3 anos de carteira assinada (podendo somar empregos diferentes)
- Não pode ter outro imóvel financiado pelo SFH em qualquer parte do Brasil
- Não pode ter recebido benefício do FGTS nos últimos 3 anos
- O imóvel deve ser para residência própria
- O imóvel deve estar na cidade onde o comprador trabalha, reside há mais de 1 ano ou estuda
- Pode usar para: dar a entrada, amortizar o saldo devedor ou quitar o financiamento

### Subsídios habitacionais federais
- MCMV Faixa 1: subsídio pode chegar a R$ 55.000 (varia por região e renda)
- MCMV Faixa 2: subsídio parcial, menor que Faixa 1
- MCMV Faixa 3: sem subsídio direto, mas taxa de juros reduzida
- Subsídios são calculados individualmente pelo banco — não é possível garantir um valor exato aqui

### Subsídios do Estado do Ceará
- O Governo do Ceará possui programas habitacionais complementares ao MCMV
- Programa Minha Casa, Minha Vida Ceará pode oferecer subsídio adicional estadual
- Para valores exatos e disponibilidade, o ideal é confirmar com a APRECE ou CEHAP (Ceará)
- Municípios cearenses também podem ter programas locais de habitação
- O corretor local terá informações atualizadas sobre o que está disponível na região

### Documentação necessária (geral)
- Pessoais: RG, CPF, comprovante de estado civil, comprovante de residência
- Renda: holerites (últimos 3 meses), declaração do IR, extrato bancário
- FGTS: extrato atualizado (solicite pelo app FGTS)
- Para autônomos: declaração de imposto de renda + declaração comprobatória de recepção de rendimentos (Decore)

### Processo de compra — etapas resumidas
1. Análise de crédito no banco
2. Escolha do imóvel
3. Avaliação do imóvel pelo banco
4. Análise jurídica e documental
5. Assinatura do contrato
6. Registro em cartório
7. Pagamento do ITBI (imposto municipal: 2% a 3% do valor)

### Custos extras que o comprador deve prever
- ITBI: 2% a 3% do valor do imóvel (pago ao município)
- Escritura e registro: 1% a 2% do valor do imóvel
- Avaliação do imóvel: cobrado pelo banco (cerca de R$ 3.000)
- Seguro obrigatório do financiamento (MIP e DFI): incluso na parcela

---

## Regras absolutas — você NUNCA deve:

1. **Inventar** taxas de juros específicas — apenas diga que variam e que o banco informa a taxa personalizada
2. **Inventar** valores de subsídios exatos — diga que variam por renda, região e disponibilidade
3. **Confirmar** aprovação de crédito — você não tem acesso ao histórico financeiro do cliente
4. **Substituir** o corretor ou o banco — você é educativo, não decisório
5. **Inventar** programas habitacionais que não existem

### Quando não tiver certeza:
Se uma pergunta for muito específica, muito técnica ou envolver valores exatos que podem ter mudado, responda (no idioma **${targetLang}**):
*"Para essa informação específica, o ideal é confirmar diretamente com o corretor ${brokerName} ou com o banco."*

---

## Papel do corretor — sempre reforce
Você NUNCA substitui o corretor. Ao final de toda resposta, incentive o cliente a falar com o corretor usando frases naturais (no idioma **${targetLang}**) como:
- "Seu corretor **${brokerName}** poderá analisar o seu caso com mais detalhes."
- "A melhor forma de avançar é conversando com **${brokerName}**."
- "Se quiser andar com isso, clique em 'Falar com o Corretor' para falar com **${brokerName}** agora."

---

## Tom e comportamento
- Educado, profissional, didático e confiável
- Explique termos técnicos de forma simples
- Use markdown quando útil: **negrito**, listas, etc.
- Respostas objetivas em **${targetLang}**
- Nunca seja alarmista — seja encorajador e seguro
- **Excluir Conta**: Se o usuário perguntar como apagar a conta, oriente-o a ir na "Central de Ajuda" e clicar no botão discreto ao final da página.

---

## Objetivo final
Educar o cliente, aumentar a confiança dele na compra, e direcioná-lo para concluir a negociação com o corretor **${brokerName}**.`;
}

// ── Chat principal do agente ──────────────────
export async function getRealEstateChatResponse(
    question: string,
    brokerName: string = "seu corretor",
    history: ChatTurn[] = [],
    language: string = "pt"
): Promise<string> {
    if (!process.env.GROQ_API_KEY) {
        await delay(700);
        return getMockAnswer(question, brokerName, language);
    }

    const client = getClient();

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: buildSystemPrompt(brokerName, language) },
        ...history.map((t) => ({
            role: t.role as "user" | "assistant",
            content: t.content,
        })),
        { role: "user", content: question },
    ];

    const response = await client.chat.completions.create({
        model: MODEL,
        messages,
        max_tokens: 1024,
        temperature: 0.7,
    });

    return response.choices[0]?.message?.content ?? "";
}

// ── Gerador de descrição de anúncio ──────────
export async function generateLinkDescription(data: {
    title: string;
    price?: number;
    description?: string;
}, language: string = "pt"): Promise<string> {
    const langNames: Record<string, string> = { pt: "Português", en: "English", es: "Español" };
    const targetLang = langNames[language] || "Português";

    if (!process.env.GROQ_API_KEY) {
        await delay(800);
        return `${data.title}. ${data.description ?? "Excelente oportunidade no mercado imobiliário."} Entre em contato para mais informações!`;
    }

    const client = getClient();
    const prompt = `Atue como um CORRETOR DE IMÓVEIS especialista criando uma legenda curta e extremamente persuasiva para as suas redes sociais (você falando com o seu público comprador final).
OBRIGATORIAMENTE em **${targetLang}**:
- Título do Imóvel: ${data.title}
${data.price ? `- Valor: R$ ${data.price.toLocaleString("pt-BR")}` : ""}
${data.description ? `- Detalhes: ${data.description}` : ""}
Máximo 3 frases. Foco em despertar curiosidade e fazer o cliente clicar no link. Inclua no final as seguintes hashtags: #imoveis #corretordeimoveis #oportunidade. Não fale na 3ª pessoa ("o corretor"), você é o corretor falando.`;

    const response = await client.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.8,
    });

    return response.choices[0]?.message?.content ?? "";
}

// ── Gerador de Copy para Landing Page do Imóvel ──
export async function generatePropertyLandingCopy(data: {
    title: string;
    price?: number;
}, language: string = "pt"): Promise<{ headline: string; description: string; bullets: string[] }> {
    const langNames: Record<string, string> = { pt: "Português", en: "English", es: "Español" };
    const targetLang = langNames[language] || "Português";

    if (!process.env.GROQ_API_KEY) {
        await delay(1000);
        return {
            headline: `Oportunidade Única: ${data.title}`,
            description: `Descubra o conforto e a sofisticação que você merece neste imóvel exclusivo. Localização privilegiada e acabamento de alto padrão.`,
            bullets: [
                "Localização estratégica e valorizada",
                "Acabamento premium e design moderno",
                "Oportunidade imperdível de investimento",
            ],
        };
    }

    const client = getClient();
    const prompt = `Atue como um redator publicitário de alto nível especializado no mercado imobiliário de luxo e alta performance.
Sua missão é gerar o conteúdo persuasivo (copy) para uma Landing Page de um imóvel.

Dados do Imóvel:
- Título: ${data.title}
${data.price ? `- Preço: R$ ${data.price.toLocaleString("pt-BR")}` : ""}

Você deve retornar OBRIGATORIAMENTE em **${targetLang}** um objeto JSON com:
1. "headline": Uma linha impactante e curta (máximo 12 palavras).
2. "description": Um parágrafo persuasivo de 3 a 4 linhas que desperte desejo e urgência.
3. "bullets": Um array com EXATAMENTE 3 pontos de destaque (bullet points) curtos focando nos benefícios.

Retorne APENAS o JSON. Exemplo:
{
  "headline": "Onde o luxo encontra o seu novo endereço no Leblon",
  "description": "Viva a experiência única de morar a poucos passos da praia em um projeto que redefine o conceito de exclusividade.",
  "bullets": ["Vista panorâmica definitiva para o mar", "3 suítes amplas com acabamento premium", "Localização mais valorizada do Rio de Janeiro"]
}`;

    const response = await client.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 512,
        temperature: 0.7,
    });

    const text = (response.choices[0]?.message?.content ?? "").trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);

    throw new Error("Falha ao gerar copy da landing page");
}

// ── Smart Capture: OCR for Real Estate Signs ──
export interface AICaptureResult {
    phones: string[];
    address?: string;
    intent?: string;
    notes?: string;
    rawDebug?: string;
}

export async function analyzeCaptureImage(base64Image: string): Promise<{ captures: AICaptureResult[] }> {
    if (!process.env.GROQ_API_KEY) {
        await delay(1200);
        return {
            captures: [{
                phones: ["(85) 99999-0000", "(85) 3333-4444"],
                address: "Rua Exemplo, 123 - Fortaleza",
                intent: "vende",
                notes: "Exemplo: 3 Quartos, 1 Suíte, 2 Vagas.",
            }],
        };
    }

    try {
        const client = getClient();
        const mimeType = base64Image.split(";")[0].split(":")[1] || "image/webp";
        const data = base64Image.split(",")[1];

        const prompt = `Analise a imagem fornecida (como um poste, muro ou fachada).
Nesta foto, você pode encontrar VÁRIAS PLACAS INDEPENDENTES coladas umas próximas às outras.

Sua missão é ler a foto e SEPARAR as informações de ACORDO COM CADA PLACA INDIVIDUAL que você encontrar. Para CADA placa distinta, crie um item no array "captures" com:
1. "phones": Todos os números de telefone detectáveis NESSA placa.
2. "address": Qualquer endereço, bairro, nome de edifício ou localização específica dessa placa.
3. "intent": A intenção de negócio real ("Venda" ou "Aluga"). SE a placa contiver a palavra "CRECI", logotipos de construtoras ou nomes de imobiliárias, classifique como "Venda (Parceiro)" ou "Aluga (Parceiro)".
4. "notes": Detalhes extras importantes da placa.
5. "debug_reasoning": O que você usou para tomar as decisões.

Retorne APENAS um objeto JSON válido com uma propriedade "captures" que é um array desses objetos. NÃO inclua blocos de markdown.`;

        const response = await client.chat.completions.create({
            model: VISION_MODEL,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { url: `data:${mimeType};base64,${data}` } },
                    ],
                },
            ],
            max_tokens: 1024,
        });

        const text = (response.choices[0]?.message?.content ?? "").trim();
        console.log("[OCR Raw Result]:", text);

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsed.captures)) {
                return {
                    captures: parsed.captures.map((c: any) => ({
                        phones: Array.isArray(c.phones) ? c.phones.filter((p: string) => p?.trim().length > 0) : [],
                        address: c.address || undefined,
                        intent: c.intent || undefined,
                        notes: c.notes || undefined,
                        rawDebug: c.debug_reasoning || "No reasoning",
                    })),
                };
            }
        }

        return { captures: [] };
    } catch (error) {
        console.error("OCR Error:", error);
        return { captures: [] };
    }
}

// ── Virtual Tour: AI Hotspot Detection ────────
export async function detectTourHotspots(base64Image: string): Promise<{ pitch: number; yaw: number; label: string }[]> {
    if (!process.env.GROQ_API_KEY) {
        await delay(1500);
        return [
            { pitch: -15, yaw: 45, label: "Porta/Passagem" },
            { pitch: -15, yaw: -45, label: "Corredor" },
        ];
    }

    try {
        const client = getClient();
        const mimeType = base64Image.split(";")[0].split(":")[1] || "image/webp";
        const data = base64Image.split(",")[1];

        const prompt = `You are a specialized AI in 360-degree virtual tours.
Analyze this equirectangular 360 image and identify all visible POIs (Points of Interest) for navigation:
- Doors to other rooms
- Hallways or passages
- Openings between spaces

For each navigation point found, return:
- pitch: Vertical angle (-90 to 90). Usually between -10 and -30 for floor/door level.
- yaw: Horizontal angle (-180 to 180).
- label: A short description of where it leads (e.g., "Suíte", "Cozinha", "Saída").

Return ONLY a JSON array of objects.
Example: [ { "pitch": -15, "yaw": 120, "label": "Quarto" } ]`;

        const response = await client.chat.completions.create({
            model: VISION_MODEL,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { url: `data:${mimeType};base64,${data}` } },
                    ],
                },
            ],
            max_tokens: 512,
        });

        const text = (response.choices[0]?.message?.content ?? "").trim();
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        return [];
    } catch (error) {
        console.error("AI Hotspot Detection Error:", error);
        return [];
    }
}

// ── Sugestão de Sequência de Tour ─────────────
export async function suggestTourSequence(scenes: { id: string; name: string }[]): Promise<string[]> {
    if (!process.env.GROQ_API_KEY || scenes.length < 2) {
        return scenes.map((s) => s.id);
    }

    try {
        const client = getClient();
        const prompt = `You are an expert real estate tour curator.
Given a list of rooms in a house, suggest the most logical and satisfying visiting sequence (e.g., Entrance -> Living -> Kitchen -> Corridor -> Rooms -> Balcony).

Rooms provided:
${scenes.map((s) => `- ${s.name} (ID: ${s.id})`).join("\n")}

Return ONLY a JSON array of IDs in the suggested order.
Example: ["id1", "id2", "id3"]`;

        const response = await client.chat.completions.create({
            model: MODEL,
            messages: [{ role: "user", content: prompt }],
            max_tokens: 256,
        });

        const text = (response.choices[0]?.message?.content ?? "").trim();
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        return scenes.map((s) => s.id);
    } catch (error) {
        console.error("AI Sequence Suggestion Error:", error);
        return scenes.map((s) => s.id);
    }
}

// ── Sugestão de títulos para anúncios ─────────
export async function generateTitleSuggestions(data: {
    title: string;
}, language: string = "pt"): Promise<string[]> {
    const langNames: Record<string, string> = { pt: "Português", en: "English", es: "Español" };
    const targetLang = langNames[language] || "Português";

    if (!process.env.GROQ_API_KEY) {
        await delay(600);
        return [
            `Oportunidade: ${data.title}`,
            `Confira: ${data.title}`,
            `Imperdível: ${data.title}`,
            `${data.title} - Agende sua visita`,
            `O melhor de ${data.title}`,
        ];
    }

    const client = getClient();
    const prompt = `Gere 5 opções de títulos curtos e impactantes para um anúncio imobiliário baseado nesta descrição: "${data.title}".
Responda OBRIGATORIAMENTE em **${targetLang}**.
Os títulos devem ser variados (ex: um focado em exclusividade, um em preço/oportunidade, um direto, etc.).
Retorne apenas os 5 títulos, um em cada linha, sem numeração ou marcadores.`;

    const response = await client.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 256,
        temperature: 0.9,
    });

    const text = response.choices[0]?.message?.content ?? "";
    return text.split("\n").filter((line) => line.trim().length > 0).slice(0, 5);
}

// ── Caption para redes sociais ────────────────
export async function generateSocialCaption(data: {
    title: string;
    price?: number;
    linkSlug: string;
}, platform: "instagram" | "facebook" | "whatsapp" = "instagram", language: string = "pt"): Promise<string> {
    const langNames: Record<string, string> = { pt: "Português", en: "English", es: "Español" };
    const targetLang = langNames[language] || "Português";

    if (!process.env.GROQ_API_KEY) {
        await delay(700);
        const p = {
            instagram: `🏡 ${data.title}\n\n${data.price ? `💰 R$ ${data.price.toLocaleString("pt-BR")}\n\n` : ""}📲 Acesse o link na bio!\n\n#imóveis #financiamento #mcmv`,
            facebook: `🏡 **${data.title}**\n\n${data.price ? `Valor: R$ ${data.price.toLocaleString("pt-BR")}\n\n` : ""}Acesse o link para simular seu financiamento!`,
            whatsapp: `Olá! Vi o anúncio *${data.title}*${data.price ? ` (R$ ${data.price.toLocaleString("pt-BR")})` : ""}. Tenho interesse! 😊`,
        };
        return p[platform];
    }

    const client = getClient();
    const instr = {
        instagram: "Máx 300 caracteres, com emojis. Atue como o corretor falando direto para o cliente final, usando primeira pessoa. Inclua CTA para 'link na bio' e hashtags: #imoveis #corretordeimoveis #oportunidade.",
        facebook: "Tom profissional, atuando como corretor falando direto com o cliente final. Máx 400 caracteres, emojis moderados. Inclua hashtags ao final.",
        whatsapp: "Mensagem pronta e encantadora em primeira pessoa. Máx 200 caracteres.",
    };

    const response = await client.chat.completions.create({
        model: MODEL,
        messages: [{
            role: "user",
            content: `Como CORRETOR DE IMÓVEIS falando DIRETAMENTE para o seu CLIENTE COMPRADOR FINAL, crie um texto para a plataforma ${platform} sobre este imóvel: ${data.title}${data.price ? ` — R$ ${data.price.toLocaleString("pt-BR")}` : ""}. Responda OBRIGATORIAMENTE em **${targetLang}**. ${instr[platform]}`,
        }],
        max_tokens: 300,
        temperature: 0.8,
    });

    return response.choices[0]?.message?.content ?? "";
}

// ── Tour Completo 100% IA ─────────────────────
export interface AIConnectionGraph {
    from: string;
    to: string;
    yaw: number;
    pitch: number;
    label: string;
    confidence?: number;
}

export interface AIRoomNode {
    id: string;
    name: string;
    type: string;
}

export interface AITourGraph {
    rooms: AIRoomNode[];
    connections: AIConnectionGraph[];
    suggestedFirstSceneId?: string;
    requiresConfirmation?: boolean;
}

export async function generateTourStructureWithAI(images: { id: string; name: string; url: string }[]): Promise<AITourGraph> {
    const createFallbackGraph = (): AITourGraph => {
        const graph: AITourGraph = {
            suggestedFirstSceneId: images[0]?.id,
            rooms: images.map((img) => ({ id: img.id, name: img.name, type: "Ambiente" })),
            connections: [],
            requiresConfirmation: true,
        };

        for (let i = 0; i < images.length; i++) {
            if (i < images.length - 1) {
                graph.connections.push({ from: images[i].id, to: images[i + 1].id, yaw: 0, pitch: -15, label: `Avançar para ${images[i + 1].name}`, confidence: 0.5 });
            }
            if (i > 0) {
                graph.connections.push({ from: images[i].id, to: images[i - 1].id, yaw: 180, pitch: -15, label: `Voltar para ${images[i - 1].name}`, confidence: 0.5 });
            }
        }
        return graph;
    };

    if (!process.env.GROQ_API_KEY || images.length === 0) {
        await delay(1500);
        return createFallbackGraph();
    }

    try {
        const client = getClient();

        const imageParts = await Promise.all(
            images.map(async (img) => {
                const res = await fetch(img.url);
                const buffer = Buffer.from(await res.arrayBuffer());
                const mimeType = res.headers.get("content-type") || "image/jpeg";
                return { url: `data:${mimeType};base64,${buffer.toString("base64")}`, id: img.id, name: img.name };
            })
        );

        const imageList = images.map((img, i) => `Image Index ${i} -> ID: "${img.id}", Original Name: "${img.name}"`).join("\n");

        const textPrompt = `You are an expert spatial analyst and virtual tour architect. You have been given ${images.length} 360-degree panoramic images of a property.

Here is the list of images:
${imageList}

For each image: classify the room type, determine connections between rooms, estimate pitch/yaw for hotspots, and assign confidence (0–1).

Return a STRICT JSON object:
{
  "requiresConfirmation": boolean,
  "suggestedFirstSceneId": "id",
  "rooms": [{ "id": "image_id", "name": "Name", "type": "Room Type" }],
  "connections": [{ "from": "id", "to": "id", "yaw": 45, "pitch": -15, "label": "Label", "confidence": 0.8 }]
}

Return ONLY the JSON without markdown.`;

        const content: Groq.Chat.ChatCompletionContentPart[] = [
            { type: "text", text: textPrompt },
            ...imageParts.map((p): Groq.Chat.ChatCompletionContentPartImage => ({
                type: "image_url",
                image_url: { url: p.url },
            })),
        ];

        const response = await client.chat.completions.create({
            model: VISION_MODEL,
            messages: [{ role: "user", content }],
            max_tokens: 2048,
        });

        const text = (response.choices[0]?.message?.content ?? "").trim()
            .replace(/^```json/, "").replace(/^```/, "").replace(/```$/, "");

        const graph: AITourGraph = JSON.parse(text.trim());
        const validIds = new Set(images.map((img) => img.id));
        graph.connections = graph.connections.filter((c) => validIds.has(c.from) && validIds.has(c.to));
        return graph;
    } catch (error) {
        console.error("Failed to generate AI Tour Graph, using fallback:", error);
        return createFallbackGraph();
    }
}

// ── Mock answers (fallback sem API key) ───────
function getMockAnswer(question: string, brokerName: string, language: string = "pt"): string {
    const q = question.toLowerCase();

    const messages: Record<string, any> = {
        pt: {
            cta: `\n\n💬 **${brokerName}** pode analisar seu caso com mais detalhes — clique em "Falar com o Corretor"!`,
            fgts: `**Como usar o FGTS na compra do imóvel:**\n\nVocê pode usar o saldo do FGTS para **dar a entrada**, **amortizar** ou **quitar** financiamento imobiliário.\n\n**Requisitos principais:**\n- Mínimo 3 anos de carteira assinada\n- O imóvel deve ser para residência própria\n- Não ter outro imóvel financiado pelo SFH`,
            other: `Boa pergunta! Para informações precisas sobre **"${question}"**, o ideal é confirmar diretamente com ${brokerName}.`,
        },
        en: {
            cta: `\n\n💬 **${brokerName}** can analyze your case — click "Talk to the Realtor"!`,
            fgts: `**How to use FGTS:**\n\nYou can use FGTS for the **down payment**, **amortization**, or **paying off** financing.`,
            other: `Good question! For precise info about **"${question}"**, confirm directly with ${brokerName}.`,
        },
        es: {
            cta: `\n\n💬 **${brokerName}** puede analizar su caso — ¡haga clic en "Hablar con el Corredor"!`,
            fgts: `**Cómo usar el FGTS:**\n\nPuede usar el FGTS para **la entrada**, **amortizar** o **liquidar** la financiación.`,
            other: `¡Buena pregunta! Para información precisa sobre **"${question}"**, confirme con ${brokerName}.`,
        },
    };

    const l = messages[language] || messages.pt;
    if (q.includes("fgts")) return l.fgts + l.cta;
    return l.other + l.cta;
}

function delay(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}
