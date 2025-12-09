import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Request a Quote',
  description:
    'Get a free quote for custom plastic parts within 24 hours. Upload your drawings and specifications. CNC machining, fabrication, and material distribution.',
  openGraph: {
    title: 'Request a Quote | Pro Plastics Inc.',
    description:
      'Free quotes within 24 hours. Upload drawings for CNC machining, fabrication, or material orders. No minimum quantities.',
  },
};

export default function QuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
