import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ── Tailwind class merge ──────────────────────
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ── Currency formatting ───────────────────────
export function formatCurrency(value: number, currency = "BRL"): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

// ── Date formatting ───────────────────────────
export function formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(dateStr));
}

export function formatRelativeDate(dateStr: string, lang = "pt"): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (lang === "en") {
        if (minutes < 1) return "just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
    } else if (lang === "es") {
        if (minutes < 1) return "ahora mismo";
        if (minutes < 60) return `hace ${minutes}min`;
        if (hours < 24) return `hace ${hours}h`;
        if (days < 7) return `hace ${days}d`;
    }

    // Default PT
    if (minutes < 1) return "agora mesmo";
    if (minutes < 60) return `há ${minutes}min`;
    if (hours < 24) return `há ${hours}h`;
    if (days < 7) return `há ${days}d`;

    // Fallback to absolute date
    return new Intl.DateTimeFormat(lang === "en" ? "en-US" : lang === "es" ? "es-ES" : "pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(dateStr));
}

// ── Slug ──────────────────────────────────────
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

// ── Truncate ──────────────────────────────────
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "…";
}

// ── Property type labels ──────────────────────
export const PROPERTY_TYPE_LABELS: Record<string, string> = {
    apartment: "Apartamento",
    house: "Casa",
    land: "Terreno",
    commercial: "Comercial",
    rural: "Rural",
};

// ── Room type labels ──────────────────────────
export const ROOM_TYPE_LABELS: Record<string, string> = {
    fachada: "Fachada",
    entrada: "Entrada",
    sala: "Sala",
    cozinha: "Cozinha",
    quarto: "Quarto",
    banheiro: "Banheiro",
    area_externa: "Área Externa",
    outro: "Outro",
};

// ── Plan labels ───────────────────────────────
export const PLAN_LABELS: Record<string, string> = {
    trial: "Trial",
    pro: "Pro",
    agency: "Agency",
};

// ── WhatsApp link builder ─────────────────────
export function buildWhatsAppLink(phone: string, message: string): string {
    const cleaned = phone.replace(/\D/g, "");
    const encoded = encodeURIComponent(message);
    return `https://wa.me/55${cleaned}?text=${encoded}`;
}

// ── Unique ID (simple, client-safe) ──────────
export function generateId(): string {
    return Math.random().toString(36).slice(2, 10);
}
