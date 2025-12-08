import type { Metadata } from 'next';
import '@/styles/globals.css';
import Layout from '@/components/Layout';

export const metadata: Metadata = {
  title: 'Pro Plastics Inc. | Precision Plastic Manufacturing Since 1968',
  description:
    'Custom plastic parts manufacturing and fabrication. CNC machining, vacuum forming, and material distribution. Serving aerospace, medical, semiconductor industries.',
  keywords: [
    'plastic manufacturing',
    'CNC machining',
    'custom plastic parts',
    'plastic fabrication',
    'New Jersey manufacturing',
  ],
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
