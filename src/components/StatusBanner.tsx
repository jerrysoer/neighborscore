import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import type { BuildingStatus } from '../lib/building/types';
import { STATUS_BG_CLASSES } from '../lib/colors';

interface StatusBannerProps {
  status: BuildingStatus;
}

const ICONS = {
  red: AlertTriangle,
  orange: AlertTriangle,
  yellow: AlertCircle,
  green: CheckCircle,
} as const;

export function StatusBanner({ status }: StatusBannerProps) {
  const Icon = ICONS[status.level];
  const isLight = status.level === 'yellow' || status.level === 'green';
  const textClass = isLight ? 'text-gray-900' : 'text-white';
  const badgeBg = isLight ? 'bg-black/10' : 'bg-white/20';
  const open = status.totalViolations - status.resolvedViolations;

  return (
    <div
      className={`rounded-xl p-5 ${STATUS_BG_CLASSES[status.level]} ${textClass}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Icon size={24} />
          <div>
            <p className="text-lg font-bold font-display">{status.label}</p>
            <p className="text-sm opacity-80">
              {open} open of {status.totalViolations} total violations
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {status.openClassC > 0 && (
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeBg}`}>
              {status.openClassC} Class C
            </span>
          )}
          {status.openClassB > 0 && (
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeBg}`}>
              {status.openClassB} Class B
            </span>
          )}
          {status.openClassA > 0 && (
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeBg}`}>
              {status.openClassA} Class A
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
