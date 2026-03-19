import type { NTAScore } from '@/lib/neighborhood/types';
import { DIMENSION_BG_CLASSES } from '@/lib/colors';
import { Shield, Sparkles, Volume2, UtensilsCrossed, TreePine, Train } from 'lucide-react';

const DIMENSIONS = [
  { key: 'safety' as const, label: 'Safety', icon: Shield },
  { key: 'cleanliness' as const, label: 'Cleanliness', icon: Sparkles },
  { key: 'noise' as const, label: 'Noise', icon: Volume2 },
  { key: 'foodSafety' as const, label: 'Food Safety', icon: UtensilsCrossed },
  { key: 'greenSpace' as const, label: 'Green Space', icon: TreePine },
  { key: 'transit' as const, label: 'Transit', icon: Train },
] as const;

function scoreColor(score: number): string {
  if (score >= 70) return 'text-status-green';
  if (score >= 40) return 'text-status-yellow';
  return 'text-status-red';
}

export function NeighborhoodScore({ score }: { score: NTAScore }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-surface p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
            Neighborhood Score
          </p>
          <h3 className="font-display text-lg font-bold text-text">
            {score.ntaName}
          </h3>
          <p className="text-sm text-text-muted">{score.borough}</p>
        </div>
        <div className="text-right">
          <p
            className={`font-display text-4xl font-bold ${scoreColor(score.composite)}`}
          >
            {score.composite}
          </p>
          <p className="text-xs text-text-muted">out of 100</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {DIMENSIONS.map(({ key, label, icon: Icon }) => {
          const value = score[key];
          const bgClass =
            DIMENSION_BG_CLASSES[key as keyof typeof DIMENSION_BG_CLASSES];
          return (
            <div key={key} className="rounded-lg bg-bg p-3">
              <div className="flex items-center gap-2">
                <div className={`rounded p-1 ${bgClass}/20`}>
                  <Icon size={14} className={`${bgClass} opacity-80`} />
                </div>
                <span className="text-xs font-medium text-text-muted">
                  {label}
                </span>
              </div>
              <p
                className={`mt-1 font-display text-xl font-bold ${scoreColor(value)}`}
              >
                {value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
