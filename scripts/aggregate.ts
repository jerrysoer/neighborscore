/**
 * Aggregate neighborhood scores for all NTAs.
 * Reads: nta-boundaries.geojson, tree-counts-by-nta.json, subway-stations.json
 * Writes: public/data/nta-scores.json
 *
 * Uses 311, NYPD, and restaurant inspection data from NYC Open Data.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE_URL = 'https://data.cityofnewyork.us/resource';
const DATA_DIR = resolve(import.meta.dirname, '../public/data');
const OUTPUT = resolve(DATA_DIR, 'nta-scores.json');

const DATASETS = {
  SERVICE_REQUESTS_311: 'erm2-nwe9',
  NYPD_COMPLAINTS_YTD: 'qgea-i56i',
  RESTAURANT_INSPECTIONS: '43nn-pn8j',
};

const APP_TOKEN = process.env.NYC_OPEN_DATA_APP_TOKEN;
const MAX_CONCURRENT = 5;

// 311 complaint type mappings
const CLEANLINESS_TYPES = [
  'Dirty Conditions',
  'Sanitation Condition',
  'Missed Collection',
  'Overflowing Litter Baskets',
  'Derelict Vehicle',
];
const NOISE_TYPES = [
  'Noise - Residential',
  'Noise - Street/Sidewalk',
  'Noise - Commercial',
  'Noise - Vehicle',
];
const RODENT_TYPE = 'Rodent';

interface NTABoundaryFeature {
  type: string;
  properties: { nta2020: string; ntaname: string; boroname: string; ntatype: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  geometry: { type: string; coordinates: any };
}

function headers(): Record<string, string> {
  const h: Record<string, string> = { Accept: 'application/json' };
  if (APP_TOKEN) h['X-App-Token'] = APP_TOKEN;
  return h;
}

async function sodaFetch<T>(datasetId: string, params: Record<string, string>): Promise<T[]> {
  const url = new URL(`${BASE_URL}/${datasetId}.json`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(url.toString(), { headers: headers() });
    if (response.status === 429) {
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      continue;
    }
    if (!response.ok) {
      throw new Error(`SODA error ${response.status}: ${url.toString()}`);
    }
    return (await response.json()) as T[];
  }
  throw new Error(`Failed after retries: ${url.toString()}`);
}

// Simple point-in-polygon (ray casting) for script-side use
function pointInPolygon(lat: number, lng: number, coords: number[][][]): boolean {
  for (const ring of coords) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i]![0]!, yi = ring[i]![1]!;
      const xj = ring[j]![0]!, yj = ring[j]![1]!;
      if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    if (inside) return true;
  }
  return false;
}

function findNTA(
  lat: number,
  lng: number,
  boundaries: NTABoundaryFeature[],
): string | null {
  for (const feature of boundaries) {
    const geom = feature.geometry;
    if (geom.type === 'MultiPolygon') {
      for (const polygon of geom.coordinates as number[][][][]) {
        if (pointInPolygon(lat, lng, polygon)) return feature.properties.nta2020;
      }
    } else if (geom.type === 'Polygon') {
      if (pointInPolygon(lat, lng, geom.coordinates as number[][][])) {
        return feature.properties.nta2020;
      }
    }
  }
  return null;
}

// Compute centroid from polygon
function computeCentroid(geom: NTABoundaryFeature['geometry']): { lat: number; lng: number } {
  let sumLat = 0, sumLng = 0, count = 0;

  const polygons: number[][][][] = geom.type === 'MultiPolygon'
    ? geom.coordinates
    : [geom.coordinates];

  for (const polygon of polygons) {
    const ring = polygon[0] as number[][] | undefined;
    if (!ring) continue;
    for (const pt of ring) {
      sumLng += pt[0] ?? 0;
      sumLat += pt[1] ?? 0;
      count++;
    }
  }
  return { lat: count > 0 ? sumLat / count : 0, lng: count > 0 ? sumLng / count : 0 };
}

async function runInBatches<T, R>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

async function main() {
  console.log('Starting NTA score aggregation...');

  // Load pre-fetched data
  const boundariesRaw = readFileSync(resolve(DATA_DIR, 'nta-boundaries.geojson'), 'utf-8');
  const boundaries = JSON.parse(boundariesRaw) as { features: NTABoundaryFeature[] };
  console.log(`Loaded ${boundaries.features.length} NTA boundaries`);

  const treeCountsRaw = readFileSync(resolve(DATA_DIR, 'tree-counts-by-nta.json'), 'utf-8');
  const treeCounts = JSON.parse(treeCountsRaw) as Record<string, number>;

  const subwayRaw = readFileSync(resolve(DATA_DIR, 'subway-stations.json'), 'utf-8');
  const subwayStations = JSON.parse(subwayRaw) as Array<{ name: string; lat: number; lng: number }>;

  // Map subway stations to NTAs
  const stationsByNTA = new Map<string, number>();
  for (const station of subwayStations) {
    const nta = findNTA(station.lat, station.lng, boundaries.features);
    if (nta) {
      stationsByNTA.set(nta, (stationsByNTA.get(nta) ?? 0) + 1);
    }
  }
  console.log(`Mapped ${subwayStations.length} subway stations to NTAs`);

  // Fetch 311 complaints (last 12 months)
  const since = new Date();
  since.setFullYear(since.getFullYear() - 1);
  const sinceStr = since.toISOString().split('T')[0]!;

  console.log(`Fetching 311 complaints since ${sinceStr}...`);
  const allTypes = [...CLEANLINESS_TYPES, ...NOISE_TYPES, RODENT_TYPE];
  const typeClause = allTypes.map((t) => `'${t}'`).join(',');

  const complaints311 = await sodaFetch<{
    complaint_type: string;
    latitude: string;
    longitude: string;
  }>(DATASETS.SERVICE_REQUESTS_311, {
    $where: `complaint_type in(${typeClause}) AND created_date > '${sinceStr}'`,
    $select: 'complaint_type,latitude,longitude',
    $limit: '100000',
  });
  console.log(`Fetched ${complaints311.length} 311 complaints`);

  // Assign 311 complaints to NTAs
  const cleanByNTA = new Map<string, number>();
  const noiseByNTA = new Map<string, number>();
  const rodentByNTA = new Map<string, number>();

  for (const c of complaints311) {
    const lat = parseFloat(c.latitude);
    const lng = parseFloat(c.longitude);
    if (isNaN(lat) || isNaN(lng)) continue;

    const nta = findNTA(lat, lng, boundaries.features);
    if (!nta) continue;

    if (CLEANLINESS_TYPES.includes(c.complaint_type)) {
      cleanByNTA.set(nta, (cleanByNTA.get(nta) ?? 0) + 1);
    } else if (NOISE_TYPES.includes(c.complaint_type)) {
      noiseByNTA.set(nta, (noiseByNTA.get(nta) ?? 0) + 1);
    } else if (c.complaint_type === RODENT_TYPE) {
      rodentByNTA.set(nta, (rodentByNTA.get(nta) ?? 0) + 1);
    }
  }

  // Fetch NYPD complaints (YTD)
  console.log('Fetching NYPD complaints...');
  const nypdComplaints = await sodaFetch<{
    latitude: string;
    longitude: string;
  }>(DATASETS.NYPD_COMPLAINTS_YTD, {
    $where: `cmplnt_fr_dt > '${sinceStr}'`,
    $select: 'latitude,longitude',
    $limit: '100000',
  });
  console.log(`Fetched ${nypdComplaints.length} NYPD complaints`);

  const crimeByNTA = new Map<string, number>();
  for (const c of nypdComplaints) {
    const lat = parseFloat(c.latitude);
    const lng = parseFloat(c.longitude);
    if (isNaN(lat) || isNaN(lng)) continue;
    const nta = findNTA(lat, lng, boundaries.features);
    if (nta) {
      crimeByNTA.set(nta, (crimeByNTA.get(nta) ?? 0) + 1);
    }
  }

  // Fetch restaurant inspections
  console.log('Fetching restaurant inspections...');
  const restaurants = await sodaFetch<{
    latitude: string;
    longitude: string;
    critical_flag: string;
  }>(DATASETS.RESTAURANT_INSPECTIONS, {
    $where: `inspection_date > '${sinceStr}' AND critical_flag='Critical'`,
    $select: 'latitude,longitude,critical_flag',
    $limit: '100000',
  });
  console.log(`Fetched ${restaurants.length} critical food violations`);

  const foodByNTA = new Map<string, number>();
  for (const r of restaurants) {
    const lat = parseFloat(r.latitude);
    const lng = parseFloat(r.longitude);
    if (isNaN(lat) || isNaN(lng)) continue;
    const nta = findNTA(lat, lng, boundaries.features);
    if (nta) {
      foodByNTA.set(nta, (foodByNTA.get(nta) ?? 0) + 1);
    }
  }

  // Compute scores for each NTA
  console.log('Computing scores...');

  interface RawScores {
    crimeCount: number;
    cleanlinessComplaints: number;
    noiseComplaints: number;
    rodentComplaints: number;
    criticalFoodViolations: number;
    treeCount: number;
    subwayStations: number;
  }

  const ntaRaws: Array<{ ntaCode: string; ntaName: string; borough: string; raw: RawScores; centroid: { lat: number; lng: number } }> = [];

  for (const feature of boundaries.features) {
    const code = feature.properties.nta2020;
    // Skip park/cemetery NTAs
    if (code.startsWith('park') || code.includes('99')) continue;

    ntaRaws.push({
      ntaCode: code,
      ntaName: feature.properties.ntaname,
      borough: feature.properties.boroname,
      centroid: computeCentroid(feature.geometry),
      raw: {
        crimeCount: crimeByNTA.get(code) ?? 0,
        cleanlinessComplaints: cleanByNTA.get(code) ?? 0,
        noiseComplaints: noiseByNTA.get(code) ?? 0,
        rodentComplaints: rodentByNTA.get(code) ?? 0,
        criticalFoodViolations: foodByNTA.get(code) ?? 0,
        treeCount: treeCounts[code] ?? 0,
        subwayStations: stationsByNTA.get(code) ?? 0,
      },
    });
  }

  // Percentile rank computation
  const allRaws = ntaRaws.map((n) => n.raw);

  function percentileRank(value: number, allValues: number[], invert: boolean): number {
    const sorted = [...allValues].sort((a, b) => a - b);
    const rank = sorted.filter((v) => v < value).length;
    const pct = (rank / Math.max(sorted.length - 1, 1)) * 100;
    return Math.round(invert ? 100 - pct : pct);
  }

  const WEIGHTS = { safety: 0.25, cleanliness: 0.2, noise: 0.2, foodSafety: 0.15, greenSpace: 0.1, transit: 0.1 };

  const ntas = ntaRaws.map((n) => {
    const r = n.raw;
    const safety = percentileRank(r.crimeCount, allRaws.map((a) => a.crimeCount), true);
    const cleanliness = percentileRank(
      r.cleanlinessComplaints + r.rodentComplaints * 1.5,
      allRaws.map((a) => a.cleanlinessComplaints + a.rodentComplaints * 1.5),
      true,
    );
    const noise = percentileRank(r.noiseComplaints, allRaws.map((a) => a.noiseComplaints), true);
    const foodSafety = percentileRank(r.criticalFoodViolations, allRaws.map((a) => a.criticalFoodViolations), true);
    const greenSpace = percentileRank(r.treeCount, allRaws.map((a) => a.treeCount), false);
    const transit = percentileRank(r.subwayStations, allRaws.map((a) => a.subwayStations), false);

    const composite = Math.round(
      safety * WEIGHTS.safety +
      cleanliness * WEIGHTS.cleanliness +
      noise * WEIGHTS.noise +
      foodSafety * WEIGHTS.foodSafety +
      greenSpace * WEIGHTS.greenSpace +
      transit * WEIGHTS.transit,
    );

    return {
      ntaCode: n.ntaCode,
      ntaName: n.ntaName,
      borough: n.borough,
      composite,
      safety,
      cleanliness,
      noise,
      foodSafety,
      greenSpace,
      transit,
      raw: n.raw,
      centroid: n.centroid,
    };
  });

  // Compute median violation rate placeholder (updated when we have HPD data)
  // For now, use a reasonable default based on NYC averages
  const medianViolationRate = 0.15;

  const output = {
    generated_at: new Date().toISOString(),
    ntas,
    metadata: {
      medianViolationRate,
      totalNTAs: ntas.length,
    },
  };

  writeFileSync(OUTPUT, JSON.stringify(output, null, 2));
  console.log(`Wrote scores for ${ntas.length} NTAs to ${OUTPUT}`);

  // Suppress unused variable warnings
  void runInBatches;
  void MAX_CONCURRENT;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
