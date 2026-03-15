"use server";
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
// ──────────────────────────────────────────────────────────────
//  AI Wrapper — Google Gemini
//  Agente especialista em financiamento imobiliário no Brasil
// ──────────────────────────────────────────────────────────────

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ChatTurn {
    role: "user" | "assistant";
    content: string;
}

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

function getClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY não definida em .env.local");
    return new GoogleGenerativeAI(apiKey);
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

1. **Inventar** taxas de juros específicas (ex: "a taxa é X% ao ano") — apenas diga que variam e que o banco informa a taxa personalizada
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
- "Leve essas informações para **${brokerName}** avaliar com você."
- "Se quiser andar com isso, clique em 'Falar com o Corretor' para falar com **${brokerName}** agora."

---

## Tom e comportamento

- Educado, profissional, didático e confiável
- Explique termos técnicos de forma simples
- Use markdown quando útil: **negrito**, listas, etc.
- Respostas objetivas em **${targetLang}**
- Nunca seja alarmista — seja encorajador e seguro
6. **Excluir Conta**: Se o usuário perguntar como apagar a conta, oriente-o a ir na "Central de Ajuda" e clicar no botão discreto ao final da página. Informe que este processo é definitivo e apaga todos os dados.

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
    if (!process.env.GEMINI_API_KEY) {
        await delay(700);
        return getMockAnswer(question, brokerName, language);
    }

    const genAI = getClient();
    const model = genAI.getGenerativeModel({ model: MODEL });
    const prompt = buildSystemPrompt(brokerName, language);

    const welcomeMessages: Record<string, string> = {
        pt: `Olá! 👋 Sou especialista em financiamento imobiliário. Pode me perguntar sobre **FGTS, subsídios, documentação, financiamento** e tudo sobre o processo de compra. Para avançar com o imóvel, clique em "Falar com ${brokerName}" a qualquer momento!`,
        en: `Hello! 👋 I am a real estate financing specialist. You can ask me about **FGTS, subsidies, documentation, financing** and everything about the buying process. To move forward with the property, click "Talk to ${brokerName}" at any time!`,
        es: `¡Hola! 👋 Soy especialista en financiación inmobiliaria. Puedes preguntarme sobre **FGTS, subsidios, documentación, financiación** y todo sobre el proceso de compra. ¡Para avanzar con el inmueble, haz clic en "Hablar con ${brokerName}" en cualquier momento!`,
    };

    const chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: prompt }],
            },
            {
                role: "model",
                parts: [{
                    text: welcomeMessages[language] || welcomeMessages.pt,
                }],
            },
            ...history.map((t) => ({
                role: t.role === "user" ? "user" as const : "model" as const,
                parts: [{ text: t.content }],
            })),
        ],
    });

    const result = await chat.sendMessage(question);
    return result.response.text();
}

// ── Gerador de descrição de anúncio ──────────
export async function generateLinkDescription(data: {
    title: string;
    price?: number;
    description?: string;
}, language: string = "pt"): Promise<string> {
    const langNames: Record<string, string> = { pt: "Português", en: "English", es: "Español" };
    const targetLang = langNames[language] || "Português";

    if (!process.env.GEMINI_API_KEY) {
        await delay(800);
        return `${data.title}. ${data.description ?? "Excelente oportunidade no mercado imobiliário."} Entre em contato para mais informações!`;
    }

    const genAI = getClient();
    const model = genAI.getGenerativeModel({ model: MODEL });

    const prompt = `Atue como um CORRETOR DE IMÓVEIS especialista criando uma legenda curta e extremamente persuasiva para as suas redes sociais (você falando com o seu público comprador final).
OBRIGATORIAMENTE em **${targetLang}**:
- Título do Imóvel: ${data.title}
${data.price ? `- Valor: R$ ${data.price.toLocaleString("pt-BR")}` : ""}
${data.description ? `- Detalhes: ${data.description}` : ""}
Máximo 3 frases. Foco em despertar curiosidade e fazer o cliente clicar no link. Inclua no final as seguintes hashtags: #imoveis #corretordeimoveis #oportunidade. Não fale na 3ª pessoa ("o corretor"), você é o corretor falando.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
}

// ── Gerador de Copy para Landing Page do Imóvel ──
export async function generatePropertyLandingCopy(data: {
    title: string;
    price?: number;
}, language: string = "pt"): Promise<{ headline: string; description: string; bullets: string[] }> {
    const langNames: Record<string, string> = { pt: "Português", en: "English", es: "Español" };
    const targetLang = langNames[language] || "Português";

    if (!process.env.GEMINI_API_KEY) {
        await delay(1000);
        return {
            headline: `Oportunidade Única: ${data.title}`,
            description: `Descubra o conforto e a sofisticação que você merece neste imóvel exclusivo. Localização privilegiada e acabamento de alto padrão.`,
            bullets: [
                "Localização estratégica e valorizada",
                "Acabamento premium e design moderno",
                "Oportunidade imperdível de investimento"
            ]
        };
    }

    const genAI = getClient();
    const model = genAI.getGenerativeModel({ model: MODEL });

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
      "description": "Viva a experiência única de morar a poucos passos da praia em um projeto que redefine o conceito de exclusividade. Cada detalhe foi pensado para proporcionar o máximo de conforto e sofisticação para sua família.",
      "bullets": ["Vista panorâmica definitiva para o mar", "3 suítes amplas com acabamento premium", "Localização mais valorizada do Rio de Janeiro"]
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }
    
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
    if (!process.env.GEMINI_API_KEY) {
        await delay(1200);
        return {
            captures: [{
                phones: ["(85) 99999-0000", "(85) 3333-4444"],
                address: "Rua Exemplo, 123 - Fortaleza",
                intent: "vende",
                notes: "Exemplo: 3 Quartos, 1 Suíte, 2 Vagas."
            }]
        };
    }

    try {
        const genAI = getClient();
        const model = genAI.getGenerativeModel({ model: MODEL });

        const mimeType = base64Image.split(";")[0].split(":")[1] || "image/webp";
        const data = base64Image.split(",")[1];

        // Multi-Sign Prompt
        const prompt = `Analise a imagem fornecida (como um poste, muro ou fachada).
            Nesta foto, você pode encontrar VÁRIAS PLACAS INDEPENDENTES coladas umas próximas às outras (ex: uma placa da construtora, outra placa de um corretor vendendo, outra placa de alguém alugando).
            
            Sua missão é ler a foto e SEPARAR as informações de ACORDO COM CADA PLACA INDIVIDUAL que você encontrar. Para CADA placa distinta, crie um item no array "captures" com o seguinte:
            1. "phones": Todos os números de telefone detectáveis NESSA placa. Tente ler mesmo se estiver borrado.
            2. "address": Qualquer endereço, bairro, nome de edifício ou localização específica dessa placa.
            3. "intent": A intenção de negócio real ("Venda" ou "Aluga"). PRESTE MUITA ATENÇÃO: SE a placa contiver a palavra "CRECI", iniciais de registro, logotipos de construtoras ou nomes de imobiliárias parceiras, classifique obrigatoriamente como "Venda (Parceiro)" ou "Aluga (Parceiro)".
            4. "notes": Detalhes extras importantes da placa (ex: "2 Quartos", "137 mil", "180 meses", "Piscina"). Reúna todo o texto persuasivo/descritivo aqui.
            5. "debug_reasoning": O que você usou para tomar as decisões ou o porquê não conseguiu ler.
            
            Retorne APENAS um objeto JSON válido, contendo uma propriedade "captures" que é um array desses objetos. NÃO inclua blocos de markdown.
            Exemplo do formato esperado:
            {
              "captures": [
                {
                   "phones": ["(XX) XXXX-XXXX"],
                   "address": "Edifício Marazul",
                   "intent": "Venda (Parceiro)",
                   "notes": "2 Quartos a partir de R$ 137 mil.",
                   "debug_reasoning": "Placa azul do Alminar Nassau."
                },
                {
                   "phones": ["(11) 9999-9999"],
                   "intent": "Aluga",
                   "notes": "",
                   "debug_reasoning": "Placa de papel sulfite escrita a mão com fita adesiva."
                }
              ]
            }`;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data, mimeType } }
        ]);

        const text = result.response.text().trim();
        console.log("[OCR Raw Result]:", text);

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsed.captures)) {
                return {
                    captures: parsed.captures.map((c: any) => ({
                        phones: Array.isArray(c.phones) ? c.phones.filter((p: string) => p && p.trim().length > 0) : [],
                        address: c.address || undefined,
                        intent: c.intent || undefined,
                        notes: c.notes || undefined,
                        rawDebug: c.debug_reasoning || "No reasoning"
                    }))
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
export async function detectTourHotspots(base64Image: string): Promise<{ pitch: number, yaw: number, label: string }[]> {
    if (!process.env.GEMINI_API_KEY) {
        await delay(1500);
        return [
            { pitch: -15, yaw: 45, label: "Porta/Passagem" },
            { pitch: -15, yaw: -45, label: "Corredor" }
        ];
    }

    try {
        const genAI = getClient();
        const model = genAI.getGenerativeModel({ model: MODEL });

        // Extrai dados da imagem base64
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
        Example: [ { "pitch": -15, "yaw": 120, "label": "Quarto" } ]
        
        Important: Accuracy is key for virtual tour navigation. Ensure yaw/pitch align with the center of the door or hallway.`;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data, mimeType } }
        ]);

        const text = result.response.text().trim();
        const jsonMatch = text.match(/\[[\s\S]*\]/);

        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return [];
    } catch (error) {
        console.error("AI Hotspot Detection Error:", error);
        return [];
    }
}

// ── Sugestão de Sequência de Tour ─────────────
export async function suggestTourSequence(scenes: { id: string, name: string }[]): Promise<string[]> {
    if (!process.env.GEMINI_API_KEY || scenes.length < 2) {
        return scenes.map(s => s.id);
    }

    try {
        const genAI = getClient();
        const model = genAI.getGenerativeModel({ model: MODEL });

        const prompt = `You are an expert real estate tour curator. 
        Given a list of rooms in a house, suggest the most logical and satisfying visiting sequence (e.g., Entrance -> Living -> Kitchen -> Corridor -> Rooms -> Balcony).
        
        Rooms provided:
        ${scenes.map(s => `- ${s.name} (ID: ${s.id})`).join("\n")}

        Return ONLY a JSON array of IDs in the suggested order.
        Example: ["id1", "id2", "id3"]`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const jsonMatch = text.match(/\[[\s\S]*\]/);

        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return scenes.map(s => s.id);
    } catch (error) {
        console.error("AI Sequence Suggestion Error:", error);
        return scenes.map(s => s.id);
    }
}

// ── Sugestão de títulos para anúncios ─────────
export async function generateTitleSuggestions(data: {
    title: string;
}, language: string = "pt"): Promise<string[]> {
    const langNames: Record<string, string> = { pt: "Português", en: "English", es: "Español" };
    const targetLang = langNames[language] || "Português";

    if (!process.env.GEMINI_API_KEY) {
        await delay(600);
        return [
            `Oportunidade: ${data.title}`,
            `Confira: ${data.title}`,
            `Imperdível: ${data.title}`,
            `${data.title} - Agende sua visita`,
            `O melhor de ${data.title}`,
        ];
    }

    const genAI = getClient();
    const model = genAI.getGenerativeModel({ model: MODEL });

    const prompt = `Gere 5 opções de títulos curtos e impactantes para um anúncio imobiliário baseado nesta descrição: "${data.title}".
Responda OBRIGATORIAMENTE em **${targetLang}**.
Os títulos devem ser variados (ex: um focado em exclusividade, um em preço/oportunidade, um direto, etc.).
Retorne apenas os 5 títulos, um em cada linha, sem numeração ou marcadores.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text.split("\n").filter(line => line.trim().length > 0).slice(0, 5);
}

// ── Caption para redes sociais ────────────────
export async function generateSocialCaption(data: {
    title: string;
    price?: number;
    linkSlug: string;
}, platform: "instagram" | "facebook" | "whatsapp" = "instagram", language: string = "pt"): Promise<string> {
    const langNames: Record<string, string> = { pt: "Português", en: "English", es: "Español" };
    const targetLang = langNames[language] || "Português";

    if (!process.env.GEMINI_API_KEY) {
        await delay(700);
        const p = {
            instagram: `🏡 ${data.title}\n\n${data.price ? `💰 R$ ${data.price.toLocaleString("pt-BR")}\n\n` : ""}📲 Acesse o link na bio para simular seu financiamento e tirar dúvidas com nossa IA!\n\n#imóveis #financiamento #mcmv`,
            facebook: `🏡 **${data.title}**\n\n${data.price ? `Valor: R$ ${data.price.toLocaleString("pt-BR")}\n\n` : ""}Acesse o link para simular seu financiamento e tirar todas as suas dúvidas!`,
            whatsapp: `Olá! Vi o anúncio *${data.title}*${data.price ? ` (R$ ${data.price.toLocaleString("pt-BR")})` : ""}. Tenho interesse! 😊`,
        };
        return p[platform];
    }

    const genAI = getClient();
    const model = genAI.getGenerativeModel({ model: MODEL });

    const instr = {
        instagram: "Máx 300 caracteres, com emojis. Atue como o corretor falando direto para o cliente final, usando primeira pessoa (ex: 'Que tal conhecer essa casa que acabou de entrar na minha carteira?'). Inclua CTA para 'link na bio' e hashtags: #imoveis #corretordeimoveis #oportunidade.",
        facebook: "Tom profissional, atuando como corretor falando direto com o cliente final. Máx 400 caracteres, emojis moderados. Inclua hashtags ao final.",
        whatsapp: "Mensagem pronta e encantadora em primeira pessoa (ex: 'Olá! Sou o seu corretor e olha essa oportunidade que incrível...'). Máx 200 caracteres.",
    };

    const result = await model.generateContent(
        `Como CORRETOR DE IMÓVEIS falando DIRETAMENTE para o seu CLIENTE COMPRADOR FINAL, crie um texto para a plataforma ${platform} sobre este imóvel: ${data.title}${data.price ? ` — R$ ${data.price.toLocaleString("pt-BR")}` : ""}. Responda OBRIGATORIAMENTE em **${targetLang}**. ${instr[platform]}`
    );
    return result.response.text();
}

// ── Mock answers (fallback sem API key) ───────
function getMockAnswer(question: string, brokerName: string, language: string = "pt"): string {
    const q = question.toLowerCase();

    const messages: Record<string, any> = {
        pt: {
            cta: `\n\n💬 **${brokerName}** pode analisar seu caso com mais detalhes — clique em "Falar com o Corretor"!`,
            fgts: `**Como usar o FGTS na compra do imóvel:**\n\nVocê pode usar o saldo do FGTS para **dar a entrada**, **amortizar** ou **quitar** financiamento imobiliário.\n\n**Requisitos principais:**\n- Mínimo 3 anos de carteira assinada (podendo somar empregos diferentes)\n- O imóvel deve ser para residência própria\n- Não ter outro imóvel financiado pelo SFH em nenhum lugar do Brasil\n- Não ter recebido benefício do FGTS para imóvel nos últimos 3 anos`,
            other: `Boa pergunta! Para informações precisas sobre **"${question}"**, o ideal é confirmar diretamente com ${brokerName}, que poderá analisar seu caso individualmente.`
        },
        en: {
            cta: `\n\n💬 **${brokerName}** can analyze your case in more detail — click "Talk to the Realtor"!`,
            fgts: `**How to use FGTS to buy property:**\n\nYou can use the FGTS balance for **the down payment**, **amortization**, or **paying off** real estate financing.\n\n**Main requirements:**\n- Minimum of 3 years of formal employment (cumulative)\n- The property must be for own residence\n- Do not have another property financed by SFH anywhere in Brazil\n- Have not received FGTS benefits for property in the last 3 years`,
            other: `Good question! For precise information about **"${question}"**, the ideally is to confirm directly with ${brokerName}, who will be able to analyze your case individually.`
        },
        es: {
            cta: `\n\n💬 **${brokerName}** puede analizar su caso con más detalle — ¡haga clic en "Hablar con el Corredor"!`,
            fgts: `**Cómo usar el FGTS en la compra de un inmueble:**\n\nPuede usar el saldo del FGTS para **dar la entrada**, **amortizar** o **liquidar** la financiación inmobiliaria.\n\n**Requisitos principales:**\n- Mínimo de 3 años de contrato (pudiendo sumar diferentes empleos)\n- El inmueble debe ser para residencia propia\n- No tener otro inmueble financiado por el SFH en ningún lugar de Brasil\n- No haber recibido beneficios del FGTS para un inmueble en los últimos 3 años`,
            other: `¡Buena pregunta! Para obtener información precisa sobre **"${question}"**, lo ideal es confirmar directamente con ${brokerName}, quien podrá analizar su caso individualmente.`
        }
    };

    const l = messages[language] || messages.pt;

    if (q.includes("fgts")) return l.fgts + l.cta;
    // ... simplificando mock para brevidade
    return l.other + l.cta;
}


function delay(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

// ── Tour Completo 100% IA (Gemini Vision) ─────
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

export async function generateTourStructureWithAI(images: { id: string; name: string; url: string; }[]): Promise<AITourGraph> {

    const createFallbackGraph = () => {
        const fallbackGraph: AITourGraph = {
            suggestedFirstSceneId: images[0]?.id,
            rooms: images.map(img => ({ id: img.id, name: img.name, type: "Ambiente" })),
            connections: []
        };

        for (let i = 0; i < images.length; i++) {
            if (i < images.length - 1) {
                fallbackGraph.connections.push({
                    from: images[i].id,
                    to: images[i + 1].id,
                    yaw: 0,
                    pitch: -15,
                    label: `Avançar para ${images[i + 1].name}`,
                    confidence: 0.5 // Fallback is treated as uncertain
                });
            }
            if (i > 0) {
                fallbackGraph.connections.push({
                    from: images[i].id,
                    to: images[i - 1].id,
                    yaw: 180,
                    pitch: -15,
                    label: `Voltar para ${images[i - 1].name}`,
                    confidence: 0.5 // Fallback is treated as uncertain
                });
            }
        }
        fallbackGraph.requiresConfirmation = true;
        return fallbackGraph;
    };

    if (!process.env.GEMINI_API_KEY || images.length === 0) {
        console.warn("Generating Fallback Graph (Missing API Key)");
        await delay(1500);
        return createFallbackGraph();
    }

    try {
        const genAI = getClient();
        const model = genAI.getGenerativeModel({ model: MODEL });

        const imageParts = await Promise.all(images.map(async (img) => {
            const response = await fetch(img.url);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const mimeType = response.headers.get('content-type') || "image/jpeg";

            return {
                inlineData: {
                    data: buffer.toString('base64'),
                    mimeType
                }
            };
        }));

        const promptTexts = [
            `You are an expert spatial analyst and virtual tour architect. You have been given ${images.length} 360-degree panoramic images of a property.`,
            `Your task is to analyze these images collectively and construct a complete, logical navigation graph for a virtual tour.`,
            `Here is the list of images and their internal IDs. You must use these EXACT IDs when referencing them:`,
            images.map((img, i) => `Image Index ${i} -> ID: "${img.id}", Original Name: "${img.name}"`).join("\n"),
            `\nFor each image, do the following:`,
            `1. Classify the room type (e.g., Living Room, Kitchen, Bedroom, Corridor, Bathroom, Exterior, Balcony).`,
            `2. Analyze the visual overlap, doorways, and passages to determine how these rooms connect to each other.`,
            `3. For every logical passage from Room A to Room B, estimate the 'pitch' (vertical angle, between -90 and 90, usually -10 to -30 for floors/doors) and 'yaw' (horizontal angle, between -180 to 180) where the hotspot should be placed in Room A to look towards Room B. Make the yaw accurately reflect the center of the doorway in the equirectangular projection of Room A.`,
            `4. Assign a 'confidence' score (from 0.0 to 1.0) for each connection. If you are very certain about the visual overlap or sequence, use 0.9+. If there are ambiguous corridors or missing doors, rate it lower (e.g. 0.4 - 0.7).`,
            `\nReturn the ENTIRE result as a STRICT JSON object with the following structure:`,
            `{
              "requiresConfirmation": boolean (set true if ANY connection has a confidence score lower than 0.6),
              "suggestedFirstSceneId": "id-of-the-best-starting-room-like-living-room",
              "rooms": [
                { "id": "image_id", "name": "Friendly Name", "type": "Room Type" }
              ],
              "connections": [
                { "from": "source_image_id", "to": "target_image_id", "yaw": 45, "pitch": -15, "label": "Ir para Kitchen", "confidence": 0.8 }
              ]
            }`,
            `Ensure connections are bi-directional where it makes sense (if A connects to B, B usually connects to A, but with a different yaw). Return ONLY the JSON object without markdown formatting blocks like \`\`\`json.`
        ];

        const requestContent = [
            promptTexts.join("\n\n"),
            ...imageParts
        ];

        const result = await model.generateContent(requestContent);
        const text = result.response.text().trim();

        let jsonStr = text;
        if (jsonStr.startsWith("```json")) jsonStr = jsonStr.replace(/^```json/, "");
        if (jsonStr.startsWith("```")) jsonStr = jsonStr.replace(/^```/, "");
        if (jsonStr.endsWith("```")) jsonStr = jsonStr.substring(0, jsonStr.length - 3);

        const graph: AITourGraph = JSON.parse(jsonStr.trim());

        // Ensure that the returned graph has matching IDs from the inputs
        const validIds = new Set(images.map(img => img.id));
        graph.connections = graph.connections.filter(c => validIds.has(c.from) && validIds.has(c.to));

        return graph;

    } catch (error) {
        console.error("Failed to generate AI Tour Graph, using fallback:", error);
        return createFallbackGraph();
    }
}
