import { describe, it, expect } from 'vitest';
import { computeBuildingStatus } from './compute-status';
import type { HPDViolation } from '../soda/types';

/** Factory for minimal HPDViolation test data */
function makeViolation(
  overrides: Partial<Pick<HPDViolation, 'class' | 'violationstatus' | 'inspectiondate'>>,
): HPDViolation {
  return {
    violationid: '1',
    boroid: '1',
    block: '100',
    lot: '50',
    class: 'A',
    violationstatus: 'Open',
    inspectiondate: '2025-01-15',
    novdescription: 'Test violation',
    latitude: '40.7128',
    longitude: '-74.006',
    ...overrides,
  };
}

describe('computeBuildingStatus', () => {
  // --- Status level branching (5 paths) ---

  it('returns RED when any open Class C violation exists', () => {
    const violations = [
      makeViolation({ class: 'C', violationstatus: 'Open' }),
      makeViolation({ class: 'A', violationstatus: 'Open' }),
    ];
    const result = computeBuildingStatus(violations);
    expect(result.level).toBe('red');
    expect(result.label).toBe('Immediately Hazardous Violations');
    expect(result.openClassC).toBe(1);
  });

  it('returns ORANGE when open Class B but no Class C', () => {
    const violations = [
      makeViolation({ class: 'B', violationstatus: 'Open' }),
      makeViolation({ class: 'A', violationstatus: 'Open' }),
    ];
    const result = computeBuildingStatus(violations);
    expect(result.level).toBe('orange');
    expect(result.label).toBe('Hazardous Violations Found');
    expect(result.openClassB).toBe(1);
    expect(result.openClassC).toBe(0);
  });

  it('returns YELLOW when open Class A but no B or C', () => {
    const violations = [
      makeViolation({ class: 'A', violationstatus: 'Open' }),
    ];
    const result = computeBuildingStatus(violations);
    expect(result.level).toBe('yellow');
    expect(result.label).toBe('Minor Issues on Record');
    expect(result.openClassA).toBe(1);
    expect(result.openClassB).toBe(0);
    expect(result.openClassC).toBe(0);
  });

  it('returns GREEN "No Violations" when violations array is empty', () => {
    const result = computeBuildingStatus([]);
    expect(result.level).toBe('green');
    expect(result.label).toBe('No Violations on Record');
    expect(result.totalViolations).toBe(0);
  });

  it('returns GREEN "All Resolved" when all violations are closed', () => {
    const violations = [
      makeViolation({ class: 'C', violationstatus: 'Close' }),
      makeViolation({ class: 'B', violationstatus: 'Close' }),
    ];
    const result = computeBuildingStatus(violations);
    expect(result.level).toBe('green');
    expect(result.label).toBe('All Violations Resolved');
    expect(result.totalViolations).toBe(2);
    expect(result.resolvedViolations).toBe(2);
  });

  // --- Priority: C > B > A ---

  it('C takes priority over B and A', () => {
    const violations = [
      makeViolation({ class: 'A', violationstatus: 'Open' }),
      makeViolation({ class: 'B', violationstatus: 'Open' }),
      makeViolation({ class: 'C', violationstatus: 'Open' }),
    ];
    const result = computeBuildingStatus(violations);
    expect(result.level).toBe('red');
  });

  it('B takes priority over A when no C', () => {
    const violations = [
      makeViolation({ class: 'A', violationstatus: 'Open' }),
      makeViolation({ class: 'B', violationstatus: 'Open' }),
    ];
    const result = computeBuildingStatus(violations);
    expect(result.level).toBe('orange');
  });

  // --- Counting accuracy ---

  it('correctly counts violations by class and status', () => {
    const violations = [
      makeViolation({ class: 'A', violationstatus: 'Open' }),
      makeViolation({ class: 'A', violationstatus: 'Open' }),
      makeViolation({ class: 'B', violationstatus: 'Close' }),
      makeViolation({ class: 'C', violationstatus: 'Open' }),
    ];
    const result = computeBuildingStatus(violations);
    expect(result.openClassA).toBe(2);
    expect(result.openClassB).toBe(0); // closed B doesn't count
    expect(result.openClassC).toBe(1);
    expect(result.totalViolations).toBe(4);
    expect(result.resolvedViolations).toBe(1);
  });

  // --- Case insensitivity ---

  it('handles mixed-case violationstatus', () => {
    const violations = [
      makeViolation({ class: 'A', violationstatus: 'OPEN' }),
    ];
    const result = computeBuildingStatus(violations);
    expect(result.level).toBe('yellow');
    expect(result.openClassA).toBe(1);
  });
});
