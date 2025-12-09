import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Contact Pro Plastics Inc. in Linden, NJ. Call (866) 925-5000 or email for quotes, technical questions, or material inquiries. Fast response guaranteed.',
  openGraph: {
    title: 'Contact Pro Plastics Inc. | Get in Touch',
    description:
      'Contact our team for quotes, technical support, or material inquiries. Located in Linden, NJ. Call (866) 925-5000.',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
