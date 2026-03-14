// ─────────────────────────────────────────────────────────────────
//  Domvia — Usage Event Tracking
//  Logs every meaningful user action to Firebase RTDB for admin analytics.
//  Path: /usage/{userId}/{eventId}
//  Path: /usage_stats/{userId}  — aggregated counters
// ─────────────────────────────────────────────────────────────────

import { rtdb } from "@/lib/firebase";
import { ref, push, set, runTransaction } from "firebase/database";

export type UsageEventType =
    | "ai_chat_message"          // IA Conversacional
    | "ai_doc_generate"          // Gerador de Documentos IA
    | "ai_description_generate"  // Gerador de Descrição
    | "ai_title_generate"        // Sugestão de Títulos
    | "ai_social_generate"       // Texto para Redes Sociais
    | "calculator_financing"     // Simulador de Financiamento
    | "calculator_land"          // Calculadora de Terrenos
    | "calculator_investment"    // Simulador de Investimento
    | "doc_form_generate"        // Gerador de Documentos (formulário)
    | "doc_saved"                // Documento salvo no histórico
    | "doc_share_whatsapp"       // Compartilhar documento
    | "link_created"             // Novo link inteligente criado
    | "link_view"                // Link visualizado por cliente
    | "lead_captured"            // Lead capturado
    | "tour_created"             // Tour 360° criado
    | "login"                    // Login do usuário
    | "page_view";               // Visita a página relevante

export interface UsageEvent {
    type: UsageEventType;
    userId: string;
    ts: number;          // Unix ms timestamp
    meta?: Record<string, string | number | boolean>;  // Optional context
}

/**
 * Log a usage event for a specific user.
 * Fire-and-forget — never blocks the UI.
 */
export async function trackUsage(
    userId: string,
    type: UsageEventType,
    meta?: Record<string, string | number | boolean>
): Promise<void> {
    if (!userId) return;
    try {
        const event: UsageEvent = { type, userId, ts: Date.now(), ...(meta ? { meta } : {}) };

        // Append raw event
        const eventsRef = ref(rtdb, `usage/${userId}`);
        await push(eventsRef, event);

        // Increment aggregated counter: /usage_stats/{userId}/{type}
        const statsRef = ref(rtdb, `usage_stats/${userId}/${type}`);
        await runTransaction(statsRef, (current) => (current ?? 0) + 1);

        // Update last_seen timestamp
        const lastSeenRef = ref(rtdb, `usage_stats/${userId}/last_seen`);
        await set(lastSeenRef, Date.now());
    } catch {
        // Silently ignore — tracking should never break the main UX
    }
}

/**
 * Convenience hook — wraps trackUsage with the current user ID.
 */
export function createTracker(userId: string) {
    return (type: UsageEventType, meta?: Record<string, string | number | boolean>) =>
        trackUsage(userId, type, meta);
}
