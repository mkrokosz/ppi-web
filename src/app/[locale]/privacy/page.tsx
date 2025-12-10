import { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { locales } from '@/i18n/config';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'Privacy Policy | Pro Plastics Inc.',
  description:
    'Privacy policy for Pro Plastics Inc. Learn how we collect, use, and protect your personal information.',
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('privacy');

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-industrial-blue-900 to-industrial-blue-800 text-white py-16">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('title')}
            </h1>
            <p className="text-steel-300">
              {t('lastUpdated')}: December 2024
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto prose prose-lg prose-steel">
            {/* Introduction */}
            <div className="mb-12">
              <p className="text-steel-600 leading-relaxed">
                {t('intro')}
              </p>
            </div>

            {/* Information We Collect */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-industrial-blue-900 mb-4">
                {t('sections.informationCollect.title')}
              </h2>
              <p className="text-steel-600 mb-4">
                {t('sections.informationCollect.description')}
              </p>
              <ul className="list-disc list-inside text-steel-600 space-y-2">
                <li>{t('sections.informationCollect.items.contactInfo')}</li>
                <li>{t('sections.informationCollect.items.companyInfo')}</li>
                <li>{t('sections.informationCollect.items.projectDetails')}</li>
                <li>{t('sections.informationCollect.items.communications')}</li>
                <li>{t('sections.informationCollect.items.websiteUsage')}</li>
              </ul>
            </div>

            {/* How We Use Information */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-industrial-blue-900 mb-4">
                {t('sections.howWeUse.title')}
              </h2>
              <p className="text-steel-600 mb-4">
                {t('sections.howWeUse.description')}
              </p>
              <ul className="list-disc list-inside text-steel-600 space-y-2">
                <li>{t('sections.howWeUse.items.processQuotes')}</li>
                <li>{t('sections.howWeUse.items.communicateOrders')}</li>
                <li>{t('sections.howWeUse.items.improveServices')}</li>
                <li>{t('sections.howWeUse.items.sendUpdates')}</li>
                <li>{t('sections.howWeUse.items.legalCompliance')}</li>
              </ul>
            </div>

            {/* Information Sharing */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-industrial-blue-900 mb-4">
                {t('sections.informationSharing.title')}
              </h2>
              <p className="text-steel-600 mb-4">
                {t('sections.informationSharing.description')}
              </p>
              <ul className="list-disc list-inside text-steel-600 space-y-2">
                <li>{t('sections.informationSharing.items.serviceProviders')}</li>
                <li>{t('sections.informationSharing.items.legalRequirements')}</li>
                <li>{t('sections.informationSharing.items.businessTransfers')}</li>
              </ul>
            </div>

            {/* Data Security */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-industrial-blue-900 mb-4">
                {t('sections.dataSecurity.title')}
              </h2>
              <p className="text-steel-600">
                {t('sections.dataSecurity.description')}
              </p>
            </div>

            {/* Cookies */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-industrial-blue-900 mb-4">
                {t('sections.cookies.title')}
              </h2>
              <p className="text-steel-600">
                {t('sections.cookies.description')}
              </p>
            </div>

            {/* Your Rights */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-industrial-blue-900 mb-4">
                {t('sections.yourRights.title')}
              </h2>
              <p className="text-steel-600 mb-4">
                {t('sections.yourRights.description')}
              </p>
              <ul className="list-disc list-inside text-steel-600 space-y-2">
                <li>{t('sections.yourRights.items.access')}</li>
                <li>{t('sections.yourRights.items.correction')}</li>
                <li>{t('sections.yourRights.items.deletion')}</li>
                <li>{t('sections.yourRights.items.optOut')}</li>
              </ul>
            </div>

            {/* Third-Party Services */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-industrial-blue-900 mb-4">
                {t('sections.thirdParty.title')}
              </h2>
              <p className="text-steel-600">
                {t('sections.thirdParty.description')}
              </p>
            </div>

            {/* Children's Privacy */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-industrial-blue-900 mb-4">
                {t('sections.children.title')}
              </h2>
              <p className="text-steel-600">
                {t('sections.children.description')}
              </p>
            </div>

            {/* Changes to Policy */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-industrial-blue-900 mb-4">
                {t('sections.changes.title')}
              </h2>
              <p className="text-steel-600">
                {t('sections.changes.description')}
              </p>
            </div>

            {/* Contact Us */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-industrial-blue-900 mb-4">
                {t('sections.contact.title')}
              </h2>
              <p className="text-steel-600 mb-4">
                {t('sections.contact.description')}
              </p>
              <div className="bg-steel-50 rounded-lg p-6">
                <p className="text-steel-700 font-semibold">Pro Plastics Inc.</p>
                <p className="text-steel-600">1190 Sylvan St</p>
                <p className="text-steel-600">Linden, NJ 07036, USA</p>
                <p className="text-steel-600 mt-2">
                  Email:{' '}
                  <a
                    href="mailto:sales@proplasticsinc.com"
                    className="text-precision-orange-500 hover:text-precision-orange-600"
                  >
                    sales@proplasticsinc.com
                  </a>
                </p>
                <p className="text-steel-600">
                  Phone:{' '}
                  <a
                    href="tel:+18669255000"
                    className="text-precision-orange-500 hover:text-precision-orange-600"
                  >
                    +1 (866) 925-5000
                  </a>
                </p>
              </div>
            </div>

            {/* Back to Home */}
            <div className="text-center pt-8 border-t border-steel-200">
              <Link
                href="/"
                className="text-precision-orange-500 hover:text-precision-orange-600 font-medium"
              >
                &larr; {t('backToHome')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
