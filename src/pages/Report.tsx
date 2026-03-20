import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapPin, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAddressReport } from '../hooks/useAddressReport';
import { analyzeSeasonalPatterns } from '../lib/building/seasonal';
import { AddressSearch } from '../components/AddressSearch';
import { StatusBanner } from '../components/StatusBanner';
import { ViolationList } from '../components/ViolationList';
import { LandlordCard } from '../components/LandlordCard';
import { NeighborhoodScoreCard } from '../components/NeighborhoodScoreCard';
import { RadarChart } from '../components/RadarChart';
import { SeasonalChart } from '../components/SeasonalChart';
import { ShareButton } from '../components/ShareButton';

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-24 rounded-xl bg-gray-200" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 rounded-xl bg-gray-200" />
        <div className="h-64 rounded-xl bg-gray-200" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-80 rounded-xl bg-gray-200" />
        <div className="h-80 rounded-xl bg-gray-200" />
      </div>
      <div className="h-64 rounded-xl bg-gray-200" />
    </div>
  );
}

export function Report() {
  const [searchParams, setSearchParams] = useSearchParams();
  const addr = searchParams.get('addr');
  const { data, loading, error } = useAddressReport(addr);

  useEffect(() => {
    if (data) {
      document.title = `${data.address.formattedAddress} — NeighborScore`;
    }
    return () => {
      document.title = 'NeighborScore — NYC Building Report Card';
    };
  }, [data]);

  function handleSearch(address: string) {
    setSearchParams({ addr: address });
  }

  if (!addr) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <MapPin size={48} className="text-text-muted" />
        <p className="text-text-muted text-lg">No address provided.</p>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-civic-blue hover:underline"
        >
          <ArrowLeft size={16} />
          Search from home
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <AddressSearch onSelect={handleSearch} compact placeholder="Search another address..." />
          </div>
        </div>
        <p className="text-sm text-text-muted">Loading report for {addr}...</p>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <AlertCircle size={48} className="text-status-red" />
        <p className="text-status-red font-medium">{error}</p>
        <Link
          to="/"
          className="rounded-lg bg-civic-blue px-4 py-2 text-sm text-white hover:bg-civic-blue/90 transition-colors"
        >
          Try Again
        </Link>
      </div>
    );
  }

  const { building, landlord, neighborhood } = data!;
  const seasonal = analyzeSeasonalPatterns(building.violations);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin size={20} className="shrink-0 text-civic-blue" />
          <h1 className="font-display text-xl font-bold text-civic-blue truncate">
            {data!.address.formattedAddress}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ShareButton address={data!.address.formattedAddress} />
        </div>
      </header>

      <div className="max-w-md">
        <AddressSearch onSelect={handleSearch} compact placeholder="Search another address..." />
      </div>

      <StatusBanner status={building.status} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ViolationList
          violations={building.violations}
          dobComplaints={building.dobComplaints}
          hpdComplaints={building.hpdComplaints}
        />
        {landlord && <LandlordCard landlord={landlord} />}
      </div>

      {neighborhood && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NeighborhoodScoreCard score={neighborhood} />
          <RadarChart score={neighborhood} />
        </div>
      )}

      <SeasonalChart pattern={seasonal} />
    </div>
  );
}
