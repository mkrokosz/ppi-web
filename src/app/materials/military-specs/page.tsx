import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, CheckCircle, FileText, Download } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Military Specifications',
  description:
    'MIL-SPEC plastics including PEEK, Nylon, Acetal, PTFE, and G-10/FR-4. ITAR registered, AS9100 capable, full material traceability.',
};

const milSpecMaterials = [
  {
    spec: 'MIL-P-17549',
    name: 'PEEK (Polyetheretherketone)',
    description: 'High-performance thermoplastic for aerospace and defense applications.',
    properties: ['High strength-to-weight ratio', 'Chemical resistance', 'Flame retardant', 'Low smoke emission'],
  },
  {
    spec: 'MIL-P-46036',
    name: 'Nylon 6/6 (Polyamide)',
    description: 'Engineering plastic for mechanical components and structural applications.',
    properties: ['High tensile strength', 'Wear resistance', 'Good machinability', 'Impact resistance'],
  },
  {
    spec: 'MIL-P-46183',
    name: 'Acetal (Delrin)',
    description: 'Precision machining plastic for gears, bearings, and mechanical parts.',
    properties: ['Dimensional stability', 'Low friction', 'High stiffness', 'Fatigue resistance'],
  },
  {
    spec: 'MIL-P-22241',
    name: 'PTFE (Teflon)',
    description: 'Fluoropolymer for seals, gaskets, and chemical-resistant applications.',
    properties: ['Extreme chemical resistance', 'Wide temperature range', 'Non-stick surface', 'Electrical insulation'],
  },
  {
    spec: 'MIL-P-8184',
    name: 'Fiberglass Reinforced Plastic (FRP)',
    description: 'Composite material for structural and electrical applications.',
    properties: ['High strength', 'Corrosion resistance', 'Electrical insulation', 'Lightweight'],
  },
  {
    spec: 'MIL-I-24768',
    name: 'G-10/FR-4 Epoxy Glass Laminate',
    description: 'Electrical grade laminate for circuit boards and insulators.',
    properties: ['Flame retardant', 'High dielectric strength', 'Dimensional stability', 'Moisture resistant'],
  },
];

const certifications = [
  'ITAR Registered',
  'AS9100 Capable',
  'ISO 9001:2015 Compliant',
  'DFARS Compliant Materials',
  'Full Material Traceability',
  'Certified Test Reports Available',
];

export default function MilitarySpecsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-industrial-blue-900 to-industrial-blue-800 text-white py-16">
        <div className="container-custom">
          <Breadcrumb
            items={[
              { label: 'Materials', href: '/materials' },
              { label: 'Military Specifications' },
            ]}
          />
          <div className="flex items-center gap-4 mb-4">
            <Shield className="w-12 h-12 text-precision-orange-400" />
            <h1 className="text-4xl md:text-5xl font-bold">Military Specifications</h1>
          </div>
          <p className="text-xl text-steel-300 max-w-3xl">
            Materials meeting MIL-SPEC requirements for defense, aerospace, and government applications.
            Full documentation and traceability available.
          </p>
        </div>
      </section>

      {/* Certifications Bar */}
      <section className="bg-steel-50 py-6 border-b border-steel-200">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center items-center gap-6 text-steel-600">
            {certifications.map((cert) => (
              <div key={cert} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Materials Grid */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <h2 className="section-heading mb-8">MIL-SPEC Materials</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {milSpecMaterials.map((material) => (
              <div key={material.spec} className="bg-white border border-steel-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="inline-block bg-industrial-blue-100 text-industrial-blue-900 text-xs font-mono font-bold px-2 py-1 rounded mb-2">
                      {material.spec}
                    </span>
                    <h3 className="text-lg font-semibold text-industrial-blue-900">
                      {material.name}
                    </h3>
                  </div>
                  <FileText className="w-6 h-6 text-steel-400" />
                </div>
                <p className="text-steel-500 text-sm mb-4">{material.description}</p>
                <ul className="space-y-2">
                  {material.properties.map((prop) => (
                    <li key={prop} className="flex items-center gap-2 text-sm text-steel-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {prop}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Section */}
      <section className="py-16 bg-steel-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-heading">Documentation & Compliance</h2>
              <p className="text-steel-600 mb-6">
                We provide complete documentation packages for all military specification materials,
                including certified test reports, material certifications, and full traceability documentation.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-steel-700">Certified Material Test Reports (CMTRs)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-steel-700">Certificate of Conformance (CoC)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-steel-700">Heat lot and batch traceability</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-steel-700">First Article Inspection Reports (FAIR)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-steel-700">DFARS/ITAR compliance documentation</span>
                </li>
              </ul>
            </div>

            <div className="bg-industrial-blue-900 text-white rounded-2xl p-8">
              <Shield className="w-12 h-12 text-precision-orange-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Need MIL-SPEC Materials?</h3>
              <p className="text-steel-300 mb-6">
                Contact us for availability, pricing, and documentation requirements for your
                defense or aerospace project.
              </p>
              <div className="space-y-3">
                <Link href="/quote" className="btn-primary w-full justify-center">
                  Request Quote
                </Link>
                <Link href="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-industrial-blue-900 w-full justify-center">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-bold text-industrial-blue-900 mb-4">
            Don&apos;t see what you need?
          </h2>
          <p className="text-steel-600 mb-6 max-w-2xl mx-auto">
            We can source additional MIL-SPEC materials to meet your specific requirements.
            Contact our team to discuss your project needs.
          </p>
          <Link href="/contact" className="btn-secondary">
            Contact Our Team
          </Link>
        </div>
      </section>
    </>
  );
}
