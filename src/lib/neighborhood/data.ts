import type { NTAScoresData } from './types';

let cachedScores: NTAScoresData | null = null;
let cachedTreeCounts: Record<string, number> | null = null;
let cachedSubwayStations: Array<{
  name: string;
  line: string;
  lat: number;
  lng: number;
}> | null = null;

export async function loadNTAScores(): Promise<NTAScoresData> {
  if (cachedScores) return cachedScores;

  const response = await fetch(
    `${import.meta.env.BASE_URL}data/nta-scores.json`,
  );
  if (!response.ok) {
    throw new Error('Failed to load NTA scores');
  }

  cachedScores = (await response.json()) as NTAScoresData;
  return cachedScores;
}

export async function loadTreeCounts(): Promise<Record<string, number>> {
  if (cachedTreeCounts) return cachedTreeCounts;

  const response = await fetch(
    `${import.meta.env.BASE_URL}data/tree-counts-by-nta.json`,
  );
  if (!response.ok) {
    throw new Error('Failed to load tree counts');
  }

  cachedTreeCounts = (await response.json()) as Record<string, number>;
  return cachedTreeCounts;
}

export async function loadSubwayStations(): Promise<
  Array<{ name: string; line: string; lat: number; lng: number }>
> {
  if (cachedSubwayStations) return cachedSubwayStations;

  const response = await fetch(
    `${import.meta.env.BASE_URL}data/subway-stations.json`,
  );
  if (!response.ok) {
    throw new Error('Failed to load subway stations');
  }

  cachedSubwayStations = (await response.json()) as Array<{
    name: string;
    line: string;
    lat: number;
    lng: number;
  }>;
  return cachedSubwayStations;
}
