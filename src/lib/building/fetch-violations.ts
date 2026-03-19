import type { HPDViolation } from '../soda/types';
import { violationsForBuildingCoords } from '../soda/queries';

export async function fetchViolations(
  lat: number,
  lng: number,
): Promise<HPDViolation[]> {
  const violations = await violationsForBuildingCoords(lat, lng);
  return violations.sort(
    (a, b) =>
      new Date(b.inspectiondate).getTime() -
      new Date(a.inspectiondate).getTime(),
  );
}
