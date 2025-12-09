import type { Metadata } from 'next';
import '@/styles/globals.css';
import Layout from '@/components/Layout';

const siteUrl = 'https://proplastics.us';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Pro Plastics Inc. | Precision Plastic Manufacturing Since 1968',
    template: '%s | Pro Plastics Inc.',
  },
  description:
    'Custom plastic parts manufacturing and fabrication in Linden, NJ. CNC machining, vacuum forming, and material distribution. Serving aerospace, medical, semiconductor, and electronics industries for 55+ years.',
  keywords: [
    'plastic manufacturing',
    'CNC machining',
    'custom plastic parts',
    'plastic fabrication',
    'New Jersey manufacturing',
    'precision plastics',
    'PEEK machining',
    'Delrin machining',
    'UHMW',
    'aerospace plastics',
    'medical device plastics',
    'semiconductor plastics',
    'plastic prototype',
    'Linden NJ',
  ],
  authors: [{ name: 'Pro Plastics Inc.' }],
  creator: 'Pro Plastics Inc.',
  publisher: 'Pro Plastics Inc.',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Pro Plastics Inc.',
    title: 'Pro Plastics Inc. | Precision Plastic Manufacturing Since 1968',
    description:
      'Custom plastic parts manufacturing and fabrication. CNC machining, vacuum forming, and material distribution. Serving aerospace, medical, and semiconductor industries.',
    images: [
      {
        url: '/images/ppi-hero-image.jpeg',
        width: 1200,
        height: 630,
        alt: 'Pro Plastics Inc. - Precision CNC Machining',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pro Plastics Inc. | Precision Plastic Manufacturing',
    description:
      'Custom plastic parts manufacturing since 1968. CNC machining, fabrication, and material distribution.',
    images: ['/images/ppi-hero-image.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add these when you have the verification codes
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
};

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
