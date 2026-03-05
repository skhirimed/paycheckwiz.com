/**
 * PaycheckWiz — Net Pay Estimation Utilities
 * Estimate take-home pay using US federal tax brackets.
 * https://paycheckwiz.com
 * MIT License — Mohamed Skhiri
 */

const PaycheckEstimator = {
    // 2026 Federal tax brackets (single filer)
    BRACKETS: [
        { min: 0, max: 11925, rate: 0.10 },
        { min: 11925, max: 48475, rate: 0.12 },
        { min: 48475, max: 103350, rate: 0.22 },
        { min: 103350, max: 197300, rate: 0.24 },
        { min: 197300, max: 250525, rate: 0.32 },
        { min: 250525, max: 626350, rate: 0.35 },
        { min: 626350, max: Infinity, rate: 0.37 }
    ],

    STANDARD_DEDUCTION: 15700,
    FICA_SS_RATE: 0.062,
    FICA_SS_CAP: 168600,
    FICA_MEDICARE: 0.0145,

    /**
     * Calculate federal income tax using progressive brackets.
     */
    calcFederalTax(grossAnnual) {
        const taxable = Math.max(0, grossAnnual - this.STANDARD_DEDUCTION);
        let tax = 0;
        for (const b of this.BRACKETS) {
            if (taxable <= b.min) break;
            const amount = Math.min(taxable, b.max) - b.min;
            tax += amount * b.rate;
        }
        return Math.round(tax * 100) / 100;
    },

    /**
     * Calculate FICA taxes (Social Security + Medicare).
     */
    calcFICA(grossAnnual) {
        const ss = Math.min(grossAnnual, this.FICA_SS_CAP) * this.FICA_SS_RATE;
        const medicare = grossAnnual * this.FICA_MEDICARE;
        return Math.round((ss + medicare) * 100) / 100;
    },

    /**
     * Full paycheck estimation.
     */
    estimate(grossAnnual) {
        const federal = this.calcFederalTax(grossAnnual);
        const fica = this.calcFICA(grossAnnual);
        const totalTax = federal + fica;
        const netAnnual = grossAnnual - totalTax;
        return {
            gross: grossAnnual,
            federalTax: federal,
            fica: fica,
            totalTax: Math.round(totalTax),
            netAnnual: Math.round(netAnnual),
            netMonthly: Math.round(netAnnual / 12),
            netBiweekly: Math.round(netAnnual / 26),
            effectiveRate: (totalTax / grossAnnual * 100).toFixed(1) + '%'
        };
    }
};

// Example
const pay = PaycheckEstimator.estimate(75000);
console.log(`$75K gross -> $${pay.netMonthly}/month net (${pay.effectiveRate} effective rate)`);
