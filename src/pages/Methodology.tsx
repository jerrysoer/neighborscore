export function Methodology() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-civic-blue">
          Methodology
        </h1>
        <p className="mt-2 text-text-muted">
          How we compute building status, landlord grades, and neighborhood
          scores.
        </p>
      </div>

      {/* Building Status Levels */}
      <section className="rounded-xl border border-gray-100 bg-surface p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold text-civic-blue mb-4">
          Building Status Levels
        </h2>
        <p className="text-sm text-text-muted mb-4">
          Each building is assigned a status based on its most severe open HPD
          violation class.
        </p>
        <div className="space-y-3">
          {[
            {
              color: 'bg-status-red',
              level: 'Red — Immediately Hazardous',
              criteria: 'One or more open Class C violations',
              example:
                'Lead paint, no heat/hot water, vermin, structural failure',
            },
            {
              color: 'bg-status-orange',
              level: 'Orange — Hazardous',
              criteria:
                'No Class C, but one or more open Class B violations',
              example:
                'Leaking pipes, broken windows, defective plumbing',
            },
            {
              color: 'bg-status-yellow',
              level: 'Yellow — Non-Hazardous',
              criteria:
                'No Class B or C, but one or more open Class A violations',
              example: 'Peeling paint (non-lead), minor cracks, missing signs',
            },
            {
              color: 'bg-status-green',
              level: 'Green — Clear',
              criteria: 'No open violations, or all resolved',
              example: 'Building has no outstanding HPD violations',
            },
          ].map((row) => (
            <div key={row.level} className="flex items-start gap-3">
              <div className={`mt-1 h-4 w-4 shrink-0 rounded-full ${row.color}`} />
              <div>
                <p className="font-medium text-text">{row.level}</p>
                <p className="text-sm text-text-muted">{row.criteria}</p>
                <p className="text-xs text-text-muted italic">{row.example}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Landlord Grading */}
      <section className="rounded-xl border border-gray-100 bg-surface p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold text-civic-blue mb-4">
          Landlord Grading
        </h2>
        <p className="text-sm text-text-muted mb-4">
          The landlord grade is based on their portfolio-wide open violation rate
          (violations per residential unit) compared to the citywide median.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-text-muted">
                <th className="pb-2 font-medium">Grade</th>
                <th className="pb-2 font-medium">Violation Rate vs. Median</th>
                <th className="pb-2 font-medium">Interpretation</th>
              </tr>
            </thead>
            <tbody className="text-text">
              {[
                { grade: 'A', range: '< 0.5x median', meaning: 'Excellent — well below average' },
                { grade: 'B', range: '< 1.0x median', meaning: 'Good — below average' },
                { grade: 'C', range: '< 1.5x median', meaning: 'Average — near the median' },
                { grade: 'D', range: '< 2.5x median', meaning: 'Below average — needs improvement' },
                { grade: 'F', range: '≥ 2.5x median', meaning: 'Poor — significantly above average' },
              ].map((row) => (
                <tr key={row.grade} className="border-b border-gray-50">
                  <td className="py-2 font-mono font-bold">{row.grade}</td>
                  <td className="py-2 font-mono">{row.range}</td>
                  <td className="py-2">{row.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Neighborhood Dimensions */}
      <section className="rounded-xl border border-gray-100 bg-surface p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold text-civic-blue mb-4">
          Neighborhood Dimensions
        </h2>
        <p className="text-sm text-text-muted mb-4">
          Each neighborhood (NTA) is scored 0–100 on six dimensions, then
          combined into a composite score.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: 'Safety',
              color: 'bg-score-safety',
              source: 'NYPD complaint records',
              meaning: 'Fewer crime complaints → higher score',
            },
            {
              name: 'Cleanliness',
              color: 'bg-score-cleanliness',
              source: '311 sanitation complaints',
              meaning: 'Fewer dirty conditions / rodent complaints → higher score',
            },
            {
              name: 'Noise',
              color: 'bg-score-noise',
              source: '311 noise complaints',
              meaning: 'Fewer noise complaints → higher score',
            },
            {
              name: 'Food Safety',
              color: 'bg-score-food',
              source: 'Restaurant inspection critical violations',
              meaning: 'Fewer critical violations → higher score',
            },
            {
              name: 'Green Space',
              color: 'bg-score-green',
              source: 'NYC tree census',
              meaning: 'More trees → higher score',
            },
            {
              name: 'Transit',
              color: 'bg-score-transit',
              source: 'MTA subway station data',
              meaning: 'More nearby subway stations → higher score',
            },
          ].map((dim) => (
            <div
              key={dim.name}
              className="rounded-lg border border-gray-100 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`h-3 w-3 rounded-full ${dim.color}`} />
                <span className="font-medium text-text">{dim.name}</span>
              </div>
              <p className="text-xs text-text-muted mb-1">
                Source: {dim.source}
              </p>
              <p className="text-xs text-text-muted">{dim.meaning}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Data Sources */}
      <section className="rounded-xl border border-gray-100 bg-surface p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold text-civic-blue mb-4">
          Data Sources & Freshness
        </h2>
        <ul className="space-y-2 text-sm text-text-muted">
          <li>
            <span className="font-medium text-text">HPD Violations</span> —
            NYC Open Data (wvxf-dwi5) — queried live per search
          </li>
          <li>
            <span className="font-medium text-text">DOB Complaints</span> —
            NYC Open Data (eabe-havv) — queried live per search
          </li>
          <li>
            <span className="font-medium text-text">HPD Complaints</span> —
            NYC Open Data (a2h7-iqsi) — queried live per search
          </li>
          <li>
            <span className="font-medium text-text">HPD Buildings & Registrations</span> —
            NYC Open Data (kj4p-ruqc, feu5-w2e2) — queried live
          </li>
          <li>
            <span className="font-medium text-text">NYPD Complaints</span> —
            NYC Open Data (5uac-w243, qgea-i56i) — pre-aggregated nightly
          </li>
          <li>
            <span className="font-medium text-text">311 Service Requests</span> —
            NYC Open Data (erm2-nwe9) — pre-aggregated nightly
          </li>
          <li>
            <span className="font-medium text-text">Restaurant Inspections</span> —
            NYC Open Data (43nn-pn8j) — pre-aggregated nightly
          </li>
          <li>
            <span className="font-medium text-text">Tree Census</span> —
            NYC Open Data (uvpi-gqnh) — pre-aggregated
          </li>
          <li>
            <span className="font-medium text-text">Subway Stations</span> —
            MTA / NY Open Data (39hk-dx4f) — pre-aggregated
          </li>
        </ul>
        <p className="mt-4 text-xs text-text-muted">
          Neighborhood boundary data and composite scores are refreshed nightly
          via CI. Building-specific data (violations, complaints, landlord info)
          is fetched live from NYC Open Data for each search.
        </p>
      </section>
    </div>
  );
}
