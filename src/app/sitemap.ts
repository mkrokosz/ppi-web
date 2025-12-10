import { MetadataRoute } from 'next';
import { locales, defaultLocale } from '@/i18n/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://proplastics.us';

  // All pages (without locale prefix)
  const pages = [
    '',
    '/about',
    '/capabilities',
    '/capabilities/cnc-machining',
    '/capabilities/fabrication',
    '/capabilities/secondary-operations',
    '/materials',
    '/materials/comparison',
    '/materials/chemical-resistance',
    '/industries',
    '/portfolio',
    '/contact',
    '/quote',
    '/privacy',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Generate entries for each page in each locale
  pages.forEach((page) => {
    locales.forEach((locale) => {
      const url = `${baseUrl}/${locale}${page}`;

      // Build alternates object for hreflang
      const languages: Record<string, string> = {};
      locales.forEach((altLocale) => {
        languages[altLocale] = `${baseUrl}/${altLocale}${page}`;
      });
      // Add x-default pointing to default locale
      languages['x-default'] = `${baseUrl}/${defaultLocale}${page}`;

      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? 1 : page.split('/').length > 2 ? 0.6 : 0.8,
        alternates: {
          languages,
        },
      });
    });
  });

  return sitemapEntries;
}
