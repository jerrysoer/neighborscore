import { describe, it, expect } from 'vitest';
import { percentileRank, computeSubScores, computeComposite } from './scoring';
import type { NTARawScores } from './types';

/** Factory for minimal NTARawScores */
function makeRaw(overrides: Partial<NTARawScores> = {}): NTARawScores {
  return {
    crimeCount: 0,
    cleanlinessComplaints: 0,
    noiseComplaints: 0,
    rodentComplaints: 0,
    criticalFoodViolations: 0,
    treeCount: 0,
    subwayStations: 0,
    ...overrides,
  };
}

describe('percentileRank', () => {
  it('returns 0 for the lowest value (non-inverted)', () => {
    const result = percentileRank(1, [1, 2, 3, 4, 5], false);
    expect(result).toBe(0);
  });

  it('returns 100 for the highest value (non-inverted)', () => {
    const result = percentileRank(5, [1, 2, 3, 4, 5], false);
    expect(result).toBe(100);
  });

  it('returns 50 for the median value (non-inverted)', () => {
    const result = percentileRank(3, [1, 2, 3, 4, 5], false);
    expect(result).toBe(50);
  });

  it('inverts correctly: lowest crime → 100', () => {
    // Lowest crime count = best safety → should be 100
    const result = percentileRank(1, [1, 2, 3, 4, 5], true);
    expect(result).toBe(100);
  });

  it('inverts correctly: highest crime → 0', () => {
    // Highest crime count = worst safety → should be 0
    const result = percentileRank(5, [1, 2, 3, 4, 5], true);
    expect(result).toBe(0);
  });

  it('handles single-element array', () => {
    const result = percentileRank(42, [42], false);
    expect(result).toBe(0); // nothing is less than itself
  });

  it('handles duplicate values', () => {
    const result = percentileRank(3, [1, 3, 3, 3, 5], false);
    // 1 value less than 3, out of 4 gaps → 25
    expect(result).toBe(25);
  });
});

describe('computeSubScores', () => {
  it('scores a safe, clean, quiet neighborhood high', () => {
    const good = makeRaw({
      crimeCount: 5,
      cleanlinessComplaints: 10,
      noiseComplaints: 5,
      rodentComplaints: 1,
      criticalFoodViolations: 2,
      treeCount: 5000,
      subwayStations: 8,
    });
    const bad = makeRaw({
      crimeCount: 500,
      cleanlinessComplaints: 300,
      noiseComplaints: 200,
      rodentComplaints: 50,
      criticalFoodViolations: 100,
      treeCount: 100,
      subwayStations: 0,
    });
    const allRaws = [good, bad];

    const scores = computeSubScores(good, allRaws);
    // Good NTA should score 100 on all inverted metrics (lower = better)
    // and 100 on higher-is-better metrics (trees, transit)
    expect(scores.safety).toBe(100);
    expect(scores.cleanliness).toBe(100);
    expect(scores.noise).toBe(100);
    expect(scores.foodSafety).toBe(100);
    expect(scores.greenSpace).toBe(100);
    expect(scores.transit).toBe(100);
    expect(scores.composite).toBe(100);
  });

  it('scores the worst neighborhood low', () => {
    const good = makeRaw({ crimeCount: 5, treeCount: 5000, subwayStations: 8 });
    const bad = makeRaw({
      crimeCount: 500,
      cleanlinessComplaints: 300,
      noiseComplaints: 200,
      rodentComplaints: 50,
      criticalFoodViolations: 100,
      treeCount: 100,
      subwayStations: 0,
    });
    const allRaws = [good, bad];

    const scores = computeSubScores(bad, allRaws);
    expect(scores.safety).toBe(0);
    expect(scores.greenSpace).toBe(0);
    expect(scores.transit).toBe(0);
    expect(scores.composite).toBe(0);
  });

  it('rodent complaints add 1.5x weight to cleanliness', () => {
    // Two NTAs: one with rodents, one with equivalent cleanliness complaints
    const rodentHeavy = makeRaw({ cleanlinessComplaints: 10, rodentComplaints: 100 });
    const cleanHeavy = makeRaw({ cleanlinessComplaints: 160, rodentComplaints: 0 });
    const allRaws = [rodentHeavy, cleanHeavy];

    // rodentHeavy effective = 10 + 100*1.5 = 160
    // cleanHeavy effective = 160 + 0 = 160
    // Same effective score → both should get same cleanliness percentile
    const rodentScores = computeSubScores(rodentHeavy, allRaws);
    const cleanScores = computeSubScores(cleanHeavy, allRaws);
    expect(rodentScores.cleanliness).toBe(cleanScores.cleanliness);
  });
});

describe('computeComposite', () => {
  it('weights sum to 100 when all dimensions are 100', () => {
    const result = computeComposite({
      safety: 100,
      cleanliness: 100,
      noise: 100,
      foodSafety: 100,
      greenSpace: 100,
      transit: 100,
    });
    expect(result).toBe(100);
  });

  it('returns 0 when all dimensions are 0', () => {
    const result = computeComposite({
      safety: 0,
      cleanliness: 0,
      noise: 0,
      foodSafety: 0,
      greenSpace: 0,
      transit: 0,
    });
    expect(result).toBe(0);
  });

  it('safety has highest weight (25%)', () => {
    // Safety only → composite = 100 * 0.25 = 25
    const safetyOnly = computeComposite({
      safety: 100,
      cleanliness: 0,
      noise: 0,
      foodSafety: 0,
      greenSpace: 0,
      transit: 0,
    });
    expect(safetyOnly).toBe(25);
  });

  it('transit has lowest weight (10%)', () => {
    const transitOnly = computeComposite({
      safety: 0,
      cleanliness: 0,
      noise: 0,
      foodSafety: 0,
      greenSpace: 0,
      transit: 100,
    });
    expect(transitOnly).toBe(10);
  });

  it('weights are: safety 25, clean 20, noise 20, food 15, green 10, transit 10', () => {
    // Set each dimension to a distinct value, verify weighted sum
    const result = computeComposite({
      safety: 80,      // 80 * 0.25 = 20
      cleanliness: 60, // 60 * 0.20 = 12
      noise: 40,       // 40 * 0.20 = 8
      foodSafety: 70,  // 70 * 0.15 = 10.5
      greenSpace: 90,  // 90 * 0.10 = 9
      transit: 50,     // 50 * 0.10 = 5
    });
    // Total = 20 + 12 + 8 + 10.5 + 9 + 5 = 64.5 → rounds to 65
    expect(result).toBe(65);
  });
});
