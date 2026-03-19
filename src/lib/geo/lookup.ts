import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import type { NTABoundary } from '../soda/types';

interface NTAMatch {
  ntaCode: string;
  ntaName: string;
  borough: string;
}

let cachedBoundaries: NTABoundary[] | null = null;

async function loadBoundaries(): Promise<NTABoundary[]> {
  if (cachedBoundaries) return cachedBoundaries;

  const response = await fetch(
    `${import.meta.env.BASE_URL}data/nta-boundaries.geojson`,
  );
  if (!response.ok) {
    throw new Error('Failed to load NTA boundaries');
  }

  const geojson = (await response.json()) as {
    features: Array<{
      properties: { nta2020: string; ntaname: string; boroname: string; ntatype?: string };
      geometry: NTABoundary['the_geom'];
    }>;
  };

  cachedBoundaries = geojson.features.map((f) => ({
    nta2020: f.properties.nta2020,
    ntaname: f.properties.ntaname,
    boroname: f.properties.boroname,
    ntatype: f.properties.ntatype ?? '',
    the_geom: f.geometry,
  }));

  return cachedBoundaries;
}

export async function lookupNTA(
  lat: number,
  lng: number,
): Promise<NTAMatch | null> {
  const boundaries = await loadBoundaries();
  const pt = point([lng, lat]);

  for (const nta of boundaries) {
    if (!nta.the_geom) continue;

    try {
      if (booleanPointInPolygon(pt, nta.the_geom as GeoJSON.Polygon | GeoJSON.MultiPolygon)) {
        return {
          ntaCode: nta.nta2020,
          ntaName: nta.ntaname,
          borough: nta.boroname,
        };
      }
    } catch {
      // Skip malformed geometries
    }
  }

  return null;
}
