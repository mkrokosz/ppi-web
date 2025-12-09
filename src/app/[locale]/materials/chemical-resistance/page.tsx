'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

type Resistance = 'E' | 'G' | 'F' | 'N';

interface ChemicalData {
  chemical: string;
  category: string;
  peek: Resistance;
  ptfe: Resistance;
  delrin: Resistance;
  nylon: Resistance;
  uhmw: Resistance;
  pvc: Resistance;
}

const resistanceData: ChemicalData[] = [
  { chemical: 'Acetone', category: 'Solvents', peek: 'E', ptfe: 'E', delrin: 'G', nylon: 'F', uhmw: 'E', pvc: 'N' },
  { chemical: 'Sulfuric Acid (10%)', category: 'Acids', peek: 'E', ptfe: 'E', delrin: 'G', nylon: 'N', uhmw: 'E', pvc: 'E' },
  { chemical: 'Sulfuric Acid (50%)', category: 'Acids', peek: 'E', ptfe: 'E', delrin: 'F', nylon: 'N', uhmw: 'G', pvc: 'G' },
  { chemical: 'Hydrochloric Acid (10%)', category: 'Acids', peek: 'E', ptfe: 'E', delrin: 'G', nylon: 'N', uhmw: 'E', pvc: 'E' },
  { chemical: 'Sodium Hydroxide (10%)', category: 'Bases', peek: 'E', ptfe: 'E', delrin: 'E', nylon: 'G', uhmw: 'E', pvc: 'E' },
  { chemical: 'Sodium Hydroxide (50%)', category: 'Bases', peek: 'E', ptfe: 'E', delrin: 'G', nylon: 'F', uhmw: 'E', pvc: 'G' },
  { chemical: 'Gasoline', category: 'Fuels', peek: 'E', ptfe: 'E', delrin: 'E', nylon: 'E', uhmw: 'E', pvc: 'N' },
  { chemical: 'Diesel Fuel', category: 'Fuels', peek: 'E', ptfe: 'E', delrin: 'E', nylon: 'E', uhmw: 'E', pvc: 'F' },
  { chemical: 'Ethanol', category: 'Alcohols', peek: 'E', ptfe: 'E', delrin: 'E', nylon: 'E', uhmw: 'E', pvc: 'E' },
  { chemical: 'Methanol', category: 'Alcohols', peek: 'E', ptfe: 'E', delrin: 'E', nylon: 'G', uhmw: 'E', pvc: 'E' },
  { chemical: 'Bleach (Sodium Hypochlorite)', category: 'Oxidizers', peek: 'E', ptfe: 'E', delrin: 'G', nylon: 'F', uhmw: 'E', pvc: 'E' },
  { chemical: 'Hydrogen Peroxide (30%)', category: 'Oxidizers', peek: 'E', ptfe: 'E', delrin: 'G', nylon: 'F', uhmw: 'G', pvc: 'G' },
  { chemical: 'Ammonia', category: 'Bases', peek: 'E', ptfe: 'E', delrin: 'E', nylon: 'G', uhmw: 'E', pvc: 'E' },
  { chemical: 'Mineral Oil', category: 'Oils', peek: 'E', ptfe: 'E', delrin: 'E', nylon: 'E', uhmw: 'E', pvc: 'E' },
  { chemical: 'Hydraulic Fluid', category: 'Oils', peek: 'E', ptfe: 'E', delrin: 'E', nylon: 'E', uhmw: 'E', pvc: 'G' },
  { chemical: 'Seawater', category: 'Water', peek: 'E', ptfe: 'E', delrin: 'E', nylon: 'G', uhmw: 'E', pvc: 'E' },
  { chemical: 'Deionized Water', category: 'Water', peek: 'E', ptfe: 'E', delrin: 'E', nylon: 'E', uhmw: 'E', pvc: 'E' },
];

const materials = [
  { name: 'PEEK', color: 'from-amber-600 to-amber-700', bgLight: 'bg-amber-50', text: 'text-amber-800' },
  { name: 'PTFE', color: 'from-emerald-600 to-emerald-700', bgLight: 'bg-emerald-50', text: 'text-emerald-800' },
  { name: 'Delrin', color: 'from-blue-600 to-blue-700', bgLight: 'bg-blue-50', text: 'text-blue-800' },
  { name: 'Nylon', color: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50', text: 'text-blue-700' },
  { name: 'UHMW', color: 'from-slate-500 to-slate-600', bgLight: 'bg-slate-50', text: 'text-slate-700' },
  { name: 'PVC', color: 'from-gray-500 to-gray-600', bgLight: 'bg-gray-50', text: 'text-gray-700' },
];
const categoryKeys = ['all', 'acids', 'bases', 'solvents', 'fuels', 'alcohols', 'oxidizers', 'oils', 'water'];

const ResistanceCell = ({ value }: { value: Resistance }) => {
  const config = {
    E: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: 'Excellent' },
    G: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Good' },
    F: { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Fair' },
    N: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Not Recommended' },
  };

  const { icon: Icon, color, bg } = config[value];

  return (
    <div className={`flex items-center justify-center p-2 rounded ${bg}`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
  );
};

export default function ChemicalResistancePage() {
  const t = useTranslations('chemicalResistance');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredData = resistanceData.filter((row) => {
    const matchesSearch = row.chemical.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || row.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-industrial-blue-900 to-industrial-blue-800 text-white py-20">
        <div className="container-custom">
          <div className="flex items-center gap-2 text-steel-300 text-sm mb-4">
            <Link href="/materials" className="hover:text-white">{t('breadcrumb.materials')}</Link>
            <span>/</span>
            <span>{t('breadcrumb.chemicalResistance')}</span>
          </div>
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

      {/* Legend */}
      <section className="py-6 bg-steel-50 border-b border-steel-200">
        <div className="container-custom">
          <div className="flex flex-wrap items-center gap-6 justify-center">
            <span className="text-steel-600 font-medium">{t('legend')}</span>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">{t('excellent')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <span className="text-sm">{t('good')}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-sm">{t('fair')}</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm">{t('notRecommended')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-white border-b border-steel-200">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-steel-400" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-steel-300 focus:border-industrial-blue-500 focus:ring-2 focus:ring-industrial-blue-200 outline-none transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryKeys.map((categoryKey) => (
                <button
                  key={categoryKey}
                  onClick={() => setSelectedCategory(categoryKey)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === categoryKey
                      ? 'bg-industrial-blue-900 text-white'
                      : 'bg-steel-100 text-steel-600 hover:bg-steel-200'
                  }`}
                >
                  {t(`categories.${categoryKey}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="mb-4">
            <p className="text-steel-500">
              {t('showing', { count: filteredData.length, total: resistanceData.length })}
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-steel-200">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 font-semibold bg-steel-100 text-industrial-blue-900">{t('chemical')}</th>
                  <th className="text-left p-4 font-semibold bg-steel-100 text-industrial-blue-900">{t('category')}</th>
                  {materials.map((material) => (
                    <th key={material.name} className={`text-center p-4 font-semibold text-white bg-gradient-to-br ${material.color}`}>
                      {material.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr
                    key={row.chemical}
                    className={index % 2 === 0 ? 'bg-steel-50' : 'bg-white'}
                  >
                    <td className="p-4 font-medium text-industrial-blue-900 border-b border-steel-200">
                      {row.chemical}
                    </td>
                    <td className="p-4 text-steel-600 border-b border-steel-200">
                      {t(`categories.${row.category.toLowerCase()}`)}
                    </td>
                    <td className="p-2 border-b border-steel-200">
                      <ResistanceCell value={row.peek} />
                    </td>
                    <td className="p-2 border-b border-steel-200">
                      <ResistanceCell value={row.ptfe} />
                    </td>
                    <td className="p-2 border-b border-steel-200">
                      <ResistanceCell value={row.delrin} />
                    </td>
                    <td className="p-2 border-b border-steel-200">
                      <ResistanceCell value={row.nylon} />
                    </td>
                    <td className="p-2 border-b border-steel-200">
                      <ResistanceCell value={row.uhmw} />
                    </td>
                    <td className="p-2 border-b border-steel-200">
                      <ResistanceCell value={row.pvc} />
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

      {/* CTA */}
      <section className="py-16 bg-industrial-blue-900 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t('needData.title')}
          </h2>
          <p className="text-steel-300 text-lg mb-8 max-w-2xl mx-auto">
            {t('needData.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary">
              {t('needData.contactExperts')}
            </Link>
            <Link href="/materials" className="btn-outline border-white text-white hover:bg-white hover:text-industrial-blue-900">
              {t('needData.browseAll')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
