import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, Locale, rtlLocales } from '@/i18n/config';
import Layout from '@/components/Layout';
import FirebaseAnalytics from '@/components/FirebaseAnalytics';
import GoogleAdsTracking from '@/components/GoogleAdsTracking';

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// JSON-LD structured data for local business
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://proplastics.us',
  name: 'Pro Plastics Inc.',
  image: 'https://proplastics.us/images/ppi-building.jpg',
  description:
    'Precision plastic manufacturing and fabrication since 1968. CNC machining, custom fabrication, and material distribution.',
  url: 'https://proplastics.us',
  telephone: '+1-866-925-5000',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '1190 Sylvan St',
    addressLocality: 'Linden',
    addressRegion: 'NJ',
    postalCode: '07036',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 40.6234,
    longitude: -74.2654,
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '08:30',
    closes: '16:00',
  },
  sameAs: [],
  priceRange: '$$',
  foundingDate: '1968',
  areaServed: {
    '@type': 'Country',
    name: 'United States',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Plastic Manufacturing Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'CNC Machining',
          description: 'Precision CNC machining of engineering plastics',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Custom Fabrication',
          description: 'Custom plastic fabrication and assembly',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Material Distribution',
          description: 'Engineering plastic sheets, rods, and tubes',
        },
      },
    ],
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for this locale
  const messages = await getMessages();

  // Determine text direction based on locale
  const isRtl = rtlLocales.includes(locale as Locale);
  const dir = isRtl ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <FirebaseAnalytics />
        <GoogleAdsTracking />
        <NextIntlClientProvider messages={messages}>
          <Layout>{children}</Layout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
