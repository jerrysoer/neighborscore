import type { HPDViolation } from '../soda/types';
import { buildingsByRegistrationIds, violationsForBuildingCoords } from '../soda/queries';
import type { PortfolioBuilding } from './types';

export async function fetchPortfolioBuildings(
  registrationIds: string[],
): Promise<PortfolioBuilding[]> {
  // Limit to 200 buildings to bound query count
  const limitedIds = registrationIds.slice(0, 200);

  // Batch in groups of 50 for the IN clause
  const batches: string[][] = [];
  for (let i = 0; i < limitedIds.length; i += 50) {
    batches.push(limitedIds.slice(i, i + 50));
  }

  const allBuildings: PortfolioBuilding[] = [];
  for (const batch of batches) {
    const buildings = await buildingsByRegistrationIds(batch);
    for (const b of buildings) {
      allBuildings.push({
        buildingId: b.buildingid,
        registrationId: b.registrationid,
        address: b.streetaddress,
        units: parseInt(b.unitsres, 10) || 0,
        lat: parseFloat(b.latitude) || 0,
        lng: parseFloat(b.longitude) || 0,
      });
    }
  }

  return allBuildings;
}

export async function fetchPortfolioViolations(
  buildings: PortfolioBuilding[],
): Promise<{ total: number; hazardous: number }> {
  // Limit to first 50 buildings for violation queries
  const sampled = buildings.slice(0, 50);
  let total = 0;
  let hazardous = 0;

  // Run in batches of 5 concurrent requests
  for (let i = 0; i < sampled.length; i += 5) {
    const batch = sampled.slice(i, i + 5);
    const results = await Promise.all(
      batch.map((b) =>
        b.lat && b.lng
          ? violationsForBuildingCoords(b.lat, b.lng)
          : Promise.resolve([] as HPDViolation[]),
      ),
    );

    for (const violations of results) {
      const open = violations.filter(
        (v) => v.violationstatus?.toLowerCase() === 'open',
      );
      total += open.length;
      hazardous += open.filter(
        (v) => v.class === 'B' || v.class === 'C',
      ).length;
    }
  }

  // Extrapolate if we sampled
  if (sampled.length < buildings.length) {
    const factor = buildings.length / sampled.length;
    total = Math.round(total * factor);
    hazardous = Math.round(hazardous * factor);
  }

  return { total, hazardous };
}
