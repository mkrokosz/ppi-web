import { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import {
  Cog,
  Layers,
  Wrench,
  ArrowRight,
  CheckCircle,
  Ruler,
  Settings,
  Target,
} from 'lucide-react';
import { locales } from '@/i18n/config';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'Manufacturing Capabilities',
  description:
    'Precision CNC machining, custom fabrication & finishing. Tolerances to +/-0.001". PEEK, Delrin, UHMW & 1000+ materials.',
  openGraph: {
    title: 'Manufacturing Capabilities | Pro Plastics Inc.',
    description:
      'Precision CNC machining with tolerances to +/-0.001". Custom fabrication and complete finishing services.',
  },
};

const capabilities = [
  {
    id: 'cncMachining',
    icon: Cog,
    materials: ['PEEK', 'Ultem', 'Delrin', 'Nylon', 'UHMW', 'Teflon', 'Acetal'],
    image: 'https://proplasticsinc.com/wp-content/uploads/2023/02/PXL_20230207_151639432-Washers.jpg_1675962659-2048x1536.jpeg',
  },
  {
    id: 'fabrication',
    icon: Layers,
    materials: ['Acrylic', 'Polycarbonate', 'HDPE', 'PVC', 'ABS', 'Phenolic'],
    image: 'https://proplasticsinc.com/wp-content/uploads/2023/02/PXL_20230207_153444714-Sheet-Mat-l.jpg_1675962529-CROPPED.jpg',
  },
  {
    id: 'secondaryOperations',
    icon: Wrench,
    materials: ['All engineering plastics'],
    image: null,
  },
];

const equipment = [
  { key: 'cncHorizontalMills', count: '4' },
  { key: 'cncVerticalMills', count: '6' },
  { key: 'cncLathes', count: '5' },
  { key: 'manualMills', count: '3' },
  { key: 'bandSaws', count: '4' },
  { key: 'routers', count: '2' },
];

const tolerances = [
  { key: 'standard', value: '±0.005"' },
  { key: 'precision', value: '±0.002"' },
  { key: 'highPrecision', value: '±0.001"' },
  { key: 'surfaceFinish', value: '32 Ra or better' },
];

const industryKeys = ['aerospace', 'medical', 'semiconductor', 'electronics', 'automotive', 'chemical'];

export default async function CapabilitiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('capabilities');
  const tCommon = await getTranslations('common');

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

      {/* Capabilities Overview */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">{t('whatWeDo')}</h2>
            <p className="section-subheading mx-auto">
              {t('whatWeDoSubtitle')}
            </p>
          </div>

          <div className="space-y-16">
            {capabilities.map((capability, index) => (
              <div
                key={capability.id}
                id={capability.id}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-industrial-blue-100 rounded-xl flex items-center justify-center">
                      <capability.icon className="w-7 h-7 text-industrial-blue-900" />
                    </div>
                    <h3 className="text-2xl font-bold text-industrial-blue-900">
                      {t(`items.${capability.id}.title`)}
                    </h3>
                  </div>
                  <p className="text-steel-600 text-lg mb-6">
                    {t(`items.${capability.id}.description`)}
                  </p>

                  <div className="mb-6">
                    <h4 className="font-semibold text-industrial-blue-900 mb-3">
                      {t('keyFeatures')}
                    </h4>
                    <ul className="space-y-2">
                      {t.raw(`items.${capability.id}.features`).map((feature: string) => (
                        <li key={feature} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-steel-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-industrial-blue-900 mb-3">
                      {t('compatibleMaterials')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {capability.materials.map((material) => (
                        <span
                          key={material}
                          className="px-3 py-1 bg-steel-100 text-steel-700 rounded-full text-sm"
                        >
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Visual */}
                {capability.image && (
                  <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                    <div className="relative aspect-video rounded-2xl overflow-hidden">
                      <Image
                        src={capability.image}
                        alt={t(`items.${capability.id}.title`)}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment & Tolerances */}
      <section className="py-20 bg-steel-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Equipment List */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-8 h-8 text-industrial-blue-900" />
                <h2 className="text-2xl font-bold text-industrial-blue-900">
                  {t('ourEquipment')}
                </h2>
              </div>
              <p className="text-steel-600 mb-6">
                {t('ourEquipmentSubtitle')}
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {equipment.map((item) => (
                  <div
                    key={item.key}
                    className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center"
                  >
                    <span className="text-steel-700">{t(`equipment.${item.key}`)}</span>
                    <span className="text-precision-orange-500 font-bold text-xl">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tolerances */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Ruler className="w-8 h-8 text-industrial-blue-900" />
                <h2 className="text-2xl font-bold text-industrial-blue-900">
                  {t('precisionTolerances')}
                </h2>
              </div>
              <p className="text-steel-600 mb-6">
                {t('precisionTolerancesSubtitle')}
              </p>
              <div className="space-y-4">
                {tolerances.map((tol) => (
                  <div
                    key={tol.key}
                    className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center"
                  >
                    <span className="text-steel-700">{t(`toleranceTypes.${tol.key}`)}</span>
                    <span className="text-industrial-blue-900 font-mono font-bold">
                      {tol.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Overview */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">{t('ourProcess')}</h2>
            <p className="section-subheading mx-auto">
              {t('ourProcessSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {['step1', 'step2', 'step3', 'step4', 'step5'].map((stepKey, index) => (
              <div key={stepKey} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-industrial-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="font-semibold text-industrial-blue-900 mb-2">
                    {t(`processSteps.${stepKey}.title`)}
                  </h3>
                  <p className="text-steel-500 text-sm">{t(`processSteps.${stepKey}.desc`)}</p>
                </div>
                {index < 4 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-steel-200 -translate-x-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries CTA */}
      <section className="py-20 bg-industrial-blue-900 text-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t('servingIndustries')}
              </h2>
              <p className="text-steel-300 text-lg mb-6">
                {t('servingIndustriesSubtitle')}
              </p>
              <Link href="/industries" className="btn-primary">
                {t('viewIndustries')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {industryKeys.map((industryKey) => (
                  <div
                    key={industryKey}
                    className="bg-white/10 rounded-lg p-4 text-center"
                  >
                    <Target className="w-8 h-8 text-precision-orange-400 mx-auto mb-2" />
                    <span className="text-sm">{t(`industries.${industryKey}`)}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-precision-orange-400 to-precision-orange-500">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('projectCta.title')}
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            {t('projectCta.subtitle')}
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
