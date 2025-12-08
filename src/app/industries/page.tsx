import Link from 'next/link';
import {
  Plane,
  Microscope,
  Cpu,
  Zap,
  Car,
  FlaskConical,
  Droplets,
  Building2,
  Leaf,
  Cog,
  Shield,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const industries = [
  {
    id: 'aerospace',
    icon: Plane,
    name: 'Aerospace',
    description:
      'Precision components for aircraft, satellites, and defense applications. Materials and processes meeting strict aerospace standards.',
    materials: ['PEEK', 'Ultem', 'Torlon', 'G-10/FR-4'],
    applications: ['Structural insulators', 'Bearing components', 'Wear parts', 'Electrical housings'],
    compliance: ['AS9100 capable', 'ITAR registered', 'MIL-SPEC materials'],
  },
  {
    id: 'medical',
    icon: Microscope,
    name: 'Medical & Life Sciences',
    description:
      'FDA-compliant materials for medical devices, laboratory equipment, and pharmaceutical applications.',
    materials: ['PEEK', 'UHMW', 'Acetal', 'Polycarbonate'],
    applications: ['Surgical instruments', 'Diagnostic equipment', 'Laboratory fixtures', 'Implant components'],
    compliance: ['FDA compliant materials', 'USP Class VI', 'ISO 13485 capable'],
  },
  {
    id: 'semiconductor',
    icon: Cpu,
    name: 'Semiconductor',
    description:
      'Ultra-clean components for wafer handling, chip processing, and cleanroom environments.',
    materials: ['PEEK', 'PTFE', 'PFA', 'Vespel'],
    applications: ['Wafer handling', 'Chemical delivery', 'Process chambers', 'Test fixtures'],
    compliance: ['Cleanroom compatible', 'Low outgassing', 'ESD safe options'],
  },
  {
    id: 'electronics',
    icon: Zap,
    name: 'Electronics',
    description:
      'Insulating components, connectors, and housings for electronic devices and systems.',
    materials: ['G-10/FR-4', 'Phenolic', 'Nylon', 'PBT'],
    applications: ['Circuit board standoffs', 'Connector bodies', 'Insulating spacers', 'EMI shielding'],
    compliance: ['UL recognized', 'RoHS compliant', 'Flame retardant options'],
  },
  {
    id: 'automotive',
    icon: Car,
    name: 'Automotive',
    description:
      'Durable components for vehicles, from under-hood applications to interior trim parts.',
    materials: ['Nylon', 'Acetal', 'POM', 'HDPE'],
    applications: ['Bushings & bearings', 'Fuel system components', 'Electrical insulators', 'Wear parts'],
    compliance: ['IATF 16949 capable', 'Automotive grade materials'],
  },
  {
    id: 'chemical',
    icon: FlaskConical,
    name: 'Chemical Processing',
    description:
      'Corrosion-resistant components for harsh chemical environments and processing equipment.',
    materials: ['PTFE', 'PVDF', 'PP', 'CPVC'],
    applications: ['Valve seats', 'Pump components', 'Tank linings', 'Gaskets & seals'],
    compliance: ['Chemical resistance certified', 'FDA compliant options'],
  },
  {
    id: 'water',
    icon: Droplets,
    name: 'Water Treatment',
    description:
      'Components for filtration systems, pumps, and water handling equipment.',
    materials: ['UHMW', 'HDPE', 'PVC', 'CPVC'],
    applications: ['Filter housings', 'Pump components', 'Valve parts', 'Piping systems'],
    compliance: ['NSF/ANSI 61 materials', 'Potable water safe'],
  },
  {
    id: 'food',
    icon: Leaf,
    name: 'Food Processing',
    description:
      'FDA-compliant and USDA-accepted materials for food contact and processing applications.',
    materials: ['UHMW', 'Acetal', 'HDPE', 'Polycarbonate'],
    applications: ['Conveyor parts', 'Cutting surfaces', 'Guide rails', 'Packaging equipment'],
    compliance: ['FDA compliant', 'USDA accepted', '3-A Dairy'],
  },
  {
    id: 'construction',
    icon: Building2,
    name: 'Construction & Industrial',
    description:
      'Heavy-duty components for construction equipment, material handling, and industrial machinery.',
    materials: ['UHMW', 'Nylon', 'HDPE', 'Acetal'],
    applications: ['Wear strips', 'Bushings', 'Roller guides', 'Structural components'],
    compliance: ['High load capacity', 'Weather resistant'],
  },
];

export default function IndustriesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-industrial-blue-900 to-industrial-blue-800 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Industries We Serve
            </h1>
            <p className="text-xl text-steel-300 leading-relaxed">
              From aerospace to food processing, we provide precision plastic
              solutions for the world&apos;s most demanding industries.
            </p>
          </div>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((industry) => (
              <div
                key={industry.id}
                className="card border border-steel-200 hover:border-precision-orange-400 transition-colors group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-industrial-blue-100 rounded-xl flex items-center justify-center group-hover:bg-precision-orange-100 transition-colors">
                    <industry.icon className="w-7 h-7 text-industrial-blue-900 group-hover:text-precision-orange-500 transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-industrial-blue-900">
                    {industry.name}
                  </h3>
                </div>

                <p className="text-steel-600 mb-4">{industry.description}</p>

                <div className="space-y-4 mb-6">
                  <div>
                    <span className="text-xs font-medium text-steel-400 uppercase">
                      Common Materials
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {industry.materials.map((material) => (
                        <span
                          key={material}
                          className="px-2 py-0.5 bg-industrial-blue-50 text-industrial-blue-700 rounded text-xs"
                        >
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-steel-400 uppercase">
                      Typical Applications
                    </span>
                    <ul className="mt-1 space-y-1">
                      {industry.applications.slice(0, 3).map((app) => (
                        <li
                          key={app}
                          className="text-sm text-steel-600 flex items-center gap-2"
                        >
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {app}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-steel-400 uppercase">
                      Compliance
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {industry.compliance.map((cert) => (
                        <span
                          key={cert}
                          className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs flex items-center gap-1"
                        >
                          <Shield className="w-3 h-3" />
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/industries/${industry.id}`}
                  className="text-precision-orange-500 font-medium text-sm hover:underline flex items-center gap-1"
                >
                  Learn More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-Industry Expertise */}
      <section className="py-20 bg-steel-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-heading">Cross-Industry Expertise</h2>
              <p className="text-steel-600 text-lg mb-6">
                With over 55 years of experience, we understand that each
                industry has unique requirements. Our team works closely with you
                to ensure every part meets your specific standards.
              </p>
              <ul className="space-y-3">
                {[
                  'Material selection guidance for your application',
                  'Design for manufacturability (DFM) support',
                  'Industry-specific compliance and certifications',
                  'Quality documentation and traceability',
                  'Prototype to production scalability',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-steel-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <Cog className="w-12 h-12 text-precision-orange-400 mb-4" />
              <h3 className="text-2xl font-bold text-industrial-blue-900 mb-4">
                Don&apos;t See Your Industry?
              </h3>
              <p className="text-steel-600 mb-6">
                We serve many specialized sectors beyond those listed. Contact us
                to discuss your specific application requirements.
              </p>
              <Link href="/contact" className="btn-primary">
                Contact Us
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-industrial-blue-900 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-steel-300 text-lg mb-8 max-w-2xl mx-auto">
            Send us your specifications and let our experts help you find the
            right solution for your industry application.
          </p>
          <Link href="/quote" className="btn-primary">
            Request a Quote
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </>
  );
}
