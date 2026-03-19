import { useState } from 'react';
import { HardHat } from 'lucide-react';
import type { DOBComplaint } from '@/lib/soda/types';

const INITIAL_SHOW = 5;

export function DOBComplaintList({
  complaints,
}: {
  complaints: DOBComplaint[];
}) {
  const [showAll, setShowAll] = useState(false);

  if (complaints.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-text-muted">
        No DOB complaints on record.
      </p>
    );
  }

  const displayed = showAll ? complaints : complaints.slice(0, INITIAL_SHOW);

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-display text-lg font-semibold text-text">
          DOB Complaints
        </h3>
        <span className="text-sm text-text-muted">{complaints.length} total</span>
      </div>
      <div className="space-y-2">
        {displayed.map((c) => (
          <div
            key={c.complaint_number}
            className="flex items-start gap-3 rounded-lg border border-gray-100 bg-surface p-3"
          >
            <HardHat size={16} className="mt-0.5 shrink-0 text-score-safety" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text">
                {c.complaint_category || 'General Complaint'}
              </p>
              <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-text-muted">
                <span>
                  {c.date_entered
                    ? new Date(c.date_entered).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Unknown date'}
                </span>
                {c.status && (
                  <span className="rounded bg-gray-100 px-1.5 py-0.5">
                    {c.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {complaints.length > INITIAL_SHOW && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 w-full rounded-lg border border-gray-200 py-2 text-sm font-medium text-civic-blue hover:bg-gray-50"
        >
          {showAll ? 'Show less' : `Show all ${complaints.length} complaints`}
        </button>
      )}
    </div>
  );
}
