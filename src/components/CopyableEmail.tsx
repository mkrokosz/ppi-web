'use client';

import { useState } from 'react';
import { Mail, Copy, Check } from 'lucide-react';
import { trackEmailCopy, trackEmailClick } from '@/lib/firebase';

interface CopyableEmailProps {
  email: string;
  location: string;
  variant?: 'light' | 'dark';
  showIcon?: boolean;
  className?: string;
}

export default function CopyableEmail({
  email,
  location,
  variant = 'light',
  showIcon = true,
  className = '',
}: CopyableEmailProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      trackEmailCopy(email, location);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  const handleEmailClick = () => {
    trackEmailClick(email, location);
  };

  const linkClass = variant === 'dark'
    ? 'text-steel-300 hover:text-precision-orange-400'
    : 'text-steel-600 hover:text-precision-orange-500';

  const buttonClass = variant === 'dark'
    ? 'text-steel-400 hover:text-precision-orange-400 hover:bg-industrial-blue-800'
    : 'text-steel-500 hover:text-precision-orange-500 hover:bg-steel-100';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showIcon && <Mail className="w-5 h-5 flex-shrink-0" />}
      <a
        href={`mailto:${email}`}
        onClick={handleEmailClick}
        className={`select-none transition-colors ${linkClass}`}
      >
        {email}
      </a>
      <button
        onClick={handleCopy}
        className={`p-1.5 rounded-md transition-all ${buttonClass}`}
        title={copied ? 'Copied!' : 'Copy email address'}
        aria-label={copied ? 'Email copied' : 'Copy email address'}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
