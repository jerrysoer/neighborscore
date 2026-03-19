import type { NTAScore } from './types';
import { loadNTAScores } from './data';

export async function lookupNTAScore(
  ntaCode: string,
): Promise<NTAScore | null> {
  const data = await loadNTAScores();
  return data.ntas.find((n) => n.ntaCode === ntaCode) ?? null;
}

export async function getMedianViolationRate(): Promise<number> {
  const data = await loadNTAScores();
  return data.metadata.medianViolationRate;
}
