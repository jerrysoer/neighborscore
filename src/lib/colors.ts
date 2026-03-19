import type { BuildingStatusLevel } from './building/types';

export const STATUS_COLORS: Record<BuildingStatusLevel, string> = {
  red: 'var(--color-status-red)',
  orange: 'var(--color-status-orange)',
  yellow: 'var(--color-status-yellow)',
  green: 'var(--color-status-green)',
};

export const STATUS_BG_CLASSES: Record<BuildingStatusLevel, string> = {
  red: 'bg-status-red',
  orange: 'bg-status-orange',
  yellow: 'bg-status-yellow',
  green: 'bg-status-green',
};

export const STATUS_TEXT_CLASSES: Record<BuildingStatusLevel, string> = {
  red: 'text-status-red',
  orange: 'text-status-orange',
  yellow: 'text-status-yellow',
  green: 'text-status-green',
};

export const DIMENSION_COLORS = {
  safety: 'var(--color-score-safety)',
  cleanliness: 'var(--color-score-cleanliness)',
  noise: 'var(--color-score-noise)',
  foodSafety: 'var(--color-score-food)',
  greenSpace: 'var(--color-score-green)',
  transit: 'var(--color-score-transit)',
} as const;

export const DIMENSION_BG_CLASSES = {
  safety: 'bg-score-safety',
  cleanliness: 'bg-score-cleanliness',
  noise: 'bg-score-noise',
  foodSafety: 'bg-score-food',
  greenSpace: 'bg-score-green',
  transit: 'bg-score-transit',
} as const;
