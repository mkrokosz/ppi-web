import type { Metadata } from 'next';
import '@/styles/globals.css';

const siteUrl = 'https://proplastics.us';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Pro Plastics Inc. | Precision Plastic Manufacturing Since 1968',
    template: '%s | Pro Plastics Inc.',
  },
  description:
    'Custom plastic manufacturing in Linden, NJ. CNC machining, fabrication & material distribution for aerospace, medical & semiconductor industries since 1968.',
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
      'Custom plastic parts manufacturing and fabrication. CNC machining, fabrication, and material distribution. Serving aerospace, medical, and semiconductor industries.',
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

// Root layout with required html/body tags
// The locale layout will override the lang attribute
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
