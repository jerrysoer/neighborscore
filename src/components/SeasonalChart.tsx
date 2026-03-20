import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Thermometer, Volume2 } from 'lucide-react';
import type { SeasonalPattern } from '../lib/building/seasonal';

interface SeasonalChartProps {
  pattern: SeasonalPattern;
}

function formatMonth(ym: string): string {
  const parts = ym.split('-');
  const year = parts[0] ?? '';
  const month = parts[1] ?? '01';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const m = parseInt(month, 10) - 1;
  return `${months[m]} '${year.slice(2)}`;
}

export function SeasonalChart({ pattern }: SeasonalChartProps) {
  if (pattern.monthlyCounts.length === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-surface p-6 shadow-sm">
        <h3 className="font-display text-lg font-bold text-civic-blue mb-3">
          Violation Timeline
        </h3>
        <p className="text-sm text-text-muted">
          Not enough data for seasonal analysis.
        </p>
      </div>
    );
  }

  const spikeMonths = new Set(pattern.spikes.map((s) => s.month));

  return (
    <div className="rounded-xl border border-gray-100 bg-surface p-6 shadow-sm">
      <h3 className="font-display text-lg font-bold text-civic-blue mb-3">
        Violation Timeline
      </h3>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={pattern.monthlyCounts}>
          <XAxis
            dataKey="month"
            tickFormatter={formatMonth}
            tick={{ fontSize: 11, fill: '#6B7280' }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} width={36} />
          <Tooltip
            labelFormatter={formatMonth}
            formatter={(value: number) => [value, 'Violations']}
          />
          <ReferenceLine
            y={pattern.averageMonthly}
            stroke="#6B7280"
            strokeDasharray="3 3"
            label={{ value: 'Avg', position: 'right', fill: '#6B7280', fontSize: 11 }}
          />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {pattern.monthlyCounts.map((entry) => (
              <Cell
                key={entry.month}
                fill={spikeMonths.has(entry.month) ? '#DC2626' : '#1E3A5F'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {(pattern.winterHeatIssues > 0 || pattern.summerNoiseIssues > 0) && (
        <div className="mt-4 flex flex-wrap gap-3">
          {pattern.winterHeatIssues > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-status-orange/10 px-3 py-2 text-sm text-status-orange">
              <Thermometer size={16} />
              {pattern.winterHeatIssues} heat-related violations in winter
            </div>
          )}
          {pattern.summerNoiseIssues > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-status-yellow/10 px-3 py-2 text-sm text-status-yellow">
              <Volume2 size={16} />
              {pattern.summerNoiseIssues} noise issues in summer
            </div>
          )}
        </div>
      )}
    </div>
  );
}
