import { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import {
  Layers,
  CheckCircle,
  ArrowRight,
  Ruler,
  Settings,
  Target,
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { locales } from '@/i18n/config';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'Custom Plastic Fabrication',
  description:
    'Custom plastic fabrication: cutting, routing, drilling, bending, bonding & assembly. Acrylic, polycarbonate, HDPE & more.',
  openGraph: {
    title: 'Custom Plastic Fabrication | Pro Plastics Inc.',
    description:
      'Complete plastic fabrication services including cutting, routing, bonding & assembly.',
  },
};

const materials = [
  'Acrylic', 'Polycarbonate', 'HDPE', 'PVC', 'CPVC',
  'ABS', 'PETG', 'Polypropylene', 'UHMW', 'Nylon',
];

const applicationKeys = ['industrial', 'display', 'foodProcessing', 'waterTreatment'];

export default async function FabricationPage({
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
              { label: t('fabrication.breadcrumb') },
            ]}
          />
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
                <Layers className="w-8 h-8 text-precision-orange-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">{t('fabrication.title')}</h1>
            </div>
            <p className="text-xl text-steel-300 leading-relaxed">
              {t('fabrication.subtitle')}
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
                  {t('fabrication.overviewTitle')}
                </h2>
                <p className="text-steel-600 leading-relaxed mb-6">
                  {t('fabrication.overviewParagraph1')}
                </p>
                <p className="text-steel-600 leading-relaxed">
                  {t('fabrication.overviewParagraph2')}
                </p>
              </div>

              {/* Features */}
              <div>
                <h2 className="text-2xl font-bold text-industrial-blue-900 mb-6">
                  {t('fabrication.capabilitiesTitle')}
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {t.raw('fabrication.features').map((feature: string) => (
                    <div key={feature} className="flex items-start gap-3 bg-steel-50 rounded-lg p-4">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-steel-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Applications */}
              <div>
                <h2 className="text-2xl font-bold text-industrial-blue-900 mb-6">
                  {t('fabrication.applicationsTitle')}
                </h2>
                <div className="space-y-4">
                  {applicationKeys.map((appKey) => (
                    <div key={appKey} className="bg-steel-50 rounded-lg p-4">
                      <h3 className="font-semibold text-industrial-blue-900 mb-1">
                        {t(`fabrication.applications.${appKey}.name`)}
                      </h3>
                      <p className="text-steel-600 text-sm">{t(`fabrication.applications.${appKey}.parts`)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fabrication Image */}
              <div className="relative aspect-video rounded-2xl overflow-hidden">
                <Image
                  src="https://proplasticsinc.com/wp-content/uploads/2023/02/PXL_20230207_153444714-Sheet-Mat-l.jpg_1675962529-CROPPED.jpg"
                  alt={t('fabrication.title')}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Materials */}
              <div className="bg-steel-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-6 h-6 text-industrial-blue-900" />
                  <h3 className="text-lg font-semibold text-industrial-blue-900">
                    {t('fabrication.materialsTitle')}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {materials.map((material) => (
                    <span
                      key={material}
                      className="px-3 py-1 bg-white text-steel-700 rounded-full text-sm border border-steel-200"
                    >
                      {material}
                    </span>
                  ))}
                </div>
                <Link
                  href="/materials"
                  className="flex items-center gap-1 text-precision-orange-500 font-medium text-sm mt-4 hover:underline"
                >
                  {t('fabrication.viewAllMaterials')} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Size capabilities */}
              <div className="bg-industrial-blue-900 text-white rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Ruler className="w-6 h-6 text-precision-orange-400" />
                  <h3 className="text-lg font-semibold">{t('fabrication.sizeCapabilities')}</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-steel-300">{t('fabrication.maxSheetSize')}</span>
                    <span className="font-mono">96&quot; x 48&quot;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-steel-300">{t('fabrication.maxThickness')}</span>
                    <span className="font-mono">4&quot;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-steel-300">{t('fabrication.minOrder')}</span>
                    <span className="font-mono">1 piece</span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-precision-orange-50 border border-precision-orange-200 rounded-xl p-6">
                <Target className="w-8 h-8 text-precision-orange-500 mb-3" />
                <h3 className="text-lg font-semibold text-industrial-blue-900 mb-2">
                  {t('fabrication.haveProject')}
                </h3>
                <p className="text-steel-600 text-sm mb-4">
                  {t('fabrication.haveProjectDesc')}
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
            {t('fabrication.otherCapabilities')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/capabilities/cnc-machining"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
            >
              <h3 className="font-semibold text-industrial-blue-900 mb-2 group-hover:text-precision-orange-500 transition-colors">
                {t('items.cncMachining.title')}
              </h3>
              <p className="text-steel-500 text-sm">{t('secondaryOperations.otherCaps.cncMachining.desc')}</p>
            </Link>
            <Link
              href="/capabilities/secondary-operations"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
            >
              <h3 className="font-semibold text-industrial-blue-900 mb-2 group-hover:text-precision-orange-500 transition-colors">
                {t('items.secondaryOperations.title')}
              </h3>
              <p className="text-steel-500 text-sm">{t('secondaryOperations.otherCaps.fabrication.desc')}</p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
