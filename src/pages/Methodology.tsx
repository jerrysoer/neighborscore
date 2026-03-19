import {
  Building2,
  Users,
  MapPin,
  Database,
  AlertTriangle,
  AlertCircle,
  Info,
} from 'lucide-react';

const STATUS_PATHS = [
  {
    level: 'Red',
    color: 'bg-status-red',
    label: 'Immediately Hazardous',
    rule: 'Any open Class C violations',
  },
  {
    level: 'Orange',
    color: 'bg-status-orange',
    label: 'Hazardous',
    rule: 'Open Class B violations (no C)',
  },
  {
    level: 'Yellow',
    color: 'bg-status-yellow',
    label: 'Non-Hazardous Issues',
    rule: 'Open Class A violations only',
  },
  {
    level: 'Green',
    color: 'bg-status-green',
    label: 'All Resolved',
    rule: 'Violations exist but all resolved',
  },
  {
    level: 'Green',
    color: 'bg-status-green',
    label: 'No Violations',
    rule: 'Zero violations on record',
  },
];

const GRADE_THRESHOLDS = [
  { grade: 'A', range: 'rate < median x 0.5', desc: 'Excellent — well below average' },
  { grade: 'B', range: '0.5x to 1x median', desc: 'Good — below average' },
  { grade: 'C', range: '1x to 1.5x median', desc: 'Average' },
  { grade: 'D', range: '1.5x to 2.5x median', desc: 'Below average — caution advised' },
  { grade: 'F', range: '> 2.5x median', desc: 'Poor — significantly above average' },
];

const DIMENSIONS = [
  {
    name: 'Safety',
    weight: '25%',
    source: 'NYPD Complaint Data (YTD)',
    method: 'Inversed crime count per capita, ranked by percentile',
  },
  {
    name: 'Cleanliness',
    weight: '20%',
    source: '311 Sanitation Complaints + Rodent Inspections',
    method: 'Inversed complaint rate, ranked by percentile',
  },
  {
    name: 'Noise',
    weight: '20%',
    source: '311 Noise Complaints',
    method: 'Inversed complaint rate, ranked by percentile',
  },
  {
    name: 'Food Safety',
    weight: '15%',
    source: 'DOHMH Restaurant Inspections',
    method: 'Inversed critical violation rate, ranked by percentile',
  },
  {
    name: 'Green Space',
    weight: '10%',
    source: 'NYC Street Tree Census',
    method: 'Tree density per NTA area, ranked by percentile',
  },
  {
    name: 'Transit',
    weight: '10%',
    source: 'MTA Subway Station Locations',
    method: 'Station count within NTA boundary, ranked by percentile',
  },
];

const DATA_SOURCES = [
  { name: 'HPD Violations', id: 'wvxf-dwi5', frequency: 'Daily' },
  { name: 'HPD Buildings', id: 'kj4p-ruqc', frequency: 'Daily' },
  { name: 'HPD Registration Contacts', id: 'tesw-yqqr', frequency: 'Daily' },
  { name: 'HPD Complaints', id: 'uwyv-629c', frequency: 'Daily' },
  { name: 'DOB Complaints', id: 'eabe-havv', frequency: 'Daily' },
  { name: 'NYPD Complaint Data (YTD)', id: 'qgea-i56i', frequency: 'Quarterly' },
  { name: '311 Service Requests', id: 'erm2-nwe9', frequency: 'Daily' },
  { name: 'Rodent Inspections', id: 'p937-wjvj', frequency: 'Monthly' },
  { name: 'Restaurant Inspections', id: '43nn-pn8j', frequency: 'Daily' },
  { name: 'NYC Street Tree Census', id: 'uvpi-gqnh', frequency: 'Decennial' },
  { name: 'MTA Subway Stations', id: 'kk4q-3rt2', frequency: 'Annually' },
  { name: 'NTA Boundaries (2020)', id: '9nt8-h7nd', frequency: 'Decennial' },
  { name: 'HPD Violation Open Data', id: 'b2iz-pps8', frequency: 'Daily' },
];

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Building2;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-surface p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-civic-blue/10 p-2">
          <Icon size={20} className="text-civic-blue" />
        </div>
        <h2 className="font-display text-xl font-bold text-text">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function Methodology() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-civic-blue">
          Methodology
        </h1>
        <p className="mt-1 text-text-muted">
          How we compute building status, landlord grades, and neighborhood
          scores from NYC Open Data.
        </p>
      </div>

      {/* Building Status */}
      <SectionCard icon={Building2} title="Building Status">
        <div className="space-y-4">
          <div className="rounded-lg bg-bg p-4">
            <h3 className="mb-2 text-sm font-semibold text-text">
              HPD Violation Classes
            </h3>
            <div className="space-y-2 text-sm text-text-muted">
              <div className="flex items-start gap-2">
                <AlertCircle
                  size={16}
                  className="mt-0.5 shrink-0 text-status-red"
                />
                <span>
                  <strong className="text-text">Class C</strong> — Immediately
                  hazardous (e.g., no heat, lead paint, fire escape blocked).
                  Landlord has 24 hours to correct.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle
                  size={16}
                  className="mt-0.5 shrink-0 text-status-orange"
                />
                <span>
                  <strong className="text-text">Class B</strong> — Hazardous
                  (e.g., broken plumbing, roach infestation, inadequate
                  lighting). 30 days to correct.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Info
                  size={16}
                  className="mt-0.5 shrink-0 text-status-yellow"
                />
                <span>
                  <strong className="text-text">Class A</strong> —
                  Non-hazardous (e.g., minor plaster cracks, missing window
                  screen). 90 days to correct.
                </span>
              </div>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-text">
            Status Determination (5 paths)
          </h3>
          <div className="space-y-2">
            {STATUS_PATHS.map((path, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg bg-bg px-4 py-2.5"
              >
                <div className={`h-3 w-3 rounded-full ${path.color}`} />
                <div className="flex-1">
                  <span className="text-sm font-medium text-text">
                    {path.label}
                  </span>
                  <span className="ml-2 text-sm text-text-muted">
                    — {path.rule}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Landlord Grade */}
      <SectionCard icon={Users} title="Landlord Grade">
        <div className="space-y-4">
          <div className="rounded-lg bg-bg p-4">
            <h3 className="mb-2 text-sm font-semibold text-text">
              Portfolio Lookup Chain
            </h3>
            <ol className="ml-4 list-decimal space-y-1 text-sm text-text-muted">
              <li>Find HPD building record by lat/lng bounding box</li>
              <li>
                Look up registration contacts by{' '}
                <code className="rounded bg-gray-100 px-1 font-mono text-xs">
                  registrationId
                </code>
              </li>
              <li>Find all registrations for the same owner name</li>
              <li>Count total buildings and units across portfolio</li>
              <li>Fetch open violation counts for all portfolio buildings</li>
              <li>Compute violation rate and grade vs. citywide median</li>
            </ol>
          </div>

          <div className="rounded-lg bg-bg p-4">
            <h3 className="mb-2 text-sm font-semibold text-text">
              Violation Rate Formula
            </h3>
            <p className="font-mono text-sm text-text-muted">
              rate = total_open_violations / total_residential_units
            </p>
            <p className="mt-2 text-sm text-text-muted">
              The citywide median violation rate is approximately{' '}
              <strong className="text-text">0.15</strong> (15 violations per
              100 units).
            </p>
          </div>

          <h3 className="text-sm font-semibold text-text">
            Grade Thresholds
          </h3>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-bg">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-text-muted">
                    Grade
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-text-muted">
                    Range
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-text-muted">
                    Meaning
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {GRADE_THRESHOLDS.map((t) => (
                  <tr key={t.grade}>
                    <td className="px-4 py-2 font-mono font-bold text-text">
                      {t.grade}
                    </td>
                    <td className="px-4 py-2 font-mono text-text-muted">
                      {t.range}
                    </td>
                    <td className="px-4 py-2 text-text-muted">{t.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SectionCard>

      {/* Neighborhood Score */}
      <SectionCard icon={MapPin} title="Neighborhood Score">
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Each NYC Neighborhood Tabulation Area (NTA) is scored from 0-100
            across 6 livability dimensions. Raw counts are converted to
            percentile ranks (higher = better) and combined with weighted
            averaging.
          </p>

          <h3 className="text-sm font-semibold text-text">
            Dimensions &amp; Weights
          </h3>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-bg">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-text-muted">
                    Dimension
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-text-muted">
                    Weight
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-text-muted">
                    Data Source
                  </th>
                  <th className="hidden px-4 py-2 text-left font-medium text-text-muted sm:table-cell">
                    Method
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {DIMENSIONS.map((d) => (
                  <tr key={d.name}>
                    <td className="px-4 py-2 font-medium text-text">
                      {d.name}
                    </td>
                    <td className="px-4 py-2 font-mono text-text-muted">
                      {d.weight}
                    </td>
                    <td className="px-4 py-2 text-text-muted">{d.source}</td>
                    <td className="hidden px-4 py-2 text-text-muted sm:table-cell">
                      {d.method}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg bg-bg p-4">
            <h3 className="mb-2 text-sm font-semibold text-text">
              Composite Formula
            </h3>
            <p className="font-mono text-sm text-text-muted">
              composite = (safety x 0.25) + (cleanliness x 0.20) + (noise x
              0.20) + (foodSafety x 0.15) + (greenSpace x 0.10) + (transit x
              0.10)
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Data Sources */}
      <SectionCard icon={Database} title="Data Sources">
        <p className="mb-4 text-sm text-text-muted">
          All data is sourced from the{' '}
          <a
            href="https://opendata.cityofnewyork.us/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-civic-blue hover:underline"
          >
            NYC Open Data Portal
          </a>{' '}
          via the Socrata Open Data API (SODA). No personal data is collected
          or stored.
        </p>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-bg">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-text-muted">
                  Dataset
                </th>
                <th className="px-4 py-2 text-left font-medium text-text-muted">
                  SODA ID
                </th>
                <th className="px-4 py-2 text-left font-medium text-text-muted">
                  Update Frequency
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {DATA_SOURCES.map((ds) => (
                <tr key={ds.id}>
                  <td className="px-4 py-2 text-text">{ds.name}</td>
                  <td className="px-4 py-2">
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-text-muted">
                      {ds.id}
                    </code>
                  </td>
                  <td className="px-4 py-2 text-text-muted">
                    {ds.frequency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
