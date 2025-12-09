import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Download } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Material Comparison Charts',
  description:
    'Compare engineering plastic properties side-by-side. Temperature, strength, chemical resistance, and more for PEEK, Ultem, Delrin, Nylon, PTFE, UHMW.',
};

const comparisonData = [
  {
    property: 'Max Service Temp',
    peek: '480°F',
    ultem: '340°F',
    delrin: '180°F',
    nylon: '210°F',
    ptfe: '500°F',
    uhmw: '180°F',
  },
  {
    property: 'Tensile Strength (psi)',
    peek: '16,000',
    ultem: '15,200',
    delrin: '10,000',
    nylon: '12,000',
    ptfe: '3,500',
    uhmw: '5,600',
  },
  {
    property: 'Flexural Modulus (psi)',
    peek: '595,000',
    ultem: '480,000',
    delrin: '410,000',
    nylon: '400,000',
    ptfe: '80,000',
    uhmw: '100,000',
  },
  {
    property: 'Impact Strength',
    peek: 'Good',
    ultem: 'Good',
    delrin: 'Good',
    nylon: 'Excellent',
    ptfe: 'Good',
    uhmw: 'Excellent',
  },
  {
    property: 'Chemical Resistance',
    peek: 'Excellent',
    ultem: 'Good',
    delrin: 'Good',
    nylon: 'Fair',
    ptfe: 'Excellent',
    uhmw: 'Excellent',
  },
  {
    property: 'Wear Resistance',
    peek: 'Excellent',
    ultem: 'Good',
    delrin: 'Excellent',
    nylon: 'Good',
    ptfe: 'Fair',
    uhmw: 'Excellent',
  },
  {
    property: 'Machinability',
    peek: 'Good',
    ultem: 'Good',
    delrin: 'Excellent',
    nylon: 'Good',
    ptfe: 'Fair',
    uhmw: 'Good',
  },
  {
    property: 'FDA Compliant',
    peek: 'Yes',
    ultem: 'No',
    delrin: 'Yes',
    nylon: 'Yes',
    ptfe: 'Yes',
    uhmw: 'Yes',
  },
  {
    property: 'Relative Cost',
    peek: '$$$$$',
    ultem: '$$$$',
    delrin: '$$',
    nylon: '$$',
    ptfe: '$$$',
    uhmw: '$',
  },
];

const materials = [
  { name: 'PEEK', color: 'from-amber-600 to-amber-700', bgLight: 'bg-amber-50', text: 'text-amber-800' },
  { name: 'Ultem', color: 'from-amber-500 to-amber-600', bgLight: 'bg-amber-50', text: 'text-amber-700' },
  { name: 'Delrin', color: 'from-blue-600 to-blue-700', bgLight: 'bg-blue-50', text: 'text-blue-800' },
  { name: 'Nylon', color: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50', text: 'text-blue-700' },
  { name: 'PTFE', color: 'from-emerald-600 to-emerald-700', bgLight: 'bg-emerald-50', text: 'text-emerald-800' },
  { name: 'UHMW', color: 'from-slate-500 to-slate-600', bgLight: 'bg-slate-50', text: 'text-slate-700' },
];

export default function ComparisonPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-industrial-blue-900 to-industrial-blue-800 text-white py-20">
        <div className="container-custom">
          <Breadcrumb
            items={[
              { label: 'Materials', href: '/materials' },
              { label: 'Comparison Charts' },
            ]}
          />
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Material Comparison Charts
            </h1>
            <p className="text-xl text-steel-300 leading-relaxed">
              Side-by-side property comparisons to help you select the right
              material for your application.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-industrial-blue-900">
                Engineering Plastics Comparison
              </h2>
              <p className="text-steel-500">
                Compare key properties across common engineering plastics
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-steel-100 text-steel-700 rounded-lg hover:bg-steel-200 transition-colors">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-steel-200">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 font-semibold bg-steel-100 text-industrial-blue-900">Property</th>
                  {materials.map((material) => (
                    <th key={material.name} className={`text-center p-4 font-semibold text-white bg-gradient-to-br ${material.color}`}>
                      {material.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={row.property}>
                    <td className={`p-4 font-medium text-industrial-blue-900 border-b border-steel-200 ${index % 2 === 0 ? 'bg-steel-50' : 'bg-white'}`}>
                      {row.property}
                    </td>
                    <td className={`p-4 text-center font-medium border-b border-steel-200 ${materials[0].text} ${index % 2 === 0 ? materials[0].bgLight : 'bg-white'}`}>
                      {row.peek}
                    </td>
                    <td className={`p-4 text-center font-medium border-b border-steel-200 ${materials[1].text} ${index % 2 === 0 ? materials[1].bgLight : 'bg-white'}`}>
                      {row.ultem}
                    </td>
                    <td className={`p-4 text-center font-medium border-b border-steel-200 ${materials[2].text} ${index % 2 === 0 ? materials[2].bgLight : 'bg-white'}`}>
                      {row.delrin}
                    </td>
                    <td className={`p-4 text-center font-medium border-b border-steel-200 ${materials[3].text} ${index % 2 === 0 ? materials[3].bgLight : 'bg-white'}`}>
                      {row.nylon}
                    </td>
                    <td className={`p-4 text-center font-medium border-b border-steel-200 ${materials[4].text} ${index % 2 === 0 ? materials[4].bgLight : 'bg-white'}`}>
                      {row.ptfe}
                    </td>
                    <td className={`p-4 text-center font-medium border-b border-steel-200 ${materials[5].text} ${index % 2 === 0 ? materials[5].bgLight : 'bg-white'}`}>
                      {row.uhmw}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-steel-500 text-sm mt-4">
            * Values shown are typical and may vary by grade. Contact us for specific material data sheets.
          </p>
        </div>
      </section>

      {/* Material Selection Guide */}
      <section className="py-16 bg-steel-50">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-industrial-blue-900 mb-8">
            Quick Selection Guide
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                need: 'High Temperature',
                materials: 'PEEK, Ultem, PTFE',
                note: 'For applications above 250°F',
              },
              {
                need: 'Chemical Resistance',
                materials: 'PTFE, PEEK, UHMW',
                note: 'For harsh chemical environments',
              },
              {
                need: 'Wear Resistance',
                materials: 'UHMW, Delrin, PEEK',
                note: 'For sliding and bearing applications',
              },
              {
                need: 'FDA Compliance',
                materials: 'UHMW, Delrin, PTFE, Nylon',
                note: 'For food contact applications',
              },
              {
                need: 'Low Cost',
                materials: 'UHMW, Nylon, Delrin',
                note: 'Budget-friendly options',
              },
              {
                need: 'Easy Machining',
                materials: 'Delrin, Nylon, UHMW',
                note: 'For complex geometries',
              },
            ].map((guide) => (
              <div key={guide.need} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-industrial-blue-900 mb-2">
                  {guide.need}
                </h3>
                <p className="text-precision-orange-500 font-medium mb-2">
                  {guide.materials}
                </p>
                <p className="text-steel-500 text-sm">{guide.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-industrial-blue-900 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">
            Need Help Choosing?
          </h2>
          <p className="text-steel-300 text-lg mb-8 max-w-2xl mx-auto">
            Our material experts can help you select the optimal plastic for
            your specific application requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary">
              Contact Our Experts
            </Link>
            <Link href="/materials" className="btn-outline border-white text-white hover:bg-white hover:text-industrial-blue-900">
              Browse All Materials
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
