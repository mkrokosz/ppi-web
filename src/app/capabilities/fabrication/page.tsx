import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Layers,
  CheckCircle,
  ArrowRight,
  Ruler,
  Settings,
  Target,
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Custom Plastic Fabrication',
  description:
    'Custom plastic fabrication: cutting, routing, drilling, bending, bonding & assembly. Acrylic, polycarbonate, HDPE & more.',
  openGraph: {
    title: 'Custom Plastic Fabrication | Pro Plastics Inc.',
    description:
      'Complete plastic fabrication services including cutting, routing, bonding & assembly.',
  },
};

const features = [
  'Precision cutting & sawing',
  'CNC routing',
  'Drilling & tapping',
  'Bending & forming',
  'Solvent & adhesive bonding',
  'Welding (hot air, ultrasonic)',
  'Assembly services',
  'Custom fixtures & jigs',
];

const materials = [
  'Acrylic', 'Polycarbonate', 'HDPE', 'PVC', 'CPVC',
  'ABS', 'PETG', 'Polypropylene', 'UHMW', 'Nylon',
];

const applications = [
  { industry: 'Industrial', parts: 'Machine guards, covers, enclosures' },
  { industry: 'Display', parts: 'Point-of-purchase displays, signage' },
  { industry: 'Food Processing', parts: 'Conveyor components, guards' },
  { industry: 'Water Treatment', parts: 'Tanks, fittings, manifolds' },
];

export default function FabricationPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-industrial-blue-900 to-industrial-blue-800 text-white py-20">
        <div className="container-custom">
          <Breadcrumb
            items={[
              { label: 'Capabilities', href: '/capabilities' },
              { label: 'Fabrication' },
            ]}
          />
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
                <Layers className="w-8 h-8 text-precision-orange-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Custom Fabrication</h1>
            </div>
            <p className="text-xl text-steel-300 leading-relaxed">
              Full-service plastic fabrication including cutting, routing, bending,
              bonding, and assembly for custom components and assemblies.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Overview */}
              <div>
                <h2 className="text-2xl font-bold text-industrial-blue-900 mb-4">
                  Complete Fabrication Services
                </h2>
                <p className="text-steel-600 leading-relaxed mb-6">
                  Our fabrication department handles everything from simple cut-to-size
                  sheets to complex multi-component assemblies. We combine traditional
                  fabrication techniques with modern CNC equipment to deliver consistent,
                  high-quality results.
                </p>
                <p className="text-steel-600 leading-relaxed">
                  Whether you need a single prototype or production quantities, our
                  experienced fabricators work with a wide range of plastic materials
                  to meet your specifications.
                </p>
              </div>

              {/* Features */}
              <div>
                <h2 className="text-2xl font-bold text-industrial-blue-900 mb-6">
                  Fabrication Capabilities
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 bg-steel-50 rounded-lg p-4">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-steel-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Applications */}
              <div>
                <h2 className="text-2xl font-bold text-industrial-blue-900 mb-6">
                  Common Applications
                </h2>
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.industry} className="bg-steel-50 rounded-lg p-4">
                      <h3 className="font-semibold text-industrial-blue-900 mb-1">
                        {app.industry}
                      </h3>
                      <p className="text-steel-600 text-sm">{app.parts}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fabrication Image */}
              <div className="relative aspect-video rounded-2xl overflow-hidden">
                <Image
                  src="https://proplasticsinc.com/wp-content/uploads/2023/02/PXL_20230207_153444714-Sheet-Mat-l.jpg_1675962529-CROPPED.jpg"
                  alt="Plastic sheet material fabrication"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Materials */}
              <div className="bg-steel-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-6 h-6 text-industrial-blue-900" />
                  <h3 className="text-lg font-semibold text-industrial-blue-900">
                    Materials We Fabricate
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {materials.map((material) => (
                    <span
                      key={material}
                      className="px-3 py-1 bg-white text-steel-700 rounded-full text-sm border border-steel-200"
                    >
                      {material}
                    </span>
                  ))}
                </div>
                <Link
                  href="/materials"
                  className="flex items-center gap-1 text-precision-orange-500 font-medium text-sm mt-4 hover:underline"
                >
                  View all materials <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Size capabilities */}
              <div className="bg-industrial-blue-900 text-white rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Ruler className="w-6 h-6 text-precision-orange-400" />
                  <h3 className="text-lg font-semibold">Size Capabilities</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-steel-300">Max Sheet Size</span>
                    <span className="font-mono">96" x 48"</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-steel-300">Max Thickness</span>
                    <span className="font-mono">4"</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-steel-300">Min Order</span>
                    <span className="font-mono">1 piece</span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-precision-orange-50 border border-precision-orange-200 rounded-xl p-6">
                <Target className="w-8 h-8 text-precision-orange-500 mb-3" />
                <h3 className="text-lg font-semibold text-industrial-blue-900 mb-2">
                  Have a Project?
                </h3>
                <p className="text-steel-600 text-sm mb-4">
                  Send us your drawings for a detailed quote within 24 hours.
                </p>
                <Link href="/quote" className="btn-primary w-full justify-center">
                  Request Quote
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Capabilities */}
      <section className="py-16 bg-steel-50">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-industrial-blue-900 mb-8 text-center">
            Other Capabilities
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'CNC Machining', href: '/capabilities/cnc-machining', desc: 'Precision machining to ±0.001"' },
              { name: 'Secondary Operations', href: '/capabilities/secondary-operations', desc: 'Threading, finishing & more' },
            ].map((cap) => (
              <Link
                key={cap.name}
                href={cap.href}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
              >
                <h3 className="font-semibold text-industrial-blue-900 mb-2 group-hover:text-precision-orange-500 transition-colors">
                  {cap.name}
                </h3>
                <p className="text-steel-500 text-sm">{cap.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
