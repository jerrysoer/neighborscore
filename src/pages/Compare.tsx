import { useSearchParams } from 'react-router-dom';
import { useAddressReport } from '../hooks/useAddressReport';
import { AddressSearch } from '../components/AddressSearch';
import { StatusBanner } from '../components/StatusBanner';
import { RadarChart } from '../components/RadarChart';

function CompactReport({ addr }: { addr: string }) {
  const { data, loading, error } = useAddressReport(addr);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-20 rounded-xl bg-gray-200" />
        <div className="h-32 rounded-xl bg-gray-200" />
        <div className="h-64 rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-status-red/20 bg-status-red/5 p-4 text-sm text-status-red">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const { building, landlord, neighborhood } = data;

  return (
    <div className="space-y-4">
      <p className="font-mono text-sm text-text-muted truncate">
        {data.address.formattedAddress}
      </p>

      <StatusBanner status={building.status} />

      <div className="rounded-xl border border-gray-100 bg-surface p-4 shadow-sm">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-mono text-2xl font-bold text-text">
              {building.status.totalViolations - building.status.resolvedViolations}
            </p>
            <p className="text-xs text-text-muted">Open Violations</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold text-text">
              {landlord?.grade ?? '—'}
            </p>
            <p className="text-xs text-text-muted">Landlord</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold text-text">
              {neighborhood ? Math.round(neighborhood.composite) : '—'}
            </p>
            <p className="text-xs text-text-muted">Neighborhood</p>
          </div>
        </div>
      </div>

      {neighborhood && <RadarChart score={neighborhood} height={220} />}
    </div>
  );
}

export function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const a1 = searchParams.get('a1');
  const a2 = searchParams.get('a2');

  function setAddr1(address: string) {
    setSearchParams((prev) => {
      prev.set('a1', address);
      return prev;
    });
  }

  function setAddr2(address: string) {
    setSearchParams((prev) => {
      prev.set('a2', address);
      return prev;
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-civic-blue">
        Compare Addresses
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <AddressSearch
            onSelect={setAddr1}
            placeholder="First address..."
            compact
          />
          {a1 && <CompactReport addr={a1} />}
        </div>
        <div className="space-y-4">
          <AddressSearch
            onSelect={setAddr2}
            placeholder="Second address..."
            compact
          />
          {a2 && <CompactReport addr={a2} />}
        </div>
      </div>
    </div>
  );
}
