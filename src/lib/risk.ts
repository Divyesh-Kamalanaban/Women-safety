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

export function calculateRiskScore(incidents: Incident[]): RiskAnalysis {
    if (incidents.length === 0) {
        return {
            score: 0,
            level: 'LOW',
            factors: { totalIncidents: 0, recentIncidents: 0, timeDistribution: {} }
        };
    }

    const now = new Date();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const SEVEN_DAYS_MS = 7 * ONE_DAY_MS;

    let score = 0;
    let recentCount = 0;
    const timeDist: Record<string, number> = { morning: 0, afternoon: 0, evening: 0, night: 0 };

    incidents.forEach(inc => {
        // 1. Base Score per incident
        score += 10;

        // 2. Recency Factor
        const diff = now.getTime() - new Date(inc.timestamp).getTime();
        if (diff < ONE_DAY_MS) {
            score += 20; // High urgent weight
            recentCount++;
        } else if (diff < SEVEN_DAYS_MS) {
            score += 5; // Moderate weight
        }

        // 3. Time of Day Factor (Evening/Night is riskier)
        const hour = new Date(inc.timestamp).getHours();
        if (hour >= 18 || hour < 6) {
            score += 5; // Night penalty
            timeDist.night++; // Simplified bucket
        } else {
            timeDist.day++;
        }
    });

    // Normalize/Cap score for easy reading? Or just keep raw.
    // Let's cap at 100 for a "Zone" logic, but since this is aggregate, maybe just return raw.
    // Actually, let's normalize by area if possible, but here we just score the cluster.

    let level: RiskLevel = 'LOW';
    if (score > 100) level = 'CRITICAL';
    else if (score > 50) level = 'HIGH';
    else if (score > 20) level = 'MODERATE';

    return {
        score,
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
