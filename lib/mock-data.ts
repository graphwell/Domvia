import type { CampaignLink, Lead, Plan, DashboardStats, Tour } from "@/types";

// ── Planos ────────────────────────────────────
export const PLANS: Plan[] = [
    {
        id: "trial",
        name: "Trial",
        type: "individual",
        price: 0,
        creditsPerMonth: 5,
        maxLinks: 3,
        highlighted: false,
        features: [
            { label: "Até 3 links ativos", included: true },
            { label: "Captação Inteligente", included: true },
            { label: "Documentos Básicos", included: true },
            { label: "Suporte via WhatsApp", included: false },
        ],
    },
    {
        id: "broker_monthly",
        name: "Corretor Pro",
        type: "individual",
        price: 97,
        creditsPerMonth: 50,
        maxLinks: 50,
        highlighted: true,
        features: [
            { label: "Até 50 links ativos", included: true },
            { label: "Todas as Ferramentas IA", included: true },
            { label: "Documentos Ilimitados", included: true },
            { label: "Suporte Prioritário", included: true },
        ],
    },
    {
        id: "agency_start",
        name: "Imobiliária Start",
        type: "agency",
        price: 397,
        creditsPerMonth: 200,
        maxMembers: 5,
        highlighted: false,
        features: [
            { label: "Até 5 Corretores", included: true },
            { label: "Gestão de Equipe", included: true },
            { label: "Créditos Compartilhados", included: true },
            { label: "Relatórios de Vendas", included: true },
        ],
    },
];

// ── Links de Campanha (mock) ──────────────────
export const MOCK_LINKS: CampaignLink[] = [
    {
        id: "link_001",
        slug: "apto-leblon-3q",
        title: "Apartamento 3 quartos — Leblon",
        description: "Apartamento com 3 quartos, 2 banheiros, 1 vaga. Próximo à praia.",
        price: 1_850_000,
        whatsapp: "21987654321",
        brokerName: "João Araújo",
        userId: "user_01",
        visits: 142,
        aiQuestions: 38,
        simulations: 22,
        status: "active",
        createdAt: "2025-03-01T10:00:00Z",
        updatedAt: "2025-03-07T18:00:00Z",
    },
    {
        id: "link_002",
        slug: "casa-barra-4q",
        title: "Casa 4 quartos — Barra da Tijuca",
        description: "Casa em condomínio fechado, 4 suítes, piscina, 3 vagas.",
        price: 2_400_000,
        whatsapp: "21987654321",
        brokerName: "João Araújo",
        userId: "user_01",
        visits: 87,
        aiQuestions: 21,
        simulations: 14,
        status: "active",
        createdAt: "2025-03-03T14:00:00Z",
        updatedAt: "2025-03-07T19:00:00Z",
    },
    {
        id: "link_003",
        slug: "studio-botafogo",
        title: "Studio compacto — Botafogo",
        description: "Studio moderno, 28m², ideal para quem busca localização e praticidade.",
        price: 420_000,
        whatsapp: "21987654321",
        brokerName: "João Araújo",
        userId: "user_01",
        visits: 210,
        aiQuestions: 67,
        simulations: 48,
        status: "active",
        createdAt: "2025-03-05T09:00:00Z",
        updatedAt: "2025-03-07T20:00:00Z",
    },
];

// ── Leads (mock) ──────────────────────────────
export const MOCK_LEADS: Lead[] = [
    {
        id: "lead_001",
        linkId: "link_001",
        linkTitle: "Apartamento 3 quartos — Leblon",
        name: "Carlos",
        lastName: "Mendes",
        phone: "(21) 98877-6655",
        usedChat: true,
        usedCalculator: true,
        questions: ["Qual a entrada mínima?", "Aceita FGTS?"],
        timeOnPage: 312,
        status: "qualified",
        createdAt: "2025-03-07T14:32:00Z",
    },
    {
        id: "lead_002",
        linkId: "link_003",
        linkTitle: "Studio compacto — Botafogo",
        name: undefined,
        usedChat: true,
        usedCalculator: false,
        questions: ["Como usar o FGTS na compra?"],
        timeOnPage: 95,
        status: "new",
        createdAt: "2025-03-07T15:10:00Z",
    },
    {
        id: "lead_003",
        linkId: "link_002",
        linkTitle: "Casa 4 quartos — Barra da Tijuca",
        name: "Fernanda",
        lastName: "Lima",
        phone: "(21) 97766-5544",
        usedChat: false,
        usedCalculator: true,
        questions: [],
        timeOnPage: 185,
        status: "contacted",
        createdAt: "2025-03-07T16:45:00Z",
    },
    {
        id: "lead_004",
        linkId: "link_003",
        linkTitle: "Studio compacto — Botafogo",
        name: "Ricardo",
        lastName: "Souza",
        phone: "(21) 96655-4433",
        usedChat: true,
        usedCalculator: true,
        questions: ["Qual a documentação necessária?", "Tem subsídio do governo?"],
        timeOnPage: 427,
        status: "qualified",
        createdAt: "2025-03-07T18:20:00Z",
    },
    {
        id: "lead_005",
        linkId: "link_001",
        linkTitle: "Apartamento 3 quartos — Leblon",
        name: undefined,
        usedChat: false,
        usedCalculator: true,
        questions: [],
        timeOnPage: 62,
        status: "new",
        createdAt: "2025-03-08T09:05:00Z",
    },
];

// ── Dashboard Stats ───────────────────────────
export const MOCK_STATS: DashboardStats = {
    totalLinks: 3,
    totalLeads: 28,
    leadsThisWeek: 7,
    totalSimulations: 45,
    totalAIQuestions: 112,
};

// ── Gráfico semanal ───────────────────────────
export const WEEKLY_CHART_DATA = [
    { day: "Seg", leads: 3, views: 18 },
    { day: "Ter", leads: 5, views: 24 },
    { day: "Qua", leads: 2, views: 15 },
    { day: "Qui", leads: 7, views: 38 },
    { day: "Sex", leads: 6, views: 32 },
    { day: "Sáb", leads: 4, views: 21 },
    { day: "Dom", leads: 1, views: 9 },
];

// ── Tours (secundários) ───────────────────────
export const MOCK_TOURS: Tour[] = [
    {
        id: "tour_001",
        userId: "user_01",
        linkId: "link_001",
        title: "Apartamento 3 quartos — Leblon",
        scenes: {
            "r1": { id: "r1", name: "Sala de Estar", panoramaUrl: "" },
            "r2": { id: "r2", name: "Quarto Master", panoramaUrl: "" },
            "r3": { id: "r3", name: "Cozinha", panoramaUrl: "" },
        },
        published: true,
        createdAt: "2025-03-02T10:00:00Z",
    },
];
