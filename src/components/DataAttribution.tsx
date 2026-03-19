import { Database } from 'lucide-react';

export function DataAttribution() {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-bg px-4 py-3 text-xs text-text-muted">
      <Database size={14} />
      <span>
        Data from{' '}
        <a
          href="https://opendata.cityofnewyork.us/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-civic-blue hover:underline"
        >
          NYC Open Data
        </a>
        . Building violations updated daily. Neighborhood scores updated
        nightly.
      </span>
    </div>
  );
}
