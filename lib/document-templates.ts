// ────────────────────────────────────────────────────────────
//  Document Templates — 10 documentos imobiliários padrão
// ────────────────────────────────────────────────────────────

export type FieldType = "text" | "textarea" | "date" | "currency" | "cpf" | "phone" | "number" | "select" | "file" | "checklist";

export interface FieldDef {
    key: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
    section?: string;
}

export interface DocumentTemplate {
    id: string;
    name: string;
    shortName: string;
    description: string;
    category: "recibo" | "autorizacao" | "declaracao" | "proposta" | "ficha" | "termo";
    icon: string;          // lucide icon name
    color: string;         // tailwind classes
    fields: FieldDef[];
    generateText: (data: Record<string, string>, brokerData?: BrokerData, language?: string) => string;
}

export interface BrokerData {
    name?: string;
    creci?: string;
    phone?: string;
    email?: string;
    company?: string;
}

const today = (lang?: string) => {
    const locale = lang === "en" ? "en-US" : lang === "es" ? "es-ES" : "pt-BR";
    return new Date().toLocaleDateString(locale);
};

const fmt = (v: string) => v || "___________________";

const fmtCurrency = (v: string, lang?: string) => {
    if (!v) return lang === "en" ? "$ ___________" : "R$ ___________";
    const num = Number(v.replace(/[^\d.]/g, ""));
    const locale = lang === "en" ? "en-US" : lang === "es" ? "es-ES" : "pt-BR";
    const currency = lang === "en" ? "USD" : "BRL";
    return num.toLocaleString(locale, { style: "currency", currency, minimumFractionDigits: 2 });
};

// ── 1. Recibo de Entrega de Chaves ───────────────────────
const reciboChaves: DocumentTemplate = {
    id: "recibo-chaves",
    name: "Recibo de Entrega de Chaves",
    shortName: "Entrega de Chaves",
    description: "Comprova a entrega de chaves em aluguéis, vendas ou devoluções.",
    category: "recibo",
    icon: "Key",
    color: "text-amber-600 bg-amber-50",
    fields: [
        {
            key: "tipo", label: "Tipo de Ato", type: "select", required: true, section: "Ato",
            options: [{ value: "entrega", label: "Entrega" }, { value: "devolucao", label: "Devolução" }, { value: "venda", label: "Compra e Venda" }]
        },
        { key: "data", label: "Data", type: "date", required: true, section: "Ato" },
        { key: "local", label: "Local (Cidade - UF)", type: "text", required: true, placeholder: "São Paulo - SP", section: "Ato" },

        { key: "cedente_nome", label: "Cedente — Nome Completo", type: "text", required: true, section: "Cedente" },
        { key: "cedente_cpf", label: "Cedente — CPF/CNPJ", type: "cpf", required: true, section: "Cedente" },
        { key: "cedente_rg", label: "Cedente — RG", type: "text", section: "Cedente" },
        { key: "cedente_estado_civil", label: "Cedente — Estado Civil", type: "select", section: "Cedente", options: [{ value: "Solteiro(a)", label: "Solteiro(a)" }, { value: "Casado(a)", label: "Casado(a)" }, { value: "Divorciado(a)", label: "Divorciado(a)" }, { value: "Viúvo(a)", label: "Viúvo(a)" }] },
        {
            key: "cedente_tipo", label: "Papel do Cedente", type: "select", section: "Cedente",
            options: [{ value: "Locador", label: "Locador" }, { value: "Vendedor", label: "Vendedor" }, { value: "Imobiliária", label: "Imobiliária" }]
        },

        { key: "cessionario_nome", label: "Cessionário — Nome Completo", type: "text", required: true, section: "Cessionário" },
        { key: "cessionario_cpf", label: "Cessionário — CPF", type: "cpf", required: true, section: "Cessionário" },
        { key: "cessionario_rg", label: "Cessionário — RG", type: "text", section: "Cessionário" },
        { key: "cessionario_estado_civil", label: "Cessionário — Estado Civil", type: "select", section: "Cessionário", options: [{ value: "Solteiro(a)", label: "Solteiro(a)" }, { value: "Casado(a)", label: "Casado(a)" }, { value: "Divorciado(a)", label: "Divorciado(a)" }, { value: "Viúvo(a)", label: "Viúvo(a)" }] },
        {
            key: "cessionario_tipo", label: "Papel do Cessionário", type: "select", section: "Cessionário",
            options: [{ value: "Locatário", label: "Locatário" }, { value: "Comprador", label: "Comprador" }]
        },

        { key: "imovel", label: "Endereço Completo do Imóvel", type: "text", required: true, section: "Imóvel" },
        { key: "matricula", label: "Matrícula do Imóvel", type: "text", section: "Imóvel" },
        { key: "inscricao", label: "Inscrição Municipal (IPTU)", type: "text", section: "Imóvel" },
        { key: "chaves_qtd", label: "Quantidade de Chaves", type: "number", required: true, placeholder: "2", section: "Imóvel" },
        { key: "chaves_desc", label: "Descrição das Chaves", type: "text", placeholder: "Chave da porta principal e fundos", section: "Imóvel" },
        {
            key: "estado_imovel", label: "Estado de Conservação", type: "select", section: "Imóvel",
            options: [{ value: "Excelente", label: "Excelente" }, { value: "Bom", label: "Bom" }, { value: "Regular", label: "Regular" }, { value: "Necessita Reparos", label: "Necessita Reparos" }]
        },

        { key: "foro", label: "Foro (Cidade/UF para disputas)", type: "text", placeholder: "Ex: São Paulo - SP", section: "Extras" },
        { key: "observacoes", label: "Observações Adicionais", type: "textarea", section: "Extras" },

        { key: "testemunha1_nome", label: "Testemunha 1 — Nome", type: "text", required: true, section: "Testemunhas" },
        { key: "testemunha1_cpf", label: "Testemunha 1 — CPF", type: "cpf", section: "Testemunhas" },
        { key: "testemunha2_nome", label: "Testemunha 2 — Nome (Opcional)", type: "text", section: "Testemunhas" },
        { key: "testemunha2_cpf", label: "Testemunha 2 — CPF", type: "cpf", section: "Testemunhas" },
    ],
    generateText: (d, b, lang) => {
        const isEn = lang === "en";
        const isEs = lang === "es";

        const title = isEn ? "KEY HANDOVER RECEIPT" : isEs ? "RECIBO DE ENTREGA DE LLAVES" : "RECIBO DE ENTREGA DE CHAVES";
        const intros = {
            en: "By this private instrument, the parties qualified below confirm the delivery/return of the keys of the property object of this negotiation.",
            es: "Por el presente instrumento privado, las partes calificadas a continuación confirman la entrega/devolución de las llaves del inmueble objeto de la negociación.",
            pt: "Pelo presente instrumento particular, as partes abaixo qualificadas confirmam a entrega/devolução das chaves do imóvel objeto da negociação."
        };
        const labels = {
            property: isEn ? "PROPERTY" : isEs ? "INMUEBLE" : "IMÓVEL",
            matricula: isEn ? "REGISTRATION" : isEs ? "MATRÍCULA" : "MATRÍCULA",
            iptu: isEn ? "MUNICIPAL TAX ID" : isEs ? "INSCRIPCIÓN MUNICIPAL" : "INSCRIÇÃO MUNICIPAL",
            keys: isEn ? "KEYS DELIVERED" : isEs ? "LLAVES ENTREGADAS" : "CHAVES ENTREGUES",
            state: isEn ? "CONSERVATION STATE" : isEs ? "ESTADO DE CONSERVACIÓN" : "ESTADO DE CONSERVAÇÃO",
            witnesses: isEn ? "WITNESSES" : isEs ? "TESTIGOS" : "TESTEMUNHAS",
            notes: isEn ? "NOTES" : isEs ? "OBSERVACIONES" : "OBSERVAÇÕES",
            intermed: isEn ? "Intermediation" : isEs ? "Intermediación" : "Intermediação"
        };

        const locale = isEn ? "en-US" : isEs ? "es-ES" : "pt-BR";
        const dateStr = d.data ? new Date(d.data).toLocaleDateString(locale) : today(lang);

        return `
${title}

${fmt(d.local)}, ${dateStr}

${intros[isEn ? "en" : isEs ? "es" : "pt"]}

${fmt(d.cedente_tipo || (isEn ? "Grantor" : isEs ? "Cedente" : "Cedente")).toUpperCase()}: ${fmt(d.cedente_nome)}${d.cedente_estado_civil ? `, ${d.cedente_estado_civil}` : ""}${d.cedente_rg ? `, ${isEn ? "ID" : "RG"} n.º ${d.cedente_rg}` : ""} ${isEn ? "and Tax ID" : "e CPF"} n.º ${fmt(d.cedente_cpf)}.

${fmt(d.cessionario_tipo || (isEn ? "Grantee" : isEs ? "Cestionario" : "Cessionário")).toUpperCase()}: ${fmt(d.cessionario_nome)}${d.cessionario_estado_civil ? `, ${d.cessionario_estado_civil}` : ""}${d.cessionario_rg ? `, ${isEn ? "ID" : "RG"} n.º ${d.cessionario_rg}` : ""} ${isEn ? "and Tax ID" : "e CPF"} n.º ${fmt(d.cessionario_cpf)}.

${labels.property}: ${fmt(d.imovel)}
${d.matricula ? `${labels.matricula}: ${d.matricula}\n` : ""}${d.inscricao ? `${labels.iptu}: ${d.inscricao}\n` : ""}
${labels.keys}: ${fmt(d.chaves_qtd)} ${isEn ? "units" : "unidade(s)"} — ${fmt(d.chaves_desc)}
${labels.state}: ${fmt(d.estado_imovel)}

${isEn ? "The parties declare that on this date the keys were handed over for the property described above, with nothing more to claim from each other by this act." : isEs ? "Las partes declaran que en esta fecha se procedió a la entrega de las llaves referentes al inmueble arriba descrito, nada más habiendo que reclamar entre sí por el presente acto." : "As partes declaram que nesta data procedeu-se à entrega das chaves referente ao imóvel acima descrito, nada mais havendo a reclamar entre si pelo presente ato."} ${isEn ? "The jurisdiction of" : isEs ? "Se elige el foro de la ciudad de" : "Fica eleito o foro da comarca de"} ${fmt(d.foro || d.local)} ${isEn ? "is chosen for any disputes arising from this document." : "para dirimir quaisquer dúvidas oriundas deste documento."}

${d.observacoes ? `${labels.notes}: ${d.observacoes}\n\n` : ""}

${b?.name ? `${labels.intermed}: ${b.name}${b.creci ? ` — CRECI ${b.creci}` : ""}` : ""}

${labels.witnesses}:
1. ${fmt(d.testemunha1_nome)} | ${isEn ? "Tax ID" : "CPF"}: ${fmt(d.testemunha1_cpf)}
${d.testemunha2_nome ? `2. ${d.testemunha2_nome} | ${isEn ? "Tax ID" : "CPF"}: ${fmt(d.testemunha2_cpf)}` : ""}
        `.trim();
    },
};

// ── 2. Recibo de Sinal de Negócio ────────────────────────
const reciboSinal: DocumentTemplate = {
    id: "recibo-sinal",
    name: "Recibo de Sinal de Negócio",
    shortName: "Sinal de Negócio",
    description: "Confirma o recebimento de sinal para reserva ou início de negociação.",
    category: "recibo",
    icon: "Banknote",
    color: "text-emerald-600 bg-emerald-50",
    fields: [
        { key: "data", label: "Data", type: "date", required: true, section: "Ato" },
        { key: "local", label: "Local (Cidade - UF)", type: "text", required: true, section: "Ato" },
        { key: "valor_sinal", label: "Valor do Sinal (R$)", type: "currency", required: true, section: "Ato" },
        {
            key: "forma_pagamento", label: "Forma de Pagamento", type: "select", required: true, section: "Ato",
            options: [{ value: "PIX", label: "PIX" }, { value: "Transferência", label: "Transferência" }, { value: "Dinheiro", label: "Dinheiro" }, { value: "Cheque", label: "Cheque" }]
        },
        { key: "vendedor_nome", label: "Vendedor / Cedente — Nome Completo", type: "text", required: true, section: "Vendedor" },
        { key: "vendedor_cpf", label: "Vendedor — CPF/CNPJ", type: "cpf", required: true, section: "Vendedor" },
        { key: "vendedor_rg", label: "Vendedor — RG", type: "text", section: "Vendedor" },
        { key: "vendedor_estado_civil", label: "Vendedor — Estado Civil", type: "select", section: "Vendedor", options: [{ value: "Solteiro(a)", label: "Solteiro(a)" }, { value: "Casado(a)", label: "Casado(a)" }, { value: "Divorciado(a)", label: "Divorciado(a)" }, { value: "Viúvo(a)", label: "Viúvo(a)" }] },
        { key: "comprador_nome", label: "Comprador — Nome Completo", type: "text", required: true, section: "Comprador" },
        { key: "comprador_cpf", label: "Comprador — CPF", type: "cpf", required: true, section: "Comprador" },
        { key: "comprador_rg", label: "Comprador — RG", type: "text", section: "Comprador" },
        { key: "comprador_tel", label: "Comprador — Telefone", type: "phone", section: "Comprador" },
        { key: "imovel", label: "Endereço Completo do Imóvel", type: "text", required: true, section: "Imóvel" },
        { key: "matricula", label: "Matrícula do Imóvel", type: "text", section: "Imóvel" },
        { key: "valor_total", label: "Valor Total da Comercialização (R$)", type: "currency", required: true, section: "Imóvel" },
        { key: "prazo_contrato", label: "Prazo para Contrato Definitivo", type: "text", placeholder: "Ex: 30 dias", section: "Imóvel" },
        {
            key: "clausula_desistencia", label: "Regras de Desistência", type: "select", section: "Extras",
            options: [{ value: "O sinal será perdido pelo comprador se desistir", label: "Sinal perdido se comprador desistir" }, { value: "O sinal será devolvido em dobro se vendedor desistir", label: "Devolvido em dobro se vendedor desistir" }, { value: "O valor será abatido do pagamento final", label: "Sinal abatido do valor total" }]
        },
        { key: "observacoes", label: "Observações Adicionais", type: "textarea", section: "Extras" },
        { key: "testemunha1_nome", label: "Testemunha 1 — Nome", type: "text", required: true, section: "Testemunhas" },
        { key: "testemunha1_cpf", label: "Testemunha 1 — CPF", type: "cpf", section: "Testemunhas" },
        { key: "testemunha2_nome", label: "Testemunha 2 — Nome", type: "text", section: "Testemunhas" },
        { key: "testemunha2_cpf", label: "Testemunha 2 — CPF", type: "cpf", section: "Testemunhas" },
    ],
    generateText: (d, b, lang) => {
        const isEn = lang === "en";
        const isEs = lang === "es";

        const title = isEn ? "BUSINESS SIGNAL AND DOWN PAYMENT RECEIPT" : isEs ? "RECIBO DE SEÑAL DE NEGOCIO Y PRINCIPIO DE PAGO" : "RECIBO DE SINAL DE NEGÓCIO E PRINCÍPIO DE PAGAMENTO";
        const intros = {
            en: "By this instrument, the Seller confesses to have received from the Buyer the above amount, as a business signal and down payment for the acquisition of the property described above.",
            es: "Por el presente, el Vendedor confiesa haber recibido del Comprador la cantidad mencionada, en concepto de señal de negocio y principio de pago para la adquisición del inmueble arriba descrito.",
            pt: "Pelo presente, o Vendedor confessa ter recebido do Comprador a quantia supra, a título de sinal de negócio e princípio de pagamento para a aquisição do imóvel acima descrito."
        };
        const labels = {
            seller: isEn ? "SELLER" : isEs ? "VENDEDOR" : "VENDEDOR",
            buyer: isEn ? "BUYER" : isEs ? "COMPRADOR" : "COMPRADOR",
            property: isEn ? "PROPERTY" : isEs ? "INMUEBLE" : "IMÓVEL",
            matricula: isEn ? "REGISTRATION" : isEs ? "MATRÍCULA" : "MATRÍCULA",
            totalValue: isEn ? "TOTAL MARKET VALUE" : isEs ? "VALOR TOTAL DE COMERCIALIZACIÓN" : "VALOR DA COMERCIALIZAÇÃO",
            signalValue: isEn ? "SIGNAL RECEIVED" : isEs ? "VALOR DE LA SEÑAL RECIBIDA" : "VALOR DO SINAL RECEBIDO",
            paymentForm: isEn ? "PAYMENT METHOD" : isEs ? "FORMA DE PAGO" : "FORMA DE PAGAMENTO",
            withdrawalRules: isEn ? "WITHDRAWAL RULES" : isEs ? "REGLAS DE DESISTIMIENTO" : "REGRAS DE DESISTÊNCIA",
            contractTerm: isEn ? "DEADLINE FOR DEED/CONTRACT" : isEs ? "PLAZO PARA ESCRITURA/CONTRATO" : "PRAZO PARA ESCRITURA/CONTRATO",
            notes: isEn ? "NOTES" : isEs ? "OBSERVACIONES" : "OBSERVAÇÕES",
            intermed: isEn ? "Intermediation" : isEs ? "Intermediación" : "Intermediação",
            witnesses: isEn ? "WITNESSES" : isEs ? "TESTIGOS" : "TESTEMUNHAS"
        };

        const locale = isEn ? "en-US" : isEs ? "es-ES" : "pt-BR";
        const dateStr = d.data ? new Date(d.data).toLocaleDateString(locale) : today(lang);

        return `
${title}

${fmt(d.local)}, ${dateStr}

${labels.seller}: ${fmt(d.vendedor_nome)} | ${isEn ? "Tax ID" : "CPF/CNPJ"}: ${fmt(d.vendedor_cpf)}${d.vendedor_rg ? ` | ${isEn ? "ID" : "RG"}: ${d.vendedor_rg}` : ""}${d.vendedor_estado_civil ? ` | ${isEn ? "Marital Status" : "Estado Civil"}: ${d.vendedor_estado_civil}` : ""}

${labels.buyer}: ${fmt(d.comprador_nome)} | ${isEn ? "Tax ID" : "CPF"}: ${fmt(d.comprador_cpf)}${d.comprador_rg ? ` | ${isEn ? "ID" : "RG"}: ${d.comprador_rg}` : ""}${d.comprador_tel ? ` | ${isEn ? "Tel" : "Tel"}: ${d.comprador_tel}` : ""}

${labels.property}: ${fmt(d.imovel)}${d.matricula ? ` — ${labels.matricula} n.º ${d.matricula}` : ""}
${labels.totalValue}: ${fmtCurrency(d.valor_total, lang)}

${labels.signalValue}: ${fmtCurrency(d.valor_sinal, lang)}
${labels.paymentForm}: ${fmt(d.forma_pagamento)}

${intros[isEn ? "en" : isEs ? "es" : "pt"]}
${d.clausula_desistencia ? `\n${labels.withdrawalRules}: ${d.clausula_desistencia}\n` : ""}${d.prazo_contracto ? `${labels.contractTerm}: ${d.prazo_contracto}\n` : ""}

${d.observacoes ? `${labels.notes}: ${d.observacoes}\n\n` : ""}${b?.name ? `${labels.intermed}: ${b.name}${b.creci ? ` — CRECI ${b.creci}` : ""}` : ""}

${labels.witnesses}:
1. ${fmt(d.testemunha1_nome)} | ${isEn ? "Tax ID" : "CPF"}: ${fmt(d.testemunha1_cpf)}
${d.testemunha2_nome ? `2. ${d.testemunha2_nome} | ${isEn ? "Tax ID" : "CPF"}: ${fmt(d.testemunha2_cpf)}` : ""}
        `.trim();
    },
};

// ── 3. Recibo de Pagamento ────────────────────────────────
const reciboPagamento: DocumentTemplate = {
    id: "recibo-pagamento",
    name: "Recibo de Pagamento",
    shortName: "Recibo de Pagamento",
    description: "Confirma o recebimento de qualquer valor relacionado a imóvel.",
    category: "recibo",
    icon: "Receipt",
    color: "text-blue-600 bg-blue-50",
    fields: [
        { key: "data", label: "Data", type: "date", required: true, section: "Ato" },
        { key: "local", label: "Local (Cidade - UF)", type: "text", required: true, section: "Ato" },
        { key: "valor", label: "Valor Recebido (R$)", type: "currency", required: true, section: "Ato" },
        {
            key: "forma_pagamento", label: "Forma de Pagamento", type: "select", required: true, section: "Ato",
            options: [{ value: "PIX", label: "PIX" }, { value: "Transferência", label: "Transferência" }, { value: "Dinheiro", label: "Dinheiro" }, { value: "Cheque", label: "Cheque" }, { value: "Boleto", label: "Boleto" }]
        },
        { key: "referencia", label: "Descrição do Pagamento", type: "text", required: true, placeholder: "Ex: Aluguel referente a março/2025", section: "Ato" },
        { key: "pagador_nome", label: "Pagador — Nome Completo", type: "text", required: true, section: "Partes" },
        { key: "pagador_cpf", label: "Pagador — CPF/CNPJ", type: "cpf", required: true, section: "Partes" },
        { key: "pagador_rg", label: "Pagador — RG", type: "text", section: "Partes" },
        { key: "recebedor_nome", label: "Recebedor — Nome Completo", type: "text", required: true, section: "Partes" },
        { key: "recebedor_cpf", label: "Recebedor — CPF/CNPJ", type: "cpf", required: true, section: "Partes" },
        { key: "recebedor_rg", label: "Recebedor — RG", type: "text", section: "Partes" },
        { key: "imovel", label: "Endereço do Imóvel", type: "text", section: "Imóvel" },
        { key: "observacoes", label: "Observações Adicionais", type: "textarea", section: "Extras" },
    ],
    generateText: (d, b, lang) => {
        const isEn = lang === "en";
        const isEs = lang === "es";

        const title = isEn ? "PAYMENT RECEIPT" : isEs ? "RECIBO DE PAGO" : "RECIBO DE PAGAMENTO";
        const labels = {
            desc: isEn ? "DESCRIPTION" : isEs ? "DESCRIPCIÓN" : "DESCRIÇÃO",
            property: isEn ? "PROPERTY" : isEs ? "INMUEBLE" : "IMÓVEL",
            receiver: isEn ? "RECEIVER" : isEs ? "RECEPTOR" : "RECEBEDOR",
            notes: isEn ? "NOTES" : isEs ? "OBSERVACIONES" : "OBSERVAÇÕES",
            intermed: isEn ? "Intermediation" : isEs ? "Intermediación" : "Intermediação"
        };

        const locale = isEn ? "en-US" : isEs ? "es-ES" : "pt-BR";
        const dateStr = d.data ? new Date(d.data).toLocaleDateString(locale) : today(lang);

        return `
${title}

${isEn ? "I received from" : isEs ? "Recibí de" : "Recebi de"} ${fmt(d.pagador_nome)}, ${isEn ? "Tax ID" : "inscrito no CPF"} n.º ${fmt(d.pagador_cpf)}${d.pagador_rg ? ` ${isEn ? "and ID" : "e RG"} n.º ${d.pagador_rg}` : ""}, ${isEn ? "the amount of" : isEs ? "la importancia de" : "a importância de"} ${fmtCurrency(d.valor, lang)}, ${isEn ? "paid via" : isEs ? "pagada vía" : "paga via"} ${fmt(d.forma_pagamento)}, ${isEn ? "referring to" : isEs ? "referente a" : "referente a"}:

${labels.desc}: ${fmt(d.referencia)}
${d.imovel ? `${labels.property}: ${d.imovel}\n` : ""}

${isEn ? "By this, I give full and general discharge of the amount received." : isEs ? "Por la presente, doy plena y general liberación del valor recibido." : "Pelo presente, dou plena e geral quitação do valor recebido."}

${fmt(d.local)}, ${dateStr}

${labels.receiver}:
${isEn ? "Name" : isEs ? "Nombre" : "Nome"}: ${fmt(d.recebedor_nome)}
${isEn ? "Tax ID" : "CPF/CNPJ"}: ${fmt(d.recebedor_cpf)}
${d.recebedor_rg ? `${isEn ? "ID" : "RG"}: ${d.recebedor_rg}` : ""}

${d.observacoes ? `${labels.notes}: ${d.observacoes}\n\n` : ""}${b?.name ? `${labels.intermed}: ${b.name}${b.creci ? ` — CRECI ${b.creci}` : ""}` : ""}
        `.trim();
    },
};

// ── 4. Proposta de Compra ─────────────────────────────────
const propostaCompra: DocumentTemplate = {
    id: "proposta-compra",
    name: "Proposta de Compra de Imóvel",
    shortName: "Proposta de Compra",
    description: "Formaliza uma proposta de aquisição com valor, condições e prazo.",
    category: "proposta",
    icon: "FileSignature",
    color: "text-violet-600 bg-violet-50",
    fields: [
        { key: "data", label: "Data da Proposta", type: "date", required: true, section: "Proposta" },
        { key: "local", label: "Local (Cidade - UF)", type: "text", required: true, section: "Proposta" },
        { key: "validade", label: "Validade da Proposta", type: "text", placeholder: "Ex: 48 horas", section: "Proposta" },

        { key: "comprador_nome", label: "Proponente — Nome Completo", type: "text", required: true, section: "Proponente" },
        { key: "comprador_cpf", label: "Proponente — CPF/CNPJ", type: "cpf", required: true, section: "Proponente" },
        { key: "comprador_rg", label: "Proponente — RG", type: "text", section: "Proponente" },
        { key: "comprador_nacionalidade", label: "Proponente — Nacionalidade", type: "text", section: "Proponente" },
        { key: "comprador_profissao", label: "Proponente — Profissão", type: "text", section: "Proponente" },
        { key: "comprador_estado_civil", label: "Proponente — Estado Civil", type: "select", section: "Proponente", options: [{ value: "Solteiro(a)", label: "Solteiro(a)" }, { value: "Casado(a)", label: "Casado(a)" }, { value: "Divorciado(a)", label: "Divorciado(a)" }, { value: "Viúvo(a)", label: "Viúvo(a)" }] },
        { key: "comprador_email", label: "Proponente — E-mail", type: "text", section: "Proponente" },
        { key: "comprador_tel", label: "Proponente — Telefone", type: "phone", section: "Proponente" },

        { key: "imovel", label: "Endereço Completo do Imóvel", type: "text", required: true, section: "Imóvel" },
        { key: "matricula", label: "Matrícula / Registro", type: "text", section: "Imóvel" },
        { key: "iptu", label: "Inscrição Municipal / IPTU", type: "text", section: "Imóvel" },

        { key: "valor_proposta", label: "Valor da Proposta (R$)", type: "currency", required: true, section: "Financeiro" },
        { key: "valor_sinal", label: "Sinal/Arras Proposto (R$)", type: "currency", section: "Financeiro" },
        {
            key: "forma_pagamento", label: "Condições de Pagamento", type: "select", required: true, section: "Financeiro",
            options: [{ value: "À vista", label: "À vista" }, { value: "Financiamento bancário", label: "Financiamento bancário" }, { value: "FGTS + Recursos Próprios", label: "FGTS + Recursos Próprios" }, { value: "Parcelamento direto", label: "Parcelamento direto" }]
        },
        { key: "prazo_fechamento", label: "Prazo Estimado para Escritura", type: "text", placeholder: "60 dias", section: "Financeiro" },
        { key: "condicoes", label: "Condições Especiais / Comentários", type: "textarea", section: "Extras" },
    ],
    generateText: (d, b, lang) => {
        const isEn = lang === "en";
        const isEs = lang === "es";

        const title = isEn ? "PROPERTY PURCHASE PROPOSAL" : isEs ? "PROPUESTA DE COMPRA DE INMUEBLE" : "PROPOSTA DE COMPRA DE IMÓVEL";
        const labels = {
            proponent: isEn ? "PROPONENT BUYER" : isEs ? "PROPONENTE COMPRADOR" : "PROPONENTE COMPRADOR",
            property: isEn ? "PROPERTY OBJECT OF THE PROPOSAL" : isEs ? "INMUEBLE OBJETO DE LA PROPUESTA" : "IMÓVEL OBJETO DA PROPOSTA",
            address: isEn ? "Address" : isEs ? "Dirección" : "Endereço",
            matricula: isEn ? "Registration n.º" : isEs ? "Matrícula n.º" : "Matrícula n.º",
            iptu: isEn ? "Municipal ID (Tax)" : isEs ? "Inscripción Municipal (IPTU)" : "Inscrição Municipal (IPTU)",
            conditions: isEn ? "PROPOSAL CONDITIONS" : isEs ? "CONDICIONES DE LA PROPUESTA" : "CONDIÇÕES DA PROPOSTA",
            totalValue: isEn ? "TOTAL PROPOSED VALUE" : isEs ? "VALOR TOTAL PROPUESTO" : "VALOR TOTAL PROPOSTO",
            signalValue: isEn ? "PROPOSED SIGNAL/ARRAS" : isEs ? "SEÑAL/ARRAS PROPUESTA" : "SINAL/ARRAS PROPOSTO",
            paymentTerms: isEn ? "PAYMENT CONDITIONS" : isEs ? "CONDICIONES DE PAGO" : "CONDIÇÕES DE PAGAMENTO",
            closingTerm: isEn ? "ESTIMATED CLOSING TERM" : isEs ? "PLAZO ESTIMADO PARA CIERRE" : "PRAZO PARA FECHAMENTO",
            validity: isEn ? "PROPOSAL VALIDITY" : isEs ? "VALIDEZ DE ESTA PROPUESTA" : "VALIDADE DESTA PROPOSTA",
            specialConditions: isEn ? "SPECIAL CONDITIONS" : isEs ? "CONDICIONES ESPECIALES" : "CONDIÇÕES ESPECIAIS",
            intermed: isEn ? "Intermediation" : isEs ? "Intermediación" : "Intermediação"
        };

        const locale = isEn ? "en-US" : isEs ? "es-ES" : "pt-BR";
        const dateStr = d.data ? new Date(d.data).toLocaleDateString(locale) : today(lang);

        return `
${title}

${fmt(d.local)}, ${dateStr}

${labels.proponent}:
${fmt(d.comprador_nome)}, ${fmt(d.comprador_nacionalidade || (isEn ? "citizen" : isEs ? "ciudadano(a)" : "brasileiro(a)"))}, ${fmt(d.comprador_estado_civil)}, ${fmt(d.comprador_profissao)}, ${isEn ? "holder of ID" : "portador do RG"} n.º ${fmt(d.comprador_rg)} ${isEn ? "and Tax ID" : "e inscrito no CPF"} n.º ${fmt(d.comprador_cpf)}.
${isEn ? "Contact" : "Contato"}: ${d.comprador_email || "N/A"} | ${isEn ? "Tel" : "Tel"}: ${d.comprador_tel || "N/A"}

${labels.property}:
${labels.address}: ${fmt(d.imovel)}
${d.matricula ? `${labels.matricula} ${d.matricula}\n` : ""}${d.iptu ? `${labels.iptu}: ${d.iptu}\n` : ""}

${labels.conditions}:
${labels.totalValue}: ${fmtCurrency(d.valor_proposta, lang)}
${labels.signalValue}: ${fmtCurrency(d.valor_sinal, lang)}
${labels.paymentTerms}: ${fmt(d.forma_pagamento)}
${d.prazo_fechamento ? `${labels.closingTerm}: ${d.prazo_fechamento}\n` : ""}${d.validade ? `${labels.validity}: ${d.validade}\n` : ""}

${isEn ? "The above-qualified proponent expresses irrevocable interest in acquiring the described property, under the conditions hereby presented, awaiting formal acceptance from the owner to start the contractual procedures." : isEs ? "El proponente arriba calificado manifiesta interés irrevocable en la adquisición del inmueble descrito, en las condiciones aquí presentadas, esperando la aceptación formal del propietario para el inicio de los procedimientos contractuales." : "O proponente acima qualificado manifesta interesse irretratável na aquisição do imóvel descrito, nas condições ora apresentadas, aguardando a aceitação formal do proprietário para início dos procedimentos contratuais."}

${d.condicoes ? `${labels.specialConditions}:\n${d.condicoes}\n\n` : ""}${b?.name ? `${labels.intermed}: ${b.name}${b.creci ? ` — CRECI ${b.creci}` : ""}` : ""}
        `.trim();
    },
};

// ── 5. Autorização de Visita ──────────────────────────────
const autorizacaoVisita: DocumentTemplate = {
    id: "autorizacao-visita",
    name: "Autorização de Visita",
    shortName: "Autorização de Visita",
    description: "Autoriza o corretor a realizar visitas com potenciais compradores.",
    category: "autorizacao",
    icon: "DoorOpen",
    color: "text-sky-600 bg-sky-50",
    fields: [
        { key: "data", label: "Data de Emissão", type: "date", required: true, section: "Ato" },
        { key: "local", label: "Local (Cidade - UF)", type: "text", required: true, section: "Ato" },
        { key: "proprietario_nome", label: "Proprietário — Nome Completo", type: "text", required: true, section: "Proprietário" },
        { key: "proprietario_cpf", label: "Proprietário — CPF/CNPJ", type: "cpf", required: true, section: "Proprietário" },
        { key: "proprietario_rg", label: "Proprietário — RG", type: "text", section: "Proprietário" },
        { key: "visitante_nome", label: "Visitante Interessado — Nome", type: "text", section: "Visitante" },
        { key: "visitante_cpf", label: "Visitante — CPF", type: "cpf", section: "Visitante" },
        { key: "imovel", label: "Endereço Completo do Imóvel", type: "text", required: true, section: "Imóvel" },
        { key: "matricula", label: "Matrícula do Imóvel", type: "text", section: "Imóvel" },
        { key: "data_visita", label: "Data Prevista da Visita", type: "date", section: "Visita" },
        { key: "horario_visita", label: "Horário", type: "text", placeholder: "Ex: 14:00", section: "Visita" },
        { key: "observacoes", label: "Observações / Condições", type: "textarea", section: "Extras" },
    ],
    generateText: (d, b, lang) => {
        const isEn = lang === "en";
        const isEs = lang === "es";

        const title = isEn ? "PROPERTY VISIT AUTHORIZATION" : isEs ? "AUTORIZACIÓN DE VISITA AL INMUEBLE" : "AUTORIZAÇÃO DE VISITA AO IMÓVEL";
        const labels = {
            owner: isEn ? "OWNER" : isEs ? "PROPRIETARIO" : "PROPRIETÁRIO",
            property: isEn ? "PROPERTY" : isEs ? "INMUEBLE" : "IMÓVEL",
            matricula: isEn ? "Registration n.º" : isEs ? "Matrícula n.º" : "Matrícula n.º",
            visitDate: isEn ? "VISIT DATE" : isEs ? "FECHA DE VISITA" : "DATA DA VISITA",
            at: isEn ? "AT" : isEs ? "A LAS" : "ÀS",
            notes: isEn ? "NOTES / CONDITIONS" : isEs ? "OBSERVACIONES / CONDICIONES" : "OBSERVAÇÕES / CONDIÇÕES",
            brokerRes: isEn ? "Responsible Broker" : isEs ? "Corredor Responsable" : "Corretor Responsável"
        };

        const locale = isEn ? "en-US" : isEs ? "es-ES" : "pt-BR";
        const dateStr = d.data ? new Date(d.data).toLocaleDateString(locale) : today(lang);

        return `
${title}

${fmt(d.local)}, ${dateStr}

${labels.owner}: ${fmt(d.proprietario_nome)}${d.proprietario_rg ? ` | ${isEn ? "ID" : "RG"}: ${d.proprietario_rg}` : ""} | ${isEn ? "Tax ID" : "CPF"}: ${fmt(d.proprietario_cpf)}

${isEn ? "I," : isEs ? "Yo," : "Eu,"} ${fmt(d.proprietario_nome)}, ${isEn ? "as the owner/possessor of the property described below, AUTHORIZE the broker" : isEs ? "en la calidad de propietario/poseedor del inmueble abajo descrito, AUTORIZO al corredor" : "na qualidade de proprietário/possuidor do imóvel abaixo descrito, AUTORIZO o(a) corretor(a)"} ${b?.name ?? "___________________________"}${b?.creci ? ` (CRECI ${b.creci})` : ""} ${isEn ? "to carry out a technical/commercial visit to said property with Mr(a)." : isEs ? "a realizar visita técnica/comercial al referido inmueble con el Sr(a)." : "a realizar visita técnica/comercial ao referido imóvel com o Sr(a)."} ${fmt(d.visitante_nome || (isEn ? "interested party" : isEs ? "interesado(a)" : "interessado(a)"))}${isEn ? ", in order to present it for marketing/rental purposes." : isEs ? ", con el fin de presentar el mismo para fines de comercialización/alquiler." : ", no intuito de apresentar o mesmo para fins de comercialização/locação."}

${labels.property}: ${fmt(d.imovel)}${d.matricula ? ` — ${labels.matricula} ${d.matricula}` : ""}
${d.data_visita ? `${labels.visitDate}: ${new Date(d.data_visita).toLocaleDateString(locale)}` : ""}${d.horario_visita ? ` ${labels.at} ${d.horario_visita}` : ""}

${isEn ? "I undertake to provide access to the property at the agreed time, as well as to ensure the necessary security conditions for the performance of the act." : isEs ? "Me comprometo a franquear el acceso al inmueble en el horario acordado, así como garantizar las condiciones de seguridad necesarias para la realización del acto." : "Comprometo-me a franquear o acesso ao imóvel no horário acordado, bem como garantir as condições de segurança necessárias para a realização do ato."}

${d.observacoes ? `${labels.notes}: ${d.observacoes}\n\n` : ""}${b?.name ? `${labels.brokerRes}: ${b.name}${b.creci ? ` — CRECI ${b.creci}` : ""}` : ""}
        `.trim();
    },
};

// ── 6. Declaração de Visita ───────────────────────────────
const declaracaoVisita: DocumentTemplate = {
    id: "declaracao-visita",
    name: "Declaração de Visita e Reconhecimento",
    shortName: "Declaração de Visita",
    description: "Registra formalmente que o cliente visitou o imóvel intermediado pelo corretor.",
    category: "declaracao",
    icon: "ClipboardCheck",
    color: "text-teal-600 bg-teal-50",
    fields: [
        { key: "data", label: "Data da Visita", type: "date", required: true, section: "Visita" },
        { key: "local", label: "Local (Cidade - UF)", type: "text", required: true, section: "Visita" },
        { key: "horario", label: "Horário", type: "text", placeholder: "Ex: 14:30", section: "Visita" },
        { key: "cliente_nome", label: "Cliente Visitante — Nome Completo", type: "text", required: true, section: "Cliente" },
        { key: "cliente_cpf", label: "Cliente — CPF", type: "cpf", required: true, section: "Cliente" },
        { key: "cliente_rg", label: "Cliente — RG", type: "text", section: "Cliente" },
        { key: "imovel", label: "Endereço Completo do Imóvel", type: "text", required: true, section: "Imóvel" },
        { key: "tipo_imovel", label: "Tipo do Imóvel", type: "text", placeholder: "Ex: Apartamento, Casa", section: "Imóvel" },
        { key: "valor_anunciado", label: "Valor Anunciado na Visita (R$)", type: "currency", section: "Imóvel" },
        { key: "observacoes", label: "Interesse / Feedback do Cliente", type: "textarea", section: "Extras" },
    ],
    generateText: (d, b, lang) => {
        const isEn = lang === "en";
        const isEs = lang === "es";

        const title = isEn ? "PROPERTY VISIT DECLARATION AND INTERMEDIATION RECOGNITION" : isEs ? "DECLARACIÓN DE VISITA AL INMUEBLE Y RECONOCIMIENTO DE INTERMEDIACIÓN" : "DECLARAÇÃO DE VISITA AO IMÓVEL E RECONHECIMENTO DE INTERMEDIAÇÃO";
        const intros = {
            en: `I declare for all legal purposes that, on ${d.data ? new Date(d.data).toLocaleDateString("en-US") : today(lang)}${d.horario ? ` at ${d.horario}` : ""}, I carried out a technical visit to the property located at:`,
            es: `Declaro para los fines legales que, en ${d.data ? new Date(d.data).toLocaleDateString("es-ES") : today(lang)}${d.horario ? ` a las ${d.horario}` : ""}, realicé visita técnica al inmueble ubicado en:`,
            pt: `Declaro para os devidos fins de direito que, em ${d.data ? new Date(d.data).toLocaleDateString("pt-BR") : today(lang)}${d.horario ? ` às ${d.horario}` : ""}, realizei visita técnica ao imóvel localizado em:`
        };
        const labels = {
            property: isEn ? "PROPERTY" : isEs ? "INMUEBLE" : "IMÓVEL",
            type: isEn ? "TYPE" : isEs ? "TIPO" : "TIPO",
            marketValue: isEn ? "INFORMED MARKET VALUE" : isEs ? "VALOR DE MERCADO INFORMADO" : "VALOR DE MERCADO INFORMADO",
            visitorData: isEn ? "VISITOR DATA" : isEs ? "DATOS DEL VISITANTE" : "DADOS DO VISITANTE",
            name: isEn ? "Name" : isEs ? "Nombre" : "Nome",
            notes: isEn ? "CLIENT FEEDBACK" : isEs ? "FEEDBACK DEL CLIENTE" : "FEEDBACK DO CLIENTE",
            intermed: isEn ? "Intermediation" : isEs ? "Intermediación" : "Intermediação"
        };

        const locale = isEn ? "en-US" : isEs ? "es-ES" : "pt-BR";
        const dateStr = d.data ? new Date(d.data).toLocaleDateString(locale) : today(lang);

        return `
${title}

${intros[isEn ? "en" : isEs ? "es" : "pt"]}

${labels.property}: ${fmt(d.imovel)}
${d.tipo_imovel ? `${labels.type}: ${d.tipo_imovel}\n` : ""}${d.valor_anunciado ? `${labels.marketValue}: ${fmtCurrency(d.valor_anunciado, lang)}\n` : ""}

${isEn ? `By this, I RECOGNIZE that I became aware of the availability of the property described above exclusively through the broker ${b?.name ?? "___________________________"}${b?.creci ? ` (CRECI ${b.creci})` : ""}, who accompanied me on the visit and provided all necessary information.` : isEs ? `Por la presente, RECONOZCO que tomé conocimiento de la disponibilidad del inmueble arriba descrito exclusivamente por intermedio del corredor ${b?.name ?? "___________________________"}${b?.creci ? ` (CRECI ${b.creci})` : ""}, quien me acompañó en la visita y prestó toda la información necesaria.` : `Pelo presente, RECONOÇO que tomei conhecimento da disponibilidade do imóvel acima descrito exclusivamente por intermédio do(a) corretor(a) ${b?.name ?? "___________________________"}${b?.creci ? ` (CRECI ${b.creci})` : ""}, quem me acompanhou na visita e prestou todas as informações necessárias.`}

${isEn ? "I further RECOGNIZE that any future negotiation regarding this property will be carried out under the intermediation of said professional, respecting the ethical and legal rules of brokerage." : isEs ? "RECONOZCO además que cualquier negociación futura relativa a este inmueble será realizada bajo la intermediación del referido profesional, respetándose las normas éticas y legales de corretaje." : "RECONHEÇO ainda que qualquer negociação futura relativa a este imóvel será realizada sob a intermediação do referido profissional, respeitando-se as normas éticas e legais de corretagem."}

${labels.visitorData}:
${labels.name}: ${fmt(d.cliente_nome)}
${isEn ? "Tax ID" : "CPF"}: ${fmt(d.cliente_cpf)}${d.cliente_rg ? ` | ${isEn ? "ID" : "RG"}: ${d.cliente_rg}` : ""}

${fmt(d.local)}, ${dateStr}

${d.observacoes ? `${labels.notes}: ${d.observacoes}\n\n` : ""}${labels.intermed}: ${b?.name ?? "___________________________"}${b?.creci ? ` — CRECI ${b.creci}` : ""}
        `.trim();
    },
};

// ── 7. Ficha Cadastral do Cliente ─────────────────────────
const fichaCadastral: DocumentTemplate = {
    id: "ficha-cadastral",
    name: "Ficha Cadastral de Pretendente",
    shortName: "Ficha Cadastral",
    description: "Registra dados completos do cliente para análise de crédito e negociação.",
    category: "ficha",
    icon: "UserCheck",
    color: "text-indigo-600 bg-indigo-50",
    fields: [
        { key: "nome", label: "Nome Completo", type: "text", required: true, section: "Identificação" },
        { key: "cpf", label: "CPF", type: "cpf", required: true, section: "Identificação" },
        { key: "rg", label: "RG / Órgão Emissor", type: "text", section: "Identificação" },
        { key: "data_nascimento", label: "Data de Nascimento", type: "date", section: "Identificação" },
        { key: "nacionalidade", label: "Nacionalidade", type: "text", placeholder: "Ex: Brasileiro(a)", section: "Identificação" },
        { key: "estado_civil", label: "Estado Civil", type: "select", section: "Identificação", options: [{ value: "Solteiro(a)", label: "Solteiro(a)" }, { value: "Casado(a)", label: "Casado(a)" }, { value: "Divorciado(a)", label: "Divorciado(a)" }, { value: "Viúvo(a)", label: "Viúvo(a)" }] },

        { key: "profissao", label: "Profissão / Cargo", type: "text", section: "Profissional" },
        { key: "empresa", label: "Empresa / Local de Trabalho", type: "text", section: "Profissional" },
        { key: "renda", label: "Renda Mensal Comprovada (R$)", type: "currency", section: "Profissional" },

        { key: "telefone", label: "Telefone Principal", type: "phone", required: true, section: "Contato" },
        { key: "email", label: "E-mail Principal", type: "text", section: "Contato" },
        { key: "endereco", label: "Endereço Residencial Atual", type: "text", section: "Contato" },
        { key: "cidade_uf", label: "Cidade - UF", type: "text", section: "Contato" },

        { key: "imovel_interesse", label: "Imóvel de Interesse / Finalidade", type: "text", section: "Interesse" },
        { key: "valor_maximo", label: "Capacidade de Investimento (R$)", type: "currency", section: "Interesse" },
        { key: "possui_fgts", label: "Utilizará FGTS?", type: "select", section: "Interesse", options: [{ value: "Sim", label: "Sim" }, { value: "Não", label: "Não" }, { value: "A estudar", label: "A estudar" }] },
        { key: "observacoes", label: "Referências / Observações", type: "textarea", section: "Extras" },
    ],
    generateText: (d, b, lang) => {
        const isEn = lang === "en";
        const isEs = lang === "es";

        const title = isEn ? "PROSPECT REGISTRATION FORM" : isEs ? "FICHA CATASTRAL DE PRETENDIENTE" : "FICHA CADASTRAL DE PRETENDIENTE";
        const labels = {
            regDate: isEn ? "Registration Date" : isEs ? "Fecha de Registro" : "Data do Cadastro",
            idSection: isEn ? "IDENTIFICATION" : isEs ? "IDENTIFICACIÓN" : "IDENTIFICAÇÃO",
            profSection: isEn ? "PROFESSIONAL AND FINANCIAL DATA" : isEs ? "DATOS PROFESIONALES Y FINANCIEROS" : "DADOS PROFISSIONAIS E FINANCEIROS",
            contactSection: isEn ? "ADDRESS AND CONTACT" : isEs ? "DIRECCIÓN Y CONTACTO" : "ENDEREÇO E CONTATO",
            interestSection: isEn ? "INTEREST PROFILE" : isEs ? "PERFIL DE INTERÉS" : "PERFIL DE INTERESSE",
            name: isEn ? "Name" : isEs ? "Nombre" : "Nome",
            birth: isEn ? "Birth" : isEs ? "Nacimiento" : "Nascimento",
            nationality: isEn ? "Nationality" : isEs ? "Nacionalidad" : "Nacionalidade",
            maritalStatus: isEn ? "Marital Status" : isEs ? "Estado Civil" : "Estado Civil",
            profession: isEn ? "Profession" : isEs ? "Profesión" : "Profissão",
            company: isEn ? "Company" : isEs ? "Empresa" : "Empresa",
            income: isEn ? "Monthly Income" : isEs ? "Renta Mensal" : "Renda Mensal",
            address: isEn ? "Address" : isEs ? "Dirección" : "Endereço",
            phone: isEn ? "Phone" : isEs ? "Teléfono" : "Telefone",
            email: isEn ? "E-mail" : isEs ? "Correo" : "E-mail",
            property: isEn ? "Property" : isEs ? "Inmueble" : "Imóvel",
            capacity: isEn ? "Investment capacity" : isEs ? "Capacidad de inversión" : "Capacidade de investimento",
            fgts: isEn ? "Use FGTS?" : isEs ? "¿Usar FGTS?" : "Uso de FGTS",
            notes: isEn ? "REFERENCES / NOTES" : isEs ? "REFERENCIAS / OBSERVACIONES" : "REFERÊNCIAS / OBSERVAÇÕES",
            regBy: isEn ? "Registered by" : isEs ? "Registrado por" : "Cadastrado por"
        };

        const locale = isEn ? "en-US" : isEs ? "es-ES" : "pt-BR";
        const birthDate = d.data_nascimento ? new Date(d.data_nascimento).toLocaleDateString(locale) : "___/___/______";

        return `
${title}

${labels.regDate}: ${today(lang)}

${labels.idSection}:
${labels.name}: ${fmt(d.nome)}
${isEn ? "Tax ID" : "CPF"}: ${fmt(d.cpf)} | ${isEn ? "ID" : "RG"}: ${fmt(d.rg)}
${labels.birth}: ${birthDate}
${labels.nationality}: ${fmt(d.nacionalidade)} | ${labels.maritalStatus}: ${fmt(d.estado_civil)}

${labels.profSection}:
${labels.profession}: ${fmt(d.profissao)}
${labels.company}: ${fmt(d.empresa)}
${labels.income}: ${fmtCurrency(d.renda, lang)}

${labels.contactSection}:
${labels.address}: ${fmt(d.endereco)} — ${fmt(d.cidade_uf)}
${labels.phone}: ${fmt(d.telefone)}
${labels.email}: ${fmt(d.email)}

${labels.interestSection}:
${labels.property}: ${fmt(d.imovel_interesse)}
${labels.capacity}: ${fmtCurrency(d.valor_maximo, lang)}
${labels.fgts}: ${fmt(d.possui_fgts)}

${d.observacoes ? `${labels.notes}: ${d.observacoes}\n\n` : ""}${labels.regBy}: ${b?.name ?? "Sistema"}${b?.creci ? ` — CRECI ${b.creci}` : ""}
        `.trim();
    },
};

// ── 8. Autorização de Venda ───────────────────────────────
const autorizacaoVenda: DocumentTemplate = {
    id: "autorizacao-venda",
    name: "Autorização de Venda de Imóvel",
    shortName: "Autorização de Venda",
    description: "Autoriza o corretor ou imobiliária a intermediar a venda do imóvel.",
    category: "autorizacao",
    icon: "Handshake",
    color: "text-rose-600 bg-rose-50",
    fields: [
        { key: "data", label: "Data da Autorização", type: "date", required: true, section: "Ato" },
        { key: "local", label: "Local (Cidade - UF)", type: "text", required: true, section: "Ato" },
        {
            key: "exclusividade", label: "Regime de Comercialização", type: "select", required: true, section: "Ato",
            options: [{ value: "Com exclusividade (Art. 726 Código Civil)", label: "Com exclusividade (Recomendado)" }, { value: "Sem exclusividade", label: "Sem exclusividade" }]
        },
        { key: "prazo_autorizacao", label: "Prazo de Validade (dias)", type: "text", placeholder: "Ex: 90 dias", required: true, section: "Ato" },

        { key: "proprietario_nome", label: "Proprietário — Nome Completo", type: "text", required: true, section: "Proprietário" },
        { key: "proprietario_cpf", label: "Proprietário — CPF/CNPJ", type: "cpf", required: true, section: "Proprietário" },
        { key: "proprietario_rg", label: "Proprietário — RG", type: "text", section: "Proprietário" },
        { key: "proprietario_estado_civil", label: "Proprietário — Estado Civil", type: "select", section: "Proprietário", options: [{ value: "Solteiro(a)", label: "Solteiro(a)" }, { value: "Casado(a)", label: "Casado(a)" }, { value: "Divorciado(a)", label: "Divorciado(a)" }, { value: "Viúvo(a)", label: "Viúvo(a)" }] },

        { key: "imovel", label: "Endereço Completo do Imóvel", type: "text", required: true, section: "Imóvel" },
        { key: "matricula", label: "Matrícula do Imóvel", type: "text", section: "Imóvel" },
        { key: "iptu", label: "Inscrição Municipal / IPTU", type: "text", section: "Imóvel" },
        { key: "valor_venda", label: "Valor de Venda Pretendido (R$)", type: "currency", required: true, section: "Imóvel" },

        { key: "comissao", label: "Comissão do Corretor (%)", type: "number", placeholder: "6", required: true, section: "Honorários" },
        { key: "foro", label: "Foro (Cidade/UF para disputas)", type: "text", placeholder: "Ex: Salvador - BA", section: "Extras" },
        { key: "observacoes", label: "Observações Adicionais", type: "textarea", section: "Extras" },

        { key: "testemunha1_nome", label: "Testemunha 1 — Nome", type: "text", required: true, section: "Testemunhas" },
        { key: "testemunha1_cpf", label: "Testemunha 1 — CPF", type: "cpf", section: "Testemunhas" },
    ],
    generateText: (d, b, lang) => {
        const isEn = lang === "en";
        const isEs = lang === "es";

        const title = isEn ? `PROPERTY SALE AUTHORIZATION UNDER ${d.exclusividade?.replace("Com exclusividade (Art. 726 Código Civil)", "EXCLUSIVE").replace("Sem exclusividade", "NON-EXCLUSIVE").toUpperCase()} REGIME` : isEs ? `AUTORIZACIÓN DE VENTA DE INMUEBLE EN RÉGIMEN DE ${d.exclusividade?.replace("Com exclusividade (Art. 726 Código Civil)", "EXCLUSIVIDAD").replace("Sem exclusividade", "NO EXCLUSIVIDAD").toUpperCase()}` : `AUTORIZAÇÃO DE VENDA DE IMÓVEL EM REGIME DE ${d.exclusividade?.toUpperCase()}`;
        const labels = {
            owner: isEn ? "COMMITTING OWNER" : isEs ? "PROPIETARIO COMITENTE" : "PROPRIETÁRIO COMITENTE",
            property: isEn ? "PROPERTY" : isEs ? "INMUEBLE" : "IMÓVEL",
            matricula: isEn ? "Registration n.º" : isEs ? "Matrícula n.º" : "Matrícula n.º",
            minValue: isEn ? "MINIMUM SALE VALUE" : isEs ? "VALOR DE VENTA MÍNIMO" : "VALOR DE VENDA MÍNIMO",
            validity: isEn ? "VALIDITY TERM" : isEs ? "PLAZO DE VALIDEZ" : "PRAZO DE VALIDADE",
            fees: isEn ? "FEES" : isEs ? "HONORARIOS" : "HONORÁRIOS",
            notes: isEn ? "NOTES" : isEs ? "OBSERVACIONES" : "OBSERVAÇÕES",
            brokerAut: isEn ? "Authorized Broker" : isEs ? "Corredor Autorizado" : "Corretor Autorizado",
            witnesses: isEn ? "WITNESSES" : isEs ? "TESTIGOS" : "TESTEMUNHAS"
        };

        const locale = isEn ? "en-US" : isEs ? "es-ES" : "pt-BR";
        const dateStr = d.data ? new Date(d.data).toLocaleDateString(locale) : today(lang);

        return `
${title}

${fmt(d.local)}, ${dateStr}

${labels.owner}: ${fmt(d.proprietario_nome)}${d.proprietario_estado_civil ? `, ${d.proprietario_estado_civil}` : ""}, ${isEn ? "holder of ID" : "portador do RG"} n.º ${fmt(d.proprietario_rg)} ${isEn ? "and Tax ID" : "e inscrito no CPF"} n.º ${fmt(d.proprietario_cpf)}.

${isEn ? `By this instrument, the Owner authorizes the broker ${b?.name ?? "___________________________"}${b?.creci ? ` (CRECI ${b.creci})` : ""} to promote, with exclusivity or not as indicated, the intermediation of sale of the property located at:` : isEs ? `Por el presente instrumento, el Propietario autoriza al corredor ${b?.name ?? "___________________________"}${b?.creci ? ` (CRECI ${b.creci})` : ""} a promover, con exclusividad o no según lo señalado, la intermediación de venta del inmueble ubicado en:` : `Pelo presente instrumento, o Proprietário autoriza o(a) corretor(a) ${b?.name ?? "___________________________"}${b?.creci ? ` (CRECI ${b.creci})` : ""} a promover, com exclusividade ou não conforme assinalado, a intermediação de venda do imóvel localizado em:`}

${labels.property}: ${fmt(d.imovel)}${d.matricula ? ` — ${labels.matricula} ${d.matricula}` : ""}
${labels.minValue}: ${fmtCurrency(d.valor_venda, lang)}
${labels.validity}: ${fmt(d.prazo_autorizacao)}

${labels.fees}: ${isEn ? `In case of conclusion of the sale, the Owner will pay the Broker the percentage of ${fmt(d.comissao)}% on the total value of the transaction as brokerage fees.` : isEs ? `En caso de concreción de la venta, el Propietario pagará al Corredor el porcentaje de ${fmt(d.comissao)}% sobre el valor total de la transacción en concepto de honorarios de corretaje.` : `Em caso de concretização da venda, o Proprietário pagará ao Corretor o percentual de ${fmt(d.comissao)}% sobre o valor total da transação a título de honorários de corretagem.`}

${isEn ? "The jurisdiction of" : isEs ? "Se elige el foro de la ciudad de" : "Fica eleito o foro da comarca de"} ${fmt(d.foro || d.local)} ${isEn ? "is chosen for any disputes arising from this authorization." : "para dirimir quaisquer dúvidas oriundas desta autorização."}

${d.observacoes ? `${labels.notes}: ${d.observacoes}\n\n` : ""}${b?.name ? `${labels.brokerAut}: ${b.name}${b.creci ? ` — CRECI ${b.creci}` : ""}` : ""}

${labels.witnesses}:
1. ${fmt(d.testemunha1_nome)} | ${isEn ? "Tax ID" : "CPF"}: ${fmt(d.testemunha1_cpf)}
        `.trim();
    },
};

// ── 9. Autorização de Locação ─────────────────────────────
const autorizacaoLocacao: DocumentTemplate = {
    id: "autorizacao-locacao",
    name: "Autorização de Locação",
    shortName: "Autorização de Locação",
    description: "Autoriza o corretor a anunciar e intermediar a locação do imóvel.",
    category: "autorizacao",
    icon: "Home",
    color: "text-orange-600 bg-orange-50",
    fields: [
        { key: "data", label: "Data de Emissão", type: "date", required: true, section: "Ato" },
        { key: "local", label: "Local (Cidade - UF)", type: "text", required: true, section: "Ato" },
        { key: "prazo_autorizacao", label: "Prazo de Validade (dias)", type: "text", placeholder: "Ex: 60 dias", required: true, section: "Ato" },

        { key: "proprietario_nome", label: "Proprietário — Nome Completo", type: "text", required: true, section: "Proprietário" },
        { key: "proprietario_cpf", label: "Proprietário — CPF/CNPJ", type: "cpf", required: true, section: "Proprietário" },
        { key: "proprietario_rg", label: "Proprietário — RG", type: "text", section: "Proprietário" },

        { key: "imovel", label: "Endereço Completo do Imóvel", type: "text", required: true, section: "Imóvel" },
        { key: "matricula", label: "Matrícula do Imóvel", type: "text", section: "Imóvel" },
        { key: "valor_aluguel", label: "Valor de Aluguel Pretendido (R$)", type: "currency", required: true, section: "Condições" },
        { key: "valor_condominio", label: "Valor do Condomínio (R$)", type: "currency", section: "Condições" },
        { key: "valor_iptu", label: "Valor do IPTU (Anual)", type: "currency", section: "Condições" },
        {
            key: "garantia", label: "Garantias Aceitas", type: "select", section: "Condições",
            options: [{ value: "Caução de 3 meses", label: "Caução (3 meses)" }, { value: "Fiador com imóvel", label: "Fiador" }, { value: "Seguro Fiança", label: "Seguro Fiança" }, { value: "Título de Capitalização", label: "Título de Capitalização" }]
        },
        { key: "comissao", label: "Taxa de Administração (%)", type: "number", placeholder: "10", section: "Honorários" },
        { key: "observacoes", label: "Observações Adicionais", type: "textarea", section: "Extras" },
    ],
    generateText: (d, b, lang) => {
        const isEn = lang === "en";
        const isEs = lang === "es";

        const title = isEn ? "LEASE AUTHORIZATION" : isEs ? "AUTORIZACIÓN DE ALQUILER" : "AUTORIZAÇÃO DE LOCAÇÃO";
        const labels = {
            owner: isEn ? "OWNER" : isEs ? "PROPIETARIO" : "PROPRIETÁRIO",
            property: isEn ? "PROPERTY" : isEs ? "INMUEBLE" : "IMÓVEL",
            matricula: isEn ? "Registration n.º" : isEs ? "Matrícula n.º" : "Matrícula n.º",
            rentValue: isEn ? "RENT VALUE" : isEs ? "VALOR DEL ALQUILER" : "VALOR DO ALUGUEL",
            condo: isEn ? "Condo" : isEs ? "Condominio" : "Condomínio",
            iptu: isEn ? "IPTU" : isEs ? "IPTU" : "IPTU",
            warranty: isEn ? "WARRANTY" : isEs ? "GARANTÍA" : "GARANTIA",
            validity: isEn ? "VALIDITY OF AUTHORIZATION" : isEs ? "VALIDEZ DE LA AUTORIZACIÓN" : "VALIDADE DA AUTORIZAÇÃO",
            admFee: isEn ? "ADMINISTRATION FEE" : isEs ? "TASA DE ADMINISTRACIÓN" : "TAXA DE ADMINISTRAÇÃO",
            notes: isEn ? "NOTES" : isEs ? "OBSERVACIONES" : "OBSERVAÇÕES",
            brokerAut: isEn ? "Authorized Broker" : isEs ? "Corredor Autorizado" : "Corretor Autorizado"
        };

        const locale = isEn ? "en-US" : isEs ? "es-ES" : "pt-BR";
        const dateStr = d.data ? new Date(d.data).toLocaleDateString(locale) : today(lang);

        return `
${title}

${fmt(d.local)}, ${dateStr}

${labels.owner}: ${fmt(d.proprietario_nome)}${d.proprietario_rg ? ` | ${isEn ? "ID" : "RG"}: ${d.proprietario_rg}` : ""} | ${isEn ? "Tax ID" : "CPF/CNPJ"}: ${fmt(d.proprietario_cpf)}

${isEn ? `I authorize the broker ${b?.name ?? "___________________________"}${b?.creci ? ` (CRECI ${b.creci})` : ""} to promote the lease of the property located at:` : isEs ? `Autorizo al corredor ${b?.name ?? "___________________________"}${b?.creci ? ` (CRECI ${b.creci})` : ""} a promover el alquiler del inmueble ubicado en:` : `Autorizo o(a) corretor(a) ${b?.name ?? "___________________________"}${b?.creci ? ` (CRECI ${b.creci})` : ""} a promover a locação do imóvel localizado em:`}

${labels.property}: ${fmt(d.imovel)}${d.matricula ? ` — ${labels.matricula} ${d.matricula}` : ""}
${labels.rentValue}: ${fmtCurrency(d.valor_aluguel, lang)}${d.valor_condominio ? ` | ${labels.condo}: ${fmtCurrency(d.valor_condominio, lang)}` : ""}${d.valor_iptu ? ` | ${labels.iptu}: ${fmtCurrency(d.valor_iptu, lang)}` : ""}
${labels.warranty}: ${fmt(d.garantia)}
${labels.validity}: ${fmt(d.prazo_autorizacao)}

${labels.admFee}: ${fmt(d.comissao)}% ${isEn ? "on the gross rental value." : isEs ? "sobre el valor bruto del alquiler." : "sobre o valor bruto do aluguel."}

${d.observacoes ? `${labels.notes}: ${d.observacoes}\n\n` : ""}${b?.name ? `${labels.brokerAut}: ${b.name}${b.creci ? ` — CRECI ${b.creci}` : ""}` : ""}
        `.trim();
    },
};

// ── 10. Termo de Reserva ──────────────────────────────────
const termoReserva: DocumentTemplate = {
    id: "termo-reserva",
    name: "Termo de Reserva de Imóvel",
    shortName: "Reserva de Imóvel",
    description: "Reserva o imóvel para análise exclusiva por um período determinado.",
    category: "termo",
    icon: "CalendarClock",
    color: "text-cyan-600 bg-cyan-50",
    fields: [
        { key: "data", label: "Data da Reserva", type: "date", required: true, section: "Ato" },
        { key: "local", label: "Local (Cidade - UF)", type: "text", required: true, section: "Ato" },
        { key: "prazo_reserva", label: "Prazo de Validade (dias)", type: "text", placeholder: "Ex: 5 dias úteis", required: true, section: "Ato" },

        { key: "interessado_nome", label: "Interessado — Nome Completo", type: "text", required: true, section: "Interessado" },
        { key: "interessado_cpf", label: "Interessado — CPF", type: "cpf", required: true, section: "Interessado" },
        { key: "interessado_rg", label: "Interessado — RG", type: "text", section: "Interessado" },

        { key: "imovel", label: "Endereço Completo do Imóvel", type: "text", required: true, section: "Imóvel" },
        { key: "matricula", label: "Matrícula do Imóvel", type: "text", section: "Imóvel" },
        { key: "valor_imovel", label: "Valor Total do Imóvel (R$)", type: "currency", section: "Condições" },
        { key: "valor_reserva", label: "Valor da Reserva / Sinal (R$)", type: "currency", section: "Condições" },
        {
            key: "condicao_uso", label: "Finalidade da Reserva", type: "select", section: "Condições",
            options: [{ value: "Valor será abatido do preço final", label: "Abatido do preço final" }, { value: "Valor caucionado aguardando análise", label: "Apenas reserva técnica" }, { value: "Valor não reembolsável em caso de desistência", label: "Não reembolsável" }]
        },
        { key: "observacoes", label: "Observações Adicionais", type: "textarea", section: "Extras" },
    ],
    generateText: (d, b, lang) => {
        const isEn = lang === "en";
        const isEs = lang === "es";

        const title = isEn ? "PROPERTY RESERVATION TERM" : isEs ? "TÉRMINO DE RESERVA DE INMUEBLE" : "TERMO DE RESERVA DE IMÓVEL";
        const labels = {
            interested: isEn ? "INTERESTED PARTY" : isEs ? "INTERESADO" : "INTERESSADO",
            property: isEn ? "PROPERTY" : isEs ? "INMUEBLE" : "IMÓVEL",
            matricula: isEn ? "Registration n.º" : isEs ? "Matrícula n.º" : "Matrícula n.º",
            totalValue: isEn ? "TOTAL PROPERTY VALUE" : isEs ? "VALOR TOTAL DEL INMUEBLE" : "VALOR TOTAL DO IMÓVEL",
            reservationValue: isEn ? "VALUE DESTINED FOR RESERVATION" : isEs ? "VALOR DESTINADO A LA RESERVA" : "VALOR DESTINADO À RESERVA",
            validity: isEn ? "VALIDITY TERM" : isEs ? "PLAZO DE VALIDEZ" : "PRAZO DE VALIDADE",
            reservationCond: isEn ? "RESERVATION CONDITION" : isEs ? "CONDICIÓN DE RESERVA" : "CONDIÇÃO DE RESERVA",
            notes: isEn ? "NOTES" : isEs ? "OBSERVACIONES" : "OBSERVAÇÕES",
            intermed: isEn ? "Intermediation" : isEs ? "Intermediación" : "Intermediação"
        };

        const locale = isEn ? "en-US" : isEs ? "es-ES" : "pt-BR";
        const dateStr = d.data ? new Date(d.data).toLocaleDateString(locale) : today(lang);

        return `
${title}

${fmt(d.local)}, ${dateStr}

${labels.interested}: ${fmt(d.interessado_nome)}${d.interessado_rg ? ` | ${isEn ? "ID" : "RG"}: ${d.interessado_rg}` : ""} | ${isEn ? "Tax ID" : "CPF"}: ${fmt(d.interessado_cpf)}

${isEn ? "By this instrument, the Interested Party reserves, exclusively, the property identified below:" : isEs ? "Por el presente instrumento, el Interesado reserva, con carácter de exclusividad, el inmueble identificado abajo:" : "Pelo presente instrumento, o Interessado reserva, em caráter de exclusividade, o imóvel abaixo identificado:"}

${labels.property}: ${fmt(d.imovel)}${d.matricula ? ` — ${labels.matricula} ${d.matricula}` : ""}
${labels.totalValue}: ${fmtCurrency(d.valor_imovel, lang)}
${labels.reservationValue}: ${fmtCurrency(d.valor_reserva, lang)}
${labels.validity}: ${fmt(d.prazo_reserva)}

${labels.reservationCond}: ${fmt(d.condicao_uso)}

${isEn ? "The purpose of this reservation is to withdraw the property from the market for the stipulate term, allowing the Interested Party to proceed with the analysis of documents and necessary approvals for the formalization of the business." : isEs ? "La presente reserva tiene por finalidad retirar el inmueble del mercado por el plazo estipulado, permitiendo que el Interesado proceda con el análisis de documentos y aprobaciones necesarias para la formalización del negocio." : "A presente reserva tem por finalidade retirar o imóvel do mercado pelo prazo estipulado, permitindo que o Interessado proceda com a análise de documentos e aprovações necessárias para a formalização do negócio."}

${d.observacoes ? `${labels.notes}: ${d.observacoes}\n\n` : ""}${b?.name ? `${labels.intermed}: ${b.name}${b.creci ? ` — CRECI ${b.creci}` : ""}` : ""}
        `.trim();
    },
};

// ── Export ────────────────────────────────────────────────
// ── 11. Ficha de Captação de Terreno ─────────────────────
const fichaTerreno: DocumentTemplate = {
    id: "ficha-terreno",
    name: "Ficha de Captação de Terreno",
    shortName: "Captação Terreno",
    description: "Ficha técnica completa para captação de terrenos, áreas e lotes.",
    category: "ficha",
    icon: "Home",
    color: "text-emerald-600 bg-emerald-50",
    fields: [
        { key: "data", label: "Data da Captação", type: "date", required: true, section: "Ato" },
        { key: "local", label: "Local (Cidade - UF)", type: "text", required: true, section: "Ato" },

        { key: "proprietario_nome", label: "Proprietário — Nome Completo", type: "text", required: true, section: "Proprietário" },
        { key: "proprietario_cpf", label: "Proprietário — CPF/CNPJ", type: "cpf", required: true, section: "Proprietário" },
        { key: "proprietario_rg", label: "Proprietário — RG", type: "text", section: "Proprietário" },

        { key: "endereco", label: "Endereço do Terreno", type: "text", required: true, section: "Localização" },
        { key: "bairro", label: "Bairro", type: "text", required: true, section: "Localização" },
        { key: "cidade", label: "Cidade", type: "text", required: true, section: "Localização" },
        { key: "estado", label: "Estado (UF)", type: "text", required: true, section: "Localização" },
        { key: "cep", label: "CEP", type: "text", section: "Localização" },

        {
            key: "situacao_juridica", label: "Situação Jurídica", type: "select", required: true, section: "Jurídico",
            options: [
                { value: "Escritura pública registrada", label: "Escritura pública registrada" },
                { value: "Contrato de compra e venda", label: "Contrato de compra e venda" },
                { value: "Posse", label: "Posse" },
                { value: "Cessão de direitos", label: "Cessão de direitos" },
                { value: "Outro", label: "Outro" }
            ]
        },

        { key: "area_total", label: "Área Total (m²)", type: "number", required: true, section: "Medidas" },
        { key: "frente", label: "Frente (metros)", type: "number", section: "Medidas" },
        { key: "fundos", label: "Fundos (metros)", type: "number", section: "Medidas" },
        { key: "lado_direito", label: "Lado Direito (metros)", type: "number", section: "Medidas" },
        { key: "lado_esquerdo", label: "Lado Esquerdo (metros)", type: "number", section: "Medidas" },

        { key: "confrontante_frente", label: "Confrontante Frente", type: "text", section: "Confrontações" },
        { key: "confrontante_fundos", label: "Confrontante Fundos", type: "text", section: "Confrontações" },
        { key: "confrontante_direito", label: "Confrontante Direito", type: "text", section: "Confrontações" },
        { key: "confrontante_esquerdo", label: "Confrontante Esquerdo", type: "text", section: "Confrontações" },

        {
            key: "topografia", label: "Topografia", type: "select", section: "Características",
            options: [
                { value: "Plano", label: "Plano" },
                { value: "Aclive", label: "Aclive" },
                { value: "Declive", label: "Declive" },
                { value: "Misto", label: "Misto" }
            ]
        },
        {
            key: "tipo_terreno", label: "Tipo de Terreno", type: "select", section: "Características",
            options: [
                { value: "Urbano", label: "Urbano" },
                { value: "Rural", label: "Rural" },
                { value: "Loteamento", label: "Loteamento" },
                { value: "Condomínio", label: "Condomínio" }
            ]
        },
        { key: "infra_energia", label: "Energia Elétrica", type: "select", section: "Infraestrutura", options: [{ value: "Sim", label: "Sim" }, { value: "Não", label: "Não" }] },
        { key: "infra_agua", label: "Água Encanada", type: "select", section: "Infraestrutura", options: [{ value: "Sim", label: "Sim" }, { value: "Não", label: "Não" }] },
        { key: "infra_esgoto", label: "Rede de Esgoto", type: "select", section: "Infraestrutura", options: [{ value: "Sim", label: "Sim" }, { value: "Não", label: "Não" }] },
        { key: "infra_pavimentacao", label: "Rua Pavimentada", type: "select", section: "Infraestrutura", options: [{ value: "Sim", label: "Sim" }, { value: "Não", label: "Não" }] },

        { key: "valor", label: "Valor do Terreno (R$)", type: "currency", required: true, section: "Comercial" },
        { key: "aceita_proposta", label: "Aceita Proposta?", type: "select", section: "Comercial", options: [{ value: "Sim", label: "Sim" }, { value: "Não", label: "Não" }] },
        { key: "aceita_permuta", label: "Aceita Permuta?", type: "select", section: "Comercial", options: [{ value: "Sim", label: "Sim" }, { value: "Não", label: "Não" }] },
        { key: "documentacao_ok", label: "Doc. pronta p/ transferência?", type: "select", section: "Comercial", options: [{ value: "Sim", label: "Sim" }, { value: "Não", label: "Não" }] },

        { key: "anexos", label: "Documentos Anexos (links ou descrições)", type: "textarea", section: "Anexos" },
        { 
            key: "lista_anexos", label: "Checklist de Documentos", type: "checklist", section: "Anexos",
            options: [
                { value: "escritura", label: "Escritura Pública" },
                { value: "contrato", label: "Contrato de Compra e Venda" },
                { value: "planta", label: "Planta do Terreno" },
                { value: "memorial", label: "Memorial Descritivo" },
                { value: "fotos", label: "Fotos do Local" },
                { value: "certidao", label: "Certidão de Matrícula" }
            ]
        },

        { key: "observacoes", label: "Observações Adicionais", type: "textarea", section: "Extras" },
    ],
    generateText: (d, b, lang) => {
        const isEn = lang === "en";
        const isEs = lang === "es";

        const title = isEn ? "LAND CAPTURE SHEET" : isEs ? "FICHA DE CAPTACIÓN DE TERRENO" : "FICHA DE CAPTAÇÃO DE TERRENO";
        const labels = {
            owner: isEn ? "OWNER" : isEs ? "PROPIETARIO" : "PROPRIETÁRIO",
            location: isEn ? "LOCATION" : isEs ? "UBICACIÓN" : "LOCALIZAÇÃO",
            legal: isEn ? "LEGAL STATUS" : isEs ? "SITUACIÓN JURÍDICA" : "SITUAÇÃO JURÍDICA",
            measures: isEn ? "MEASURES AND AREA" : isEs ? "MEDIDAS Y ÁREA" : "MEDIDAS E ÁREA",
            confrontations: isEn ? "CONFRONTATIONS" : isEs ? "CONFRONTACIONES" : "CONFRONTAÇÕES",
            characteristics: isEn ? "CHARACTERISTICS" : isEs ? "CARACTERÍSTICAS" : "CARACTERÍSTICAS",
            infra: isEn ? "INFRASTRUCTURE" : isEs ? "INFRAESTRUCTURA" : "INFRAESTRUTURA",
            commercial: isEn ? "COMMERCIAL INFORMATION" : isEs ? "INFORMACIÓN COMERCIAL" : "INFORMAÇÕES COMERCIAIS",
            notes: isEn ? "NOTES" : isEs ? "OBSERVACIONES" : "OBSERVAÇÕES",
            intermed: isEn ? "Intermediation" : isEs ? "Intermediación" : "Intermediação"
        };

        const locale = isEn ? "en-US" : isEs ? "es-ES" : "pt-BR";
        const dateStr = d.data ? new Date(d.data).toLocaleDateString(locale) : today(lang);

        const infraList = [];
        if (d.infra_energia === "Sim") infraList.push(isEn ? "Electricity" : isEs ? "Energía" : "Energia Elétrica");
        if (d.infra_agua === "Sim") infraList.push(isEn ? "Water" : isEs ? "Agua" : "Água Encanada");
        if (d.infra_esgoto === "Sim") infraList.push(isEn ? "Sewage" : isEs ? "Alcantarillado" : "Rede de Esgoto");
        if (d.infra_pavimentacao === "Sim") infraList.push(isEn ? "Paved" : isEs ? "Pavimentado" : "Rua Pavimentada");

        return `
${title}

${fmt(d.local)}, ${dateStr}

${labels.owner}: ${fmt(d.proprietario_nome)}${d.proprietario_cpf ? ` | ${isEn ? "Tax ID" : "CPF/CNPJ"}: ${d.proprietario_cpf}` : ""}${d.proprietario_rg ? ` | ${isEn ? "ID" : "RG"}: ${d.proprietario_rg}` : ""}

${labels.location}:
${fmt(d.endereco)} - ${fmt(d.bairro)}
${fmt(d.cidade)} - ${fmt(d.estado)} | CEP: ${fmt(d.cep)}

${labels.legal}: ${fmt(d.situacao_juridica)}

${labels.measures}:
${isEn ? "Total Area" : "Área Total"}: ${fmt(d.area_total)} m²
${isEn ? "Front" : "Frente"}: ${fmt(d.frente)}m | ${isEn ? "Back" : "Fundos"}: ${fmt(d.fundos)}m
${isEn ? "Right" : "Direita"}: ${fmt(d.lado_direito)}m | ${isEn ? "Left" : "Esquerda"}: ${fmt(d.lado_esquerdo)}m

${labels.confrontations}:
${isEn ? "Front" : "Frente"}: ${fmt(d.confrontante_frente)}
${isEn ? "Back" : "Fundos"}: ${fmt(d.confrontante_fundos)}
${isEn ? "Right" : "Direita"}: ${fmt(d.confrontante_direito)}
${isEn ? "Left" : "Esquerda"}: ${fmt(d.confrontante_esquerdo)}

${labels.characteristics}:
${isEn ? "Topography" : "Topografia"}: ${fmt(d.topografia)} | ${isEn ? "Type" : "Tipo"}: ${fmt(d.tipo_terreno)}
${labels.infra}: ${infraList.length > 0 ? infraList.join(", ") : (isEn ? "None reported" : isEs ? "Nada informado" : "Nada informado")}

${labels.commercial}:
${isEn ? "Market Value" : "Valor de Mercado"}: ${fmtCurrency(d.valor, lang)}
${isEn ? "Accepts Proposal?" : "Aceita Proposta?"}: ${fmt(d.aceita_proposta)}
${isEn ? "Accepts Exchange?" : "Aceita Permuta?"}: ${fmt(d.aceita_permuta)}
${isEn ? "Docs Ready?" : "Doc. p/ Transferência?"}: ${fmt(d.documentacao_ok)}

${d.observacoes ? `${labels.notes}: ${d.observacoes}\n\n` : ""}${b?.name ? `${labels.intermed}: ${b.name}${b.creci ? ` — CRECI ${b.creci}` : ""}` : ""}
        `.trim();
    },
};

// ── 12. Contrato de Compra e Venda de Terreno ────────────
const contratoVendaTerreno: DocumentTemplate = {
    id: "contrato-venda-terreno",
    name: "Contrato de Compra e Venda de Terreno",
    shortName: "Venda de Terreno",
    description: "Contrato para compra e venda de terrenos, lotes ou áreas, com suporte a posse e escritura.",
    category: "proposta",
    icon: "Handshake",
    color: "text-brand-600 bg-brand-50",
    fields: [
        { key: "data", label: "Data do Contrato", type: "date", required: true, section: "Ato" },
        { key: "local", label: "Local (Cidade - UF)", type: "text", required: true, section: "Ato" },

        { key: "vendedor_nome", label: "Vendedor — Nome Completo", type: "text", required: true, section: "Vendedor" },
        { key: "vendedor_cpf", label: "Vendedor — CPF/CNPJ", type: "cpf", required: true, section: "Vendedor" },
        { key: "vendedor_rg", label: "Vendedor — RG", type: "text", section: "Vendedor" },
        { key: "vendedor_civil", label: "Vendedor — Estado Civil", type: "select", section: "Vendedor", options: [{ value: "Solteiro(a)", label: "Solteiro(a)" }, { value: "Casado(a)", label: "Casado(a)" }, { value: "Divorciado(a)", label: "Divorciado(a)" }, { value: "Viúvo(a)", label: "Viúvo(a)" }] },
        { key: "vendedor_endereco", label: "Vendedor — Endereço Res.", type: "text", section: "Vendedor" },

        { key: "comprador_nome", label: "Comprador — Nome Completo", type: "text", required: true, section: "Comprador" },
        { key: "comprador_cpf", label: "Comprador — CPF/CNPJ", type: "cpf", required: true, section: "Comprador" },
        { key: "comprador_rg", label: "Comprador — RG", type: "text", section: "Comprador" },
        { key: "comprador_civil", label: "Comprador — Estado Civil", type: "select", section: "Comprador", options: [{ value: "Solteiro(a)", label: "Solteiro(a)" }, { value: "Casado(a)", label: "Casado(a)" }, { value: "Divorciado(a)", label: "Divorciado(a)" }, { value: "Viúvo(a)", label: "Viúvo(a)" }] },
        { key: "comprador_endereco", label: "Comprador — Endereço Res.", type: "text", section: "Comprador" },

        { key: "imovel_endereco", label: "Endereço do Terreno", type: "text", required: true, section: "Objeto" },
        { key: "imovel_area", label: "Área Total (m²)", type: "number", required: true, section: "Objeto" },
        { key: "imovel_matricula", label: "Matrícula / Transcrição", type: "text", section: "Objeto", placeholder: "Se houver" },
        { key: "imovel_iptu", label: "Inscrição Municipal (IPTU)", type: "text", section: "Objeto" },
        {
            key: "tipo_direito", label: "Tipo de Direito Transmitido", type: "select", required: true, section: "Objeto",
            options: [{ value: "Propriedade Plena (Escritura)", label: "Propriedade Plena" }, { value: "Posse e Direitos", label: "Posse e Direitos" }, { value: "Cessão de Direitos Hereditários", label: "Cessão de Direitos" }]
        },

        { key: "valor_total", label: "Valor Total (R$)", type: "currency", required: true, section: "Pagamento" },
        { key: "valor_sinal", label: "Valor do Sinal (R$)", type: "currency", section: "Pagamento" },
        { key: "pagamento_detalhes", label: "Condições de Pagamento", type: "textarea", placeholder: "Ex: Saldo em 10 parcelas mensais de R$...", section: "Pagamento" },

        { key: "data_posse", label: "Data da Transmissão da Posse", type: "date", section: "Cláusulas" },
        { key: "foro", label: "Foro da Comarca (Cidade/UF)", type: "text", section: "Cláusulas" },
        { key: "observacoes", label: "Observações Adicionais", type: "textarea", section: "Cláusulas" },

        { key: "testemunha1", label: "Testemunha 1 (Nome)", type: "text", section: "Testemunhas" },
        { key: "testemunha2", label: "Testemunha 2 (Nome)", type: "text", section: "Testemunhas" },
    ],
    generateText: (d, b, lang) => {
        const isEn = lang === "en";
        const isEs = lang === "es";
        const locale = isEn ? "en-US" : isEs ? "es-ES" : "pt-BR";
        const dateStr = d.data ? new Date(d.data).toLocaleDateString(locale) : today(lang);

        return `
CONTRATO PARTICULAR DE COMPRA E VENDA DE TERRENO

VENDEDOR(A): ${fmt(d.vendedor_nome)}, ${fmt(d.vendedor_civil)}, portador(a) do RG n.º ${fmt(d.vendedor_rg)} e inscrito(a) no CPF n.º ${fmt(d.vendedor_cpf)}, residente e domiciliado(a) em ${fmt(d.vendedor_endereco)}.

COMPRADOR(A): ${fmt(d.comprador_nome)}, ${fmt(d.comprador_civil)}, portador(a) do RG n.º ${fmt(d.comprador_rg)} e inscrito(a) no CPF n.º ${fmt(d.comprador_cpf)}, residente e domiciliado(a) em ${fmt(d.comprador_endereco)}.

1. DO OBJETO
O Vendedor é legítimo possuidor/proprietário do imóvel situado em ${fmt(d.imovel_endereco)}, com área total de ${fmt(d.imovel_area)}m²${d.imovel_matricula ? `, matriculado sob o n.º ${d.imovel_matricula}` : ""}${d.imovel_iptu ? `, cadastro municipal n.º ${d.imovel_iptu}` : ""}. Pelo presente instrumento, o Vendedor transmite ao Comprador a ${fmt(d.tipo_direito)} do referido imóvel.

2. DO PREÇO E PAGAMENTO
O valor total da transação é de ${fmtCurrency(d.valor_total, lang)}.
${d.valor_sinal ? `Sendo pago a título de sinal e princípio de pagamento a quantia de ${fmtCurrency(d.valor_sinal, lang)}.` : ""}
Condições: ${fmt(d.pagamento_detalhes)}

3. DA POSSE
A posse precária ou definitiva do imóvel será transmitida ao Comprador em ${d.data_posse ? new Date(d.data_posse).toLocaleDateString(locale) : "data do pagamento total"}, momento a partir do qual correrão por conta do Comprador todos os impostos e taxas incidentes sobre o imóvel.

4. DA ESCRITURA E TRANSFERÊNCIA
O Vendedor se compromete a assinar toda a documentação necessária para a transferência do imóvel assim que quitado o valor total, ficando as despesas com escritura e registro por conta do Comprador.

5. DO FORO
Fica eleito o foro da comarca de ${fmt(d.foro || d.local)} para dirimir quaisquer dúvidas oriundas deste contrato.

${d.local}, ${dateStr}

____________________________________
VENDEDOR

____________________________________
COMPRADOR

Testemunhas:
1. ${fmt(d.testemunha1)}
2. ${fmt(d.testemunha2)}

${d.observacoes ? `\nOBSERVAÇÕES:\n${d.observacoes}` : ""}
${b?.name ? `\nIntermediação: ${b.name}${b.creci ? ` - CRECI ${b.creci}` : ""}` : ""}
        `.trim();
    },
};

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
    reciboChaves,
    reciboSinal,
    reciboPagamento,
    propostaCompra,
    autorizacaoVisita,
    declaracaoVisita,
    fichaCadastral,
    autorizacaoVenda,
    autorizacaoLocacao,
    termoReserva,
    fichaTerreno,
    contratoVendaTerreno,
];

export function getTemplate(id: string): DocumentTemplate | undefined {
    return DOCUMENT_TEMPLATES.find((t) => t.id === id);
}

export const CATEGORY_LABELS: Record<string, string> = {
    recibo: "Recibos",
    autorizacao: "Autorizações",
    declaracao: "Declarações",
    proposta: "Propostas",
    ficha: "Cadastros",
    termo: "Termos",
};
