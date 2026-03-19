/**
 * Download NTA boundary GeoJSON from NYC Open Data.
 * Output: public/data/nta-boundaries.geojson
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DATASET_ID = '9nt8-h7nd';
const BASE_URL = `https://data.cityofnewyork.us/resource/${DATASET_ID}.json`;
const OUTPUT = resolve(import.meta.dirname, '../public/data/nta-boundaries.geojson');

const APP_TOKEN = process.env.NYC_OPEN_DATA_APP_TOKEN;

async function main() {
  console.log('Fetching NTA boundaries...');

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (APP_TOKEN) headers['X-App-Token'] = APP_TOKEN;

  const url = `${BASE_URL}?$limit=500`;
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch boundaries: ${response.status}`);
  }

  const rows = (await response.json()) as Array<{
    nta2020: string;
    ntaname: string;
    boroname: string;
    ntatype: string;
    the_geom: { type: string; coordinates: number[][][][] };
  }>;

  console.log(`Received ${rows.length} NTA boundaries`);

  // Convert to GeoJSON FeatureCollection
  const geojson = {
    type: 'FeatureCollection',
    features: rows
      .filter((r) => r.the_geom)
      .map((r) => ({
        type: 'Feature',
        properties: {
          nta2020: r.nta2020,
          ntaname: r.ntaname,
          boroname: r.boroname,
          ntatype: r.ntatype,
        },
        geometry: r.the_geom,
      })),
  };

  writeFileSync(OUTPUT, JSON.stringify(geojson));
  console.log(`Wrote ${geojson.features.length} features to ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
