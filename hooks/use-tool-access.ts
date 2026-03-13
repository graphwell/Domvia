"use client";

import { useAuth } from "@/hooks/auth-provider";
import { checkAndConsumeCredits, TOOL_CREDIT_COSTS, PLAN_CONFIG } from "@/lib/billing";
import { useState } from "react";

export function useToolAccess(toolId: string) {
    const { user } = useAuth();
    const [isChecking, setIsChecking] = useState(false);

    // Map legacy toolIds to new ones if needed
    const toolMap: any = {
        'SMART_CAPTURE': 'captacao',
        'DOCUMENT_GENERATOR': 'doc_gen',
        'DESCRIPTION_GENERATOR': 'description_gen',
        'TITLE_GENERATOR': 'title_gen',
        'SOCIAL_GENERATOR': 'social_gen',
        'TOUR_360': 'tour_360',
        'AI_CHAT': 'ai_chat',
    };

    const mappedToolId = toolMap[toolId] || toolId;
    const cost = TOOL_CREDIT_COSTS[mappedToolId] || 1;

    const canAccess = async () => {
        if (!user) return false;
        
        // This is a rough client-side check. 
        // Real check happens in useTool or API.
        if (user.planId === 'max') return true;
        
        return true; // Assume true and let useTool/API handle it
    };

    const useTool = async (description: string) => {
        if (!user?.id) return false;

        setIsChecking(true);
        try {
            const result = await checkAndConsumeCredits(user.id, mappedToolId);
            return result.success;
        } catch (error: any) {
            console.error("Access error:", error.message);
            return false;
        } finally {
            setIsChecking(false);
        }
    };

    return {
        isIncludedInPlan: true, // Legacy compatibility
        cost,
        canAccess,
        useTool,
        isChecking
    };
}
