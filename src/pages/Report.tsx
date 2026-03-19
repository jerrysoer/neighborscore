import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, MapPin } from 'lucide-react';
import { searchAddress, type AddressReport } from '@/lib/search';
import { StatusBanner } from '@/components/building/StatusBanner';
import { ViolationList } from '@/components/building/ViolationList';
import { DOBComplaintList } from '@/components/building/DOBComplaintList';
import { HPDComplaintList } from '@/components/building/HPDComplaintList';
import { SeasonalPatterns } from '@/components/building/SeasonalPatterns';
import { LandlordCard } from '@/components/landlord/LandlordCard';
import { NegotiationTips } from '@/components/building/NegotiationTips';
import { AIVerdict } from '@/components/building/AIVerdict';
import { NeighborhoodScore } from '@/components/neighborhood/NeighborhoodScore';
import { NeighborhoodRadar } from '@/components/neighborhood/NeighborhoodRadar';
import { ShareButton } from '@/components/ShareButton';
import { DataAttribution } from '@/components/DataAttribution';
import { AddressSearch } from '@/components/AddressSearch';

type LoadState =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'loaded'; report: AddressReport }
  | { type: 'error'; message: string };

export function Report() {
  const [searchParams] = useSearchParams();
  const addr = searchParams.get('addr');
  const [state, setState] = useState<LoadState>({ type: 'idle' });

  useEffect(() => {
    if (!addr) {
      setState({ type: 'idle' });
      return;
    }

    setState({ type: 'loading' });
    searchAddress(addr)
      .then((report) => setState({ type: 'loaded', report }))
      .catch((err) =>
        setState({
          type: 'error',
          message:
            err instanceof Error ? err.message : 'Failed to load report',
        }),
      );
  }, [addr]);

  if (state.type === 'idle') {
    return (
      <div className="mx-auto max-w-xl space-y-6 py-12 text-center">
        <h1 className="font-display text-2xl font-bold text-civic-blue">
          Building Report
        </h1>
        <p className="text-text-muted">
          Search for any NYC address to get a building report card.
        </p>
        <AddressSearch large />
      </div>
    );
  }

  if (state.type === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4 py-24">
        <Loader2 size={32} className="animate-spin text-civic-blue" />
        <p className="text-text-muted">Loading building report...</p>
        <p className="text-sm text-text-muted/60">
          Querying NYC Open Data for violations, complaints, and landlord
          info...
        </p>
      </div>
    );
  }

  if (state.type === 'error') {
    return (
      <div className="mx-auto max-w-xl space-y-6 py-12 text-center">
        <div className="rounded-xl border border-status-red/20 bg-status-red/5 p-6">
          <p className="font-medium text-status-red">{state.message}</p>
        </div>
        <AddressSearch large />
      </div>
    );
  }

  const { report } = state;
  const { address, building, landlord, neighborhood } = report;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <MapPin size={14} />
            <span>{address.borough}</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-text">
            {address.formattedAddress}
          </h1>
        </div>
        <ShareButton report={report} />
      </div>

      {/* Search bar for new queries */}
      <AddressSearch />

      {/* Building Status */}
      <StatusBanner status={building.status} />

      {/* Red flag banner for Class C */}
      {building.status.openClassC > 0 && (
        <div className="rounded-lg bg-status-red/10 px-4 py-3 text-sm font-medium text-status-red">
          This building has {building.status.openClassC} immediately hazardous
          violation{building.status.openClassC > 1 ? 's' : ''}.{' '}
          <a
            href="https://www.nyc.gov/site/hpd/renters/important-safety-issues.page"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Learn about violation classes
          </a>
        </div>
      )}

      {/* Violations */}
      <div className="rounded-xl border border-gray-200 bg-surface p-5">
        <ViolationList violations={building.violations} />
      </div>

      {/* DOB + HPD Complaints side by side on desktop */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-surface p-5">
          <DOBComplaintList complaints={building.dobComplaints} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-surface p-5">
          <HPDComplaintList complaints={building.hpdComplaints} />
        </div>
      </div>

      {/* Seasonal Patterns */}
      <SeasonalPatterns violations={building.violations} />

      {/* Landlord */}
      {landlord && <LandlordCard profile={landlord} />}

      {/* Negotiation Tips */}
      <NegotiationTips report={building} landlord={landlord} />

      {/* AI Verdict */}
      <AIVerdict report={report} />

      {/* Neighborhood Score */}
      {neighborhood && <NeighborhoodScore score={neighborhood} />}

      {/* Neighborhood Radar */}
      {neighborhood && (
        <div className="rounded-xl border border-gray-200 bg-surface p-5">
          <h3 className="mb-1 font-display text-lg font-semibold text-text">
            Dimension Profile
          </h3>
          <p className="mb-2 text-sm text-text-muted">
            Radar view of {neighborhood.ntaName} across 6 livability dimensions
          </p>
          <NeighborhoodRadar
            items={[
              {
                label: neighborhood.ntaName,
                safety: neighborhood.safety,
                cleanliness: neighborhood.cleanliness,
                noise: neighborhood.noise,
                foodSafety: neighborhood.foodSafety,
                greenSpace: neighborhood.greenSpace,
                transit: neighborhood.transit,
              },
            ]}
          />
        </div>
      )}

      {/* Attribution */}
      <DataAttribution />
    </div>
  );
}
