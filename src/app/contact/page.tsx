'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

// Note: Metadata must be exported from a server component

export default function ContactPage() {
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setFormStatus('success');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-industrial-blue-900 to-industrial-blue-800 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl text-steel-300 leading-relaxed">
              Have questions about our capabilities or need a quote? We&apos;re here
              to help. Reach out and our team will respond promptly.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold text-industrial-blue-900 mb-6">
                Get in Touch
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-industrial-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-industrial-blue-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-industrial-blue-900">Phone</h3>
                    <a
                      href="tel:+18669255000"
                      className="text-steel-600 hover:text-precision-orange-500 transition-colors"
                    >
                      (866) 925-5000
                    </a>
                    <p className="text-steel-500 text-sm">Toll-free</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-industrial-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-industrial-blue-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-industrial-blue-900">Email</h3>
                    <a
                      href="mailto:sales@proplasticsinc.com"
                      className="text-steel-600 hover:text-precision-orange-500 transition-colors"
                    >
                      sales@proplasticsinc.com
                    </a>
                    <p className="text-steel-500 text-sm">Sales & Quotes</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-industrial-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-industrial-blue-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-industrial-blue-900">Address</h3>
                    <p className="text-steel-600">
                      1190 Sylvan St<br />
                      Linden, NJ 07036
                    </p>
                    <a
                      href="https://goo.gl/maps/R8fawsprvH5KirYK7"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-precision-orange-500 text-sm hover:underline"
                    >
                      Get Directions →
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-industrial-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-industrial-blue-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-industrial-blue-900">Hours</h3>
                    <p className="text-steel-600">
                      Monday - Friday<br />
                      8:30 AM - 4:00 PM EST
                    </p>
                    <p className="text-steel-500 text-sm">
                      Closed Saturday & Sunday
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Quote CTA */}
              <div className="mt-8 p-6 bg-precision-orange-50 rounded-xl border border-precision-orange-200">
                <h3 className="font-semibold text-industrial-blue-900 mb-2">
                  Need a Quote?
                </h3>
                <p className="text-steel-600 text-sm mb-4">
                  For faster service, use our quote request form to upload your
                  drawings directly.
                </p>
                <Link
                  href="/quote"
                  className="flex items-center gap-2 text-precision-orange-500 font-medium hover:underline"
                >
                  Request a Quote <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-steel-50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-industrial-blue-900 mb-6">
                  Send Us a Message
                </h2>

                {formStatus === 'success' ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-industrial-blue-900 mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-steel-600 mb-6">
                      Thank you for reaching out. We&apos;ll get back to you within
                      one business day.
                    </p>
                    <button
                      onClick={() => {
                        setFormStatus('idle');
                        setFormData({
                          firstName: '',
                          lastName: '',
                          email: '',
                          phone: '',
                          company: '',
                          subject: '',
                          message: '',
                        });
                      }}
                      className="text-precision-orange-500 font-medium hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-steel-700 mb-2"
                        >
                          First Name *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-steel-300 focus:border-industrial-blue-500 focus:ring-2 focus:ring-industrial-blue-200 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-steel-700 mb-2"
                        >
                          Last Name *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          required
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-steel-300 focus:border-industrial-blue-500 focus:ring-2 focus:ring-industrial-blue-200 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-steel-700 mb-2"
                        >
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-steel-300 focus:border-industrial-blue-500 focus:ring-2 focus:ring-industrial-blue-200 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-steel-700 mb-2"
                        >
                          Phone
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="(555) 555-5555"
                          className="w-full px-4 py-3 rounded-lg border border-steel-300 focus:border-industrial-blue-500 focus:ring-2 focus:ring-industrial-blue-200 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="company"
                        className="block text-sm font-medium text-steel-700 mb-2"
                      >
                        Company
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-steel-300 focus:border-industrial-blue-500 focus:ring-2 focus:ring-industrial-blue-200 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-steel-700 mb-2"
                      >
                        Subject *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-steel-300 focus:border-industrial-blue-500 focus:ring-2 focus:ring-industrial-blue-200 outline-none transition-all"
                      >
                        <option value="">Select a subject...</option>
                        <option value="quote">Quote Request</option>
                        <option value="capabilities">Capabilities Question</option>
                        <option value="materials">Material Information</option>
                        <option value="order">Order Status</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-steel-700 mb-2"
                      >
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        required
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="How can we help you?"
                        className="w-full px-4 py-3 rounded-lg border border-steel-300 focus:border-industrial-blue-500 focus:ring-2 focus:ring-industrial-blue-200 outline-none transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={formStatus === 'submitting'}
                      className="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {formStatus === 'submitting' ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-0">
        <div className="bg-steel-200 h-96 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-steel-400 mx-auto mb-4" />
            <p className="text-steel-500">
              [Google Maps embed placeholder]<br />
              1190 Sylvan St, Linden, NJ 07036
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
