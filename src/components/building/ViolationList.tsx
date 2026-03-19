import { useState } from 'react';
import type { HPDViolation } from '@/lib/soda/types';
import { ViolationCard } from './ViolationCard';

const INITIAL_SHOW = 10;

export function ViolationList({ violations }: { violations: HPDViolation[] }) {
  const [showAll, setShowAll] = useState(false);

  if (violations.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-text-muted">
        No HPD violations on record for this building.
      </p>
    );
  }

  // Sort: open first, then by class severity (C > B > A), then by date
  const sorted = [...violations].sort((a, b) => {
    const aOpen = a.violationstatus?.toLowerCase() === 'open' ? 0 : 1;
    const bOpen = b.violationstatus?.toLowerCase() === 'open' ? 0 : 1;
    if (aOpen !== bOpen) return aOpen - bOpen;

    const classOrder = { C: 0, B: 1, A: 2 } as const;
    const aClass = classOrder[a.class as keyof typeof classOrder] ?? 3;
    const bClass = classOrder[b.class as keyof typeof classOrder] ?? 3;
    if (aClass !== bClass) return aClass - bClass;

    return (
      new Date(b.inspectiondate).getTime() -
      new Date(a.inspectiondate).getTime()
    );
  });

  const displayed = showAll ? sorted : sorted.slice(0, INITIAL_SHOW);
  const openCount = violations.filter(
    (v) => v.violationstatus?.toLowerCase() === 'open',
  ).length;

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-display text-lg font-semibold text-text">
          HPD Violations
        </h3>
        <span className="text-sm text-text-muted">
          {openCount} open · {violations.length} total
        </span>
      </div>
      <div className="space-y-2">
        {displayed.map((v) => (
          <ViolationCard key={v.violationid} violation={v} />
        ))}
      </div>
      {violations.length > INITIAL_SHOW && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 w-full rounded-lg border border-gray-200 py-2 text-sm font-medium text-civic-blue hover:bg-gray-50"
        >
          {showAll
            ? 'Show less'
            : `Show all ${violations.length} violations`}
        </button>
      )}
    </div>
  );
}
