import type { HPDViolation } from '@/lib/soda/types';
import { analyzeSeasonalPatterns } from '@/lib/building/seasonal';
import { Thermometer, Volume2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

interface MonthBucket {
  month: string;
  count: number;
  isSpike: boolean;
}

function aggregateByMonth(violations: HPDViolation[]): MonthBucket[] {
  const counts = new Array<number>(12).fill(0);

  for (const v of violations) {
    if (!v.inspectiondate) continue;
    const monthIdx = new Date(v.inspectiondate).getMonth();
    const prev = counts[monthIdx];
    if (prev !== undefined) counts[monthIdx] = prev + 1;
  }

  const total = counts.reduce((s, c) => s + c, 0);
  const avg = total / 12;
  const spikeThreshold = avg * 2;

  return counts.map((count, i) => {
    const label = MONTH_LABELS[i] ?? 'Unknown';
    return {
      month: label,
      count,
      isSpike: count > spikeThreshold,
    };
  });
}

export function SeasonalPatterns({
  violations,
}: {
  violations: HPDViolation[];
}) {
  const datedViolations = violations.filter((v) => v.inspectiondate);
  if (datedViolations.length === 0) return null;

  const { winterHeatIssues, summerNoiseIssues } =
    analyzeSeasonalPatterns(violations);
  const buckets = aggregateByMonth(violations);
  const total = buckets.reduce((s, b) => s + b.count, 0);
  const avgMonthly = total / 12;

  return (
    <div className="rounded-xl border border-gray-200 bg-surface p-5">
      <h3 className="mb-1 font-display text-lg font-semibold text-text">
        Seasonal Patterns
      </h3>
      <p className="mb-4 text-sm text-text-muted">
        Violation distribution by month across all years
      </p>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={buckets} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              fontSize: 13,
            }}
            formatter={(value: number) => [value, 'Violations']}
          />
          <ReferenceLine
            y={avgMonthly}
            stroke="var(--color-text-muted)"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
            label={{
              value: `avg: ${avgMonthly.toFixed(1)}`,
              position: 'right',
              fontSize: 11,
              fill: 'var(--color-text-muted)',
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {buckets.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.isSpike
                    ? 'var(--color-status-red)'
                    : 'var(--color-civic-blue)'
                }
                fillOpacity={entry.isSpike ? 0.85 : 0.65}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Alert banners */}
      <div className="mt-4 space-y-2">
        {winterHeatIssues > 0 && (
          <div className="flex items-start gap-3 rounded-lg bg-status-orange/10 px-4 py-3">
            <Thermometer
              size={18}
              className="mt-0.5 shrink-0 text-status-orange"
            />
            <div>
              <p className="text-sm font-medium text-status-orange">
                Winter Heat Issues
              </p>
              <p className="mt-0.5 text-sm text-text-muted">
                {winterHeatIssues} heat/hot water violation
                {winterHeatIssues > 1 ? 's' : ''} found during winter months
                (Nov-Mar). This building may have heating reliability problems.
              </p>
            </div>
          </div>
        )}
        {summerNoiseIssues > 0 && (
          <div className="flex items-start gap-3 rounded-lg bg-status-yellow/10 px-4 py-3">
            <Volume2
              size={18}
              className="mt-0.5 shrink-0 text-status-yellow"
            />
            <div>
              <p className="text-sm font-medium text-status-yellow">
                Summer Noise Issues
              </p>
              <p className="mt-0.5 text-sm text-text-muted">
                {summerNoiseIssues} noise-related violation
                {summerNoiseIssues > 1 ? 's' : ''} found during summer months
                (Jun-Aug).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
