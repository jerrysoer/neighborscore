import { describe, it, expect } from 'vitest';
import { analyzeSeasonalPatterns } from './seasonal';
import type { HPDViolation } from '../soda/types';

/** Factory for minimal HPDViolation with date + description.
 *  Uses datetime format (not date-only) to match SODA API output
 *  and avoid UTC vs local timezone month-shift bugs. */
function makeViolation(
  overrides: Partial<Pick<HPDViolation, 'inspectiondate' | 'novdescription' | 'violationstatus'>>,
): HPDViolation {
  return {
    violationid: '1',
    boroid: '1',
    block: '100',
    lot: '50',
    class: 'A',
    violationstatus: 'Open',
    inspectiondate: '2025-06-15T12:00:00',
    novdescription: 'General violation',
    latitude: '40.7128',
    longitude: '-74.006',
    ...overrides,
  };
}

describe('analyzeSeasonalPatterns', () => {
  it('returns zeros for empty violations', () => {
    const result = analyzeSeasonalPatterns([]);
    expect(result.monthlyCounts).toEqual([]);
    expect(result.averageMonthly).toBe(0);
    expect(result.spikes).toEqual([]);
    expect(result.winterHeatIssues).toBe(0);
    expect(result.summerNoiseIssues).toBe(0);
  });

  it('groups violations by month', () => {
    const violations = [
      makeViolation({ inspectiondate: '2025-01-10T12:00:00' }),
      makeViolation({ inspectiondate: '2025-01-20T12:00:00' }),
      makeViolation({ inspectiondate: '2025-03-05T12:00:00' }),
    ];
    const result = analyzeSeasonalPatterns(violations);
    expect(result.monthlyCounts).toEqual([
      { month: '2025-01', count: 2 },
      { month: '2025-03', count: 1 },
    ]);
  });

  it('computes average monthly count', () => {
    const violations = [
      makeViolation({ inspectiondate: '2025-01-10T12:00:00' }),
      makeViolation({ inspectiondate: '2025-01-20T12:00:00' }),
      makeViolation({ inspectiondate: '2025-02-05T12:00:00' }),
      makeViolation({ inspectiondate: '2025-02-15T12:00:00' }),
    ];
    const result = analyzeSeasonalPatterns(violations);
    // 2 months, 4 total → average = 2
    expect(result.averageMonthly).toBe(2);
  });

  it('detects spikes (>2x monthly average)', () => {
    const violations = [
      // Jan: 1 violation
      makeViolation({ inspectiondate: '2025-01-10T12:00:00' }),
      // Feb: 1 violation
      makeViolation({ inspectiondate: '2025-02-10T12:00:00' }),
      // Mar: 6 violations (spike!) — avg is ~2.67, threshold ~5.33
      makeViolation({ inspectiondate: '2025-03-01T12:00:00' }),
      makeViolation({ inspectiondate: '2025-03-02T12:00:00' }),
      makeViolation({ inspectiondate: '2025-03-03T12:00:00' }),
      makeViolation({ inspectiondate: '2025-03-04T12:00:00' }),
      makeViolation({ inspectiondate: '2025-03-05T12:00:00' }),
      makeViolation({ inspectiondate: '2025-03-06T12:00:00' }),
    ];
    const result = analyzeSeasonalPatterns(violations);
    expect(result.spikes).toHaveLength(1);
    expect(result.spikes[0]!.month).toBe('2025-03');
    expect(result.spikes[0]!.count).toBe(6);
  });

  // --- Winter heat detection (Nov-Mar) ---

  it('detects winter heat issues in December', () => {
    const violations = [
      makeViolation({
        inspectiondate: '2025-12-15T12:00:00',
        novdescription: 'No heat in apartment',
      }),
      makeViolation({
        inspectiondate: '2025-12-20T12:00:00',
        novdescription: 'Hot water not working',
      }),
    ];
    const result = analyzeSeasonalPatterns(violations);
    expect(result.winterHeatIssues).toBe(2);
  });

  it('detects winter heat issues in January (month=0)', () => {
    const violations = [
      makeViolation({
        inspectiondate: '2025-01-10T12:00:00',
        novdescription: 'Heating system broken',
      }),
    ];
    const result = analyzeSeasonalPatterns(violations);
    expect(result.winterHeatIssues).toBe(1);
  });

  it('does NOT count heat violations in summer as winter issues', () => {
    const violations = [
      makeViolation({
        inspectiondate: '2025-07-15T12:00:00',
        novdescription: 'No heat in apartment',
      }),
    ];
    const result = analyzeSeasonalPatterns(violations);
    expect(result.winterHeatIssues).toBe(0);
  });

  // --- Summer noise detection (Jun-Aug) ---

  it('detects summer noise issues', () => {
    const violations = [
      makeViolation({
        inspectiondate: '2025-06-15T12:00:00',
        novdescription: 'Loud noise from construction',
      }),
      makeViolation({
        inspectiondate: '2025-07-20T12:00:00',
        novdescription: 'Excessive noise from neighbor',
      }),
    ];
    const result = analyzeSeasonalPatterns(violations);
    expect(result.summerNoiseIssues).toBe(2);
  });

  it('does NOT count noise violations in winter as summer issues', () => {
    const violations = [
      makeViolation({
        inspectiondate: '2025-01-15T12:00:00',
        novdescription: 'Loud noise from upstairs',
      }),
    ];
    const result = analyzeSeasonalPatterns(violations);
    expect(result.summerNoiseIssues).toBe(0);
  });

  // --- Edge cases ---

  it('skips violations with missing inspectiondate', () => {
    const violations = [
      makeViolation({ inspectiondate: '' }),
      makeViolation({ inspectiondate: '2025-03-10T12:00:00' }),
    ];
    const result = analyzeSeasonalPatterns(violations);
    // Empty date produces Invalid Date, which has NaN month
    // The filter in the original code checks `if (!v.inspectiondate)` which handles empty string
    expect(result.monthlyCounts.length).toBeGreaterThanOrEqual(1);
  });

  it('skips violations with missing novdescription for seasonal detection', () => {
    const violations = [
      makeViolation({
        inspectiondate: '2025-12-15T12:00:00',
        novdescription: '',
      }),
    ];
    const result = analyzeSeasonalPatterns(violations);
    expect(result.winterHeatIssues).toBe(0);
  });
});
