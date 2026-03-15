// ─────────────────────────────────────────────────────────
//  LeadBroker AI — Core Types
//  Plataforma de conversão de leads para corretores
// ─────────────────────────────────────────────────────────

// ── Usuário / Corretor ────────────────────────
export type UserRole = "ADMIN_MASTER" | "ADMIN" | "CORRETOR" | "AGENCY_ADMIN" | "AGENCY_MEMBER";

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    whatsapp?: string;
    avatarUrl?: string;
    photoURL?: string;
    role: UserRole;
    planId: string;
    plan?: string;
    credits: number;
    bonusCredits?: number;
    lastActivity?: number;
    referredCount?: number;
    createdAt: number | string;
    inviteCode?: string;
    referredBy?: string;
    agencyId?: string;
    creci?: string;
    logoURL?: string;
    useLogoInDocs?: boolean;
}

export interface Agency {
    id: string;
    name: string;
    adminId: string;
    memberIds: string[];
    planId: "agency_start" | "agency_pro" | "agency_max";
    credits: number;
    createdAt: number;
}

// ── Link de Campanha (principal entidade) ─────
// Cada link é um anúncio inteligente que o corretor
// compartilha no Instagram, WhatsApp, etc.
export interface CampaignLink {
    id: string;
    slug: string;                 // ex: "abc123" → /lead/abc123
    title: string;                // Título do anúncio (ex: "Apto 3q Leblon")
    description?: string;         // Descrição opcional para contexto da IA
    price?: number;               // Valor do imóvel (para pré-preencher calculadora)
    whatsapp: string;             // Número do corretor para este anúncio
    brokerName: string;           // Nome do corretor — usado pela IA nas respostas
    userId: string;
    visits: number;
    aiQuestions: number;
    simulations: number;
    status: "active" | "paused" | "archived";
    createdAt: string;
    updatedAt: string;

    // Landing Page (Pro/Max)
    landing_enabled?: boolean;
    landing_photos?: string[];
    landing_cta?: string;
    landing_headline?: string;
    landing_description?: string;
    landing_bullets?: string[];
    landing_show_logo?: boolean;
    landing_views?: number;
    landing_cta_clicks?: number;
    landing_avg_time?: number;
}

// ── Lead (visita ao link) ─────────────────────
export interface Lead {
    id: string;
    linkId: string;
    linkTitle: string;            // título do anúncio para exibição
    name?: string;
    lastName?: string;
    phone?: string;
    usedChat: boolean;
    usedCalculator: boolean;
    questions: string[];
    timeOnPage: number;           // segundos
    status: "new" | "qualified" | "contacted";
    createdAt: string;
}

// ── Simulação de Financiamento ────────────────
export interface SimulationInput {
    propertyValue: number;
    downPayment: number;
    years: number;
    annualRate: number;
}

export interface SimulationResult {
    monthlyInstallment: number;
    totalFinanced: number;
    totalPaid: number;
    totalInterest: number;
    downPaymentPercent: number;
}

// ── Mensagens de chat ─────────────────────────
export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
}

// ── Planos ────────────────────────────────────
export interface PlanFeature {
    label: string;
    included: boolean;
}

export interface Plan {
    id: string;
    name: string;
    type: "individual" | "agency";
    price: number;
    creditsPerMonth: number;
    maxLinks?: number;
    maxMembers?: number;
    features: PlanFeature[];
    highlighted: boolean;
    description?: string;
    badge?: string;
}

export interface TopUp {
    id: string;
    name: string;
    credits: number;
    price: number;
    highlighted?: boolean;
}

// ── Créditos ──────────────────────────────────
export interface CreditTransaction {
    id: string;
    amount: number;
    type: "earned" | "spent" | "purchase" | "referral" | "admin_adjustment";
    description: string;
    timestamp: number;
    expiresAt?: number;
    toolId?: string;
}

// ── Tour 360° (Professional multi-environment) ─
export interface TourHotspot {
    id: string;
    pitch: number;
    yaw: number;
    targetSceneId: string;
    text?: string;
    isUncertain?: boolean;
}

export interface TourScene {
    id: string;
    name: string;
    panoramaUrl: string;
    hotspots?: TourHotspot[];
    initialPitch?: number;
    initialYaw?: number;
    initialHfov?: number;
}

export interface Tour {
    id: string;
    userId: string;
    title: string;
    description?: string;
    address?: string;
    firstSceneId?: string;
    scenes: Record<string, TourScene>;
    published: boolean;
    createdAt: string;
    updatedAt?: string;
    linkId?: string;    // Opcional: associar a um link de campanha
}

// ── Dashboard ─────────────────────────────────
export interface DashboardStats {
    totalLinks: number;
    totalLeads: number;
    leadsThisWeek: number;
    totalSimulations: number;
    totalAIQuestions: number;
    totalCaptures?: number;
}
