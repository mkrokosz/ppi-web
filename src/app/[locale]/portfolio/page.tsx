import { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { ArrowRight, Filter, Cog, Layers, Package, Wrench, Camera } from 'lucide-react';
import { locales } from '@/i18n/config';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'Our Work',
  description:
    'View examples of precision plastic components manufactured by Pro Plastics Inc. for aerospace, medical, semiconductor, automotive, and other industries.',
  openGraph: {
    title: 'Portfolio | Pro Plastics Inc.',
    description:
      'Examples of precision CNC machined plastic parts for aerospace, medical devices, semiconductors, and more.',
  },
};

const portfolioItems = [
  {
    id: 1,
    key: 'peekInsulators',
    industryKey: 'aerospace',
    material: 'PEEK',
    processKey: 'cncMachining',
    tolerance: '±0.001"',
  },
  {
    id: 2,
    key: 'medicalDevice',
    industryKey: 'medical',
    material: 'Ultem',
    processKey: 'cncMachining',
    tolerance: '±0.002"',
  },
  {
    id: 3,
    key: 'semiconductorWafer',
    industryKey: 'semiconductor',
    material: 'PTFE',
    processKey: 'cncMachining',
    tolerance: '±0.001"',
  },
  {
    id: 4,
    key: 'nylonBushings',
    industryKey: 'automotive',
    material: 'Nylon 6/6',
    processKey: 'cncTurning',
    tolerance: '±0.003"',
  },
  {
    id: 5,
    key: 'valveSeats',
    industryKey: 'chemical',
    material: 'PVDF',
    processKey: 'cncMachining',
    tolerance: '±0.002"',
  },
  {
    id: 6,
    key: 'conveyorParts',
    industryKey: 'foodProcessing',
    material: 'UHMW',
    processKey: 'fabrication',
    tolerance: '±0.005"',
  },
  {
    id: 7,
    key: 'circuitBoardStandoffs',
    industryKey: 'electronics',
    material: 'G-10/FR-4',
    processKey: 'cncMachining',
    tolerance: '±0.002"',
  },
  {
    id: 8,
    key: 'opticalHousings',
    industryKey: 'industrial',
    material: 'Acetal',
    processKey: 'cncMachining',
    tolerance: '±0.001"',
  },
  {
    id: 9,
    key: 'waterTreatment',
    industryKey: 'waterTreatment',
    material: 'CPVC',
    processKey: 'fabrication',
    tolerance: '±0.010"',
  },
];

const categoryKeys = ['aerospace', 'medical', 'semiconductor', 'electronics', 'automotive', 'chemical', 'foodProcessing'];

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('portfolio');
  const tCommon = await getTranslations('common');

  const capabilities = [
    { icon: Cog, key: 'cncMachining' },
    { icon: Layers, key: 'fabrication' },
    { icon: Package, key: 'materialDistribution' },
    { icon: Wrench, key: 'secondaryOps' },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-industrial-blue-900 to-industrial-blue-800 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t('title')}
            </h1>
            <p className="text-xl text-steel-300 leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-6 bg-steel-50 border-b border-steel-200 sticky top-[136px] z-40">
        <div className="container-custom">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-steel-500 flex-shrink-0" />
            <button
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors bg-industrial-blue-900 text-white"
            >
              {t('filterAll')}
            </button>
            {categoryKeys.map((key) => (
              <button
                key={key}
                className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors bg-white text-steel-600 hover:bg-steel-100"
              >
                {t(`categories.${key}`)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolioItems.map((item) => (
              <div
                key={item.id}
                className="card border border-steel-200 hover:border-precision-orange-400 transition-colors group overflow-hidden"
              >
                {/* Coming Soon Image */}
                <div className="h-16 bg-gradient-to-br from-steel-200 to-steel-300 -mx-6 -mt-6 mb-4 flex items-center justify-center relative overflow-hidden">
                  <div className="flex items-center gap-2 z-10">
                    <Camera className="w-4 h-4 text-steel-500" />
                    <p className="text-steel-600 text-xs font-medium">{t('photoComingSoon')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-industrial-blue-100 text-industrial-blue-800 rounded text-xs font-medium">
                    {t(`categories.${item.industryKey}`)}
                  </span>
                  <span className="px-2 py-1 bg-steel-100 text-steel-600 rounded text-xs">
                    {item.material}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-industrial-blue-900 mb-2">
                  {t(`items.${item.key}.title`)}
                </h3>

                <p className="text-steel-500 text-sm mb-4">{t(`items.${item.key}.description`)}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-steel-400 text-xs uppercase">{t('process')}</span>
                    <p className="text-steel-700">{t(`processes.${item.processKey}`)}</p>
                  </div>
                  <div>
                    <span className="text-steel-400 text-xs uppercase">{t('tolerance')}</span>
                    <p className="text-steel-700 font-mono">{item.tolerance}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Note about confidentiality */}
          <div className="mt-12 text-center">
            <p className="text-steel-500 text-sm max-w-2xl mx-auto">
              {t('confidentiality')}
            </p>
          </div>
        </div>
      </section>

      {/* Capabilities Summary */}
      <section className="py-16 bg-steel-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">{t('whatWeDo')}</h2>
            <p className="section-subheading mx-auto">
              {t('whatWeDoSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {capabilities.map((cap) => (
              <div key={cap.key} className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-12 h-12 bg-industrial-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <cap.icon className="w-6 h-6 text-industrial-blue-900" />
                </div>
                <h3 className="font-semibold text-industrial-blue-900 mb-2">
                  {t(`capabilities.${cap.key}.title`)}
                </h3>
                <p className="text-steel-500 text-sm">{t(`capabilities.${cap.key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-precision-orange-400 to-precision-orange-500">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <Link
            href="/quote"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-precision-orange-500 font-semibold rounded-lg hover:bg-steel-50 transition-colors shadow-lg"
          >
            {tCommon('requestQuote')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </>
  );
}
