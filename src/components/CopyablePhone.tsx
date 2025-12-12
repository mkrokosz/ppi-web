'use client';

import { useState } from 'react';
import { Phone, Copy, Check } from 'lucide-react';
import { trackPhoneCopy, trackPhoneClick } from '@/lib/firebase';

interface CopyablePhoneProps {
  phone: string;
  phoneRaw: string; // e.g., "+18669255000" for tel: link
  location: string;
  variant?: 'light' | 'dark';
  showIcon?: boolean;
  showCopyButton?: boolean;
  className?: string;
}

export default function CopyablePhone({
  phone,
  phoneRaw,
  location,
  variant = 'light',
  showIcon = true,
  showCopyButton = true,
  className = '',
}: CopyablePhoneProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(phone);
      trackPhoneCopy(phone, location);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy phone:', err);
    }
  };

  const handlePhoneClick = () => {
    trackPhoneClick(phone, location);
  };

  const linkClass = variant === 'dark'
    ? 'text-steel-300 hover:text-precision-orange-400'
    : 'text-steel-600 hover:text-precision-orange-500';

  const buttonClass = variant === 'dark'
    ? 'text-steel-400 hover:text-precision-orange-400 hover:bg-industrial-blue-800'
    : 'text-steel-500 hover:text-precision-orange-500 hover:bg-steel-100';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showIcon && <Phone className="w-5 h-5 flex-shrink-0" />}
      <a
        href={`tel:${phoneRaw}`}
        onClick={handlePhoneClick}
        className={`select-none transition-colors ${linkClass}`}
      >
        {phone}
      </a>
      {showCopyButton && (
        <button
          onClick={handleCopy}
          className={`p-1.5 rounded-md transition-all ${buttonClass}`}
          title={copied ? 'Copied!' : 'Copy phone number'}
          aria-label={copied ? 'Phone copied' : 'Copy phone number'}
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
