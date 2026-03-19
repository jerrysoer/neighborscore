import type { NTAScore } from '@/lib/neighborhood/types';
import { DIMENSION_HEX, type DimensionKey } from '@/lib/dimensions';

const ROWS: { key: DimensionKey; label: string }[] = [
  { key: 'composite', label: 'Overall' },
  { key: 'safety', label: 'Safety' },
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'noise', label: 'Noise' },
  { key: 'foodSafety', label: 'Food Safety' },
  { key: 'greenSpace', label: 'Green Space' },
  { key: 'transit', label: 'Transit' },
];

const CHIP_COLORS: DimensionKey[] = ['safety', 'foodSafety', 'transit'];

function Bar({ value, color, isBest }: { value: number; color: string; isBest: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span
        className={`w-8 text-right font-mono text-sm ${
          isBest ? 'font-bold text-text' : 'text-text-muted'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function ComparisonGrid({ items }: { items: NTAScore[] }) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-surface p-5">
      <h3 className="mb-4 font-display text-lg font-semibold text-text">
        Side-by-Side Comparison
      </h3>

      <div className="space-y-4">
        {ROWS.map(({ key, label }) => {
          const values = items.map((nta) => nta[key]);
          const maxVal = Math.max(...values);

          return (
            <div key={key}>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
                {label}
              </p>
              <div className="space-y-1.5">
                {items.map((nta, i) => {
                  const val = nta[key];
                  const colorKey = CHIP_COLORS[i % CHIP_COLORS.length]!;
                  const color = DIMENSION_HEX[colorKey];
                  return (
                    <div key={nta.ntaCode} className="flex items-center gap-3">
                      <span className="w-28 truncate text-xs text-text-muted sm:w-36">
                        {nta.ntaName}
                      </span>
                      <div className="flex-1">
                        <Bar
                          value={val}
                          color={color}
                          isBest={val === maxVal && items.length > 1}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
