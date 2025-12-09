import { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import {
  Plane,
  Microscope,
  Cpu,
  Zap,
  Car,
  FlaskConical,
  Droplets,
  Building2,
  Leaf,
  Cog,
  Shield,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { locales } from '@/i18n/config';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'Industries We Serve',
  description:
    'Precision plastic components for aerospace, medical, semiconductor, electronics, automotive & more. FDA compliant, MIL-SPEC capable.',
  openGraph: {
    title: 'Industries We Serve | Pro Plastics Inc.',
    description:
      'Precision plastic components for aerospace, medical, semiconductor, and 9+ other industries. FDA compliant, MIL-SPEC, and ISO certified.',
  },
};

const industries = [
  {
    id: 'aerospace',
    icon: Plane,
    materials: ['PEEK', 'Ultem', 'Torlon', 'G-10/FR-4'],
    image: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800&q=80',
    imageAlt: 'Rocket launch with flames and smoke',
  },
  {
    id: 'medical',
    icon: Microscope,
    materials: ['PEEK', 'UHMW', 'Acetal', 'Polycarbonate'],
    image: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=800&q=80',
    imageAlt: 'Medical laboratory equipment and research',
  },
  {
    id: 'semiconductor',
    icon: Cpu,
    materials: ['PEEK', 'PTFE', 'PFA', 'Vespel'],
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    imageAlt: 'Semiconductor chip and circuit board technology',
  },
  {
    id: 'electronics',
    icon: Zap,
    materials: ['G-10/FR-4', 'Phenolic', 'Nylon', 'PBT'],
    image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80',
    imageAlt: 'Electronic circuit board and components',
  },
  {
    id: 'automotive',
    icon: Car,
    materials: ['Nylon', 'Acetal', 'POM', 'HDPE'],
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
    imageAlt: 'Automotive manufacturing and engineering',
  },
  {
    id: 'chemical',
    icon: FlaskConical,
    materials: ['PTFE', 'PVDF', 'PP', 'CPVC'],
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80',
    imageAlt: 'Chemical processing plant and industrial equipment',
  },
  {
    id: 'water',
    icon: Droplets,
    materials: ['UHMW', 'HDPE', 'PVC', 'CPVC'],
    image: 'https://images.unsplash.com/photo-1504297050568-910d24c426d3?w=800&q=80',
    imageAlt: 'Water treatment facility and filtration systems',
  },
  {
    id: 'food',
    icon: Leaf,
    materials: ['UHMW', 'Acetal', 'HDPE', 'Polycarbonate'],
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    imageAlt: 'Food processing and manufacturing facility',
  },
  {
    id: 'construction',
    icon: Building2,
    materials: ['UHMW', 'Nylon', 'HDPE', 'Acetal'],
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    imageAlt: 'Construction site with heavy industrial equipment',
  },
];

export default async function IndustriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('industries');
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

      {/* Industries Grid */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((industry) => (
              <div
                key={industry.id}
                className="card border border-steel-200 hover:border-precision-orange-400 transition-colors group overflow-hidden p-0"
              >
                {/* Industry Image */}
                <div className="relative h-40 w-full">
                  <Image
                    src={industry.image}
                    alt={industry.imageAlt}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-industrial-blue-900/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/90 rounded-lg flex items-center justify-center">
                      <industry.icon className="w-5 h-5 text-industrial-blue-900" />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {t(`items.${industry.id}.name`)}
                    </h3>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-steel-600 mb-4">{t(`items.${industry.id}.description`)}</p>

                <div className="space-y-4 mb-6">
                  <div>
                    <span className="text-xs font-medium text-steel-400 uppercase">
                      {t('commonMaterials')}
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {industry.materials.map((material) => (
                        <span
                          key={material}
                          className="px-2 py-0.5 bg-industrial-blue-50 text-industrial-blue-700 rounded text-xs"
                        >
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-steel-400 uppercase">
                      {t('typicalApplications')}
                    </span>
                    <ul className="mt-1 space-y-1">
                      {[0, 1, 2].map((index) => (
                        <li
                          key={index}
                          className="text-sm text-steel-600 flex items-center gap-2"
                        >
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {t(`items.${industry.id}.applications.${index}`)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-steel-400 uppercase">
                      {t('compliance')}
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {t.raw(`items.${industry.id}.compliance`).map((cert: string) => (
                        <span
                          key={cert}
                          className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs flex items-center gap-1"
                        >
                          <Shield className="w-3 h-3" />
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-Industry Expertise */}
      <section className="py-20 bg-steel-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-heading">{t('crossIndustry.title')}</h2>
              <p className="text-steel-600 text-lg mb-6">
                {t('crossIndustry.description')}
              </p>
              <ul className="space-y-3">
                {[0, 1, 2, 3, 4].map((index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-steel-700">{t(`crossIndustry.features.${index}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <Cog className="w-12 h-12 text-precision-orange-400 mb-4" />
              <h3 className="text-2xl font-bold text-industrial-blue-900 mb-4">
                {t('dontSee.title')}
              </h3>
              <p className="text-steel-600 mb-6">
                {t('dontSee.description')}
              </p>
              <Link href="/contact" className="btn-primary">
                {tCommon('contactUs')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-industrial-blue-900 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-steel-300 text-lg mb-8 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <Link href="/quote" className="btn-primary">
            {tCommon('requestQuote')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </>
  );
}
