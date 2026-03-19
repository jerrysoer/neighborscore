import type { NTARawScores, NTAScore } from './types';

// Weights for composite score
const WEIGHTS = {
  safety: 0.25,
  cleanliness: 0.2,
  noise: 0.2,
  foodSafety: 0.15,
  greenSpace: 0.1,
  transit: 0.1,
} as const;

/**
 * Compute percentile rank (0-100) for a value in a distribution.
 * For "lower is better" metrics (crime, complaints), invert = true.
 * For "higher is better" metrics (trees, stations), invert = false.
 */
export function percentileRank(
  value: number,
  allValues: number[],
  invert: boolean,
): number {
  const sorted = [...allValues].sort((a, b) => a - b);
  const rank = sorted.filter((v) => v < value).length;
  const pct = (rank / Math.max(sorted.length - 1, 1)) * 100;
  return invert ? 100 - pct : pct;
}

export function computeSubScores(
  raw: NTARawScores,
  allRaws: NTARawScores[],
): Omit<NTAScore, 'ntaCode' | 'ntaName' | 'borough' | 'raw' | 'centroid'> {
  const safetyValues = allRaws.map((r) => r.crimeCount);
  const cleanlinessValues = allRaws.map(
    (r) => r.cleanlinessComplaints + r.rodentComplaints * 1.5,
  );
  const noiseValues = allRaws.map((r) => r.noiseComplaints);
  const foodValues = allRaws.map((r) => r.criticalFoodViolations);
  const greenValues = allRaws.map((r) => r.treeCount);
  const transitValues = allRaws.map((r) => r.subwayStations);

  const safety = percentileRank(raw.crimeCount, safetyValues, true);
  const cleanliness = percentileRank(
    raw.cleanlinessComplaints + raw.rodentComplaints * 1.5,
    cleanlinessValues,
    true,
  );
  const noise = percentileRank(raw.noiseComplaints, noiseValues, true);
  const foodSafety = percentileRank(
    raw.criticalFoodViolations,
    foodValues,
    true,
  );
  const greenSpace = percentileRank(raw.treeCount, greenValues, false);
  const transit = percentileRank(raw.subwayStations, transitValues, false);

  const composite = Math.round(
    safety * WEIGHTS.safety +
      cleanliness * WEIGHTS.cleanliness +
      noise * WEIGHTS.noise +
      foodSafety * WEIGHTS.foodSafety +
      greenSpace * WEIGHTS.greenSpace +
      transit * WEIGHTS.transit,
  );

  return {
    composite,
    safety: Math.round(safety),
    cleanliness: Math.round(cleanliness),
    noise: Math.round(noise),
    foodSafety: Math.round(foodSafety),
    greenSpace: Math.round(greenSpace),
    transit: Math.round(transit),
  };
}

export function computeComposite(scores: {
  safety: number;
  cleanliness: number;
  noise: number;
  foodSafety: number;
  greenSpace: number;
  transit: number;
}): number {
  return Math.round(
    scores.safety * WEIGHTS.safety +
      scores.cleanliness * WEIGHTS.cleanliness +
      scores.noise * WEIGHTS.noise +
      scores.foodSafety * WEIGHTS.foodSafety +
      scores.greenSpace * WEIGHTS.greenSpace +
      scores.transit * WEIGHTS.transit,
  );
}
