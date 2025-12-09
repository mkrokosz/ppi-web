'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Phone, ChevronDown } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/' },
  {
    name: 'Capabilities',
    href: '/capabilities',
    children: [
      { name: 'CNC Machining', href: '/capabilities/cnc-machining' },
      { name: 'Fabrication', href: '/capabilities/fabrication' },
      { name: 'Secondary Operations', href: '/capabilities/secondary-operations' },
    ],
  },
  {
    name: 'Materials',
    href: '/materials',
    children: [
      { name: 'Material Database', href: '/materials' },
      { name: 'Comparison Charts', href: '/materials/comparison' },
      { name: 'Chemical Resistance', href: '/materials/chemical-resistance' },
    ],
  },
  { name: 'Industries', href: '/industries' },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-industrial-blue-900 text-white py-2">
        <div className="container-custom flex justify-between items-center text-sm">
          <div className="hidden sm:flex items-center gap-6">
            <span>Mon-Fri: 8:30 AM - 4:00 PM</span>
            <span>1190 Sylvan St, Linden, NJ 07036</span>
          </div>
          <a
            href="tel:+18669255000"
            className="flex items-center gap-2 hover:text-precision-orange-300 transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span className="font-semibold">(866) 925-5000</span>
          </a>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 -ml-3">
            <Image
              src="/images/ppi-logo.png"
              alt="Pro Plastics Inc. logo"
              width={80}
              height={80}
              className="w-20 h-20"
            />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-industrial-blue-900">
                Pro Plastics
              </span>
              <span className="text-xs text-steel-500 tracking-wider leading-tight">
                PRECISION MANUFACTURING<br />SINCE 1968
              </span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.children && setOpenDropdown(item.name)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-4 py-2 text-steel-700 hover:text-industrial-blue-900 font-medium transition-colors"
                >
                  {item.name}
                  {item.children && <ChevronDown className="w-4 h-4" />}
                </Link>

                {/* Dropdown menu */}
                {item.children && openDropdown === item.name && (
                  <div className="absolute top-full left-0 w-56 bg-white shadow-lg rounded-lg py-2 border border-steel-100">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="block px-4 py-2 text-steel-600 hover:bg-steel-50 hover:text-industrial-blue-900 transition-colors"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Link href="/quote" className="btn-primary">
              Request Quote
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 text-steel-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-steel-100">
            {navigation.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className="block px-4 py-3 text-steel-700 hover:bg-steel-50 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
                {item.children && (
                  <div className="pl-6 bg-steel-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="block px-4 py-2 text-steel-600 text-sm"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="px-4 pt-4">
              <Link
                href="/quote"
                className="btn-primary w-full text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Request Quote
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
