import { Building2, Shield, TrendingUp, Scale } from 'lucide-react';
import { AddressSearch } from '@/components/AddressSearch';

const FEATURES = [
  {
    icon: Building2,
    title: 'Building Report Card',
    description:
      'Open HPD violations, DOB complaints, and housing code issues — all in one view.',
  },
  {
    icon: Shield,
    title: 'Landlord Grade',
    description:
      'See how your landlord manages all their buildings. Portfolio-wide violation rate vs NYC average.',
  },
  {
    icon: TrendingUp,
    title: 'Neighborhood Score',
    description:
      'Safety, cleanliness, noise, food safety, green space, and transit — scored 0-100.',
  },
  {
    icon: Scale,
    title: 'Negotiation Tips',
    description:
      'Contextual tips based on violations and landlord history. Know your rights before signing.',
  },
];

export function Home() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero */}
      <div className="mx-auto max-w-2xl space-y-6 text-center">
        <h1 className="font-display text-4xl font-bold leading-tight text-civic-blue sm:text-5xl">
          Check any NYC building
          <br />
          before you sign.
        </h1>
        <p className="text-lg text-text-muted">
          Building violations, landlord grades, and neighborhood scores —
          powered by NYC Open Data.
        </p>
        <div className="mx-auto max-w-lg">
          <AddressSearch large />
        </div>
        <p className="text-xs text-text-muted/60">
          Try: 100 Broadway, New York · 350 5th Ave, New York · 1 MetroTech
          Center, Brooklyn
        </p>
      </div>

      {/* Features */}
      <div className="grid gap-6 sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-xl border border-gray-200 bg-surface p-6"
          >
            <div className="mb-3 inline-flex rounded-lg bg-civic-blue/10 p-2">
              <Icon size={20} className="text-civic-blue" />
            </div>
            <h3 className="font-display text-base font-semibold text-text">
              {title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-text-muted">
              {description}
            </p>
          </div>
        ))}
      </div>

      {/* Data sources */}
      <div className="text-center">
        <p className="text-xs text-text-muted/60">
          Data from 13 NYC Open Data datasets · Updated nightly · Free and open
          source
        </p>
        <p className="mt-1 text-xs text-text-muted/40">
          Built for NYC Open Data Week 2026
        </p>
      </div>
    </div>
  );
}
