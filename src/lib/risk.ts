import { Incident } from '@prisma/client';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface RiskAnalysis {
    score: number;
    level: RiskLevel;
    factors: {
        totalIncidents: number;
        recentIncidents: number;
        timeDistribution: Record<string, number>;
    };
}

export function calculateRiskScore(incidents: Incident[], datasetScore: number = 0): RiskAnalysis {
    if (incidents.length === 0 && datasetScore === 0) {
        return {
            score: 0,
            level: 'LOW',
            factors: { totalIncidents: 0, recentIncidents: 0, timeDistribution: {} }
        };
    }

    const now = new Date();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const SEVEN_DAYS_MS = 7 * ONE_DAY_MS;

    // Weights for different incident categories
    const CATEGORY_WEIGHTS: Record<string, number> = {
        'rape': 50,
        'sexual assault': 50,
        'assault': 40,
        'harassment': 30,
        'stalking': 25,
        'robbery': 20,
        'theft': 15,
        'eve teasing': 20,
        'domestic violence': 35,
        'poor lighting': 15, // Environmental risk factor
        'unsafe crowding': 15, // Environmental risk factor
        'other': 10
    };

    let incidentScore = 0;
    let recentCount = 0;
    const timeDist: Record<string, number> = { morning: 0, afternoon: 0, evening: 0, night: 0 };

    incidents.forEach(inc => {
        // 1. Weighted Score per incident
        const category = (inc.category || 'other').toLowerCase();
        let baseWeight = 10; // Default fallback

        // Find matching weight (partial match allowed for robustness)
        if (CATEGORY_WEIGHTS[category]) {
            baseWeight = CATEGORY_WEIGHTS[category];
        } else {
            // Try partial match
            const foundKey = Object.keys(CATEGORY_WEIGHTS).find(k => category.includes(k));
            if (foundKey) baseWeight = CATEGORY_WEIGHTS[foundKey];
        }

        incidentScore += baseWeight;

        // 2. Recency Factor (Multiplier or Addition?)
        // Let's keep it additive to avoid exploding scores, but scale it relative to severity?
        // Current logic: +20 for < 24h. Let's make it +50% of base weight for recency?
        // Sticking to simple additive for now to preserve existing tuning, but boosting it slightly.
        const diff = now.getTime() - new Date(inc.timestamp).getTime();
        if (diff < ONE_DAY_MS) {
            incidentScore += 20; // High urgent weight
            recentCount++;
        } else if (diff < SEVEN_DAYS_MS) {
            incidentScore += 10; // Moderate weight (Increased from 5)
        }

        // 3. Time of Day Factor (Evening/Night is riskier)
        const hour = new Date(inc.timestamp).getHours();
        if (hour >= 18 || hour < 6) {
            incidentScore += 5; // Night penalty
            timeDist.night = (timeDist.night || 0) + 1; // Simplified bucket
        } else {
            timeDist.day = (timeDist.day || 0) + 1;
        }
    });

    // Normalize Incident Score (Max 100)
    // If > 100, cap it.
    let normalizedIncidentScore = Math.min(incidentScore, 100);

    // Apply 80% Weight to Incident Score
    const weightedIncidentScore = normalizedIncidentScore * 0.8;

    // Dataset Score is already 0-20.
    const finalScore = weightedIncidentScore + datasetScore;

    let level: RiskLevel = 'LOW';
    if (finalScore > 80) level = 'CRITICAL';
    else if (finalScore > 50) level = 'HIGH';
    else if (finalScore > 20) level = 'MODERATE';

    return {
        score: finalScore,
        level,
        factors: {
            totalIncidents: incidents.length,
            recentIncidents: recentCount,
            timeDistribution: timeDist
        }
    };
}

export function generateAlerts(incidents: Incident[]): string[] {
    const alerts: string[] = [];
    const risk = calculateRiskScore(incidents);

    if (risk.factors.recentIncidents > 2) {
        alerts.push(`High activity detected: ${risk.factors.recentIncidents} incidents in the last 24h.`);
    }

    if (risk.factors.timeDistribution['night'] > risk.factors.timeDistribution['day']) {
        alerts.push("Caution: Majority of incidents reported during evening/night hours.");
    }

    if (risk.level === 'CRITICAL' || risk.level === 'HIGH') {
        alerts.push(`Risk Level is ${risk.level}. Avoid travelling alone.`);
    }

    return alerts;
}
