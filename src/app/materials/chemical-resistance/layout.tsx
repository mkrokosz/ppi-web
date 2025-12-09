import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chemical Resistance Guide',
  description:
    'Chemical resistance chart for engineering plastics. Find compatibility of PEEK, PTFE, Delrin, Nylon, UHMW, and PVC with acids, bases, solvents, and more.',
};

export default function ChemicalResistanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
