import { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import {
  Wrench,
  CheckCircle,
  ArrowRight,
  Settings,
  Target,
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { locales } from '@/i18n/config';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'Secondary Operations & Finishing',
  description:
    'Plastic finishing: threading, heat treating, grinding, polishing, marking & engraving. Complete part finishing services.',
  openGraph: {
    title: 'Secondary Operations | Pro Plastics Inc.',
    description:
      'Complete plastic finishing including threading, heat treating, polishing & engraving.',
  },
};

const operationKeys = ['threading', 'heatTreatment', 'surfaceGrinding', 'polishing', 'marking', 'bonding', 'assembly', 'packaging'];

export default async function SecondaryOperationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('capabilities');
  const tNav = await getTranslations('nav');
  const tCommon = await getTranslations('common');

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-industrial-blue-900 to-industrial-blue-800 text-white py-20">
        <div className="container-custom">
          <Breadcrumb
            items={[
              { label: tNav('capabilities'), href: '/capabilities' },
              { label: t('secondaryOperations.breadcrumb') },
            ]}
          />
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
                <Wrench className="w-8 h-8 text-precision-orange-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">{t('secondaryOperations.title')}</h1>
            </div>
            <p className="text-xl text-steel-300 leading-relaxed">
              {t('secondaryOperations.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Overview */}
              <div>
                <h2 className="text-2xl font-bold text-industrial-blue-900 mb-4">
                  {t('secondaryOperations.overviewTitle')}
                </h2>
                <p className="text-steel-600 leading-relaxed mb-6">
                  {t('secondaryOperations.overviewParagraph1')}
                </p>
                <p className="text-steel-600 leading-relaxed">
                  {t('secondaryOperations.overviewParagraph2')}
                </p>
              </div>

              {/* Operations Grid */}
              <div>
                <h2 className="text-2xl font-bold text-industrial-blue-900 mb-6">
                  {t('secondaryOperations.servicesTitle')}
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {operationKeys.map((opKey) => (
                    <div key={opKey} className="bg-steel-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-industrial-blue-900">
                            {t(`secondaryOperations.operations.${opKey}.name`)}
                          </h3>
                          <p className="text-steel-600 text-sm mt-1">
                            {t(`secondaryOperations.operations.${opKey}.description`)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Surface Finishes */}
              <div className="bg-industrial-blue-900 text-white rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-6 h-6 text-precision-orange-400" />
                  <h3 className="text-lg font-semibold">{t('secondaryOperations.surfaceFinishes')}</h3>
                </div>
                <ul className="space-y-2">
                  {t.raw('secondaryOperations.finishes').map((finish: string) => (
                    <li key={finish} className="flex items-center gap-2 text-steel-300">
                      <CheckCircle className="w-4 h-4 text-precision-orange-400" />
                      {finish}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div className="bg-steel-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-industrial-blue-900 mb-4">
                  {t('secondaryOperations.benefitsTitle')}
                </h3>
                <ul className="space-y-3">
                  {t.raw('secondaryOperations.benefits').map((benefit: string) => (
                    <li key={benefit} className="flex items-center gap-2 text-steel-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="bg-precision-orange-50 border border-precision-orange-200 rounded-xl p-6">
                <Target className="w-8 h-8 text-precision-orange-500 mb-3" />
                <h3 className="text-lg font-semibold text-industrial-blue-900 mb-2">
                  {t('secondaryOperations.haveProject')}
                </h3>
                <p className="text-steel-600 text-sm mb-4">
                  {t('secondaryOperations.haveProjectDesc')}
                </p>
                <Link href="/quote" className="btn-primary w-full justify-center">
                  {tCommon('requestQuote')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Capabilities */}
      <section className="py-16 bg-steel-50">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-industrial-blue-900 mb-8 text-center">
            {t('secondaryOperations.otherCapabilities')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/capabilities/cnc-machining"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
            >
              <h3 className="font-semibold text-industrial-blue-900 mb-2 group-hover:text-precision-orange-500 transition-colors">
                {t('secondaryOperations.otherCaps.cncMachining.name')}
              </h3>
              <p className="text-steel-500 text-sm">{t('secondaryOperations.otherCaps.cncMachining.desc')}</p>
            </Link>
            <Link
              href="/capabilities/fabrication"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
            >
              <h3 className="font-semibold text-industrial-blue-900 mb-2 group-hover:text-precision-orange-500 transition-colors">
                {t('secondaryOperations.otherCaps.fabrication.name')}
              </h3>
              <p className="text-steel-500 text-sm">{t('secondaryOperations.otherCaps.fabrication.desc')}</p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
