import { Plan } from "@/types";

export type SimulatorLevel = "basic" | "advanced" | "professional";

export interface PlanPermissions {
    simulatorLevel: SimulatorLevel;
    canUseTour360: boolean;
    canUseCustomDescription: boolean;
    canUseSocialCaption: boolean;
    canUseTitleSuggestions: boolean;
    maxActiveLinks: number;
}

const PERMISSIONS_BY_PLAN: Record<string, PlanPermissions> = {
    trial: {
        simulatorLevel: "basic",
        canUseTour360: false,
        canUseCustomDescription: true,
        canUseSocialCaption: true,
        canUseTitleSuggestions: true,
        maxActiveLinks: 3,
    },
    starter: {
        simulatorLevel: "basic",
        canUseTour360: true,
        canUseCustomDescription: true,
        canUseSocialCaption: true,
        canUseTitleSuggestions: true,
        maxActiveLinks: 20,
    },
    pro: {
        simulatorLevel: "advanced",
        canUseTour360: true,
        canUseCustomDescription: true,
        canUseSocialCaption: true,
        canUseTitleSuggestions: true,
        maxActiveLinks: 999,
    },
    elite: { // hypothetical elite plan for professional simulator
        simulatorLevel: "professional",
        canUseTour360: true,
        canUseCustomDescription: true,
        canUseSocialCaption: true,
        canUseTitleSuggestions: true,
        maxActiveLinks: 999,
    },
};

export function getPermissions(planId: string = "trial"): PlanPermissions {
    return PERMISSIONS_BY_PLAN[planId] || PERMISSIONS_BY_PLAN.trial;
}

export function canAccessLevel(currentLevel: SimulatorLevel, userLevel: SimulatorLevel): boolean {
    const levels: SimulatorLevel[] = ["basic", "advanced", "professional"];
    return levels.indexOf(userLevel) >= levels.indexOf(currentLevel);
}
