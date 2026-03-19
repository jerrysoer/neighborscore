import { Loader2 } from 'lucide-react';

export function LoadingFallback() {
  return (
    <div className="flex flex-col items-center gap-3 py-24">
      <Loader2 size={28} className="animate-spin text-civic-blue" />
      <p className="text-sm text-text-muted">Loading...</p>
    </div>
  );
}
