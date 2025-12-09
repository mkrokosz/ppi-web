import { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Breadcrumb from '@/components/Breadcrumb';
import { locales } from '@/i18n/config';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'Material Comparison Charts',
  description:
    'Compare engineering plastic properties side-by-side. Temperature, strength, chemical resistance, and more for PEEK, Ultem, Delrin, Nylon, PTFE, UHMW.',
};

const comparisonData = [
  {
    propertyKey: 'maxServiceTemp',
    peek: '480°F',
    ultem: '340°F',
    delrin: '180°F',
    nylon: '210°F',
    ptfe: '500°F',
    uhmw: '180°F',
  },
  {
    propertyKey: 'tensileStrength',
    peek: '16,000',
    ultem: '15,200',
    delrin: '10,000',
    nylon: '12,000',
    ptfe: '3,500',
    uhmw: '5,600',
  },
  {
    propertyKey: 'flexuralModulus',
    peek: '595,000',
    ultem: '480,000',
    delrin: '410,000',
    nylon: '400,000',
    ptfe: '80,000',
    uhmw: '100,000',
  },
  {
    propertyKey: 'impactStrength',
    peek: 'excellent',
    ultem: 'good',
    delrin: 'good',
    nylon: 'excellent',
    ptfe: 'good',
    uhmw: 'excellent',
    isRating: true,
  },
  {
    propertyKey: 'chemicalResistance',
    peek: 'excellent',
    ultem: 'good',
    delrin: 'good',
    nylon: 'fair',
    ptfe: 'excellent',
    uhmw: 'excellent',
    isRating: true,
  },
  {
    propertyKey: 'wearResistance',
    peek: 'excellent',
    ultem: 'good',
    delrin: 'excellent',
    nylon: 'good',
    ptfe: 'fair',
    uhmw: 'excellent',
    isRating: true,
  },
  {
    propertyKey: 'machinability',
    peek: 'good',
    ultem: 'good',
    delrin: 'excellent',
    nylon: 'good',
    ptfe: 'fair',
    uhmw: 'good',
    isRating: true,
  },
  {
    propertyKey: 'fdaCompliant',
    peek: 'yes',
    ultem: 'no',
    delrin: 'yes',
    nylon: 'yes',
    ptfe: 'yes',
    uhmw: 'yes',
    isYesNo: true,
  },
  {
    propertyKey: 'relativeCost',
    peek: '$$$$$',
    ultem: '$$$$',
    delrin: '$$',
    nylon: '$$',
    ptfe: '$$$',
    uhmw: '$',
  },
];

const materials = [
  { name: 'PEEK', color: 'from-amber-600 to-amber-700', bgLight: 'bg-amber-50', text: 'text-amber-800' },
  { name: 'Ultem', color: 'from-amber-500 to-amber-600', bgLight: 'bg-amber-50', text: 'text-amber-700' },
  { name: 'Delrin', color: 'from-blue-600 to-blue-700', bgLight: 'bg-blue-50', text: 'text-blue-800' },
  { name: 'Nylon', color: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50', text: 'text-blue-700' },
  { name: 'PTFE', color: 'from-emerald-600 to-emerald-700', bgLight: 'bg-emerald-50', text: 'text-emerald-800' },
  { name: 'UHMW', color: 'from-slate-500 to-slate-600', bgLight: 'bg-slate-50', text: 'text-slate-700' },
];

const selectionGuideKeys = [
  'highTemperature',
  'chemicalResistance',
  'wearResistance',
  'fdaCompliance',
  'lowCost',
  'easyMachining',
];

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('comparison');

  // Helper function to get cell value - translate ratings, keep numbers as-is
  const getCellValue = (row: typeof comparisonData[0], key: 'peek' | 'ultem' | 'delrin' | 'nylon' | 'ptfe' | 'uhmw') => {
    const value = row[key];
    if ('isRating' in row && row.isRating) {
      return t(`ratings.${value}`);
    }
    if ('isYesNo' in row && row.isYesNo) {
      return t(`ratings.${value}`);
    }
    return value;
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-industrial-blue-900 to-industrial-blue-800 text-white py-20">
        <div className="container-custom">
          <Breadcrumb
            items={[
              { label: t('breadcrumb.materials'), href: '/materials' },
              { label: t('breadcrumb.comparison') },
            ]}
          />
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

      {/* Comparison Table */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-industrial-blue-900">
              {t('tableTitle')}
            </h2>
            <p className="text-steel-500">
              {t('tableSubtitle')}
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-steel-200">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 font-semibold bg-steel-100 text-industrial-blue-900">{t('property')}</th>
                  {materials.map((material) => (
                    <th key={material.name} className={`text-center p-4 font-semibold text-white bg-gradient-to-br ${material.color}`}>
                      {material.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={row.propertyKey}>
                    <td className={`p-4 font-medium text-industrial-blue-900 border-b border-steel-200 ${index % 2 === 0 ? 'bg-steel-50' : 'bg-white'}`}>
                      {t(`properties.${row.propertyKey}`)}
                    </td>
                    <td className={`p-4 text-center font-medium border-b border-steel-200 ${materials[0].text} ${index % 2 === 0 ? materials[0].bgLight : 'bg-white'}`}>
                      {getCellValue(row, 'peek')}
                    </td>
                    <td className={`p-4 text-center font-medium border-b border-steel-200 ${materials[1].text} ${index % 2 === 0 ? materials[1].bgLight : 'bg-white'}`}>
                      {getCellValue(row, 'ultem')}
                    </td>
                    <td className={`p-4 text-center font-medium border-b border-steel-200 ${materials[2].text} ${index % 2 === 0 ? materials[2].bgLight : 'bg-white'}`}>
                      {getCellValue(row, 'delrin')}
                    </td>
                    <td className={`p-4 text-center font-medium border-b border-steel-200 ${materials[3].text} ${index % 2 === 0 ? materials[3].bgLight : 'bg-white'}`}>
                      {getCellValue(row, 'nylon')}
                    </td>
                    <td className={`p-4 text-center font-medium border-b border-steel-200 ${materials[4].text} ${index % 2 === 0 ? materials[4].bgLight : 'bg-white'}`}>
                      {getCellValue(row, 'ptfe')}
                    </td>
                    <td className={`p-4 text-center font-medium border-b border-steel-200 ${materials[5].text} ${index % 2 === 0 ? materials[5].bgLight : 'bg-white'}`}>
                      {getCellValue(row, 'uhmw')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-steel-500 text-sm mt-4">
            {t('disclaimer')}
          </p>
        </div>
      </section>

      {/* Material Selection Guide */}
      <section className="py-16 bg-steel-50">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-industrial-blue-900 mb-8">
            {t('quickGuide')}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectionGuideKeys.map((key) => (
              <div key={key} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-industrial-blue-900 mb-2">
                  {t(`selectionGuide.${key}.need`)}
                </h3>
                <p className="text-precision-orange-500 font-medium mb-2">
                  {t(`selectionGuide.${key}.materials`)}
                </p>
                <p className="text-steel-500 text-sm">{t(`selectionGuide.${key}.note`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-industrial-blue-900 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t('needHelp.title')}
          </h2>
          <p className="text-steel-300 text-lg mb-8 max-w-2xl mx-auto">
            {t('needHelp.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary">
              {t('needHelp.contactExperts')}
            </Link>
            <Link href="/materials" className="btn-outline border-white text-white hover:bg-white hover:text-industrial-blue-900">
              {t('needHelp.browseAll')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
