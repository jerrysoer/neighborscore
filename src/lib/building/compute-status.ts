import type { HPDViolation } from '../soda/types';
import type { BuildingStatus, BuildingStatusLevel } from './types';

export function computeBuildingStatus(
  violations: HPDViolation[],
): BuildingStatus {
  const open = violations.filter(
    (v) => v.violationstatus?.toLowerCase() === 'open',
  );
  const resolved = violations.filter(
    (v) => v.violationstatus?.toLowerCase() !== 'open',
  );

  const openClassA = open.filter((v) => v.class === 'A').length;
  const openClassB = open.filter((v) => v.class === 'B').length;
  const openClassC = open.filter((v) => v.class === 'C').length;

  let level: BuildingStatusLevel;
  let label: string;

  if (openClassC > 0) {
    level = 'red';
    label = 'Immediately Hazardous Violations';
  } else if (openClassB > 0) {
    level = 'orange';
    label = 'Hazardous Violations Found';
  } else if (openClassA > 0) {
    level = 'yellow';
    label = 'Minor Issues on Record';
  } else if (violations.length === 0) {
    level = 'green';
    label = 'No Violations on Record';
  } else {
    level = 'green';
    label = 'All Violations Resolved';
  }

  return {
    level,
    label,
    openClassA,
    openClassB,
    openClassC,
    totalViolations: violations.length,
    resolvedViolations: resolved.length,
  };
}
