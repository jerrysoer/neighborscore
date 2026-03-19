import { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import type { NTAScore } from '@/lib/neighborhood/types';
import { DIMENSION_HEX, type DimensionKey } from '@/lib/dimensions';

const CHIP_COLORS: DimensionKey[] = ['safety', 'foodSafety', 'transit'];

export function NTASelector({
  allNTAs,
  selected,
  onAdd,
  onRemove,
  maxSelections = 3,
}: {
  allNTAs: NTAScore[];
  selected: NTAScore[];
  onAdd: (nta: NTAScore) => void;
  onRemove: (ntaCode: string) => void;
  maxSelections?: number;
}) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCodes = new Set(selected.map((s) => s.ntaCode));

  const filtered = query.length >= 2
    ? allNTAs
        .filter(
          (nta) =>
            !selectedCodes.has(nta.ntaCode) &&
            nta.ntaName.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 8)
    : [];

  useEffect(() => {
    if (query.length >= 2 && filtered.length > 0) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [query, filtered.length]);

  const handleSelect = (nta: NTAScore) => {
    onAdd(nta);
    setQuery('');
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-3">
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((nta, i) => {
            const colorKey = CHIP_COLORS[i % CHIP_COLORS.length]!;
            const hex = DIMENSION_HEX[colorKey];
            return (
              <span
                key={nta.ntaCode}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-white"
                style={{ backgroundColor: hex }}
              >
                {nta.ntaName}
                <button
                  onClick={() => onRemove(nta.ntaCode)}
                  className="rounded-full p-0.5 hover:bg-white/20"
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Search input */}
      {selected.length < maxSelections && (
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() =>
              query.length >= 2 && filtered.length > 0 && setShowDropdown(true)
            }
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder={`Search neighborhoods (${maxSelections - selected.length} remaining)...`}
            className="w-full rounded-lg border border-gray-200 bg-surface py-2.5 pl-9 pr-4 text-sm text-text placeholder:text-text-muted/50 focus:border-civic-blue focus:outline-none focus:ring-2 focus:ring-civic-blue/20"
          />

          {showDropdown && (
            <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-surface shadow-lg">
              {filtered.map((nta) => (
                <li key={nta.ntaCode}>
                  <button
                    type="button"
                    onMouseDown={() => handleSelect(nta)}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-bg"
                  >
                    <span>
                      <span className="font-medium text-text">
                        {nta.ntaName}
                      </span>
                      <span className="ml-2 text-text-muted">
                        {nta.borough}
                      </span>
                    </span>
                    <span className="font-mono text-xs text-text-muted">
                      {nta.composite}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
