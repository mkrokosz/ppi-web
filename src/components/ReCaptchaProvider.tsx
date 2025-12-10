'use client';

import Script from 'next/script';
import { createContext, useContext, useCallback, useState } from 'react';

interface ReCaptchaContextType {
  executeRecaptcha: (action: string) => Promise<string | null>;
  isLoaded: boolean;
}

const ReCaptchaContext = createContext<ReCaptchaContextType>({
  executeRecaptcha: async () => null,
  isLoaded: false,
});

export const useReCaptcha = () => useContext(ReCaptchaContext);

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

interface ReCaptchaProviderProps {
  children: React.ReactNode;
}

export default function ReCaptchaProvider({ children }: ReCaptchaProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const executeRecaptcha = useCallback(
    async (action: string): Promise<string | null> => {
      if (!siteKey) {
        console.warn('reCAPTCHA site key not configured');
        return null;
      }

      if (!isLoaded || typeof window === 'undefined' || !window.grecaptcha) {
        console.warn('reCAPTCHA not loaded yet');
        return null;
      }

      try {
        return await new Promise((resolve) => {
          window.grecaptcha.ready(async () => {
            try {
              const token = await window.grecaptcha.execute(siteKey, { action });
              resolve(token);
            } catch (error) {
              console.error('reCAPTCHA execution error:', error);
              resolve(null);
            }
          });
        });
      } catch (error) {
        console.error('reCAPTCHA error:', error);
        return null;
      }
    },
    [siteKey, isLoaded]
  );

  // Don't render script if no site key configured
  if (!siteKey) {
    return (
      <ReCaptchaContext.Provider value={{ executeRecaptcha, isLoaded: false }}>
        {children}
      </ReCaptchaContext.Provider>
    );
  }

  return (
    <ReCaptchaContext.Provider value={{ executeRecaptcha, isLoaded }}>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
        onLoad={() => setIsLoaded(true)}
        strategy="lazyOnload"
      />
      {children}
    </ReCaptchaContext.Provider>
  );
}
