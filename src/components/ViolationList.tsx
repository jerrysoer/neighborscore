import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';
import type { HPDViolation, DOBComplaint, HPDComplaint } from '../lib/soda/types';

interface ViolationListProps {
  violations: HPDViolation[];
  dobComplaints: DOBComplaint[];
  hpdComplaints: HPDComplaint[];
}

const INITIAL_SHOW = 20;

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatusBadge({ status }: { status: string }) {
  const isOpen = status.toLowerCase().includes('open') || status.toLowerCase().includes('active');
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        isOpen ? 'bg-status-red/10 text-status-red' : 'bg-status-green/10 text-status-green'
      }`}
    >
      {isOpen ? 'Open' : 'Closed'}
    </span>
  );
}

function Section({
  title,
  count,
  defaultOpen,
  children,
}: {
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const Icon = open ? ChevronDown : ChevronRight;

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 py-3 text-left font-medium text-text hover:text-civic-blue transition-colors"
      >
        <Icon size={16} />
        <span>{title}</span>
        <span className="ml-auto rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-mono text-text-muted">
          {count}
        </span>
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

function HPDViolationSection({ violations }: { violations: HPDViolation[] }) {
  const classC = violations.filter((v) => v.class === 'C');
  const classB = violations.filter((v) => v.class === 'B');
  const classA = violations.filter((v) => v.class === 'A');

  return (
    <div className="space-y-2">
      {[
        { label: 'Class C — Immediately Hazardous', items: classC },
        { label: 'Class B — Hazardous', items: classB },
        { label: 'Class A — Non-Hazardous', items: classA },
      ]
        .filter((g) => g.items.length > 0)
        .map((group) => (
          <ViolationGroup key={group.label} label={group.label} items={group.items} />
        ))}
    </div>
  );
}

function ViolationGroup({ label, items }: { label: string; items: HPDViolation[] }) {
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? items : items.slice(0, INITIAL_SHOW);
  const Icon = expanded ? ChevronDown : ChevronRight;

  return (
    <div className="ml-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 py-1.5 text-sm text-text-muted hover:text-text transition-colors"
      >
        <Icon size={14} />
        <span>{label}</span>
        <span className="ml-auto text-xs font-mono">{items.length}</span>
      </button>
      {expanded && (
        <div className="ml-5 space-y-2 mt-1">
          {displayed.map((v) => (
            <div
              key={v.violationid}
              className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-text leading-snug">{v.novdescription || 'No description'}</p>
                <StatusBadge status={v.violationstatus} />
              </div>
              <p className="mt-1 font-mono text-xs text-text-muted">
                {formatDate(v.inspectiondate)}
              </p>
            </div>
          ))}
          {!showAll && items.length > INITIAL_SHOW && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="text-sm text-civic-blue hover:underline"
            >
              Show all {items.length} violations
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function ViolationList({ violations, dobComplaints, hpdComplaints }: ViolationListProps) {
  const totalCount = violations.length + dobComplaints.length + hpdComplaints.length;

  if (totalCount === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-surface p-6 shadow-sm">
        <div className="flex items-center gap-3 text-status-green">
          <CheckCircle size={24} />
          <div>
            <p className="font-medium">No violations or complaints found</p>
            <p className="text-sm text-text-muted">This building has a clean record.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-surface p-6 shadow-sm">
      <h3 className="font-display text-lg font-bold text-civic-blue mb-3">
        Violations & Complaints
      </h3>

      {violations.length > 0 && (
        <Section title="HPD Violations" count={violations.length} defaultOpen>
          <HPDViolationSection violations={violations} />
        </Section>
      )}

      {dobComplaints.length > 0 && (
        <Section title="DOB Complaints" count={dobComplaints.length}>
          <div className="ml-4 space-y-2">
            {dobComplaints.slice(0, INITIAL_SHOW).map((c) => (
              <div
                key={c.complaint_number}
                className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-text">{c.complaint_category || 'Unknown category'}</p>
                  <StatusBadge status={c.status} />
                </div>
                <p className="mt-1 font-mono text-xs text-text-muted">
                  {formatDate(c.date_entered)}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {hpdComplaints.length > 0 && (
        <Section title="HPD Complaints" count={hpdComplaints.length}>
          <div className="ml-4 space-y-2">
            {hpdComplaints.slice(0, INITIAL_SHOW).map((c) => (
              <div
                key={c.complaintid}
                className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-text font-medium">{c.majorcategory}</p>
                    <p className="text-text-muted">{c.minorcategory}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <p className="mt-1 font-mono text-xs text-text-muted">
                  {formatDate(c.statusdate)}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
