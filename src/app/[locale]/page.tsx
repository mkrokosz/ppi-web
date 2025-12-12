'use client';

import { Link } from '@/i18n/routing';
import Image from 'next/image';
import {
  Cog,
  Factory,
  Package,
  Microscope,
  Plane,
  Cpu,
  Zap,
  Droplets,
  Car,
  Building2,
  FlaskConical,
  Leaf,
  CheckCircle,
  ArrowRight,
  Quote,
  Clock,
  Award,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const tIndustries = useTranslations('industries');

  const capabilities = [
    {
      icon: Cog,
      title: t('capabilities.cncMachining.title'),
      description: t('capabilities.cncMachining.description'),
      href: '/capabilities/cnc-machining',
    },
    {
      icon: Factory,
      title: t('capabilities.customFabrication.title'),
      description: t('capabilities.customFabrication.description'),
      href: '/capabilities/fabrication',
    },
    {
      icon: Package,
      title: t('capabilities.materialDistribution.title'),
      description: t('capabilities.materialDistribution.description'),
      href: '/materials',
    },
    {
      icon: Microscope,
      title: t('capabilities.prototyping.title'),
      description: t('capabilities.prototyping.description'),
      href: '/capabilities/prototyping',
    },
  ];

  const industries = [
    { icon: Plane, name: tIndustries('aerospace'), href: '/industries/aerospace', image: '/images/industries/thumb/aerospace.jpg' },
    { icon: Microscope, name: tIndustries('medical'), href: '/industries/medical', image: '/images/industries/thumb/medical.jpg' },
    { icon: Cpu, name: tIndustries('semiconductor'), href: '/industries/semiconductor', image: '/images/industries/thumb/semiconductor.jpg' },
    { icon: Zap, name: tIndustries('electronics'), href: '/industries/electronics', image: '/images/industries/thumb/electronics.jpg' },
    { icon: Car, name: tIndustries('automotive'), href: '/industries/automotive', image: '/images/industries/thumb/automotive.jpg' },
    { icon: FlaskConical, name: tIndustries('chemicalProcessing'), href: '/industries/chemical', image: '/images/industries/thumb/chemical.jpg' },
    { icon: Droplets, name: tIndustries('waterTreatment'), href: '/industries/water', image: '/images/industries/thumb/water.jpg' },
    { icon: Building2, name: tIndustries('construction'), href: '/industries/construction', image: '/images/industries/thumb/construction.jpg' },
    { icon: Leaf, name: tIndustries('foodProcessing'), href: '/industries/food', image: '/images/industries/thumb/food.jpg' },
  ];

  const stats = [
    { value: '55+', label: t('stats.yearsExperience') },
    { value: '12', label: t('stats.industriesServed') },
    { value: '1000+', label: t('stats.materialsAvailable') },
    { value: '24hr', label: t('stats.quoteTurnaround') },
  ];

  const testimonials = [
    {
      quote: t('testimonials.testimonial1.quote'),
      author: t('testimonials.testimonial1.author'),
      company: t('testimonials.testimonial1.company'),
    },
    {
      quote: t('testimonials.testimonial2.quote'),
      author: t('testimonials.testimonial2.author'),
      company: t('testimonials.testimonial2.company'),
    },
    {
      quote: t('testimonials.testimonial3.quote'),
      author: t('testimonials.testimonial3.author'),
      company: t('testimonials.testimonial3.company'),
    },
  ];

  const features = [
    t('features.zeroDefect'),
    t('features.onTimeDelivery'),
    t('features.expertGuidance'),
    t('features.competitivePricing'),
    t('features.rapidQuote'),
    t('features.customSolutions'),
  ];
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-industrial-blue-900 via-industrial-blue-800 to-industrial-blue-900 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="container-custom relative py-8 lg:py-12">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
            <div className="lg:pl-12">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm mb-4">
                <Award className="w-4 h-4 text-precision-orange-400" />
                <span>{t('hero.trustedSince')}</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                <span
                  className="text-precision-orange-400 tracking-tight drop-shadow-[0_2px_10px_rgba(237,137,54,0.3)]"
                  style={{
                    textShadow: '0 0 40px rgba(237, 137, 54, 0.4), 0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  Pro Plastics Inc.
                </span>
                <div className="h-1 w-32 bg-gradient-to-r from-precision-orange-400 to-precision-orange-300 rounded-full mt-3" />
              </h1>
              <p className="text-2xl md:text-3xl font-semibold text-white mb-6">
                {t('hero.subtitle')}
              </p>
              <p className="text-xl text-steel-300 mb-8 leading-relaxed">
                {t('hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/quote" className="btn-primary text-lg px-8 py-4">
                  {t('hero.getQuote')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link href="/capabilities" className="btn-outline border-white text-white hover:bg-white hover:text-industrial-blue-900 text-lg px-8 py-4">
                  {t('hero.viewCapabilities')}
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative w-fit">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl w-fit">
                <Image
                  src="/images/ppi-hero-image.jpeg"
                  alt="CNC machine drilling precision plastic component - Pro Plastics Inc. manufacturing"
                  width={600}
                  height={400}
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-industrial-blue-900/30 to-transparent" />
              </div>
              {/* Stats overlay */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center"
                  >
                    <div className="text-xl font-bold text-precision-orange-400 mb-0.5">
                      {stat.value}
                    </div>
                    <div className="text-steel-300 text-xs">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-steel-50 py-6 border-b border-steel-200">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center items-center gap-8 text-steel-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>{t('trustIndicators.isoQuality')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>{t('trustIndicators.madeInUsa')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>{t('trustIndicators.fastTurnaround')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>{t('trustIndicators.expertSupport')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">{t('sections.capabilities.title')}</h2>
            <p className="section-subheading mx-auto">
              {t('sections.capabilities.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((capability) => (
              <Link
                key={capability.title}
                href={capability.href}
                className="card group hover:border-precision-orange-400 border-2 border-transparent"
              >
                <div className="w-14 h-14 bg-industrial-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-precision-orange-100 transition-colors">
                  <capability.icon className="w-7 h-7 text-industrial-blue-900 group-hover:text-precision-orange-500 transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-industrial-blue-900 mb-2">
                  {capability.title}
                </h3>
                <p className="text-steel-500">{capability.description}</p>
                <div className="mt-4 flex items-center text-precision-orange-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {tCommon('learnMore')} <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 bg-steel-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">{t('sections.industries.title')}</h2>
            <p className="section-subheading mx-auto">
              {t('sections.industries.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-9 gap-3">
            {industries.map((industry) => (
              <Link
                key={industry.name}
                href={industry.href}
                className="flex flex-col bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow group overflow-hidden"
              >
                <div className="relative h-16 w-full rounded-t-xl overflow-hidden">
                  <Image
                    src={industry.image}
                    alt={industry.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-industrial-blue-900/50 to-transparent" />
                </div>
                <div className="relative px-2 pt-5 pb-2 flex flex-col items-center">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-industrial-blue-100 rounded-full flex items-center justify-center border-2 border-white group-hover:bg-precision-orange-100 transition-colors">
                    <industry.icon className="w-4 h-4 text-industrial-blue-900 group-hover:text-precision-orange-500 transition-colors" />
                  </div>
                  <span className="text-xs font-medium text-steel-700 text-center">
                    {industry.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-heading">
                {t('sections.whyChooseUs.title')}
              </h2>
              <p className="text-steel-500 text-lg mb-8">
                {t('sections.whyChooseUs.subtitle')}
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 bg-steel-50 rounded-lg p-4"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-steel-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link href="/about" className="btn-secondary">
                  {t('sections.whyChooseUs.learnMore')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] relative rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/ppi-building.jpg"
                  alt="Pro Plastics Inc. manufacturing facility exterior - Linden, New Jersey"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 max-w-xs">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-precision-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-precision-orange-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-industrial-blue-900">
                      {t('quickTurnaround.title')}
                    </div>
                    <div className="text-sm text-steel-500">
                      {t('quickTurnaround.subtitle')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-industrial-blue-900 text-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('sections.testimonials.title')}
            </h2>
            <p className="text-steel-300 max-w-2xl mx-auto">
              {t('sections.testimonials.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-8"
              >
                <Quote className="w-10 h-10 text-precision-orange-400 mb-4" />
                <p className="text-steel-200 mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-steel-400 text-sm">
                    {testimonial.company}
                  </div>
                </div>
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-precision-orange-500 font-semibold rounded-lg hover:bg-steel-50 transition-colors shadow-lg"
            >
              {tCommon('requestQuote')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <a
              href="tel:+18669255000"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              {tCommon('callUs')}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
