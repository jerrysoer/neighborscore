import type { AddressReport } from './search';
import { analyzeSeasonalPatterns } from './building/seasonal';

export type VerdictLevel =
  | 'GREEN_LIGHT'
  | 'PROCEED_WITH_CAUTION'
  | 'RED_FLAG'
  | 'NEEDS_INVESTIGATION';

export interface VerdictResponse {
  verdict: VerdictLevel;
  summary: string;
  findings: string[];
  questions: string[];
  recommendation: string;
}

export async function fetchVerdict(
  report: AddressReport,
): Promise<VerdictResponse> {
  const apiUrl = import.meta.env.VITE_VERDICT_API_URL;
  if (!apiUrl) {
    throw new Error('AI analysis is not configured');
  }

  const seasonal = analyzeSeasonalPatterns(report.building.violations);

  const body = {
    address: report.address.formattedAddress,
    buildingStatus: {
      level: report.building.status.level,
      label: report.building.status.label,
      openClassA: report.building.status.openClassA,
      openClassB: report.building.status.openClassB,
      openClassC: report.building.status.openClassC,
      totalViolations: report.building.status.totalViolations,
      resolvedViolations: report.building.status.resolvedViolations,
    },
    landlord: report.landlord
      ? {
          name: report.landlord.ownerName,
          grade: report.landlord.grade,
          buildings: report.landlord.portfolioSize,
          units: report.landlord.totalUnits,
          violationRate: report.landlord.violationRate,
        }
      : null,
    seasonal: {
      winterHeatIssues: seasonal.winterHeatIssues,
      summerNoiseIssues: seasonal.summerNoiseIssues,
      spikeMonths: seasonal.spikes.map((s) => s.month),
    },
    neighborhood: report.neighborhood
      ? {
          name: report.neighborhood.ntaName,
          composite: report.neighborhood.composite,
          safety: report.neighborhood.safety,
          cleanliness: report.neighborhood.cleanliness,
          noise: report.neighborhood.noise,
          foodSafety: report.neighborhood.foodSafety,
          greenSpace: report.neighborhood.greenSpace,
          transit: report.neighborhood.transit,
        }
      : null,
  };

  const response = await fetch(`${apiUrl}/api/verdict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(err.error ?? 'AI analysis failed');
  }

  return (await response.json()) as VerdictResponse;
}
