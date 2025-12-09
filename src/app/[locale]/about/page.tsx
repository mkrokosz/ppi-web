import { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import {
  Award,
  Users,
  Target,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { locales } from '@/i18n/config';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'About Pro Plastics Inc.',
  description:
    'Precision plastic manufacturing since 1968 in Linden, NJ. 55+ years serving aerospace, medical & semiconductor industries.',
  openGraph: {
    title: 'About Pro Plastics Inc. | 55+ Years of Precision Manufacturing',
    description:
      'Family-owned precision plastic manufacturer since 1968. ISO certified, serving 12+ industries worldwide.',
  },
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('about');
  const tCommon = await getTranslations('common');

  const timeline = [
    { year: '1968', key: '1968' },
    { year: '1980s', key: '1980s' },
    { year: '1990s', key: '1990s' },
    { year: '2000s', key: '2000s' },
    { year: '2010s', key: '2010s' },
    { year: locale === 'es' ? 'Hoy' : 'Today', key: 'today' },
  ];

  const values = [
    { icon: Target, key: 'qualityFirst' },
    { icon: Clock, key: 'onTimeDelivery' },
    { icon: Users, key: 'customerPartnership' },
    { icon: Shield, key: 'integrity' },
  ];

  const certifications = [
    { key: 'iso' },
    { key: 'fda' },
    { key: 'rohs' },
    { key: 'itar' },
    { key: 'ul' },
    { key: 'milSpec' },
  ];

  const teams = [
    { key: 'leadership' },
    { key: 'engineering' },
    { key: 'production' },
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

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-heading">{t('story.title')}</h2>
              <div className="space-y-4 text-steel-600 leading-relaxed">
                <p>{t('story.paragraph1')}</p>
                <p>{t('story.paragraph2')}</p>
                <p>{t('story.paragraph3')}</p>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-video relative rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/ppi-building.jpg"
                  alt="Pro Plastics Inc. precision plastics manufacturing facility - Linden, New Jersey since 1968"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <p className="text-center text-steel-500 mt-4 font-medium">
                {t('story.facilityCaption')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-steel-50" id="history">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">{t('timeline.title')}</h2>
            <p className="section-subheading mx-auto">
              {t('timeline.subtitle')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 md:left-1/2 transform md:-translate-x-px h-full w-0.5 bg-industrial-blue-200" />

              {timeline.map((item, index) => (
                <div
                  key={item.key}
                  className={`relative flex items-start gap-8 mb-12 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Content */}
                  <div
                    className={`flex-1 ${
                      index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:pl-12'
                    } pl-20 md:pl-0`}
                  >
                    <div className="bg-white rounded-xl p-6 shadow-md">
                      <div className="text-precision-orange-500 font-bold text-lg mb-1">
                        {item.year}
                      </div>
                      <h3 className="text-xl font-semibold text-industrial-blue-900 mb-2">
                        {t(`timeline.${item.key}.title`)}
                      </h3>
                      <p className="text-steel-500">{t(`timeline.${item.key}.description`)}</p>
                    </div>
                  </div>

                  {/* Dot */}
                  <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-precision-orange-400 rounded-full border-4 border-white shadow" />

                  {/* Spacer for alternating layout */}
                  <div className="hidden md:block flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white" id="values">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">{t('values.title')}</h2>
            <p className="section-subheading mx-auto">
              {t('values.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.key} className="text-center">
                <div className="w-16 h-16 bg-industrial-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-industrial-blue-900" />
                </div>
                <h3 className="text-xl font-semibold text-industrial-blue-900 mb-2">
                  {t(`values.${value.key}.title`)}
                </h3>
                <p className="text-steel-500">{t(`values.${value.key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-steel-50" id="team">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">{t('team.title')}</h2>
            <p className="section-subheading mx-auto">
              {t('team.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {teams.map((team) => (
              <div key={team.key} className="bg-white rounded-xl p-8 shadow-md text-center">
                <div className="w-20 h-20 bg-steel-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-10 h-10 text-steel-400" />
                </div>
                <h3 className="text-xl font-semibold text-industrial-blue-900 mb-2">
                  {t(`team.${team.key}.title`)}
                </h3>
                <p className="text-steel-500">{t(`team.${team.key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-20 bg-white" id="quality">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-heading">{t('quality.title')}</h2>
              <p className="text-steel-600 leading-relaxed mb-8">
                {t('quality.description')}
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {certifications.map((cert) => (
                  <div
                    key={cert.key}
                    className="flex items-center gap-3 bg-steel-50 rounded-lg p-4"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-steel-700 text-sm">{t(`quality.certifications.${cert.key}`)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-industrial-blue-900 text-white rounded-2xl p-8">
              <Award className="w-16 h-16 text-precision-orange-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">{t('quality.promise.title')}</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-precision-orange-400 mt-0.5 flex-shrink-0" />
                  <span>{t('quality.promise.item1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-precision-orange-400 mt-0.5 flex-shrink-0" />
                  <span>{t('quality.promise.item2')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-precision-orange-400 mt-0.5 flex-shrink-0" />
                  <span>{t('quality.promise.item3')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-precision-orange-400 mt-0.5 flex-shrink-0" />
                  <span>{t('quality.promise.item4')}</span>
                </li>
              </ul>
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quote" className="btn-primary">
              {tCommon('requestQuote')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link href="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-industrial-blue-900">
              {tCommon('contactUs')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
