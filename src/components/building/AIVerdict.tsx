import { useState } from 'react';
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import type { AddressReport } from '@/lib/search';
import {
  fetchVerdict,
  type VerdictResponse,
  type VerdictLevel,
} from '@/lib/verdict';

type VerdictState =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'loaded'; data: VerdictResponse }
  | { type: 'error'; message: string };

const VERDICT_CONFIG: Record<
  VerdictLevel,
  { label: string; color: string; bg: string; icon: typeof CheckCircle }
> = {
  GREEN_LIGHT: {
    label: 'Green Light',
    color: 'text-status-green',
    bg: 'bg-status-green/10',
    icon: CheckCircle,
  },
  PROCEED_WITH_CAUTION: {
    label: 'Proceed with Caution',
    color: 'text-status-yellow',
    bg: 'bg-status-yellow/10',
    icon: AlertTriangle,
  },
  RED_FLAG: {
    label: 'Red Flag',
    color: 'text-status-red',
    bg: 'bg-status-red/10',
    icon: XCircle,
  },
  NEEDS_INVESTIGATION: {
    label: 'Needs Investigation',
    color: 'text-status-orange',
    bg: 'bg-status-orange/10',
    icon: HelpCircle,
  },
};

export function AIVerdict({ report }: { report: AddressReport }) {
  const [state, setState] = useState<VerdictState>({ type: 'idle' });

  const analyze = async () => {
    setState({ type: 'loading' });
    try {
      const data = await fetchVerdict(report);
      setState({ type: 'loaded', data });
    } catch (err) {
      setState({
        type: 'error',
        message:
          err instanceof Error ? err.message : 'AI analysis failed',
      });
    }
  };

  if (state.type === 'idle') {
    return (
      <div className="rounded-xl border border-gray-200 bg-surface p-5">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <Sparkles size={24} className="text-civic-blue" />
          <div>
            <h3 className="font-display text-lg font-semibold text-text">
              AI Analysis
            </h3>
            <p className="mt-1 text-sm text-text-muted">
              Get an AI-powered assessment of this building based on all
              available data
            </p>
          </div>
          <button
            onClick={analyze}
            className="rounded-lg bg-civic-blue px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-civic-blue/90"
          >
            Get AI Analysis
          </button>
        </div>
      </div>
    );
  }

  if (state.type === 'loading') {
    return (
      <div className="rounded-xl border border-gray-200 bg-surface p-5">
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="h-8 w-8 animate-pulse rounded-full bg-civic-blue/20" />
          <Loader2 size={20} className="animate-spin text-civic-blue" />
          <p className="text-sm text-text-muted">
            Analyzing building data...
          </p>
        </div>
      </div>
    );
  }

  if (state.type === 'error') {
    return (
      <div className="rounded-xl border border-gray-200 bg-surface p-5">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <p className="text-sm text-status-red">{state.message}</p>
          <button
            onClick={analyze}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-bg"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { data } = state;
  const config = VERDICT_CONFIG[data.verdict];
  const VerdictIcon = config.icon;

  return (
    <div className="rounded-xl border border-gray-200 bg-surface p-5">
      <h3 className="mb-4 font-display text-lg font-semibold text-text">
        AI Analysis
      </h3>

      {/* Verdict badge */}
      <div className={`mb-4 flex items-center gap-3 rounded-lg px-4 py-3 ${config.bg}`}>
        <VerdictIcon size={22} className={config.color} />
        <div>
          <p className={`font-display text-lg font-bold ${config.color}`}>
            {config.label}
          </p>
          <p className="text-sm text-text-muted">{data.summary}</p>
        </div>
      </div>

      {/* Findings */}
      {data.findings.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold text-text">
            Key Findings
          </h4>
          <ul className="space-y-1.5">
            {data.findings.map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-text-muted"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-civic-blue/40" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Questions */}
      {data.questions.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold text-text">
            Questions to Ask
          </h4>
          <ul className="space-y-1.5">
            {data.questions.map((q, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-text-muted"
              >
                <span className="mt-0.5 shrink-0 text-civic-blue">?</span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendation */}
      <div className="rounded-lg bg-bg p-4">
        <p className="text-sm font-medium text-text">Recommendation</p>
        <p className="mt-1 text-sm text-text-muted">{data.recommendation}</p>
      </div>

      {/* Attribution */}
      <p className="mt-4 text-xs text-text-muted/60">
        Powered by Claude AI. This analysis is advisory and should not replace
        professional inspection or legal advice.
      </p>
    </div>
  );
}
