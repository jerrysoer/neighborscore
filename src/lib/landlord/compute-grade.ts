import type { LandlordGrade, LandlordProfile, PortfolioBuilding } from './types';

const DEFAULT_MEDIAN_RATE = 0.15; // Fallback if nta-scores not loaded

export function computeLandlordGrade(
  ownerName: string,
  buildings: PortfolioBuilding[],
  totalOpenViolations: number,
  hazardousViolations: number,
  medianViolationRate?: number,
): LandlordProfile {
  const totalUnits = buildings.reduce((sum, b) => sum + b.units, 0);
  const rate = totalUnits > 0 ? totalOpenViolations / totalUnits : 0;
  const median = medianViolationRate ?? DEFAULT_MEDIAN_RATE;

  let grade: LandlordGrade;
  if (rate < median * 0.5) {
    grade = 'A';
  } else if (rate < median) {
    grade = 'B';
  } else if (rate < median * 1.5) {
    grade = 'C';
  } else if (rate < median * 2.5) {
    grade = 'D';
  } else {
    grade = 'F';
  }

  return {
    ownerName,
    portfolioSize: buildings.length,
    totalUnits,
    totalOpenViolations,
    hazardousViolations,
    violationRate: rate,
    grade,
    buildings,
  };
}
