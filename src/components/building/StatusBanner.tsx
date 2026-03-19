import { ShieldCheck, AlertTriangle, AlertOctagon, Info } from 'lucide-react';
import type { BuildingStatus } from '@/lib/building/types';
import { STATUS_BG_CLASSES, STATUS_TEXT_CLASSES } from '@/lib/colors';

const STATUS_CONFIG = {
  red: {
    icon: AlertOctagon,
    bgClass: 'bg-status-red/10 border-status-red/30',
    textClass: STATUS_TEXT_CLASSES.red,
    badgeClass: STATUS_BG_CLASSES.red,
  },
  orange: {
    icon: AlertTriangle,
    bgClass: 'bg-status-orange/10 border-status-orange/30',
    textClass: STATUS_TEXT_CLASSES.orange,
    badgeClass: STATUS_BG_CLASSES.orange,
  },
  yellow: {
    icon: Info,
    bgClass: 'bg-status-yellow/10 border-status-yellow/30',
    textClass: STATUS_TEXT_CLASSES.yellow,
    badgeClass: STATUS_BG_CLASSES.yellow,
  },
  green: {
    icon: ShieldCheck,
    bgClass: 'bg-status-green/10 border-status-green/30',
    textClass: STATUS_TEXT_CLASSES.green,
    badgeClass: STATUS_BG_CLASSES.green,
  },
} as const;

export function StatusBanner({ status }: { status: BuildingStatus }) {
  const config = STATUS_CONFIG[status.level];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border-2 p-5 ${config.bgClass}`}>
      <div className="flex items-start gap-4">
        <div className={`rounded-full p-2 ${config.badgeClass}/20`}>
          <Icon className={config.textClass} size={28} />
        </div>
        <div className="flex-1">
          <h2 className={`font-display text-xl font-bold ${config.textClass}`}>
            {status.label}
          </h2>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-text-muted">
            {status.openClassC > 0 && (
              <span className="rounded-full bg-status-red/15 px-3 py-0.5 font-medium text-status-red">
                {status.openClassC} Class C
              </span>
            )}
            {status.openClassB > 0 && (
              <span className="rounded-full bg-status-orange/15 px-3 py-0.5 font-medium text-status-orange">
                {status.openClassB} Class B
              </span>
            )}
            {status.openClassA > 0 && (
              <span className="rounded-full bg-status-yellow/15 px-3 py-0.5 font-medium text-status-yellow">
                {status.openClassA} Class A
              </span>
            )}
            <span>
              {status.totalViolations} total · {status.resolvedViolations}{' '}
              resolved
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
