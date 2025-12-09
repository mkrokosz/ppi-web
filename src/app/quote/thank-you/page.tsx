'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { defaultLocale, locales } from '@/i18n/config';

export default function QuoteThankYouRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const lang = searchParams.get('lang');
    const locale = lang && locales.includes(lang as typeof locales[number]) ? lang : defaultLocale;
    router.replace(`/${locale}/quote/thank-you`);
  }, [searchParams, router]);

  return null;
}
