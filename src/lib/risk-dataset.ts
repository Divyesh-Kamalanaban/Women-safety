// Data derived from result.csv
// Each score represents the 20% contribution to the total risk score.

export const STATE_RISK_SCORES: Record<string, number> = {
    "UTTAR PRADESH": 20.0,
    "MADHYA PRADESH": 18.54,
    "MAHARASHTRA": 17.65,
    "ANDHRA PRADESH": 16.72,
    "TAMIL NADU": 11.96,
    "RAJASTHAN": 11.07,
    "WEST BENGAL": 9.62,
    "KARNATAKA": 9.58,
    "ASSAM": 9.36,
    "KERALA": 8.21,
    "ODISHA": 8.08,
    "BIHAR": 7.92,
    "HARYANA": 6.30,
    "PUNJAB": 5.92,
    "CHHATTISGARH": 5.26,
    "DELHI": 4.57,
    "DELHI UT": 4.57, // Alias
    "NCT OF DELHI": 4.57, // Alias
    "JHARKHAND": 4.42,
    "GUJARAT": 4.09,
    "TELANGANA": 3.70,
    "JAMMU & KASHMIR": 2.96,
    "JAMMU AND KASHMIR": 2.96, // Alias
    "TRIPURA": 2.86,
    "UTTARAKHAND": 2.55,
    "NAGALAND": 1.92,
    "SIKKIM": 1.39,
    "HIMACHAL PRADESH": 1.18,
    "D&N HAVELI": 0.82,
    "DADRA AND NAGAR HAVELI": 0.82, // Alias
    "GOA": 0.44,
    "MEGHALAYA": 0.34,
    "DAMAN AND DIU": 0.32,
    "MANIPUR": 0.26,
    "ARUNACHAL PRADESH": 0.26,
    "CHANDIGARH": 0.23,
    "MIZORAM": 0.22,
    "ANDAMAN AND NICOBAR ISLANDS": 0.11,
    "PUDUCHERRY": 0.11,
    "LAKSHADWEEP": 0.004
};

export function getStateRiskScore(stateName: string): number {
    if (!stateName) return 0;

    const normalized = stateName.trim().toUpperCase();

    // Direct match
    if (STATE_RISK_SCORES[normalized] !== undefined) {
        return STATE_RISK_SCORES[normalized];
    }

    // Partial/Fuzzy match attempts (simple includes)
    for (const key in STATE_RISK_SCORES) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return STATE_RISK_SCORES[key];
        }
    }

    return 0; // Default safe if not found (or could be average?)
}
