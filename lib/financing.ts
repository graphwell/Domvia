// ──────────────────────────────────────────────
//  Financing Calculator — SAC / Price (French)
// ──────────────────────────────────────────────

export interface FinancingInput {
    propertyValue: number;
    downPayment: number;
    years: number;
    annualRate: number; // e.g. 10.5 for 10.5%
    amortization?: "price" | "sac";
    itbiRate?: number;     // e.g. 2 for 2%
    registryRate?: number; // e.g. 1 for 1%
    includeInTotal?: boolean; // Whether to include extra costs in total paid
}

export interface FinancingResult {
    totalFinanced: number;
    monthlyInstallment: number;   // First installment (Price: constant, SAC: starts high)
    lastInstallment?: number;     // For SAC
    totalPaid: number;
    totalInterest: number;
    effectiveMonthlyRate: number;
    months: number;
    itbiCost: number;
    registryCost: number;
    totalExtraCosts: number;
}

/**
 * Calculates financing based on Price (French) or SAC amortization.
 */
export function calculateFinancing(input: FinancingInput): FinancingResult {
    const {
        propertyValue,
        downPayment,
        years,
        annualRate,
        amortization = "price",
        itbiRate = 2,
        registryRate = 1
    } = input;

    const totalFinanced = Math.max(0, propertyValue - downPayment);
    const months = years * 12;
    const monthlyRate = annualRate / 100 / 12;

    const itbiCost = (propertyValue * itbiRate) / 100;
    const registryCost = (propertyValue * registryRate) / 100;
    const totalExtraCosts = itbiCost + registryCost;

    if (totalFinanced === 0 || months === 0) {
        return {
            totalFinanced,
            monthlyInstallment: 0,
            totalPaid: itbiCost + registryCost,
            totalInterest: 0,
            effectiveMonthlyRate: 0,
            months,
            itbiCost,
            registryCost,
            totalExtraCosts,
        };
    }

    let monthlyInstallment = 0;
    let lastInstallment = 0;
    let totalPaid = 0;

    if (amortization === "price") {
        if (monthlyRate === 0) {
            monthlyInstallment = totalFinanced / months;
            totalPaid = totalFinanced;
        } else {
            // PMT formula
            monthlyInstallment = (totalFinanced * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
            totalPaid = monthlyInstallment * months;
        }
        lastInstallment = monthlyInstallment;
    } else {
        // SAC amortization
        const fixedAmortization = totalFinanced / months;
        const firstInterest = totalFinanced * monthlyRate;
        monthlyInstallment = fixedAmortization + firstInterest;

        // Total SAC paid = TotalFinanced + Sum of Interest
        // Interest sequence is an Arithmetic Progression: 
        // I_1 = PV * i
        // I_n = (PV/n) * i
        // Sum = (I_1 + I_n) * n / 2
        const lastInterest = fixedAmortization * monthlyRate;
        lastInstallment = fixedAmortization + lastInterest;
        const sumInterest = ((firstInterest + lastInterest) * months) / 2;

        totalPaid = totalFinanced + sumInterest;
    }

    const totalInterest = totalPaid - totalFinanced;

    return {
        totalFinanced,
        monthlyInstallment,
        lastInstallment,
        totalPaid: totalPaid + totalExtraCosts,
        totalInterest,
        effectiveMonthlyRate: monthlyRate * 100,
        months,
        itbiCost,
        registryCost,
        totalExtraCosts,
    };
}

/**
 * Minimum down payment validation — FGTS + market rule: typically 20%
 */
export function getMinDownPayment(propertyValue: number): number {
    return propertyValue * 0.2;
}

/**
 * Suggested financing scenarios for a given property value.
 */
export function getFinancingScenarios(propertyValue: number) {
    return [
        { label: "20% de entrada / 30 anos", downPayment: propertyValue * 0.20, years: 30, annualRate: 10.5 },
        { label: "30% de entrada / 20 anos", downPayment: propertyValue * 0.30, years: 20, annualRate: 10.5 },
        { label: "50% de entrada / 15 anos", downPayment: propertyValue * 0.50, years: 15, annualRate: 10.0 },
    ].map((s) => ({
        ...s,
        ...calculateFinancing({ propertyValue, downPayment: s.downPayment, years: s.years, annualRate: s.annualRate }),
    }));
}
