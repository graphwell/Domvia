"use client";

import { useAuth } from "@/hooks/auth-provider";
import { checkAndConsumeCredits, DEFAULT_TOOL_CREDIT_COSTS as TOOL_CREDIT_COSTS, getToolCostDynamic } from "@/lib/billing";
import React, { useState, useEffect, useCallback } from "react";
import { reportToolError } from "@/lib/admin-alerts";
import { CreditConfirmationModal } from "@/components/ui/CreditConfirmationModal";

interface ToolAccess {
    isIncludedInPlan: boolean;
    cost: number;
    canAccess: () => Promise<boolean>;
    useTool: (description: string) => Promise<boolean>;
    isChecking: boolean;
    ConfirmationModal: React.JSX.Element;
}

export function useToolAccess(toolId: string): ToolAccess {
    const { user } = useAuth();
    const [isChecking, setIsChecking] = useState(false);
    const [dynamicCost, setDynamicCost] = useState<number | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingAction, setPendingAction] = useState<{resolve: (v: boolean) => void, desc: string} | null>(null);

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
    
    useEffect(() => {
        if (user?.planId) {
            getToolCostDynamic(mappedToolId, user.planId).then(setDynamicCost);
        }
    }, [user?.planId, mappedToolId]);

    const cost = dynamicCost ?? (TOOL_CREDIT_COSTS[mappedToolId] || 1);

    const canAccess = async () => {
        if (!user) return false;
        if (['max', 'elite', 'lifetime'].includes((user.planId || 'trial').toLowerCase())) return true;
        return (user.credits || 0) >= cost;
    };

    const executeUsage = async (description: string) => {
        if (!user?.id) return false;
        setIsChecking(true);
        try {
            const result = await checkAndConsumeCredits(user.id, mappedToolId);
            if (!result.success) {
                reportToolError(user.id, mappedToolId, "Insufficient credits or limit reached", { description, reason: result.reason });
            }
            return result.success;
        } catch (error: any) {
            console.error("Access error:", error.message);
            reportToolError(user.id, mappedToolId, error, { description });
            return false;
        } finally {
            setIsChecking(false);
        }
    };

    /**
     * useTool with automatic confirmation modal
     */
    const useTool = async (description: string): Promise<boolean> => {
        if (!user) return false;
        
        // Skip confirmation for Max/Elite/Lifetime or free tools
        const isUnlimited = ['max', 'elite', 'lifetime'].includes((user.planId || 'trial').toLowerCase());
        if (isUnlimited || cost === 0) {
            return await executeUsage(description);
        }

        // Show confirmation modal
        return new Promise((resolve) => {
            setPendingAction({ resolve, desc: description });
            setShowConfirm(true);
        });
    };

    const handleConfirm = async () => {
        if (!pendingAction) return;
        const success = await executeUsage(pendingAction.desc);
        pendingAction.resolve(success);
        setPendingAction(null);
        setShowConfirm(false);
    };

    const handleCancel = () => {
        if (pendingAction) {
            pendingAction.resolve(false);
            setPendingAction(null);
        }
        setShowConfirm(false);
    };

    // Tool names for UI
    const toolNames: any = {
        'captacao': 'Captação Inteligente',
        'doc_gen': 'Gerador de Documentos',
        'description_gen': 'Descrição de Imóvel',
        'title_gen': 'Sugestão de Títulos',
        'social_gen': 'Conteúdo para Redes Sociais',
        'tour_360': 'Tour Virtual 360°',
        'ai_chat': 'IA Conversacional',
    };

    const ConfirmationModal = (
        <CreditConfirmationModal 
            isOpen={showConfirm}
            onClose={handleCancel}
            onConfirm={handleConfirm}
            cost={cost}
            balance={user?.credits || 0}
            toolName={toolNames[mappedToolId] || mappedToolId}
            isLoading={isChecking}
        />
    );

    return {
        isIncludedInPlan: true,
        cost,
        canAccess,
        useTool,
        isChecking,
        ConfirmationModal
    };
}
