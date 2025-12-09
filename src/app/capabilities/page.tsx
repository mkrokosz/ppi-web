import { Metadata } from 'next';
import Link from 'next/link';
import {
  Cog,
  Layers,
  Wind,
  Wrench,
  ArrowRight,
  CheckCircle,
  Ruler,
  Settings,
  Target,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Manufacturing Capabilities',
  description:
    'CNC machining, custom fabrication, vacuum forming, and secondary operations. Tolerances to +/-0.001". PEEK, Delrin, UHMW, Teflon, and 1000+ materials.',
  openGraph: {
    title: 'Manufacturing Capabilities | Pro Plastics Inc.',
    description:
      'Precision CNC machining with tolerances to +/-0.001". Custom fabrication, vacuum forming, and complete finishing services.',
  },
};

const capabilities = [
  {
    id: 'cnc-machining',
    icon: Cog,
    title: 'CNC Machining',
    description:
      'State-of-the-art CNC horizontal and vertical machining centers for complex geometries and tight tolerances.',
    features: [
      'Horizontal & vertical machining centers',
      'Multi-axis capability',
      'Tolerances to ±0.001"',
      'Complex 3D contours',
      'Large format capabilities',
    ],
    materials: ['PEEK', 'Ultem', 'Delrin', 'Nylon', 'UHMW', 'Teflon', 'Acetal'],
  },
  {
    id: 'fabrication',
    icon: Layers,
    title: 'Custom Fabrication',
    description:
      'Full-service plastic fabrication including cutting, routing, bonding, and assembly of custom components.',
    features: [
      'Precision cutting & routing',
      'Drilling & tapping',
      'Bending & forming',
      'Solvent & adhesive bonding',
      'Assembly services',
    ],
    materials: ['Acrylic', 'Polycarbonate', 'HDPE', 'PVC', 'ABS', 'Phenolic'],
  },
  {
    id: 'vacuum-forming',
    icon: Wind,
    title: 'Vacuum Forming',
    description:
      'Thermoforming and vacuum forming for enclosures, covers, and custom-shaped components.',
    features: [
      'Custom tooling available',
      'Low to medium volumes',
      'Various thicknesses',
      'Trimming & finishing',
      'Prototype to production',
    ],
    materials: ['ABS', 'PETG', 'Polystyrene', 'Polycarbonate', 'HDPE'],
  },
  {
    id: 'secondary-operations',
    icon: Wrench,
    title: 'Secondary Operations',
    description:
      'Complete finishing services including threading, heat treating, and surface finishing.',
    features: [
      'Threading & tapping',
      'Heat treating/annealing',
      'Surface grinding',
      'Polishing & finishing',
      'Marking & engraving',
    ],
    materials: ['All engineering plastics'],
  },
];

const equipment = [
  { name: 'CNC Horizontal Mills', count: '4' },
  { name: 'CNC Vertical Mills', count: '6' },
  { name: 'CNC Lathes', count: '5' },
  { name: 'Manual Mills', count: '3' },
  { name: 'Band Saws', count: '4' },
  { name: 'Routers', count: '2' },
];

const tolerances = [
  { type: 'Standard', value: '±0.005"' },
  { type: 'Precision', value: '±0.002"' },
  { type: 'High Precision', value: '±0.001"' },
  { type: 'Surface Finish', value: '32 Ra or better' },
];

export default function CapabilitiesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-industrial-blue-900 to-industrial-blue-800 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Manufacturing Capabilities
            </h1>
            <p className="text-xl text-steel-300 leading-relaxed">
              From precision CNC machining to complete fabrication services, we
              have the equipment and expertise to handle your most demanding
              plastic manufacturing requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Capabilities Overview */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">What We Do</h2>
            <p className="section-subheading mx-auto">
              Comprehensive plastic manufacturing services under one roof.
            </p>
          </div>

          <div className="space-y-16">
            {capabilities.map((capability, index) => (
              <div
                key={capability.id}
                id={capability.id}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-industrial-blue-100 rounded-xl flex items-center justify-center">
                      <capability.icon className="w-7 h-7 text-industrial-blue-900" />
                    </div>
                    <h3 className="text-2xl font-bold text-industrial-blue-900">
                      {capability.title}
                    </h3>
                  </div>
                  <p className="text-steel-600 text-lg mb-6">
                    {capability.description}
                  </p>

                  <div className="mb-6">
                    <h4 className="font-semibold text-industrial-blue-900 mb-3">
                      Key Features:
                    </h4>
                    <ul className="space-y-2">
                      {capability.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-steel-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-industrial-blue-900 mb-3">
                      Compatible Materials:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {capability.materials.map((material) => (
                        <span
                          key={material}
                          className="px-3 py-1 bg-steel-100 text-steel-700 rounded-full text-sm"
                        >
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Visual placeholder */}
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="aspect-video bg-gradient-to-br from-steel-100 to-steel-200 rounded-2xl flex items-center justify-center">
                    <div className="text-center p-8">
                      <capability.icon className="w-16 h-16 text-steel-400 mx-auto mb-4" />
                      <p className="text-steel-500">
                        [{capability.title} photo placeholder]
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment & Tolerances */}
      <section className="py-20 bg-steel-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Equipment List */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-8 h-8 text-industrial-blue-900" />
                <h2 className="text-2xl font-bold text-industrial-blue-900">
                  Our Equipment
                </h2>
              </div>
              <p className="text-steel-600 mb-6">
                Modern manufacturing equipment maintained to the highest standards.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {equipment.map((item) => (
                  <div
                    key={item.name}
                    className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center"
                  >
                    <span className="text-steel-700">{item.name}</span>
                    <span className="text-precision-orange-500 font-bold text-xl">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tolerances */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Ruler className="w-8 h-8 text-industrial-blue-900" />
                <h2 className="text-2xl font-bold text-industrial-blue-900">
                  Precision Tolerances
                </h2>
              </div>
              <p className="text-steel-600 mb-6">
                Capable of meeting your most demanding dimensional requirements.
              </p>
              <div className="space-y-4">
                {tolerances.map((tol) => (
                  <div
                    key={tol.type}
                    className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center"
                  >
                    <span className="text-steel-700">{tol.type}</span>
                    <span className="text-industrial-blue-900 font-mono font-bold">
                      {tol.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Overview */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">Our Process</h2>
            <p className="section-subheading mx-auto">
              From quote to delivery, we ensure quality at every step.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {[
              { step: '01', title: 'Quote Request', desc: 'Submit drawings for review' },
              { step: '02', title: 'Engineering Review', desc: 'DFM analysis & material selection' },
              { step: '03', title: 'Production', desc: 'Precision manufacturing' },
              { step: '04', title: 'Quality Check', desc: 'Inspection & verification' },
              { step: '05', title: 'Delivery', desc: 'Secure packaging & shipping' },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-industrial-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">{item.step}</span>
                  </div>
                  <h3 className="font-semibold text-industrial-blue-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-steel-500 text-sm">{item.desc}</p>
                </div>
                {index < 4 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-steel-200 -translate-x-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries CTA */}
      <section className="py-20 bg-industrial-blue-900 text-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Serving Critical Industries
              </h2>
              <p className="text-steel-300 text-lg mb-6">
                Our capabilities support demanding applications in aerospace,
                medical, semiconductor, and other precision industries.
              </p>
              <Link href="/industries" className="btn-primary">
                View Industries
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {['Aerospace', 'Medical', 'Semiconductor', 'Electronics', 'Automotive', 'Chemical'].map(
                (industry) => (
                  <div
                    key={industry}
                    className="bg-white/10 rounded-lg p-4 text-center"
                  >
                    <Target className="w-8 h-8 text-precision-orange-400 mx-auto mb-2" />
                    <span className="text-sm">{industry}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-precision-orange-400 to-precision-orange-500">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Have a Project in Mind?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Send us your drawings and specifications. We&apos;ll provide a detailed
            quote and manufacturing recommendations within 24 hours.
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
