import { describe, it, expect } from 'vitest';
import { computeLandlordGrade } from './compute-grade';
import type { PortfolioBuilding } from './types';

/** Factory for minimal PortfolioBuilding */
function makeBuilding(overrides: Partial<PortfolioBuilding> = {}): PortfolioBuilding {
  return {
    buildingId: '1',
    registrationId: '100',
    units: 10,
    lat: 40.71,
    lng: -74.0,
    ...overrides,
  };
}

describe('computeLandlordGrade', () => {
  const median = 0.2; // 0.2 violations per unit

  // --- Grade bracket boundaries ---
  // A: rate < median * 0.5 = 0.1
  // B: rate < median * 1.0 = 0.2
  // C: rate < median * 1.5 = 0.3
  // D: rate < median * 2.5 = 0.5
  // F: rate >= 0.5

  it('assigns A when violation rate < 0.5x median', () => {
    // 100 units, 5 violations → rate = 0.05 < 0.1
    const buildings = [makeBuilding({ units: 100 })];
    const result = computeLandlordGrade('Owner', buildings, 5, 0, median);
    expect(result.grade).toBe('A');
    expect(result.violationRate).toBeCloseTo(0.05);
  });

  it('assigns B when rate >= 0.5x and < 1x median', () => {
    // 100 units, 15 violations → rate = 0.15 (>0.1, <0.2)
    const buildings = [makeBuilding({ units: 100 })];
    const result = computeLandlordGrade('Owner', buildings, 15, 0, median);
    expect(result.grade).toBe('B');
  });

  it('assigns C when rate >= 1x and < 1.5x median', () => {
    // 100 units, 25 violations → rate = 0.25 (>0.2, <0.3)
    const buildings = [makeBuilding({ units: 100 })];
    const result = computeLandlordGrade('Owner', buildings, 25, 0, median);
    expect(result.grade).toBe('C');
  });

  it('assigns D when rate >= 1.5x and < 2.5x median', () => {
    // 100 units, 40 violations → rate = 0.4 (>0.3, <0.5)
    const buildings = [makeBuilding({ units: 100 })];
    const result = computeLandlordGrade('Owner', buildings, 40, 0, median);
    expect(result.grade).toBe('D');
  });

  it('assigns F when rate >= 2.5x median', () => {
    // 100 units, 60 violations → rate = 0.6 (>0.5)
    const buildings = [makeBuilding({ units: 100 })];
    const result = computeLandlordGrade('Owner', buildings, 60, 0, median);
    expect(result.grade).toBe('F');
  });

  // --- Boundary edge tests (the bracket seams) ---

  it('boundary: rate exactly at 0.5x median is B (not A)', () => {
    // rate = 0.1 exactly → 0.1 < 0.1 is FALSE, so B
    const buildings = [makeBuilding({ units: 100 })];
    const result = computeLandlordGrade('Owner', buildings, 10, 0, median);
    expect(result.grade).toBe('B');
  });

  it('boundary: rate just below 0.5x median is A', () => {
    // rate = 0.099 → 0.099 < 0.1 is TRUE, so A
    const buildings = [makeBuilding({ units: 1000 })];
    const result = computeLandlordGrade('Owner', buildings, 99, 0, median);
    expect(result.grade).toBe('A');
  });

  it('boundary: rate exactly at 1x median is C (not B)', () => {
    // rate = 0.2 → 0.2 < 0.2 is FALSE, so C
    const buildings = [makeBuilding({ units: 100 })];
    const result = computeLandlordGrade('Owner', buildings, 20, 0, median);
    expect(result.grade).toBe('C');
  });

  it('boundary: rate exactly at 2.5x median is F (not D)', () => {
    // rate = 0.5 → 0.5 < 0.5 is FALSE, so F
    const buildings = [makeBuilding({ units: 100 })];
    const result = computeLandlordGrade('Owner', buildings, 50, 0, median);
    expect(result.grade).toBe('F');
  });

  // --- Monotonicity: grades degrade as violations increase ---

  it('grades degrade monotonically as violation count increases', () => {
    const gradeOrder: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, F: 0 };
    const buildings = [makeBuilding({ units: 100 })];

    const gradeA = computeLandlordGrade('O', buildings, 5, 0, median);
    const gradeB = computeLandlordGrade('O', buildings, 15, 0, median);
    const gradeC = computeLandlordGrade('O', buildings, 25, 0, median);
    const gradeD = computeLandlordGrade('O', buildings, 40, 0, median);
    const gradeF = computeLandlordGrade('O', buildings, 60, 0, median);

    expect(gradeOrder[gradeA.grade]!).toBeGreaterThan(gradeOrder[gradeB.grade]!);
    expect(gradeOrder[gradeB.grade]!).toBeGreaterThan(gradeOrder[gradeC.grade]!);
    expect(gradeOrder[gradeC.grade]!).toBeGreaterThan(gradeOrder[gradeD.grade]!);
    expect(gradeOrder[gradeD.grade]!).toBeGreaterThan(gradeOrder[gradeF.grade]!);
  });

  // --- Edge cases ---

  it('handles zero units (no division by zero) with rate = 0 → A', () => {
    const buildings = [makeBuilding({ units: 0 })];
    const result = computeLandlordGrade('Owner', buildings, 10, 0, median);
    expect(result.violationRate).toBe(0);
    expect(result.grade).toBe('A');
  });

  it('sums units across multiple buildings', () => {
    const buildings = [
      makeBuilding({ units: 50 }),
      makeBuilding({ units: 50 }),
    ];
    const result = computeLandlordGrade('Owner', buildings, 5, 0, median);
    expect(result.totalUnits).toBe(100);
    expect(result.violationRate).toBeCloseTo(0.05);
  });

  it('uses default median rate when not provided', () => {
    // Default median = 0.15, so A threshold = 0.075
    const buildings = [makeBuilding({ units: 100 })];
    const result = computeLandlordGrade('Owner', buildings, 5, 0);
    // rate = 0.05, 0.05 < 0.075 → A
    expect(result.grade).toBe('A');
  });

  it('populates all output fields correctly', () => {
    const buildings = [makeBuilding({ units: 50 }), makeBuilding({ units: 30 })];
    const result = computeLandlordGrade('Acme LLC', buildings, 20, 5, median);
    expect(result.ownerName).toBe('Acme LLC');
    expect(result.portfolioSize).toBe(2);
    expect(result.totalUnits).toBe(80);
    expect(result.totalOpenViolations).toBe(20);
    expect(result.hazardousViolations).toBe(5);
    expect(result.violationRate).toBeCloseTo(0.25);
    expect(result.buildings).toHaveLength(2);
  });
});
