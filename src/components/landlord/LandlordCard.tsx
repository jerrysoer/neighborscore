import { Building2, AlertTriangle, TrendingUp } from 'lucide-react';
import type { LandlordProfile } from '@/lib/landlord/types';

const GRADE_COLORS = {
  A: 'bg-status-green/15 text-status-green',
  B: 'bg-status-green/10 text-status-green',
  C: 'bg-status-yellow/15 text-status-yellow',
  D: 'bg-status-orange/15 text-status-orange',
  F: 'bg-status-red/15 text-status-red',
} as const;

export function LandlordCard({ profile }: { profile: LandlordProfile }) {
  const gradeStyle = GRADE_COLORS[profile.grade];
  const rateMultiple =
    profile.violationRate > 0
      ? (profile.violationRate / 0.15).toFixed(1)
      : '0';

  return (
    <div className="rounded-xl border border-gray-200 bg-surface p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-civic-blue/10 p-2">
            <Building2 size={20} className="text-civic-blue" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Your Landlord
            </p>
            <h3 className="font-display text-lg font-bold text-text">
              {profile.ownerName}
            </h3>
          </div>
        </div>
        <div
          className={`rounded-xl px-4 py-2 text-center font-display text-2xl font-bold ${gradeStyle}`}
        >
          {profile.grade}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-bg p-3 text-center">
          <p className="font-display text-xl font-bold text-text">
            {profile.portfolioSize}
          </p>
          <p className="text-xs text-text-muted">Buildings</p>
        </div>
        <div className="rounded-lg bg-bg p-3 text-center">
          <p className="font-display text-xl font-bold text-text">
            {profile.totalUnits.toLocaleString()}
          </p>
          <p className="text-xs text-text-muted">Total Units</p>
        </div>
        <div className="rounded-lg bg-bg p-3 text-center">
          <p className="font-display text-xl font-bold text-text">
            {profile.totalOpenViolations.toLocaleString()}
          </p>
          <p className="text-xs text-text-muted">Open Violations</p>
        </div>
      </div>

      {(profile.grade === 'D' || profile.grade === 'F') && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-status-orange/10 p-3">
          <AlertTriangle
            size={16}
            className="mt-0.5 shrink-0 text-status-orange"
          />
          <p className="text-sm text-status-orange">
            This landlord's portfolio has a violation rate {rateMultiple}x the
            NYC average. Buildings under their management may have systemic
            maintenance issues.
          </p>
        </div>
      )}

      {profile.hazardousViolations > 0 && (
        <div className="mt-3 flex items-center gap-2 text-sm text-text-muted">
          <TrendingUp size={14} />
          <span>
            {profile.hazardousViolations} hazardous violations across portfolio
          </span>
        </div>
      )}
    </div>
  );
}
