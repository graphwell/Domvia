export const TOOL_COSTS = {
    // Leves (1 crédito)
    DESCRIPTION_GENERATOR: 1,
    SOCIAL_POST_GENERATOR: 1,
    TITLE_GENERATOR: 1,

    // Médias (2 créditos)
    INVESTMENT_ANALYZER: 2,
    SIMULATOR_PRO: 2,

    // Avançadas (3 a 5 créditos)
    SMART_CAPTURE: 3,
    DOCUMENT_GENERATOR: 5,
    TOUR_360: 1
};

export function getToolCost(toolId: string): number {
    return (TOOL_COSTS as any)[toolId] || 1;
}
