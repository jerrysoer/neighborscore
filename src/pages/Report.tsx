import { useSearchParams } from 'react-router-dom';

export function Report() {
  const [searchParams] = useSearchParams();
  const addr = searchParams.get('addr');

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-civic-blue">
        Building Report
      </h1>
      {addr ? (
        <p className="text-text-muted">Report for: {addr}</p>
      ) : (
        <p className="text-text-muted">
          No address provided. Search from the home page.
        </p>
      )}
    </div>
  );
}
