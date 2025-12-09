import Link from 'next/link';
import Image from 'next/image';
import {
  Cog,
  Factory,
  Package,
  Microscope,
  Plane,
  Cpu,
  Zap,
  Droplets,
  Car,
  Building2,
  FlaskConical,
  Leaf,
  CheckCircle,
  ArrowRight,
  Quote,
  Clock,
  Award,
  Users,
} from 'lucide-react';

const capabilities = [
  {
    icon: Cog,
    title: 'CNC Machining',
    description:
      'Precision CNC horizontal and vertical machining with tight tolerances for complex geometries.',
    href: '/capabilities/cnc-machining',
  },
  {
    icon: Factory,
    title: 'Custom Fabrication',
    description:
      'Full-service plastic fabrication including routing, milling, drilling, and punching.',
    href: '/capabilities/fabrication',
  },
  {
    icon: Package,
    title: 'Material Distribution',
    description:
      'Comprehensive inventory of plastic sheets, rods, and tubes in engineering-grade materials.',
    href: '/materials',
  },
  {
    icon: Microscope,
    title: 'Prototyping',
    description:
      'Rapid prototype development from concept to production-ready parts.',
    href: '/capabilities/prototyping',
  },
];

const industries = [
  { icon: Plane, name: 'Aerospace', href: '/industries/aerospace' },
  { icon: Microscope, name: 'Medical', href: '/industries/medical' },
  { icon: Cpu, name: 'Semiconductor', href: '/industries/semiconductor' },
  { icon: Zap, name: 'Electronics', href: '/industries/electronics' },
  { icon: Car, name: 'Automotive', href: '/industries/automotive' },
  { icon: FlaskConical, name: 'Chemical Processing', href: '/industries/chemical' },
  { icon: Droplets, name: 'Water Treatment', href: '/industries/water' },
  { icon: Building2, name: 'Construction', href: '/industries/construction' },
  { icon: Leaf, name: 'Food Processing', href: '/industries/food' },
];

const stats = [
  { value: '55+', label: 'Years of Experience' },
  { value: '12', label: 'Industries Served' },
  { value: '1000+', label: 'Materials Available' },
  { value: '24hr', label: 'Quote Turnaround' },
];

const testimonials = [
  {
    quote:
      'Pro Plastics has been our go-to supplier for precision components for over a decade. Their quality and turnaround time are unmatched.',
    author: 'Engineering Director',
    company: 'Aerospace Manufacturing Co.',
  },
  {
    quote:
      'The material expertise at Pro Plastics helped us select the perfect FDA-compliant plastic for our medical device application.',
    author: 'Product Development Manager',
    company: 'Medical Device Startup',
  },
  {
    quote:
      'From prototype to production, Pro Plastics delivered exactly what we needed. Highly recommend for semiconductor applications.',
    author: 'Operations Lead',
    company: 'Semiconductor Equipment Supplier',
  },
];

const features = [
  'Zero-defect quality commitment',
  'On-time delivery guarantee',
  'Expert material guidance',
  'Competitive pricing',
  'Rapid quote turnaround',
  'Custom solutions for any industry',
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-industrial-blue-900 via-industrial-blue-800 to-industrial-blue-900 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="container-custom relative py-8 lg:py-12">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
            <div className="lg:pl-20">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm mb-4">
                <Award className="w-4 h-4 text-precision-orange-400" />
                <span>Trusted Since 1968</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                <span
                  className="text-precision-orange-400 tracking-tight drop-shadow-[0_2px_10px_rgba(237,137,54,0.3)]"
                  style={{
                    textShadow: '0 0 40px rgba(237, 137, 54, 0.4), 0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  Pro Plastics Inc.
                </span>
                <div className="h-1 w-32 bg-gradient-to-r from-precision-orange-400 to-precision-orange-300 rounded-full mt-3" />
              </h1>
              <p className="text-2xl md:text-3xl font-semibold text-white mb-6">
                Precision Plastic Manufacturing
              </p>
              <p className="text-xl text-steel-300 mb-8 leading-relaxed">
                Your complete source for custom plastic parts—from prototype to
                production. Expert CNC machining, fabrication, and material
                distribution for demanding industries.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/quote" className="btn-primary text-lg px-8 py-4">
                  Get a Free Quote
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link href="/capabilities" className="btn-outline border-white text-white hover:bg-white hover:text-industrial-blue-900 text-lg px-8 py-4">
                  View Capabilities
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative w-fit">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl w-fit">
                <Image
                  src="/images/ppi-hero-image.jpeg"
                  alt="CNC machine drilling precision plastic component - Pro Plastics Inc. manufacturing"
                  width={600}
                  height={400}
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-industrial-blue-900/30 to-transparent" />
              </div>
              {/* Stats overlay */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center"
                  >
                    <div className="text-xl font-bold text-precision-orange-400 mb-0.5">
                      {stat.value}
                    </div>
                    <div className="text-steel-300 text-xs">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-steel-50 py-6 border-b border-steel-200">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center items-center gap-8 text-steel-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>ISO Quality Standards</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Made in USA</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Fast Turnaround</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Expert Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">Our Capabilities</h2>
            <p className="section-subheading mx-auto">
              From complex CNC machining to full-scale production, we deliver
              precision plastic solutions tailored to your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((capability) => (
              <Link
                key={capability.title}
                href={capability.href}
                className="card group hover:border-precision-orange-400 border-2 border-transparent"
              >
                <div className="w-14 h-14 bg-industrial-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-precision-orange-100 transition-colors">
                  <capability.icon className="w-7 h-7 text-industrial-blue-900 group-hover:text-precision-orange-500 transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-industrial-blue-900 mb-2">
                  {capability.title}
                </h3>
                <p className="text-steel-500">{capability.description}</p>
                <div className="mt-4 flex items-center text-precision-orange-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 bg-steel-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">Industries We Serve</h2>
            <p className="section-subheading mx-auto">
              Trusted by leading companies across diverse industries for
              mission-critical plastic components.
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
            {industries.map((industry) => (
              <Link
                key={industry.name}
                href={industry.href}
                className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="w-12 h-12 bg-industrial-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-precision-orange-100 transition-colors">
                  <industry.icon className="w-6 h-6 text-industrial-blue-900 group-hover:text-precision-orange-500 transition-colors" />
                </div>
                <span className="text-sm font-medium text-steel-700 text-center">
                  {industry.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-heading">
                Why Choose Pro Plastics?
              </h2>
              <p className="text-steel-500 text-lg mb-8">
                With over 55 years of experience, we combine traditional
                craftsmanship with modern precision manufacturing to deliver
                exceptional results every time.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 bg-steel-50 rounded-lg p-4"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-steel-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link href="/about" className="btn-secondary">
                  Learn More About Us
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] relative rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/ppi-building.jpg"
                  alt="Pro Plastics Inc. manufacturing facility exterior - Linden, New Jersey"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 max-w-xs">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-precision-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-precision-orange-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-industrial-blue-900">
                      Quick Turnaround
                    </div>
                    <div className="text-sm text-steel-500">
                      Quotes within 24 hours
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-industrial-blue-900 text-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Clients Say
            </h2>
            <p className="text-steel-300 max-w-2xl mx-auto">
              Don&apos;t just take our word for it—hear from the companies that
              trust us with their precision plastic needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-8"
              >
                <Quote className="w-10 h-10 text-precision-orange-400 mb-4" />
                <p className="text-steel-200 mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-steel-400 text-sm">
                    {testimonial.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-precision-orange-400 to-precision-orange-500">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Upload your drawings and get a detailed quote within 24 hours. Our
            team is ready to help bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-precision-orange-500 font-semibold rounded-lg hover:bg-steel-50 transition-colors shadow-lg"
            >
              Request a Quote
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <a
              href="tel:+18669255000"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Call (866) 925-5000
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
