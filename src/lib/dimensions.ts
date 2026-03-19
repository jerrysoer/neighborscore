import { DIMENSION_COLORS } from './colors';

export type DimensionKey =
  | 'composite'
  | 'safety'
  | 'cleanliness'
  | 'noise'
  | 'foodSafety'
  | 'greenSpace'
  | 'transit';

export const DIMENSIONS: { key: DimensionKey; label: string }[] = [
  { key: 'composite', label: 'Overall' },
  { key: 'safety', label: 'Safety' },
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'noise', label: 'Noise' },
  { key: 'foodSafety', label: 'Food' },
  { key: 'greenSpace', label: 'Green' },
  { key: 'transit', label: 'Transit' },
];

export const DIMENSION_HEX: Record<DimensionKey, string> = {
  composite: '#1E3A5F',
  safety: '#4A90D9',
  cleanliness: '#2DD4BF',
  noise: '#F59E0B',
  foodSafety: '#F87171',
  greenSpace: '#22C55E',
  transit: '#A78BFA',
};

export function getDimensionHex(key: DimensionKey): string {
  return DIMENSION_HEX[key];
}

export function getDimensionColor(key: DimensionKey): string {
  if (key === 'composite') return 'var(--color-civic-blue)';
  return DIMENSION_COLORS[key];
}
