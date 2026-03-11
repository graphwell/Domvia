import { rtdb } from "./firebase";
import { ref, push, set, serverTimestamp } from "firebase/database";

export interface Suggestion {
    id?: string;
    userId: string;
    userEmail: string;
    title: string;
    description: string;
    category: "bug" | "improvement" | "feature" | "other";
    priority: "low" | "medium" | "high";
    city?: string;
    phone?: string;
    country?: string;
    createdAt: any;
    status: "pending" | "reviewing" | "implemented" | "dismissed";
    allowReply?: boolean;
    replies?: { userId: string; text: string; createdAt: number }[];
}

export async function createSuggestion(suggestion: Omit<Suggestion, "id" | "createdAt" | "status" | "replies">) {
    const suggestionsRef = ref(rtdb, "suggestions");
    const newSuggestionRef = push(suggestionsRef);

    const suggestionData: Suggestion = {
        ...suggestion,
        createdAt: serverTimestamp(),
        status: "pending",
        allowReply: suggestion.allowReply ?? false,
    };

    await set(newSuggestionRef, suggestionData);
    return newSuggestionRef.key;
}
