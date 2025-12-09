import { redirect } from 'next/navigation';
import { defaultLocale, locales } from '@/i18n/config';

export const dynamic = 'force-dynamic';

export default function QuoteThankYouRedirect({
  searchParams,
}: {
  searchParams: { lang?: string };
}) {
  const lang = searchParams.lang;
  const locale = lang && locales.includes(lang as typeof locales[number]) ? lang : defaultLocale;
  redirect(`/${locale}/quote/thank-you`);
}
