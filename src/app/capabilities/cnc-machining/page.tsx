import Link from 'next/link';
import {
  Cog,
  CheckCircle,
  ArrowRight,
  Ruler,
  Settings,
  Target,
} from 'lucide-react';

const features = [
  'Horizontal machining centers',
  'Vertical machining centers',
  'Multi-axis capability (3, 4, and 5-axis)',
  'Large format machining up to 48" x 96"',
  'High-speed machining for fine finishes',
  'Complex 3D contours and geometries',
];

const tolerances = [
  { type: 'Standard', value: '±0.005"' },
  { type: 'Precision', value: '±0.002"' },
  { type: 'High Precision', value: '±0.001"' },
];

const materials = [
  'PEEK', 'Ultem (PEI)', 'Torlon (PAI)', 'Vespel',
  'Delrin (Acetal)', 'Nylon 6/6', 'PTFE (Teflon)',
  'UHMW', 'Polycarbonate', 'G-10/FR-4', 'Phenolic',
];

const applications = [
  { industry: 'Aerospace', parts: 'Structural insulators, bearing housings, wear components' },
  { industry: 'Medical', parts: 'Surgical instrument components, diagnostic housings' },
  { industry: 'Semiconductor', parts: 'Wafer handling, process chamber components' },
  { industry: 'Electronics', parts: 'Connector bodies, insulating spacers' },
];

export default function CNCMachiningPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-industrial-blue-900 to-industrial-blue-800 text-white py-20">
        <div className="container-custom">
          <div className="flex items-center gap-2 text-steel-300 text-sm mb-4">
            <Link href="/capabilities" className="hover:text-white">Capabilities</Link>
            <span>/</span>
            <span>CNC Machining</span>
          </div>
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
                <Cog className="w-8 h-8 text-precision-orange-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">CNC Machining</h1>
            </div>
            <p className="text-xl text-steel-300 leading-relaxed">
              State-of-the-art CNC machining centers delivering precision plastic
              components with tolerances as tight as ±0.001" for the most demanding
              applications.
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
                  Precision CNC Machining Services
                </h2>
                <p className="text-steel-600 leading-relaxed mb-6">
                  Our CNC machining department combines advanced multi-axis equipment
                  with decades of plastic machining expertise. Unlike metal machining,
                  plastics require specialized knowledge of material behavior, cutting
                  parameters, and thermal management to achieve optimal results.
                </p>
                <p className="text-steel-600 leading-relaxed">
                  We machine everything from simple turned parts to complex 5-axis
                  components, maintaining tight tolerances while ensuring excellent
                  surface finishes. Our team works with you from design through
                  production to optimize your parts for manufacturability.
                </p>
              </div>

              {/* Features */}
              <div>
                <h2 className="text-2xl font-bold text-industrial-blue-900 mb-6">
                  Equipment & Capabilities
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
                  Industry Applications
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
                  <Cog className="w-16 h-16 text-steel-400 mx-auto mb-4" />
                  <p className="text-steel-500">[CNC machining center photo]</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tolerances */}
              <div className="bg-industrial-blue-900 text-white rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Ruler className="w-6 h-6 text-precision-orange-400" />
                  <h3 className="text-lg font-semibold">Tolerances</h3>
                </div>
                <div className="space-y-3">
                  {tolerances.map((tol) => (
                    <div key={tol.type} className="flex justify-between items-center">
                      <span className="text-steel-300">{tol.type}</span>
                      <span className="font-mono font-bold">{tol.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Materials */}
              <div className="bg-steel-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-6 h-6 text-industrial-blue-900" />
                  <h3 className="text-lg font-semibold text-industrial-blue-900">
                    Materials We Machine
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
              { name: 'Fabrication', href: '/capabilities/fabrication', desc: 'Cutting, routing, bonding & assembly' },
              { name: 'Vacuum Forming', href: '/capabilities/vacuum-forming', desc: 'Thermoforming for enclosures & covers' },
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
