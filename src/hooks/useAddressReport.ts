import { useEffect, useState } from 'react';
import { searchAddress, type AddressReport } from '../lib/search';

interface UseAddressReportResult {
  data: AddressReport | null;
  loading: boolean;
  error: string | null;
}

export function useAddressReport(
  query: string | null,
): UseAddressReportResult {
  const [data, setData] = useState<AddressReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let stale = false;
    setLoading(true);
    setError(null);

    searchAddress(query)
      .then((result) => {
        if (!stale) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!stale) {
          setError(
            err instanceof Error ? err.message : 'An unexpected error occurred',
          );
          setLoading(false);
        }
      });

    return () => {
      stale = true;
    };
  }, [query]);

  return { data, loading, error };
}
