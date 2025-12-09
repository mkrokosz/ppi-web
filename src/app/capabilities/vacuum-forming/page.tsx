import { Metadata } from 'next';
import Link from 'next/link';
import {
  Wind,
  CheckCircle,
  ArrowRight,
  Ruler,
  Settings,
  Target,
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Vacuum Forming',
  description:
    'Thermoforming and vacuum forming services for plastic enclosures, covers, and custom-shaped components. ABS, PETG, polycarbonate, and more.',
};

const features = [
  'Custom tooling design & fabrication',
  'Low to medium volume production',
  'Prototype to production capability',
  'Various material thicknesses',
  'Trimming & finishing services',
  'Assembly & secondary operations',
];

const materials = [
  'ABS', 'PETG', 'Polystyrene', 'HIPS',
  'Polycarbonate', 'HDPE', 'Acrylic', 'PVC',
];

const applications = [
  { industry: 'Industrial', parts: 'Equipment covers, machine guards, housings' },
  { industry: 'Medical', parts: 'Device enclosures, trays, covers' },
  { industry: 'Electronics', parts: 'Equipment housings, bezels, panels' },
  { industry: 'Display', parts: 'Point-of-purchase displays, signage' },
];

export default function VacuumFormingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-industrial-blue-900 to-industrial-blue-800 text-white py-20">
        <div className="container-custom">
          <Breadcrumb
            items={[
              { label: 'Capabilities', href: '/capabilities' },
              { label: 'Vacuum Forming' },
            ]}
          />
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
                <Wind className="w-8 h-8 text-precision-orange-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Vacuum Forming</h1>
            </div>
            <p className="text-xl text-steel-300 leading-relaxed">
              Thermoforming and vacuum forming services for enclosures, covers,
              and custom-shaped components with cost-effective tooling.
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
                  Vacuum Forming Services
                </h2>
                <p className="text-steel-600 leading-relaxed mb-6">
                  Vacuum forming offers an economical solution for producing
                  plastic parts with complex shapes. Unlike injection molding,
                  vacuum forming tooling is significantly less expensive, making
                  it ideal for low to medium volume production runs.
                </p>
                <p className="text-steel-600 leading-relaxed">
                  We handle the complete process from tooling design through
                  finished parts, including trimming, drilling, and assembly.
                  Our team can help optimize your design for the vacuum forming
                  process to achieve the best results.
                </p>
              </div>

              {/* Features */}
              <div>
                <h2 className="text-2xl font-bold text-industrial-blue-900 mb-6">
                  Our Capabilities
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

              {/* Image placeholder */}
              <div className="aspect-video bg-gradient-to-br from-steel-100 to-steel-200 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Wind className="w-16 h-16 text-steel-400 mx-auto mb-4" />
                  <p className="text-steel-500">[Vacuum forming equipment photo]</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Size capabilities */}
              <div className="bg-industrial-blue-900 text-white rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Ruler className="w-6 h-6 text-precision-orange-400" />
                  <h3 className="text-lg font-semibold">Size Capabilities</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-steel-300">Max Form Size</span>
                    <span className="font-mono">48" x 48"</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-steel-300">Max Draw Depth</span>
                    <span className="font-mono">12"</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-steel-300">Material Thickness</span>
                    <span className="font-mono">0.020" - 0.250"</span>
                  </div>
                </div>
              </div>

              {/* Materials */}
              <div className="bg-steel-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-6 h-6 text-industrial-blue-900" />
                  <h3 className="text-lg font-semibold text-industrial-blue-900">
                    Formable Materials
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
              { name: 'Fabrication', href: '/capabilities/fabrication', desc: 'Cutting, routing, bonding & assembly' },
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
