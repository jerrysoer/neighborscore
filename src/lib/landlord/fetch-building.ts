import type { HPDBuilding } from '../soda/types';
import { hpdBuildingByCoords } from '../soda/queries';

export async function fetchHPDBuilding(
  lat: number,
  lng: number,
): Promise<HPDBuilding | null> {
  const buildings = await hpdBuildingByCoords(lat, lng);
  if (buildings.length === 0) return null;

  // Return the closest building by checking distance
  let closest = buildings[0]!;
  let minDist = Infinity;

  for (const b of buildings) {
    const bLat = parseFloat(b.latitude);
    const bLng = parseFloat(b.longitude);
    const dist = Math.abs(bLat - lat) + Math.abs(bLng - lng);
    if (dist < minDist) {
      minDist = dist;
      closest = b;
    }
  }

  return closest;
}
