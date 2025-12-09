'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  ChevronDown,
  ArrowRight,
  Download,
  CheckCircle,
  X,
} from 'lucide-react';

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
    properties: ['High Temperature', 'Chemical Resistant', 'FDA Compliant', 'Low Friction'],
    applications: ['Aerospace', 'Medical', 'Semiconductor'],
    forms: ['Sheet', 'Rod', 'Tube'],
    tempRange: '-100°F to +480°F',
    description: 'Premium high-performance thermoplastic with excellent mechanical properties at elevated temperatures.',
    color: 'from-amber-600 to-amber-800',
  },
  {
    id: 'ultem',
    name: 'Ultem (PEI)',
    category: 'High Performance',
    properties: ['High Temperature', 'Chemical Resistant', 'Flame Retardant'],
    applications: ['Aerospace', 'Electronics', 'Medical'],
    forms: ['Sheet', 'Rod'],
    tempRange: '-40°F to +340°F',
    description: 'Polyetherimide with high strength, stiffness, and broad chemical resistance.',
    color: 'from-amber-500 to-amber-700',
  },
  {
    id: 'delrin',
    name: 'Delrin (Acetal)',
    category: 'Engineering',
    properties: ['Low Friction', 'Wear Resistant', 'Machinable'],
    applications: ['Automotive', 'Electronics', 'Food Processing'],
    forms: ['Sheet', 'Rod', 'Tube'],
    tempRange: '-40°F to +180°F',
    description: 'High-strength acetal homopolymer with excellent dimensional stability and machinability.',
    color: 'from-blue-600 to-blue-800',
  },
  {
    id: 'nylon',
    name: 'Nylon 6/6',
    category: 'Engineering',
    properties: ['Wear Resistant', 'Impact Resistant', 'Machinable'],
    applications: ['Automotive', 'Electronics', 'Industrial'],
    forms: ['Sheet', 'Rod', 'Tube'],
    tempRange: '-60°F to +210°F',
    description: 'Versatile engineering plastic with excellent wear resistance and mechanical properties.',
    color: 'from-blue-500 to-blue-700',
  },
  {
    id: 'teflon',
    name: 'PTFE (Teflon)',
    category: 'Fluoropolymer',
    properties: ['Chemical Resistant', 'Low Friction', 'High Temperature', 'FDA Compliant'],
    applications: ['Chemical Processing', 'Food Processing', 'Semiconductor'],
    forms: ['Sheet', 'Rod', 'Tube'],
    tempRange: '-450°F to +500°F',
    description: 'Exceptional chemical resistance and lowest coefficient of friction of any solid material.',
    color: 'from-emerald-600 to-emerald-800',
  },
  {
    id: 'uhmw',
    name: 'UHMW Polyethylene',
    category: 'Standard',
    properties: ['Wear Resistant', 'Impact Resistant', 'Low Friction', 'FDA Compliant'],
    applications: ['Food Processing', 'Material Handling', 'Industrial'],
    forms: ['Sheet', 'Rod'],
    tempRange: '-200°F to +180°F',
    description: 'Ultra high molecular weight PE with outstanding abrasion resistance and impact strength.',
    color: 'from-slate-500 to-slate-700',
  },
  {
    id: 'polycarbonate',
    name: 'Polycarbonate',
    category: 'Standard',
    properties: ['Impact Resistant', 'Optically Clear', 'Flame Retardant'],
    applications: ['Electronics', 'Safety', 'Glazing'],
    forms: ['Sheet', 'Rod', 'Tube'],
    tempRange: '-40°F to +250°F',
    description: 'Virtually unbreakable with excellent optical clarity and impact resistance.',
    color: 'from-slate-400 to-slate-600',
  },
  {
    id: 'acrylic',
    name: 'Acrylic (PMMA)',
    category: 'Standard',
    properties: ['Optically Clear', 'UV Resistant', 'Machinable'],
    applications: ['Display', 'Lighting', 'Glazing'],
    forms: ['Sheet', 'Rod', 'Tube'],
    tempRange: '-40°F to +180°F',
    description: 'Crystal clear thermoplastic with excellent optical properties and weather resistance.',
    color: 'from-sky-400 to-sky-600',
  },
  {
    id: 'phenolic',
    name: 'Phenolic (Canvas/Linen)',
    category: 'Thermoset',
    properties: ['High Temperature', 'Electrical Insulation', 'Wear Resistant'],
    applications: ['Electrical', 'Industrial', 'Aerospace'],
    forms: ['Sheet', 'Rod', 'Tube'],
    tempRange: '-60°F to +300°F',
    description: 'Fabric-reinforced laminate with excellent electrical and mechanical properties.',
    color: 'from-orange-700 to-orange-900',
  },
  {
    id: 'g10',
    name: 'G-10/FR-4 (Glass Epoxy)',
    category: 'Thermoset',
    properties: ['Electrical Insulation', 'High Strength', 'Chemical Resistant'],
    applications: ['Electrical', 'Electronics', 'Aerospace'],
    forms: ['Sheet', 'Rod'],
    tempRange: '-60°F to +285°F',
    description: 'Glass fabric reinforced epoxy with superior electrical and mechanical properties.',
    color: 'from-lime-600 to-lime-800',
  },
  {
    id: 'pvc',
    name: 'PVC (Type I & II)',
    category: 'Standard',
    properties: ['Chemical Resistant', 'Flame Retardant', 'Machinable'],
    applications: ['Chemical Processing', 'Water Treatment', 'Industrial'],
    forms: ['Sheet', 'Rod', 'Tube'],
    tempRange: '32°F to +140°F',
    description: 'Cost-effective material with good chemical resistance and flame retardancy.',
    color: 'from-gray-500 to-gray-700',
  },
  {
    id: 'hdpe',
    name: 'HDPE',
    category: 'Standard',
    properties: ['Chemical Resistant', 'FDA Compliant', 'Impact Resistant'],
    applications: ['Food Processing', 'Chemical Processing', 'Industrial'],
    forms: ['Sheet', 'Rod'],
    tempRange: '-148°F to +180°F',
    description: 'High-density polyethylene with excellent chemical resistance and low moisture absorption.',
    color: 'from-stone-500 to-stone-700',
  },
];

const categories = ['All', 'High Performance', 'Engineering', 'Fluoropolymer', 'Thermoset', 'Standard'];
const allProperties = Array.from(new Set(materials.flatMap((m) => m.properties)));
const allApplications = Array.from(new Set(materials.flatMap((m) => m.applications)));

export default function MaterialsPage() {
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
              Material Database
            </h1>
            <p className="text-xl text-steel-300 leading-relaxed">
              Explore our comprehensive inventory of engineering plastics. Find
              the perfect material for your application with our searchable
              database.
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
                placeholder="Search materials by name or description..."
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
              Filters
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-industrial-blue-900 text-white'
                    : 'bg-white text-steel-600 hover:bg-steel-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-industrial-blue-900 mb-3">
                    Properties
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allProperties.map((prop) => (
                      <button
                        key={prop}
                        onClick={() => toggleProperty(prop)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedProperties.includes(prop)
                            ? 'bg-precision-orange-400 text-white'
                            : 'bg-steel-100 text-steel-600 hover:bg-steel-200'
                        }`}
                      >
                        {prop}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-industrial-blue-900 mb-3">
                    Applications
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allApplications.map((app) => (
                      <button
                        key={app}
                        onClick={() => toggleApplication(app)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedApplications.includes(app)
                            ? 'bg-precision-orange-400 text-white'
                            : 'bg-steel-100 text-steel-600 hover:bg-steel-200'
                        }`}
                      >
                        {app}
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
              <span className="text-sm text-steel-500">Active filters:</span>
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1 bg-steel-200 text-steel-700 rounded-full text-sm hover:bg-steel-300 transition-colors"
              >
                Clear all <X className="w-4 h-4" />
              </button>
              <span className="text-sm text-steel-500">
                ({filteredMaterials.length} of {materials.length} materials)
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
                No materials match your current filters.
              </p>
              <button
                onClick={clearFilters}
                className="text-precision-orange-500 font-medium hover:underline"
              >
                Clear filters
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
                      {material.name}
                    </h3>

                    <p className="text-steel-500 text-sm mb-4 line-clamp-2">
                      {material.description}
                    </p>

                    <div className="space-y-3 mb-4">
                      <div>
                        <span className="text-xs font-medium text-steel-400 uppercase">
                          Temp Range
                        </span>
                        <p className="text-sm text-steel-700 font-mono">
                          {material.tempRange}
                        </p>
                      </div>

                      <div>
                        <span className="text-xs font-medium text-steel-400 uppercase">
                          Available Forms
                        </span>
                        <div className="flex gap-2 mt-1">
                          {material.forms.map((form) => (
                            <span
                              key={form}
                              className="px-2 py-0.5 bg-steel-100 text-steel-600 rounded text-xs"
                            >
                              {form}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-medium text-steel-400 uppercase">
                          Key Properties
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {material.properties.slice(0, 3).map((prop) => (
                            <span
                              key={prop}
                              className="flex items-center gap-1 text-xs text-green-700"
                            >
                              <CheckCircle className="w-3 h-3" />
                              {prop}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-steel-100 flex justify-between items-center">
                      <Link
                        href={`/materials/${material.id}`}
                        className="text-precision-orange-500 font-medium text-sm hover:underline flex items-center gap-1"
                      >
                        View Details <ArrowRight className="w-4 h-4" />
                      </Link>
                      <button className="text-steel-400 hover:text-steel-600 transition-colors">
                        <Download className="w-5 h-5" />
                      </button>
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
            <h2 className="section-heading">Material Resources</h2>
            <p className="section-subheading mx-auto">
              Additional tools to help you select the right material.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/materials/comparison"
              className="card group hover:border-precision-orange-400 border-2 border-transparent"
            >
              <h3 className="text-xl font-semibold text-industrial-blue-900 mb-2">
                Comparison Charts
              </h3>
              <p className="text-steel-500 mb-4">
                Side-by-side property comparisons to help you choose between materials.
              </p>
              <span className="text-precision-orange-500 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                View Charts <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link
              href="/materials/chemical-resistance"
              className="card group hover:border-precision-orange-400 border-2 border-transparent"
            >
              <h3 className="text-xl font-semibold text-industrial-blue-900 mb-2">
                Chemical Resistance Guide
              </h3>
              <p className="text-steel-500 mb-4">
                Comprehensive guide to material compatibility with various chemicals.
              </p>
              <span className="text-precision-orange-500 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                View Guide <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link
              href="/materials/military-specs"
              className="card group hover:border-precision-orange-400 border-2 border-transparent"
            >
              <h3 className="text-xl font-semibold text-industrial-blue-900 mb-2">
                Military Specifications
              </h3>
              <p className="text-steel-500 mb-4">
                Materials meeting MIL-SPEC requirements for defense applications.
              </p>
              <span className="text-precision-orange-500 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                View Specs <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-industrial-blue-900 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">
            Need Help Selecting a Material?
          </h2>
          <p className="text-steel-300 text-lg mb-8 max-w-2xl mx-auto">
            Our material experts can help you choose the right plastic for your
            specific application requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary">
              Contact Our Experts
            </Link>
            <a
              href="tel:+18669255000"
              className="btn-outline border-white text-white hover:bg-white hover:text-industrial-blue-900"
            >
              Call +1 (866) 925-5000
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
