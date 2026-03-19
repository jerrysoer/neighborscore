/**
 * Download static datasets: subway stations + tree counts by NTA.
 * Output: public/data/subway-stations.json, public/data/tree-counts-by-nta.json
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const NYC_BASE_URL = 'https://data.cityofnewyork.us/resource';
const NYS_BASE_URL = 'https://data.ny.gov/resource';
const OUTPUT_DIR = resolve(import.meta.dirname, '../public/data');

const DATASETS = {
  SUBWAY_STATIONS: '39hk-dx4f', // MTA dataset on NY State Open Data
  TREE_CENSUS: 'uvpi-gqnh',    // NYC Open Data
};

const APP_TOKEN = process.env.NYC_OPEN_DATA_APP_TOKEN;

function headers(): Record<string, string> {
  const h: Record<string, string> = { Accept: 'application/json' };
  if (APP_TOKEN) h['X-App-Token'] = APP_TOKEN;
  return h;
}

async function fetchSubwayStations() {
  console.log('Fetching subway stations from MTA/NY State data...');
  const url = `${NYS_BASE_URL}/${DATASETS.SUBWAY_STATIONS}.json?$limit=1000`;
  const response = await fetch(url, { headers: headers() });
  if (!response.ok) throw new Error(`Subway fetch failed: ${response.status}`);

  const rows = (await response.json()) as Array<{
    stop_name: string;
    line: string;
    daytime_routes: string;
    gtfs_latitude: string;
    gtfs_longitude: string;
    georeference?: { type: string; coordinates: [number, number] };
  }>;

  const stations = rows
    .filter((r) => r.gtfs_latitude && r.gtfs_longitude)
    .map((r) => ({
      name: r.stop_name,
      line: r.daytime_routes ?? r.line,
      lat: parseFloat(r.gtfs_latitude),
      lng: parseFloat(r.gtfs_longitude),
    }))
    .filter((s) => !isNaN(s.lat) && !isNaN(s.lng));

  const outPath = resolve(OUTPUT_DIR, 'subway-stations.json');
  writeFileSync(outPath, JSON.stringify(stations));
  console.log(`Wrote ${stations.length} stations to ${outPath}`);
}

async function fetchTreeCounts() {
  console.log('Fetching tree counts by NTA...');
  const url = `${NYC_BASE_URL}/${DATASETS.TREE_CENSUS}.json?$select=nta,count(*) as count&$group=nta&$limit=1000`;
  const response = await fetch(url, { headers: headers() });
  if (!response.ok) throw new Error(`Tree fetch failed: ${response.status}`);

  const rows = (await response.json()) as Array<{
    nta: string;
    count: string;
  }>;

  const counts: Record<string, number> = {};
  for (const row of rows) {
    if (row.nta) {
      counts[row.nta] = parseInt(row.count, 10);
    }
  }

  const outPath = resolve(OUTPUT_DIR, 'tree-counts-by-nta.json');
  writeFileSync(outPath, JSON.stringify(counts));
  console.log(`Wrote ${Object.keys(counts).length} NTA tree counts to ${outPath}`);
}

async function main() {
  await Promise.all([fetchSubwayStations(), fetchTreeCounts()]);
  console.log('Done!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
