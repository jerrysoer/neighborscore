import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

interface Suggestion {
  id: string;
  place_name: string;
}

export function AddressSearch({ large = false }: { large?: boolean }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  const fetchSuggestions = useCallback(
    async (text: string) => {
      if (text.length < 3) {
        setSuggestions([]);
        return;
      }

      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      if (!token) return;

      try {
        const encoded = encodeURIComponent(text);
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${token}&country=US&bbox=-74.26,40.49,-73.7,40.92&types=address&limit=5`;
        const response = await fetch(url);
        if (!response.ok) return;
        const data = (await response.json()) as {
          features: Array<{ id: string; place_name: string }>;
        };
        setSuggestions(data.features);
      } catch {
        // Autocomplete failure is non-critical
      }
    },
    [],
  );

  const handleSelect = (address: string) => {
    setSuggestions([]);
    setShowSuggestions(false);
    setQuery(address);
    navigate(`/report?addr=${encodeURIComponent(address)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowSuggestions(false);
    navigate(`/report?addr=${encodeURIComponent(query.trim())}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
    fetchSuggestions(value);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative">
        <Search
          size={large ? 22 : 18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Enter any NYC address..."
          className={`w-full rounded-xl border border-gray-200 bg-surface pl-12 pr-4 font-body text-text shadow-sm transition-shadow placeholder:text-text-muted/50 focus:border-civic-blue focus:outline-none focus:ring-2 focus:ring-civic-blue/20 ${
            large ? 'py-4 text-lg' : 'py-3 text-base'
          }`}
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-surface shadow-lg">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onMouseDown={() => handleSelect(s.place_name)}
                className="w-full px-4 py-3 text-left text-sm text-text hover:bg-bg"
              >
                {s.place_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
