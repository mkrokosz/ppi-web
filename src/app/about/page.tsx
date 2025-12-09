import { Metadata } from 'next';
import {
  Award,
  Users,
  Building,
  Target,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'About Pro Plastics Inc.',
  description:
    'Precision plastic manufacturing since 1968 in Linden, NJ. 55+ years serving aerospace, medical & semiconductor industries.',
  openGraph: {
    title: 'About Pro Plastics Inc. | 55+ Years of Precision Manufacturing',
    description:
      'Family-owned precision plastic manufacturer since 1968. ISO certified, serving 12+ industries worldwide.',
  },
};

const timeline = [
  {
    year: '1968',
    title: 'Company Founded',
    description:
      'Pro Plastics Inc. established in Linden, New Jersey, starting with basic plastic fabrication services.',
  },
  {
    year: '1980s',
    title: 'Expansion & Growth',
    description:
      'Expanded capabilities to include CNC machining and began serving aerospace and medical industries.',
  },
  {
    year: '1990s',
    title: 'Technology Investment',
    description:
      'Major investment in precision CNC equipment, establishing reputation for tight-tolerance machining.',
  },
  {
    year: '2000s',
    title: 'Material Distribution',
    description:
      'Launched comprehensive material distribution division, becoming a one-stop shop for customers.',
  },
  {
    year: '2010s',
    title: 'Industry Leadership',
    description:
      'Recognized as a leading plastic manufacturer serving 12+ industries with global reach.',
  },
  {
    year: 'Today',
    title: 'Innovation Continues',
    description:
      'Continuing to invest in advanced manufacturing technology while maintaining our commitment to quality.',
  },
];

const values = [
  {
    icon: Target,
    title: 'Quality First',
    description:
      'Zero-defect commitment from material selection through final inspection. Every part meets exact specifications.',
  },
  {
    icon: Clock,
    title: 'On-Time Delivery',
    description:
      'We understand that your production schedules depend on us. Reliable delivery is our promise.',
  },
  {
    icon: Users,
    title: 'Customer Partnership',
    description:
      'We work alongside your engineering team to find optimal solutions for your specific applications.',
  },
  {
    icon: Shield,
    title: 'Integrity',
    description:
      'Honest communication, fair pricing, and standing behind every product we manufacture.',
  },
];

const certifications = [
  'ISO 9001:2015 Quality Management',
  'FDA Compliant Materials',
  'RoHS Compliant',
  'ITAR Registered',
  'UL Recognized Materials',
  'Military Specification Capable',
];

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-industrial-blue-900 to-industrial-blue-800 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About Pro Plastics Inc.
            </h1>
            <p className="text-xl text-steel-300 leading-relaxed">
              For over 55 years, we&apos;ve been a trusted partner for plastic parts
              manufacturing and fabrication, serving diverse industries worldwide
              with precision, quality, and dedication.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-heading">Our Story</h2>
              <div className="space-y-4 text-steel-600 leading-relaxed">
                <p>
                  Founded in 1968, Pro Plastics Inc. began as a small plastic
                  fabrication shop in Linden, New Jersey. What started as a local
                  operation has grown into a trusted manufacturing partner serving
                  companies across the globe.
                </p>
                <p>
                  Our founder believed that precision manufacturing should be
                  accessible to companies of all sizes. That philosophy continues
                  today—whether you need a single prototype or thousands of
                  production parts, we deliver the same exceptional quality and
                  attention to detail.
                </p>
                <p>
                  Over five decades, we&apos;ve invested in the latest CNC technology,
                  expanded our material expertise, and built a team of skilled
                  craftspeople who take pride in every part we produce. Today,
                  we&apos;re proud to serve 12 distinct industries, from aerospace to
                  medical devices.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-video relative rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/ppi-building.jpg"
                  alt="Pro Plastics Inc. precision plastics manufacturing facility - Linden, New Jersey since 1968"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <p className="text-center text-steel-500 mt-4 font-medium">
                Our Linden, NJ Facility
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-steel-50" id="history">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">Our Journey</h2>
            <p className="section-subheading mx-auto">
              55+ years of continuous growth, innovation, and commitment to excellence.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 md:left-1/2 transform md:-translate-x-px h-full w-0.5 bg-industrial-blue-200" />

              {timeline.map((item, index) => (
                <div
                  key={item.year}
                  className={`relative flex items-start gap-8 mb-12 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Content */}
                  <div
                    className={`flex-1 ${
                      index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:pl-12'
                    } pl-20 md:pl-0`}
                  >
                    <div className="bg-white rounded-xl p-6 shadow-md">
                      <div className="text-precision-orange-500 font-bold text-lg mb-1">
                        {item.year}
                      </div>
                      <h3 className="text-xl font-semibold text-industrial-blue-900 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-steel-500">{item.description}</p>
                    </div>
                  </div>

                  {/* Dot */}
                  <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-precision-orange-400 rounded-full border-4 border-white shadow" />

                  {/* Spacer for alternating layout */}
                  <div className="hidden md:block flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white" id="values">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">Our Core Values</h2>
            <p className="section-subheading mx-auto">
              The principles that guide everything we do.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-industrial-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-industrial-blue-900" />
                </div>
                <h3 className="text-xl font-semibold text-industrial-blue-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-steel-500">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-steel-50" id="team">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">Our Team</h2>
            <p className="section-subheading mx-auto">
              Skilled professionals dedicated to delivering precision results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                role: 'Leadership',
                description: 'Experienced management team with decades of manufacturing expertise.',
              },
              {
                role: 'Engineering',
                description: 'Technical experts who help optimize your designs for manufacturability.',
              },
              {
                role: 'Production',
                description: 'Skilled machinists and fabricators who bring precision to every part.',
              },
            ].map((team) => (
              <div key={team.role} className="bg-white rounded-xl p-8 shadow-md text-center">
                <div className="w-20 h-20 bg-steel-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-10 h-10 text-steel-400" />
                </div>
                <h3 className="text-xl font-semibold text-industrial-blue-900 mb-2">
                  {team.role}
                </h3>
                <p className="text-steel-500">{team.description}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-20 bg-white" id="quality">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-heading">Quality & Certifications</h2>
              <p className="text-steel-600 leading-relaxed mb-8">
                Quality isn&apos;t just a goal—it&apos;s built into every process. From
                incoming material inspection to final quality checks, we maintain
                rigorous standards that meet or exceed industry requirements.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {certifications.map((cert) => (
                  <div
                    key={cert}
                    className="flex items-center gap-3 bg-steel-50 rounded-lg p-4"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-steel-700 text-sm">{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-industrial-blue-900 text-white rounded-2xl p-8">
              <Award className="w-16 h-16 text-precision-orange-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Our Quality Promise</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-precision-orange-400 mt-0.5 flex-shrink-0" />
                  <span>100% inspection on critical dimensions</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-precision-orange-400 mt-0.5 flex-shrink-0" />
                  <span>Full material traceability and certification</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-precision-orange-400 mt-0.5 flex-shrink-0" />
                  <span>Statistical process control where required</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-precision-orange-400 mt-0.5 flex-shrink-0" />
                  <span>First article inspection reports available</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-industrial-blue-900 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Let&apos;s Work Together
          </h2>
          <p className="text-steel-300 text-lg mb-8 max-w-2xl mx-auto">
            Partner with a company that&apos;s been delivering precision plastic
            manufacturing for over 55 years.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quote" className="btn-primary">
              Request a Quote
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link href="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-industrial-blue-900">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
