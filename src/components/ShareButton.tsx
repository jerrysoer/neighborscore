import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import type { AddressReport } from '@/lib/search';

export function ShareButton({ report }: { report: AddressReport }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const { address, building, landlord, neighborhood } = report;
    const status = building.status;
    const openTotal =
      status.openClassA + status.openClassB + status.openClassC;

    let text = `${address.formattedAddress}`;
    if (openTotal > 0) {
      text += ` — ${openTotal} open violation${openTotal > 1 ? 's' : ''}`;
      if (status.openClassC > 0)
        text += ` (${status.openClassC} hazardous)`;
    } else {
      text += ` — Clean building`;
    }

    if (landlord) {
      text += `. Landlord grade: ${landlord.grade}`;
    }
    if (neighborhood) {
      text += `. Neighborhood: ${neighborhood.composite}/100`;
    }

    const url = `${window.location.origin}${import.meta.env.BASE_URL}#/report?addr=${encodeURIComponent(address.formattedAddress)}`;
    text += `\nCheck yours: ${url}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-gray-50"
    >
      {copied ? (
        <>
          <Check size={16} className="text-status-green" />
          Copied!
        </>
      ) : (
        <>
          <Share2 size={16} />
          Share Report
        </>
      )}
    </button>
  );
}
