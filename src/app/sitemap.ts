import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://proplastics.us';

  // Main pages
  const mainPages = [
    '',
    '/about',
    '/capabilities',
    '/materials',
    '/industries',
    '/portfolio',
    '/contact',
    '/quote',
  ];

  // Capability sub-pages
  const capabilityPages = [
    '/capabilities/cnc-machining',
    '/capabilities/fabrication',
    '/capabilities/vacuum-forming',
    '/capabilities/secondary-operations',
  ];

  // Material sub-pages
  const materialPages = [
    '/materials/comparison',
    '/materials/chemical-resistance',
    '/materials/military-specs',
  ];

  const allPages = [...mainPages, ...capabilityPages, ...materialPages];

  return allPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route.includes('/') && route.split('/').length > 2 ? 0.6 : 0.8,
  }));
}
