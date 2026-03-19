import type { BuildingReport } from '@/lib/building/types';
import type { LandlordProfile } from '@/lib/landlord/types';
import { ExternalLink } from 'lucide-react';

interface NegotiationTip {
  icon: string;
  title: string;
  body: string;
  link?: string;
  linkText?: string;
}

function generateTips(
  report: BuildingReport,
  landlord: LandlordProfile | null,
): NegotiationTip[] {
  const tips: NegotiationTip[] = [];
  const { status } = report;

  if (status.openClassC > 0) {
    tips.push({
      icon: '\u{1F6A8}',
      title: 'Immediately Hazardous Violations',
      body: `This building has ${status.openClassC} Class C violation(s). Under NYC Housing Maintenance Code, tenants may withhold rent or request abatement for hazardous conditions until corrected.`,
      link: 'https://www.nyc.gov/site/hpd/renters/tenants-rights.page',
      linkText: 'NYC Tenant Rights',
    });
  }

  if (status.openClassB > 0) {
    tips.push({
      icon: '\u{26A0}\u{FE0F}',
      title: 'Hazardous Violations on Record',
      body: `${status.openClassB} open Class B violation(s). Ask the landlord for a timeline to correct these before signing. Get it in writing.`,
    });
  }

  if (landlord && (landlord.grade === 'D' || landlord.grade === 'F')) {
    const rateMultiple = (landlord.violationRate / 0.15).toFixed(1);
    tips.push({
      icon: '\u{1F3E2}',
      title: 'High-Violation Landlord',
      body: `This landlord's portfolio violation rate is ${rateMultiple}x the NYC average. Consider a shorter initial lease (6-12 months) to evaluate conditions before committing long-term.`,
    });
  }

  if (
    status.openClassA === 0 &&
    status.openClassB === 0 &&
    status.openClassC === 0 &&
    landlord &&
    (landlord.grade === 'A' || landlord.grade === 'B')
  ) {
    tips.push({
      icon: '\u{2705}',
      title: 'Clean Building, Responsible Landlord',
      body: 'No red flags in the data. This building and landlord have solid track records. Standard lease terms are reasonable.',
    });
  }

  return tips;
}

export function NegotiationTips({
  report,
  landlord,
}: {
  report: BuildingReport;
  landlord: LandlordProfile | null;
}) {
  const tips = generateTips(report, landlord);
  if (tips.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-surface p-5">
      <h3 className="mb-4 font-display text-lg font-semibold text-text">
        Rent Negotiation Tips
      </h3>
      <div className="space-y-3">
        {tips.map((tip, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-lg bg-bg p-4"
          >
            <span className="mt-0.5 text-lg">{tip.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-text">{tip.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-text-muted">
                {tip.body}
              </p>
              {tip.link && (
                <a
                  href={tip.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-civic-blue hover:underline"
                >
                  {tip.linkText || 'Learn more'}
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
