import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Request a Quote',
  description:
    'Request a free quote from Pro Plastics Inc. Fast turnaround on CNC machining, fabrication & custom plastic parts.',
  openGraph: {
    title: 'Request a Quote | Pro Plastics Inc.',
    description:
      'Get a free quote for precision plastic manufacturing. 24-hour quote turnaround available.',
  },
};

export default function QuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
