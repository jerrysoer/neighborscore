import {
  RadarChart as RechartsRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import type { NTAScore } from '../lib/neighborhood/types';

interface RadarChartProps {
  score: NTAScore;
  height?: number;
}

const DIMENSION_LABELS: { key: keyof NTAScore; label: string }[] = [
  { key: 'safety', label: 'Safety' },
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'noise', label: 'Noise' },
  { key: 'foodSafety', label: 'Food Safety' },
  { key: 'greenSpace', label: 'Green Space' },
  { key: 'transit', label: 'Transit' },
];

export function RadarChart({ score, height = 300 }: RadarChartProps) {
  const data = DIMENSION_LABELS.map(({ key, label }) => ({
    dimension: label,
    value: score[key] as number,
    fullMark: 100,
  }));

  return (
    <div className="rounded-xl border border-gray-100 bg-surface p-6 shadow-sm">
      <h3 className="font-display text-lg font-bold text-civic-blue mb-3">
        Neighborhood Profile
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsRadarChart data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke="#1E3A5F"
            fill="#1E3A5F"
            fillOpacity={0.2}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
