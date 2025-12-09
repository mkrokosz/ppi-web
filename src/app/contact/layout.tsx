import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Contact Pro Plastics Inc. for quotes, questions, or support. Call +1 (866) 925-5000 or visit us in Linden, NJ, USA.',
  openGraph: {
    title: 'Contact Pro Plastics Inc.',
    description:
      'Get in touch with our team. Call +1 (866) 925-5000 or send us a message.',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
