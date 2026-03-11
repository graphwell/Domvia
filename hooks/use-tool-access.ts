"use client";

import { useAuth } from "@/hooks/auth-provider";
import { consumeCredits, hasToolUnlocked } from "@/lib/credits";
import { TOOL_COSTS } from "@/lib/tool-costs";
import { useState } from "react";

export function useToolAccess(toolId: string) {
    const { user } = useAuth();
    const [isChecking, setIsChecking] = useState(false);

    const cost = (TOOL_COSTS as any)[toolId] || 1;

    // Check if the plan includes the tool
    const isIncludedInPlan = () => {
        if (!user) return false;

        // Trial logic
        if (user.planId === "trial") {
            return ["DESCRIPTION_GENERATOR", "TITLE_GENERATOR", "SMART_CAPTURE", "DOCUMENT_GENERATOR"].includes(toolId);
        }

        // Broker Pro logic
        if (user.planId === "broker_monthly" || user.planId === "broker_annual") {
            return true; // Corretor Pro includes all current tools
        }

        // Agency logic
        if (user.planId.startsWith("agency")) {
            return true;
        }

        return false;
    };

    const canAccess = async () => {
        if (!user) return false;
        if (isIncludedInPlan()) return true;

        const unlocked = await hasToolUnlocked(user.id, toolId);
        if (unlocked) return true;

        return (user.credits || 0) >= cost;
    };

    const useTool = async (description: string) => {
        if (!user) return false;
        if (isIncludedInPlan()) return true;

        setIsChecking(true);
        try {
            // Check if already unlocked (lifetime or duration)
            const unlocked = await hasToolUnlocked(user.id, toolId);
            if (unlocked) return true;

            // Otherwise, consume credits
            await consumeCredits(user.id, cost, description, toolId);
            return true;
        } catch (error: any) {
            console.error("Access error:", error.message);
            return false;
        } finally {
            setIsChecking(false);
        }
    };

    return {
        isIncludedInPlan: isIncludedInPlan(),
        cost,
        canAccess,
        useTool,
        isChecking
    };
}
