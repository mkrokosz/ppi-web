'use client';

import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import CopyableEmail from './CopyableEmail';
import CopyablePhone from './CopyablePhone';
import CopyableAddress from './CopyableAddress';
import { useTranslations } from 'next-intl';
import LanguageSelector from './LanguageSelector';

export default function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const tIndustries = useTranslations('industries');
  const tCommon = useTranslations('common');

  const footerLinks = {
    company: [
      { name: t('links.aboutUs'), href: '/about' },
      { name: t('links.ourTeam'), href: '/about#team' },
      { name: t('links.facilityTour'), href: '/about#facility' },
      { name: t('links.qualityCertifications'), href: '/about#quality' },
      { name: t('links.privacyPolicy'), href: '/privacy' },
    ],
    capabilities: [
      { name: tNav('cncMachining'), href: '/capabilities/cnc-machining' },
      { name: tNav('fabrication'), href: '/capabilities/fabrication' },
      { name: tNav('secondaryOperations'), href: '/capabilities/secondary-operations' },
    ],
    resources: [
      { name: tNav('materialDatabase'), href: '/materials' },
      { name: tNav('comparisonCharts'), href: '/materials/comparison' },
      { name: t('links.chemicalResistanceGuide'), href: '/materials/chemical-resistance' },
      { name: tCommon('requestQuote'), href: '/quote' },
    ],
    industries: [
      { name: tIndustries('aerospace'), href: '/industries/aerospace' },
      { name: tIndustries('medical'), href: '/industries/medical' },
      { name: tIndustries('semiconductor'), href: '/industries/semiconductor' },
      { name: tIndustries('electronics'), href: '/industries/electronics' },
    ],
  };
  return (
    <footer className="bg-industrial-blue-900 text-white">
      {/* Main footer content */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company info */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center gap-0 -ml-5">
              <Image
                src="/images/ppi-logo.png"
                alt="Pro Plastics Inc. logo"
                width={64}
                height={64}
                className="w-16 h-16 drop-shadow-[0_0_4px_rgba(255,255,255,0.3)] -mt-1"
              />
              <div className="flex flex-col">
                <span className="text-2xl font-bold">Pro Plastics Inc.</span>
                <span className="text-sm text-steel-300">
                  {tCommon('since1968')}
                </span>
              </div>
            </div>
            <p className="text-steel-300 mb-6 leading-relaxed">
              {t('tagline')}
            </p>
            <div className="space-y-3">
              <CopyablePhone
                phone="+1 (866) 925-5000"
                phoneRaw="+18669255000"
                location="footer"
                variant="dark"
              />
              <CopyableEmail
                email="sales@proplasticsinc.com"
                location="footer"
                variant="dark"
              />
              <CopyableAddress
                address={tCommon('address')}
                cityStateZip={tCommon('cityStateZip')}
                location="footer"
                variant="dark"
                multiline
              />
              <div className="flex items-center gap-3 text-steel-300">
                <Clock className="w-5 h-5" />
                <span>{tCommon('hours')}</span>
              </div>
            </div>
          </div>

          {/* Company links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('company')}</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-steel-300 hover:text-precision-orange-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Capabilities links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('capabilities')}</h3>
            <ul className="space-y-2">
              {footerLinks.capabilities.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-steel-300 hover:text-precision-orange-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('resources')}</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-steel-300 hover:text-precision-orange-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Industries links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('industries')}</h3>
            <ul className="space-y-2">
              {footerLinks.industries.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-steel-300 hover:text-precision-orange-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-industrial-blue-800">
        <div className="container-custom py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-steel-400 text-sm">
            &copy; {new Date().getFullYear()} {t('copyright')}
          </p>
          {/* Language selector - mobile only, centered */}
          <div className="sm:hidden">
            <LanguageSelector showFullName openAbove />
          </div>
        </div>
      </div>
    </footer>
  );
}
