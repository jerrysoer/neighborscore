import type { NTAScore } from '../lib/neighborhood/types';
import { DIMENSION_BG_CLASSES } from '../lib/colors';

interface NeighborhoodScoreCardProps {
  score: NTAScore;
}

const DIMENSIONS: { key: keyof typeof DIMENSION_BG_CLASSES; label: string }[] = [
  { key: 'safety', label: 'Safety' },
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'noise', label: 'Noise' },
  { key: 'foodSafety', label: 'Food Safety' },
  { key: 'greenSpace', label: 'Green Space' },
  { key: 'transit', label: 'Transit' },
];

function scoreColor(value: number): string {
  if (value >= 70) return '#10B981';
  if (value >= 40) return '#EAB308';
  return '#DC2626';
}

function ScoreGauge({ value }: { value: number }) {
  const radius = 52;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;
  const color = scoreColor(value);

  return (
    <svg width={128} height={128} viewBox="0 0 128 128" className="shrink-0">
      <circle
        cx={64}
        cy={64}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={stroke}
      />
      <circle
        cx={64}
        cy={64}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        transform="rotate(-90 64 64)"
        className="transition-all duration-700"
      />
      <text
        x={64}
        y={60}
        textAnchor="middle"
        className="fill-text font-mono text-2xl font-bold"
        fontSize={28}
      >
        {Math.round(value)}
      </text>
      <text
        x={64}
        y={80}
        textAnchor="middle"
        className="fill-text-muted text-xs"
        fontSize={12}
      >
        / 100
      </text>
    </svg>
  );
}

function DimensionBar({
  label,
  value,
  bgClass,
}: {
  label: string;
  value: number;
  bgClass: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-sm text-text-muted shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-gray-100">
        <div
          className={`h-2 rounded-full ${bgClass} transition-all duration-700`}
          style={{ width: `${Math.round(value)}%` }}
        />
      </div>
      <span className="w-8 text-right font-mono text-sm text-text">
        {Math.round(value)}
      </span>
    </div>
  );
}

export function NeighborhoodScoreCard({ score }: NeighborhoodScoreCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-surface p-6 shadow-sm">
      <h3 className="font-display text-lg font-bold text-civic-blue mb-1">
        Neighborhood
      </h3>
      <p className="text-sm text-text-muted mb-4">{score.ntaName}</p>

      <div className="flex items-center gap-6 mb-6">
        <ScoreGauge value={score.composite} />
        <div className="text-sm text-text-muted">
          <p className="font-display font-bold text-text text-base">
            Composite Score
          </p>
          <p className="mt-1">
            Based on safety, cleanliness, noise, food safety, green space, and transit.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {DIMENSIONS.map(({ key, label }) => (
          <DimensionBar
            key={key}
            label={label}
            value={score[key]}
            bgClass={DIMENSION_BG_CLASSES[key]}
          />
        ))}
      </div>
    </div>
  );
}
