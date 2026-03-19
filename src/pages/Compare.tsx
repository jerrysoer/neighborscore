import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { loadNTAScores } from '@/lib/neighborhood/data';
import type { NTAScore } from '@/lib/neighborhood/types';
import { NTASelector } from '@/components/compare/NTASelector';
import { ComparisonGrid } from '@/components/compare/ComparisonGrid';
import { NeighborhoodRadar } from '@/components/neighborhood/NeighborhoodRadar';
import type { RadarItem } from '@/components/neighborhood/NeighborhoodRadar';

export function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allNTAs, setAllNTAs] = useState<NTAScore[]>([]);
  const [selected, setSelected] = useState<NTAScore[]>([]);
  const [loading, setLoading] = useState(true);

  // Load NTA data and initialize from URL params
  useEffect(() => {
    loadNTAScores()
      .then((data) => {
        const sorted = [...data.ntas].sort((a, b) =>
          a.ntaName.localeCompare(b.ntaName),
        );
        setAllNTAs(sorted);

        // Initialize from URL params
        const ntaParam = searchParams.get('ntas');
        if (ntaParam) {
          const codes = ntaParam.split(',');
          const found = codes
            .map((code) => data.ntas.find((n) => n.ntaCode === code))
            .filter((n): n is NTAScore => n !== undefined)
            .slice(0, 3);
          setSelected(found);
        }

        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync selection to URL
  const updateURL = useCallback(
    (items: NTAScore[]) => {
      if (items.length > 0) {
        setSearchParams(
          { ntas: items.map((n) => n.ntaCode).join(',') },
          { replace: true },
        );
      } else {
        setSearchParams({}, { replace: true });
      }
    },
    [setSearchParams],
  );

  const handleAdd = (nta: NTAScore) => {
    const next = [...selected, nta].slice(0, 3);
    setSelected(next);
    updateURL(next);
  };

  const handleRemove = (ntaCode: string) => {
    const next = selected.filter((s) => s.ntaCode !== ntaCode);
    setSelected(next);
    updateURL(next);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-24">
        <Loader2 size={28} className="animate-spin text-civic-blue" />
        <p className="text-sm text-text-muted">Loading neighborhood data...</p>
      </div>
    );
  }

  const radarItems: RadarItem[] = selected.map((nta) => ({
    label: nta.ntaName,
    safety: nta.safety,
    cleanliness: nta.cleanliness,
    noise: nta.noise,
    foodSafety: nta.foodSafety,
    greenSpace: nta.greenSpace,
    transit: nta.transit,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-civic-blue">
          Compare Neighborhoods
        </h1>
        <p className="mt-1 text-text-muted">
          Select up to 3 neighborhoods to compare side by side.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-surface p-5">
        <NTASelector
          allNTAs={allNTAs}
          selected={selected}
          onAdd={handleAdd}
          onRemove={handleRemove}
        />
      </div>

      {selected.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-text-muted">
            Start typing a neighborhood name above to begin comparing.
          </p>
        </div>
      )}

      {/* Radar chart */}
      {selected.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-surface p-5">
          <h3 className="mb-2 font-display text-lg font-semibold text-text">
            Dimension Profile
          </h3>
          <NeighborhoodRadar items={radarItems} height={360} />
        </div>
      )}

      {/* Comparison grid */}
      {selected.length > 0 && <ComparisonGrid items={selected} />}
    </div>
  );
}
