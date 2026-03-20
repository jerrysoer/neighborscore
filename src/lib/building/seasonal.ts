import type { HPDViolation } from '../soda/types';

export interface MonthlyCount {
  month: string; // YYYY-MM
  count: number;
}

export interface SeasonalPattern {
  monthlyCounts: MonthlyCount[];
  averageMonthly: number;
  spikes: MonthlyCount[];
  winterHeatIssues: number;
  summerNoiseIssues: number;
}

export function analyzeSeasonalPatterns(
  violations: HPDViolation[],
): SeasonalPattern {
  const byMonth = new Map<string, number>();

  for (const v of violations) {
    if (!v.inspectiondate) continue;
    const date = new Date(v.inspectiondate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    byMonth.set(key, (byMonth.get(key) ?? 0) + 1);
  }

  const monthlyCounts = Array.from(byMonth.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const total = monthlyCounts.reduce((sum, m) => sum + m.count, 0);
  const averageMonthly =
    monthlyCounts.length > 0 ? total / monthlyCounts.length : 0;

  const spikes = monthlyCounts.filter((m) => m.count > averageMonthly * 2);

  // Winter = Nov-Mar, check for heat-related violations
  const heatKeywords = ['heat', 'hot water', 'heating'];
  const winterHeatIssues = violations.filter((v) => {
    if (!v.inspectiondate || !v.novdescription) return false;
    const month = new Date(v.inspectiondate).getMonth();
    const isWinter = month >= 10 || month <= 2; // Nov-Mar
    const isHeatRelated = heatKeywords.some((k) =>
      v.novdescription.toLowerCase().includes(k),
    );
    return isWinter && isHeatRelated;
  }).length;

  // Summer = Jun-Aug, check noise
  const noiseKeywords = ['noise', 'loud'];
  const summerNoiseIssues = violations.filter((v) => {
    if (!v.inspectiondate || !v.novdescription) return false;
    const month = new Date(v.inspectiondate).getMonth();
    const isSummer = month >= 5 && month <= 7; // Jun-Aug
    const isNoiseRelated = noiseKeywords.some((k) =>
      v.novdescription.toLowerCase().includes(k),
    );
    return isSummer && isNoiseRelated;
  }).length;

  return {
    monthlyCounts,
    averageMonthly,
    spikes,
    winterHeatIssues,
    summerNoiseIssues,
  };
}
