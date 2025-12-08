import Link from 'next/link';
import { ArrowRight, Filter, Cog, Layers, Package, Wrench } from 'lucide-react';

const portfolioItems = [
  {
    id: 1,
    title: 'Precision PEEK Insulators',
    industry: 'Aerospace',
    material: 'PEEK',
    process: 'CNC Machining',
    tolerance: '±0.001"',
    description: 'High-temperature insulators for aircraft electrical systems, machined to exacting tolerances.',
  },
  {
    id: 2,
    title: 'Medical Device Components',
    industry: 'Medical',
    material: 'Ultem',
    process: 'CNC Machining',
    tolerance: '±0.002"',
    description: 'FDA-compliant housings and brackets for diagnostic imaging equipment.',
  },
  {
    id: 3,
    title: 'Semiconductor Wafer Handling',
    industry: 'Semiconductor',
    material: 'PTFE',
    process: 'CNC Machining',
    tolerance: '±0.001"',
    description: 'Ultra-clean wafer carriers and handling fixtures for cleanroom environments.',
  },
  {
    id: 4,
    title: 'Custom Nylon Bushings',
    industry: 'Automotive',
    material: 'Nylon 6/6',
    process: 'CNC Turning',
    tolerance: '±0.003"',
    description: 'High-volume wear-resistant bushings for automotive suspension systems.',
  },
  {
    id: 5,
    title: 'Chemical Processing Valve Seats',
    industry: 'Chemical',
    material: 'PVDF',
    process: 'CNC Machining',
    tolerance: '±0.002"',
    description: 'Corrosion-resistant valve components for aggressive chemical environments.',
  },
  {
    id: 6,
    title: 'Food-Grade Conveyor Parts',
    industry: 'Food Processing',
    material: 'UHMW',
    process: 'Fabrication',
    tolerance: '±0.005"',
    description: 'FDA-compliant wear strips and guide rails for food packaging lines.',
  },
  {
    id: 7,
    title: 'Circuit Board Standoffs',
    industry: 'Electronics',
    material: 'G-10/FR-4',
    process: 'CNC Machining',
    tolerance: '±0.002"',
    description: 'Flame-retardant insulating standoffs for high-density PCB assemblies.',
  },
  {
    id: 8,
    title: 'Optical Lens Housings',
    industry: 'Industrial',
    material: 'Acetal',
    process: 'CNC Machining',
    tolerance: '±0.001"',
    description: 'Precision housings for industrial optical measurement equipment.',
  },
  {
    id: 9,
    title: 'Water Treatment Components',
    industry: 'Water Treatment',
    material: 'CPVC',
    process: 'Fabrication',
    tolerance: '±0.010"',
    description: 'Chemical-resistant fittings and manifolds for municipal water systems.',
  },
];

const categories = ['All', 'Aerospace', 'Medical', 'Semiconductor', 'Electronics', 'Automotive', 'Chemical', 'Food Processing'];

export default function PortfolioPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-industrial-blue-900 to-industrial-blue-800 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Our Work
            </h1>
            <p className="text-xl text-steel-300 leading-relaxed">
              Explore examples of precision plastic components we&apos;ve manufactured
              for clients across diverse industries.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-6 bg-steel-50 border-b border-steel-200 sticky top-[136px] z-40">
        <div className="container-custom">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-steel-500 flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  category === 'All'
                    ? 'bg-industrial-blue-900 text-white'
                    : 'bg-white text-steel-600 hover:bg-steel-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolioItems.map((item) => (
              <div
                key={item.id}
                className="card border border-steel-200 hover:border-precision-orange-400 transition-colors group overflow-hidden"
              >
                {/* Image Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-steel-100 to-steel-200 -mx-6 -mt-6 mb-6 flex items-center justify-center">
                  <div className="text-center">
                    <Cog className="w-12 h-12 text-steel-400 mx-auto mb-2" />
                    <p className="text-steel-400 text-sm">[Part photo]</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-industrial-blue-100 text-industrial-blue-800 rounded text-xs font-medium">
                    {item.industry}
                  </span>
                  <span className="px-2 py-1 bg-steel-100 text-steel-600 rounded text-xs">
                    {item.material}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-industrial-blue-900 mb-2">
                  {item.title}
                </h3>

                <p className="text-steel-500 text-sm mb-4">{item.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-steel-400 text-xs uppercase">Process</span>
                    <p className="text-steel-700">{item.process}</p>
                  </div>
                  <div>
                    <span className="text-steel-400 text-xs uppercase">Tolerance</span>
                    <p className="text-steel-700 font-mono">{item.tolerance}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Note about confidentiality */}
          <div className="mt-12 text-center">
            <p className="text-steel-500 text-sm max-w-2xl mx-auto">
              Due to confidentiality agreements with our clients, we can only share
              limited details about our projects. Contact us for more information
              about our capabilities for your specific application.
            </p>
          </div>
        </div>
      </section>

      {/* Capabilities Summary */}
      <section className="py-16 bg-steel-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">What We Can Do For You</h2>
            <p className="section-subheading mx-auto">
              Our portfolio represents just a sample of our manufacturing
              capabilities.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: Cog,
                title: 'CNC Machining',
                desc: 'Complex geometries with tolerances to ±0.001"',
              },
              {
                icon: Layers,
                title: 'Fabrication',
                desc: 'Cutting, routing, bonding, and assembly',
              },
              {
                icon: Package,
                title: 'Material Distribution',
                desc: '1000+ materials in stock',
              },
              {
                icon: Wrench,
                title: 'Secondary Ops',
                desc: 'Threading, finishing, and more',
              },
            ].map((cap) => (
              <div key={cap.title} className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-12 h-12 bg-industrial-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <cap.icon className="w-6 h-6 text-industrial-blue-900" />
                </div>
                <h3 className="font-semibold text-industrial-blue-900 mb-2">
                  {cap.title}
                </h3>
                <p className="text-steel-500 text-sm">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-precision-orange-400 to-precision-orange-500">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Have a Similar Project?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Send us your drawings and we&apos;ll provide a detailed quote within 24
            hours. No project is too complex.
          </p>
          <Link
            href="/quote"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-precision-orange-500 font-semibold rounded-lg hover:bg-steel-50 transition-colors shadow-lg"
          >
            Request a Quote
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </>
  );
}
