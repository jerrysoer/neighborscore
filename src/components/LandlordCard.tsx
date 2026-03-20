import type { LandlordProfile, LandlordGrade } from '../lib/landlord/types';

const GRADE_COLORS: Record<LandlordGrade, string> = {
  A: 'bg-status-green text-white',
  B: 'bg-status-green/70 text-white',
  C: 'bg-status-yellow text-gray-900',
  D: 'bg-status-orange text-white',
  F: 'bg-status-red text-white',
};

interface LandlordCardProps {
  landlord: LandlordProfile;
}

export function LandlordCard({ landlord }: LandlordCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-surface p-6 shadow-sm">
      <h3 className="font-display text-lg font-bold text-civic-blue mb-4">
        Landlord Grade
      </h3>

      <div className="flex items-center gap-5">
        <div
          className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-3xl font-bold font-display ${GRADE_COLORS[landlord.grade]}`}
        >
          {landlord.grade}
        </div>
        <div className="min-w-0">
          <p className="font-display font-bold text-text truncate">
            {landlord.ownerName}
          </p>
          <div className="mt-2 space-y-1 text-sm text-text-muted">
            <p>
              <span className="font-mono">{landlord.portfolioSize}</span> buildings,{' '}
              <span className="font-mono">{landlord.totalUnits}</span> units
            </p>
            <p>
              Open violations:{' '}
              <span className="font-mono">{landlord.totalOpenViolations}</span>
            </p>
            <p>
              Violation rate:{' '}
              <span className="font-mono">{landlord.violationRate.toFixed(2)}</span>{' '}
              per unit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
