import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Quote Request Submitted',
  description: 'Thank you for your quote request. Our team will respond within 24 hours.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function QuoteThankYouPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-industrial-blue-900 to-industrial-blue-800 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Request a Quote
            </h1>
          </div>
        </div>
      </section>

      {/* Thank You Content */}
      <section className="py-20 bg-white">
        <div className="container-custom max-w-2xl">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-industrial-blue-900 mb-4">
              Quote Request Submitted!
            </h2>
            <p className="text-steel-600 text-lg mb-8">
              Thank you for your quote request. Our team will review your
              requirements and get back to you within 24 hours with a detailed
              quote.
            </p>

            <div className="bg-steel-50 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-industrial-blue-900 mb-4">
                What happens next?
              </h3>
              <ol className="space-y-3 text-steel-600">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-precision-orange-400 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </span>
                  <span>Our engineering team reviews your drawings and requirements</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-precision-orange-400 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </span>
                  <span>We&apos;ll reach out if we need any clarification</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-precision-orange-400 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </span>
                  <span>You&apos;ll receive a detailed quote via email within 24 hours</span>
                </li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="btn-secondary">
                Return Home
              </Link>
              <Link href="/capabilities" className="btn-outline">
                View Capabilities
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-steel-200">
              <p className="text-steel-500 text-sm mb-2">Need immediate assistance?</p>
              <a
                href="tel:+18669255000"
                className="inline-flex items-center gap-2 text-precision-orange-500 font-medium hover:underline"
              >
                <Phone className="w-4 h-4" />
                Call (866) 925-5000
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
