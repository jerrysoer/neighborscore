import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const DIMENSION_KEYS = [
  'safety',
  'cleanliness',
  'noise',
  'foodSafety',
  'greenSpace',
  'transit',
] as const;

const DIMENSION_LABELS: Record<(typeof DIMENSION_KEYS)[number], string> = {
  safety: 'Safety',
  cleanliness: 'Cleanliness',
  noise: 'Noise',
  foodSafety: 'Food Safety',
  greenSpace: 'Green Space',
  transit: 'Transit',
};

const PALETTE = [
  'var(--color-civic-blue)',
  'var(--color-score-food)',
  'var(--color-score-transit)',
] as const;

export interface RadarItem {
  label: string;
  safety: number;
  cleanliness: number;
  noise: number;
  foodSafety: number;
  greenSpace: number;
  transit: number;
}

interface RadarDataPoint {
  dimension: string;
  [key: string]: string | number;
}

export function NeighborhoodRadar({
  items,
  height = 320,
}: {
  items: RadarItem[];
  height?: number;
}) {
  if (items.length === 0) return null;

  // Transform items into radar data points (one per dimension)
  const data: RadarDataPoint[] = DIMENSION_KEYS.map((key) => {
    const point: RadarDataPoint = { dimension: DIMENSION_LABELS[key] };
    for (const item of items) {
      point[item.label] = item[key];
    }
    return point;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
        />
        <PolarRadiusAxis
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
          axisLine={false}
        />
        {items.map((item, i) => (
          <Radar
            key={item.label}
            name={item.label}
            dataKey={item.label}
            stroke={PALETTE[i % PALETTE.length]}
            fill={PALETTE[i % PALETTE.length]}
            fillOpacity={items.length === 1 ? 0.2 : 0.12}
            strokeWidth={2}
          />
        ))}
        {items.length > 1 && (
          <Legend
            wrapperStyle={{ fontSize: 13, color: 'var(--color-text-muted)' }}
          />
        )}
      </RadarChart>
    </ResponsiveContainer>
  );
}
