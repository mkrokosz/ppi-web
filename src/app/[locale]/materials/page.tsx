'use client';

import { useState, useMemo } from 'react';
import { Link } from '@/i18n/routing';
import {
  Search,
  Filter,
  ChevronDown,
  ArrowRight,
  CheckCircle,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

// Note: Metadata must be exported from a server component, so we use generateMetadata in a separate file
// or rely on the parent layout for client components

interface Material {
  id: string;
  name: string;
  category: string;
  properties: string[];
  applications: string[];
  forms: string[];
  tempRange: string;
  description: string;
  color: string; // Tailwind gradient class for category
}

const materials: Material[] = [
  {
    id: 'peek',
    name: 'PEEK (Polyether Ether Ketone)',
    category: 'High Performance',
    properties: ['highTemperature', 'chemicalResistant', 'fdaCompliant', 'lowFriction'],
    applications: ['aerospace', 'medical', 'semiconductor'],
    forms: ['sheet', 'rod', 'tube'],
    tempRange: '-100°F to +480°F',
    description: 'Premium high-performance thermoplastic with excellent mechanical properties at elevated temperatures.',
    color: 'from-amber-600 to-amber-800',
  },
  {
    id: 'ultem',
    name: 'Ultem (PEI)',
    category: 'High Performance',
    properties: ['highTemperature', 'chemicalResistant', 'flameRetardant'],
    applications: ['aerospace', 'electronics', 'medical'],
    forms: ['sheet', 'rod'],
    tempRange: '-40°F to +340°F',
    description: 'Polyetherimide with high strength, stiffness, and broad chemical resistance.',
    color: 'from-amber-500 to-amber-700',
  },
  {
    id: 'delrin',
    name: 'Delrin (Acetal)',
    category: 'Engineering',
    properties: ['lowFriction', 'wearResistant', 'machinable'],
    applications: ['automotive', 'electronics', 'foodProcessing'],
    forms: ['sheet', 'rod', 'tube'],
    tempRange: '-40°F to +180°F',
    description: 'High-strength acetal homopolymer with excellent dimensional stability and machinability.',
    color: 'from-blue-600 to-blue-800',
  },
  {
    id: 'nylon',
    name: 'Nylon 6/6',
    category: 'Engineering',
    properties: ['wearResistant', 'impactResistant', 'machinable'],
    applications: ['automotive', 'electronics', 'industrial'],
    forms: ['sheet', 'rod', 'tube'],
    tempRange: '-60°F to +210°F',
    description: 'Versatile engineering plastic with excellent wear resistance and mechanical properties.',
    color: 'from-blue-500 to-blue-700',
  },
  {
    id: 'teflon',
    name: 'PTFE (Teflon)',
    category: 'Fluoropolymer',
    properties: ['chemicalResistant', 'lowFriction', 'highTemperature', 'fdaCompliant'],
    applications: ['chemicalProcessing', 'foodProcessing', 'semiconductor'],
    forms: ['sheet', 'rod', 'tube'],
    tempRange: '-450°F to +500°F',
    description: 'Exceptional chemical resistance and lowest coefficient of friction of any solid material.',
    color: 'from-emerald-600 to-emerald-800',
  },
  {
    id: 'uhmw',
    name: 'UHMW Polyethylene',
    category: 'Standard',
    properties: ['wearResistant', 'impactResistant', 'lowFriction', 'fdaCompliant'],
    applications: ['foodProcessing', 'materialHandling', 'industrial'],
    forms: ['sheet', 'rod'],
    tempRange: '-200°F to +180°F',
    description: 'Ultra high molecular weight PE with outstanding abrasion resistance and impact strength.',
    color: 'from-slate-500 to-slate-700',
  },
  {
    id: 'polycarbonate',
    name: 'Polycarbonate',
    category: 'Standard',
    properties: ['impactResistant', 'opticallyClear', 'flameRetardant'],
    applications: ['electronics', 'safety', 'glazing'],
    forms: ['sheet', 'rod', 'tube'],
    tempRange: '-40°F to +250°F',
    description: 'Virtually unbreakable with excellent optical clarity and impact resistance.',
    color: 'from-slate-400 to-slate-600',
  },
  {
    id: 'acrylic',
    name: 'Acrylic (PMMA)',
    category: 'Standard',
    properties: ['opticallyClear', 'uvResistant', 'machinable'],
    applications: ['display', 'lighting', 'glazing'],
    forms: ['sheet', 'rod', 'tube'],
    tempRange: '-40°F to +180°F',
    description: 'Crystal clear thermoplastic with excellent optical properties and weather resistance.',
    color: 'from-sky-400 to-sky-600',
  },
  {
    id: 'phenolic',
    name: 'Phenolic (Canvas/Linen)',
    category: 'Thermoset',
    properties: ['highTemperature', 'electricalInsulation', 'wearResistant'],
    applications: ['electrical', 'industrial', 'aerospace'],
    forms: ['sheet', 'rod', 'tube'],
    tempRange: '-60°F to +300°F',
    description: 'Fabric-reinforced laminate with excellent electrical and mechanical properties.',
    color: 'from-orange-700 to-orange-900',
  },
  {
    id: 'g10',
    name: 'G-10/FR-4 (Glass Epoxy)',
    category: 'Thermoset',
    properties: ['electricalInsulation', 'highStrength', 'chemicalResistant'],
    applications: ['electrical', 'electronics', 'aerospace'],
    forms: ['sheet', 'rod'],
    tempRange: '-60°F to +285°F',
    description: 'Glass fabric reinforced epoxy with superior electrical and mechanical properties.',
    color: 'from-lime-600 to-lime-800',
  },
  {
    id: 'pvc',
    name: 'PVC (Type I & II)',
    category: 'Standard',
    properties: ['chemicalResistant', 'flameRetardant', 'machinable'],
    applications: ['chemicalProcessing', 'waterTreatment', 'industrial'],
    forms: ['sheet', 'rod', 'tube'],
    tempRange: '32°F to +140°F',
    description: 'Cost-effective material with good chemical resistance and flame retardancy.',
    color: 'from-gray-500 to-gray-700',
  },
  {
    id: 'hdpe',
    name: 'HDPE',
    category: 'Standard',
    properties: ['chemicalResistant', 'fdaCompliant', 'impactResistant'],
    applications: ['foodProcessing', 'chemicalProcessing', 'industrial'],
    forms: ['sheet', 'rod'],
    tempRange: '-148°F to +180°F',
    description: 'High-density polyethylene with excellent chemical resistance and low moisture absorption.',
    color: 'from-stone-500 to-stone-700',
  },
];

const categoryKeys = ['all', 'highPerformance', 'engineering', 'fluoropolymer', 'thermoset', 'standard'];
const categoryMap: Record<string, string> = {
  'all': 'All',
  'highPerformance': 'High Performance',
  'engineering': 'Engineering',
  'fluoropolymer': 'Fluoropolymer',
  'thermoset': 'Thermoset',
  'standard': 'Standard',
};
const allPropertyKeys = Array.from(new Set(materials.flatMap((m) => m.properties)));
const allApplicationKeys = Array.from(new Set(materials.flatMap((m) => m.applications)));

export default function MaterialsPage() {
  const t = useTranslations('materials');
  const tCommon = useTranslations('common');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      // Search query filter
      if (
        searchQuery &&
        !material.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !material.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && material.category !== selectedCategory) {
        return false;
      }

      // Properties filter
      if (
        selectedProperties.length > 0 &&
        !selectedProperties.some((prop) => material.properties.includes(prop))
      ) {
        return false;
      }

      // Applications filter
      if (
        selectedApplications.length > 0 &&
        !selectedApplications.some((app) => material.applications.includes(app))
      ) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedProperties, selectedApplications]);

  const toggleProperty = (prop: string) => {
    setSelectedProperties((prev) =>
      prev.includes(prop) ? prev.filter((p) => p !== prop) : [...prev, prop]
    );
  };

  const toggleApplication = (app: string) => {
    setSelectedApplications((prev) =>
      prev.includes(app) ? prev.filter((a) => a !== app) : [...prev, app]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedProperties([]);
    setSelectedApplications([]);
  };

  const hasActiveFilters =
    searchQuery || selectedCategory !== 'All' || selectedProperties.length > 0 || selectedApplications.length > 0;

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

      {/* Search and Filter Section */}
      <section className="py-8 bg-steel-50 border-b border-steel-200 sticky top-[136px] z-40">
        <div className="container-custom">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
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
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-steel-300 rounded-lg hover:bg-steel-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              {t('filters')}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categoryKeys.map((key) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(categoryMap[key])}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === categoryMap[key]
                    ? 'bg-industrial-blue-900 text-white'
                    : 'bg-white text-steel-600 hover:bg-steel-100'
                }`}
              >
                {t(`categories.${key}`)}
              </button>
            ))}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-industrial-blue-900 mb-3">
                    {t('properties')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allPropertyKeys.map((propKey) => (
                      <button
                        key={propKey}
                        onClick={() => toggleProperty(propKey)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedProperties.includes(propKey)
                            ? 'bg-precision-orange-400 text-white'
                            : 'bg-steel-100 text-steel-600 hover:bg-steel-200'
                        }`}
                      >
                        {t(`propertyNames.${propKey}`)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-industrial-blue-900 mb-3">
                    {t('applications')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allApplicationKeys.map((appKey) => (
                      <button
                        key={appKey}
                        onClick={() => toggleApplication(appKey)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedApplications.includes(appKey)
                            ? 'bg-precision-orange-400 text-white'
                            : 'bg-steel-100 text-steel-600 hover:bg-steel-200'
                        }`}
                      >
                        {t(`applicationNames.${appKey}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-steel-500">{t('activeFilters')}</span>
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1 bg-steel-200 text-steel-700 rounded-full text-sm hover:bg-steel-300 transition-colors"
              >
                {t('clearAll')} <X className="w-4 h-4" />
              </button>
              <span className="text-sm text-steel-500">
                {t('showing', { count: filteredMaterials.length, total: materials.length })}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Materials Grid */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-steel-500 text-lg mb-4">
                {t('noResults')}
              </p>
              <button
                onClick={clearFilters}
                className="text-precision-orange-500 font-medium hover:underline"
              >
                {t('clearFilters')}
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => (
                <div
                  key={material.id}
                  className="card border border-steel-200 hover:border-precision-orange-400 transition-colors p-0 overflow-hidden"
                >
                  {/* Material Color Header */}
                  <div className={`relative h-20 w-full bg-gradient-to-br ${material.color}`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white/20 text-6xl font-bold tracking-tighter">
                        {material.id.toUpperCase()}
                      </span>
                    </div>
                    <span className="absolute bottom-2 left-3 px-3 py-1 bg-white/90 text-industrial-blue-800 rounded-full text-xs font-medium">
                      {material.category}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-industrial-blue-900 mb-2">
                      {t(`items.${material.id}.name`)}
                    </h3>

                    <p className="text-steel-500 text-sm mb-4 line-clamp-2">
                      {t(`items.${material.id}.description`)}
                    </p>

                    <div className="space-y-3 mb-4">
                      <div>
                        <span className="text-xs font-medium text-steel-400 uppercase">
                          {t('tempRange')}
                        </span>
                        <p className="text-sm text-steel-700 font-mono">
                          {material.tempRange}
                        </p>
                      </div>

                      <div>
                        <span className="text-xs font-medium text-steel-400 uppercase">
                          {t('availableForms')}
                        </span>
                        <div className="flex gap-2 mt-1">
                          {material.forms.map((formKey) => (
                            <span
                              key={formKey}
                              className="px-2 py-0.5 bg-steel-100 text-steel-600 rounded text-xs"
                            >
                              {t(`forms.${formKey}`)}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-medium text-steel-400 uppercase">
                          {t('keyProperties')}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {material.properties.slice(0, 3).map((propKey) => (
                            <span
                              key={propKey}
                              className="flex items-center gap-1 text-xs text-green-700"
                            >
                              <CheckCircle className="w-3 h-3" />
                              {t(`propertyNames.${propKey}`)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-16 bg-steel-50">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="section-heading">{t('resources.title')}</h2>
            <p className="section-subheading mx-auto">
              {t('resources.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/materials/comparison"
              className="card group hover:border-precision-orange-400 border-2 border-transparent"
            >
              <h3 className="text-xl font-semibold text-industrial-blue-900 mb-2">
                {t('resources.comparison.title')}
              </h3>
              <p className="text-steel-500 mb-4">
                {t('resources.comparison.description')}
              </p>
              <span className="text-precision-orange-500 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                {t('resources.viewCharts')} <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link
              href="/materials/chemical-resistance"
              className="card group hover:border-precision-orange-400 border-2 border-transparent"
            >
              <h3 className="text-xl font-semibold text-industrial-blue-900 mb-2">
                {t('resources.chemicalResistance.title')}
              </h3>
              <p className="text-steel-500 mb-4">
                {t('resources.chemicalResistance.description')}
              </p>
              <span className="text-precision-orange-500 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                {t('resources.viewGuide')} <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link
              href="/materials/military-specs"
              className="card group hover:border-precision-orange-400 border-2 border-transparent"
            >
              <h3 className="text-xl font-semibold text-industrial-blue-900 mb-2">
                {t('resources.milSpec.title')}
              </h3>
              <p className="text-steel-500 mb-4">
                {t('resources.milSpec.description')}
              </p>
              <span className="text-precision-orange-500 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                {t('resources.viewSpecs')} <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-industrial-blue-900 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-steel-300 text-lg mb-8 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary">
              {t('cta.contactExperts')}
            </Link>
            <a
              href="tel:+18669255000"
              className="btn-outline border-white text-white hover:bg-white hover:text-industrial-blue-900"
            >
              {tCommon('callUs')}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
