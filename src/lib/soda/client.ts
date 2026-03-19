import type { DatasetId, SodaQueryParams } from './types';

const BASE_URL = 'https://data.cityofnewyork.us/resource';
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

interface SodaClientOptions {
  appToken?: string;
}

export async function sodaFetch<T>(
  datasetId: DatasetId,
  params: SodaQueryParams = {},
  options: SodaClientOptions = {},
): Promise<T[]> {
  const url = new URL(`${BASE_URL}/${datasetId}.json`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  // Use app token if provided (scripts) or from env (client-side)
  const token = options.appToken ?? import.meta.env.VITE_NYC_OPEN_DATA_APP_TOKEN;
  if (token) {
    headers['X-App-Token'] = token;
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url.toString(), { headers });

      if (response.status === 429) {
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, backoff));
        continue;
      }

      if (!response.ok) {
        throw new Error(
          `SODA API error: ${response.status} ${response.statusText}`,
        );
      }

      return (await response.json()) as T[];
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < MAX_RETRIES - 1) {
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, backoff));
      }
    }
  }

  throw lastError ?? new Error('SODA fetch failed after retries');
}
