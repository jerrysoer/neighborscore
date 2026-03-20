import { useState, useEffect, useRef } from 'react';
import { Share2, Copy, Check, Mail } from 'lucide-react';

interface ShareButtonProps {
  address: string;
}

export function ShareButton({ address }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }

  function shareTwitter() {
    const text = encodeURIComponent(`Check out the building report for ${address} on NeighborScore`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  }

  function shareEmail() {
    const subject = encodeURIComponent(`NeighborScore Report: ${address}`);
    const body = encodeURIComponent(`Check out this building report:\n${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-text-muted hover:text-text transition-colors"
      >
        <Share2 size={14} />
        Share
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-44 overflow-hidden rounded-xl border border-gray-200 bg-surface shadow-lg">
          <button
            type="button"
            onClick={copyLink}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-text hover:bg-gray-50 transition-colors"
          >
            {copied ? <Check size={14} className="text-status-green" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button
            type="button"
            onClick={shareTwitter}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-text hover:bg-gray-50 transition-colors"
          >
            <Share2 size={14} />
            Share on X
          </button>
          <button
            type="button"
            onClick={shareEmail}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-text hover:bg-gray-50 transition-colors"
          >
            <Mail size={14} />
            Email
          </button>
        </div>
      )}
    </div>
  );
}
