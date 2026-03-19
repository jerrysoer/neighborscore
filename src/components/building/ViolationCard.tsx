import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { HPDViolation } from '@/lib/soda/types';

const CLASS_STYLES = {
  C: { bg: 'bg-status-red/10', text: 'text-status-red', border: 'border-status-red/20' },
  B: { bg: 'bg-status-orange/10', text: 'text-status-orange', border: 'border-status-orange/20' },
  A: { bg: 'bg-status-yellow/10', text: 'text-status-yellow', border: 'border-status-yellow/20' },
} as const;

const CLASS_LABELS = {
  C: 'Immediately Hazardous',
  B: 'Hazardous',
  A: 'Non-Hazardous',
} as const;

export function ViolationCard({ violation }: { violation: HPDViolation }) {
  const [expanded, setExpanded] = useState(false);
  const style = CLASS_STYLES[violation.class] ?? CLASS_STYLES.A;
  const classLabel = CLASS_LABELS[violation.class] ?? 'Unknown';

  const date = violation.inspectiondate
    ? new Date(violation.inspectiondate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown date';

  const isOpen = violation.violationstatus?.toLowerCase() === 'open';

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className={`w-full rounded-lg border text-left transition-colors ${style.border} ${expanded ? style.bg : 'bg-surface hover:bg-gray-50'}`}
    >
      <div className="flex items-center gap-3 p-3">
        <span
          className={`shrink-0 rounded px-2 py-0.5 font-mono text-xs font-bold ${style.bg} ${style.text}`}
        >
          {violation.class}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text">
            {classLabel}
          </p>
          <p className="text-xs text-text-muted">{date}</p>
        </div>
        {isOpen && (
          <span className="shrink-0 rounded-full bg-status-red/10 px-2 py-0.5 text-xs font-medium text-status-red">
            Open
          </span>
        )}
        {expanded ? (
          <ChevronUp size={16} className="shrink-0 text-text-muted" />
        ) : (
          <ChevronDown size={16} className="shrink-0 text-text-muted" />
        )}
      </div>
      {expanded && violation.novdescription && (
        <div className="border-t border-gray-100 px-3 pb-3 pt-2">
          <p className="text-sm leading-relaxed text-text-muted">
            {violation.novdescription}
          </p>
          <p className="mt-1 font-mono text-xs text-text-muted/60">
            ID: {violation.violationid} · Status: {violation.violationstatus}
          </p>
        </div>
      )}
    </button>
  );
}
