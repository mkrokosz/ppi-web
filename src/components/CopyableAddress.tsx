'use client';

import { useState } from 'react';
import { MapPin, Copy, Check } from 'lucide-react';
import { trackAddressCopy, trackDirectionsClick, gtagAddressCopy, gtagDirectionsClick } from '@/lib/firebase';

interface CopyableAddressProps {
  address: string;
  cityStateZip: string;
  mapsUrl?: string;
  location: string;
  variant?: 'light' | 'dark';
  showIcon?: boolean;
  showCopyButton?: boolean;
  multiline?: boolean;
  className?: string;
}

export default function CopyableAddress({
  address,
  cityStateZip,
  mapsUrl = 'https://goo.gl/maps/R8fawsprvH5KirYK7',
  location,
  variant = 'light',
  showIcon = true,
  showCopyButton = true,
  multiline = false,
  className = '',
}: CopyableAddressProps) {
  const [copied, setCopied] = useState(false);

  const fullAddress = `${address}, ${cityStateZip}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      trackAddressCopy(location);
      gtagAddressCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const handleAddressClick = () => {
    trackDirectionsClick(location);
    gtagDirectionsClick();
  };

  const linkClass = variant === 'dark'
    ? 'text-steel-300 hover:text-precision-orange-400'
    : 'text-steel-600 hover:text-precision-orange-500';

  const buttonClass = variant === 'dark'
    ? 'text-steel-400 hover:text-precision-orange-400 hover:bg-industrial-blue-800'
    : 'text-steel-500 hover:text-precision-orange-500 hover:bg-steel-100';

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {showIcon && <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleAddressClick}
        className={`select-none transition-colors ${linkClass}`}
      >
        {multiline ? (
          <>
            {address}<br />{cityStateZip}
          </>
        ) : (
          `${address}, ${cityStateZip}`
        )}
      </a>
      {showCopyButton && (
        <button
          onClick={handleCopy}
          className={`p-1.5 rounded-md transition-all flex-shrink-0 ${multiline ? 'mt-0' : ''} ${buttonClass}`}
          title={copied ? 'Copied!' : 'Copy address'}
          aria-label={copied ? 'Address copied' : 'Copy address'}
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
}
