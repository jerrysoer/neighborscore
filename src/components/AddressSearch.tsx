import { useState, useEffect, useRef, useCallback } from 'react';
import { Search } from 'lucide-react';

interface Suggestion {
  id: string;
  place_name: string;
}

interface AddressSearchProps {
  onSelect: (address: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  compact?: boolean;
}

export function AddressSearch({
  onSelect,
  placeholder = 'Enter any NYC address...',
  autoFocus = false,
  compact = false,
}: AddressSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchSuggestions = useCallback(async (q: string) => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token || q.length < 3) {
      setSuggestions([]);
      return;
    }

    const encoded = encodeURIComponent(q);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${token}&country=US&bbox=-74.26,40.49,-73.7,40.92&types=address&limit=5&autocomplete=true`;

    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const data = (await res.json()) as {
        features: Array<{ id: string; place_name: string }>;
      };
      setSuggestions(data.features.map((f) => ({ id: f.id, place_name: f.place_name })));
      setOpen(true);
    } catch {
      // Silently fail on network issues
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectSuggestion(place_name: string) {
    setQuery(place_name);
    setOpen(false);
    setSuggestions([]);
    onSelect(place_name);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = suggestions[active];
      if (active >= 0 && selected) {
        selectSuggestion(selected.place_name);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search
          size={compact ? 16 : 20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full rounded-xl border border-gray-200 bg-surface shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-civic-blue/30 focus:border-civic-blue ${
            compact ? 'py-2 pl-9 pr-4 text-sm' : 'py-3 pl-10 pr-4 text-base'
          }`}
        />
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-surface shadow-lg">
          {suggestions.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                  i === active ? 'bg-civic-blue/10 text-civic-blue' : 'text-text hover:bg-gray-50'
                }`}
                onMouseEnter={() => setActive(i)}
                onClick={() => selectSuggestion(s.place_name)}
              >
                <Search size={14} className="shrink-0 text-text-muted" />
                <span className="font-mono text-sm">{s.place_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
