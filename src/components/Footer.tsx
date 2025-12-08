import Link from 'next/link';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const footerLinks = {
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Team', href: '/about#team' },
    { name: 'Facility Tour', href: '/about#facility' },
    { name: 'Quality & Certifications', href: '/about#quality' },
  ],
  capabilities: [
    { name: 'CNC Machining', href: '/capabilities/cnc-machining' },
    { name: 'Fabrication', href: '/capabilities/fabrication' },
    { name: 'Vacuum Forming', href: '/capabilities/vacuum-forming' },
    { name: 'Secondary Operations', href: '/capabilities/secondary-operations' },
  ],
  resources: [
    { name: 'Material Database', href: '/materials' },
    { name: 'Comparison Charts', href: '/materials/comparison' },
    { name: 'Chemical Resistance Guide', href: '/materials/chemical-resistance' },
    { name: 'Request Quote', href: '/quote' },
  ],
  industries: [
    { name: 'Aerospace', href: '/industries/aerospace' },
    { name: 'Medical', href: '/industries/medical' },
    { name: 'Semiconductor', href: '/industries/semiconductor' },
    { name: 'Electronics', href: '/industries/electronics' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-industrial-blue-900 text-white">
      {/* Main footer content */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company info */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <span className="text-2xl font-bold">Pro Plastics Inc.</span>
              <p className="text-steel-300 text-sm mt-1">
                Precision Manufacturing Since 1968
              </p>
            </div>
            <p className="text-steel-300 mb-6 leading-relaxed">
              Your trusted partner for custom plastic parts manufacturing and
              fabrication. Serving aerospace, medical, semiconductor, and more.
            </p>
            <div className="space-y-3">
              <a
                href="tel:+18669255000"
                className="flex items-center gap-3 text-steel-300 hover:text-precision-orange-400 transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>(866) 925-5000</span>
              </a>
              <a
                href="mailto:sales@proplasticsinc.com"
                className="flex items-center gap-3 text-steel-300 hover:text-precision-orange-400 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>sales@proplasticsinc.com</span>
              </a>
              <div className="flex items-start gap-3 text-steel-300">
                <MapPin className="w-5 h-5 mt-0.5" />
                <span>1190 Sylvan St<br />Linden, NJ 07036</span>
              </div>
              <div className="flex items-center gap-3 text-steel-300">
                <Clock className="w-5 h-5" />
                <span>Mon-Fri: 8:30 AM - 4:00 PM</span>
              </div>
            </div>
          </div>

          {/* Company links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-steel-300 hover:text-precision-orange-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Capabilities links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Capabilities</h3>
            <ul className="space-y-2">
              {footerLinks.capabilities.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-steel-300 hover:text-precision-orange-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-steel-300 hover:text-precision-orange-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Industries links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Industries</h3>
            <ul className="space-y-2">
              {footerLinks.industries.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-steel-300 hover:text-precision-orange-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-industrial-blue-800">
        <div className="container-custom py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-steel-400 text-sm">
            &copy; {new Date().getFullYear()} Pro Plastics Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-steel-400 hover:text-precision-orange-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-steel-400 hover:text-precision-orange-400 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
