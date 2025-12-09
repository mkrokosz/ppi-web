import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Material Database',
  description:
    'Browse our comprehensive database of engineering plastics including PEEK, Delrin, UHMW, Teflon, Nylon, Polycarbonate, and more. Filter by properties, applications, and specifications.',
  openGraph: {
    title: 'Engineering Plastics Material Database | Pro Plastics Inc.',
    description:
      '1000+ engineering plastics in stock. PEEK, Delrin, UHMW, Teflon, and more. Filter by temperature, chemical resistance, and FDA compliance.',
  },
};

export default function MaterialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
