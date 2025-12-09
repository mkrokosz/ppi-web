import { Metadata } from 'next';
import Link from 'next/link';
import {
  Wrench,
  CheckCircle,
  ArrowRight,
  Settings,
  Target,
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Secondary Operations & Finishing',
  description:
    'Plastic finishing: threading, heat treating, grinding, polishing, marking & engraving. Complete part finishing services.',
  openGraph: {
    title: 'Secondary Operations | Pro Plastics Inc.',
    description:
      'Complete plastic finishing including threading, heat treating, polishing & engraving.',
  },
};

const operations = [
  {
    name: 'Threading & Tapping',
    description: 'Internal and external threads, helicoil inserts, threaded inserts',
  },
  {
    name: 'Heat Treatment',
    description: 'Annealing to relieve stress and improve dimensional stability',
  },
  {
    name: 'Surface Grinding',
    description: 'Precision surface finishing for tight flatness requirements',
  },
  {
    name: 'Polishing & Finishing',
    description: 'Flame polishing, buffing, and custom surface treatments',
  },
  {
    name: 'Marking & Engraving',
    description: 'Laser marking, engraving, and part identification',
  },
  {
    name: 'Bonding & Welding',
    description: 'Solvent bonding, ultrasonic welding, hot air welding',
  },
  {
    name: 'Assembly',
    description: 'Sub-assembly and full assembly services with hardware',
  },
  {
    name: 'Packaging',
    description: 'Custom packaging for shipping and presentation',
  },
];

const finishes = [
  'As-machined',
  'Flame polished',
  'Buffed/polished',
  'Bead blasted',
  'Sanded (various grits)',
  'Vapor polished',
];

export default function SecondaryOperationsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-industrial-blue-900 to-industrial-blue-800 text-white py-20">
        <div className="container-custom">
          <Breadcrumb
            items={[
              { label: 'Capabilities', href: '/capabilities' },
              { label: 'Secondary Operations' },
            ]}
          />
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
                <Wrench className="w-8 h-8 text-precision-orange-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Secondary Operations</h1>
            </div>
            <p className="text-xl text-steel-300 leading-relaxed">
              Complete finishing services including threading, heat treating,
              surface finishing, marking, and assembly to deliver ready-to-use parts.
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
                  Complete Part Finishing
                </h2>
                <p className="text-steel-600 leading-relaxed mb-6">
                  Our secondary operations department ensures your parts are
                  delivered ready for use. From simple deburring to complex
                  assembly, we handle all the finishing touches that turn
                  machined components into finished products.
                </p>
                <p className="text-steel-600 leading-relaxed">
                  By handling secondary operations in-house, we maintain quality
                  control throughout the entire process and reduce lead times
                  compared to outsourcing these services.
                </p>
              </div>

              {/* Operations Grid */}
              <div>
                <h2 className="text-2xl font-bold text-industrial-blue-900 mb-6">
                  Available Services
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {operations.map((op) => (
                    <div key={op.name} className="bg-steel-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-industrial-blue-900">
                            {op.name}
                          </h3>
                          <p className="text-steel-600 text-sm mt-1">
                            {op.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Surface Finishes */}
              <div className="bg-industrial-blue-900 text-white rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-6 h-6 text-precision-orange-400" />
                  <h3 className="text-lg font-semibold">Surface Finishes</h3>
                </div>
                <ul className="space-y-2">
                  {finishes.map((finish) => (
                    <li key={finish} className="flex items-center gap-2 text-steel-300">
                      <CheckCircle className="w-4 h-4 text-precision-orange-400" />
                      {finish}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div className="bg-steel-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-industrial-blue-900 mb-4">
                  Benefits of In-House Finishing
                </h3>
                <ul className="space-y-3">
                  {[
                    'Single point of contact',
                    'Consistent quality control',
                    'Reduced lead times',
                    'Lower total cost',
                    'Better communication',
                  ].map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-steel-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>
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
