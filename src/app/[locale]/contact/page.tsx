'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import {
  Mail,
  MapPin,
  Clock,
  Send,
  ArrowRight,
} from 'lucide-react';
import { trackContactFormSubmit, trackDirectionsClick, gtagDirectionsClick, gtagContactFormSubmit } from '@/lib/firebase';
import CopyableEmail from '@/components/CopyableEmail';
import CopyablePhone from '@/components/CopyablePhone';
import CopyableAddress from '@/components/CopyableAddress';
import { useTranslations, useLocale } from 'next-intl';
import ReCaptchaProvider, { useReCaptcha } from '@/components/ReCaptchaProvider';

export default function ContactPage() {
  return (
    <ReCaptchaProvider>
      <ContactPageContent />
    </ReCaptchaProvider>
  );
}

function ContactPageContent() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('contact');
  const tCommon = useTranslations('common');
  const { executeRecaptcha } = useReCaptcha();
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    website: '', // Honeypot field - hidden from real users
  });
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    setErrorMessage('');

    const apiUrl = process.env.NEXT_PUBLIC_CONTACT_API_URL;

    // Get reCAPTCHA token
    const recaptchaToken = await executeRecaptcha('contact_form');

    if (!apiUrl) {
      // Fallback for development or if API not configured
      console.log('Contact form submission:', formData);
      console.log('reCAPTCHA token:', recaptchaToken);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push(`/contact/thank-you?lang=${locale}`);
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      trackContactFormSubmit(formData.subject);
      gtagContactFormSubmit();
      router.push(`/contact/thank-you?lang=${locale}`);
    } catch (error) {
      console.error('Contact form error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
      setFormStatus('error');
    }
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('title')}</h1>
            <p className="text-xl text-steel-300 leading-relaxed">
              {t('subtitle')}
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
                {t('getInTouch')}
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-industrial-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="w-6 h-6 text-industrial-blue-900 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-industrial-blue-900">{t('phone')}</h3>
                    <CopyablePhone
                      phone="+1 (866) 925-5000"
                      phoneRaw="+18669255000"
                      location="contact-page"
                      variant="light"
                      showIcon={false}
                    />
                    <p className="text-steel-500 text-sm">{tCommon('tollFree')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-industrial-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-industrial-blue-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-industrial-blue-900">{t('emailLabel')}</h3>
                    <CopyableEmail
                      email="sales@proplasticsinc.com"
                      location="contact-page"
                      variant="light"
                      showIcon={false}
                    />
                    <p className="text-steel-500 text-sm">{t('salesQuotes')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-industrial-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-industrial-blue-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-industrial-blue-900">{t('addressLabel')}</h3>
                    <CopyableAddress
                      address={tCommon('address')}
                      cityStateZip={tCommon('cityStateZip')}
                      location="contact-page"
                      variant="light"
                      showIcon={false}
                      multiline
                    />
                    <a
                      href="https://goo.gl/maps/R8fawsprvH5KirYK7"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => { trackDirectionsClick('contact-page-link'); gtagDirectionsClick(); }}
                      className="text-precision-orange-500 text-sm hover:underline"
                    >
                      {tCommon('getDirections')} →
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-industrial-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-industrial-blue-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-industrial-blue-900">{t('hoursLabel')}</h3>
                    <p className="text-steel-600">
                      {t('mondayFriday')}<br />
                      8:30 AM - 4:00 PM EST
                    </p>
                    <p className="text-steel-500 text-sm">
                      {t('closedWeekend')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Quote CTA */}
              <div className="mt-8 p-6 bg-precision-orange-50 rounded-xl border border-precision-orange-200">
                <h3 className="font-semibold text-industrial-blue-900 mb-2">
                  {t('needQuote')}
                </h3>
                <p className="text-steel-600 text-sm mb-4">
                  {t('quoteDescription')}
                </p>
                <Link
                  href="/quote"
                  className="flex items-center gap-2 text-precision-orange-500 font-medium hover:underline"
                >
                  {tCommon('requestQuote')} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-steel-50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-industrial-blue-900 mb-6">
                  {t('sendMessage')}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-steel-700 mb-2"
                        >
                          {t('form.firstName')} {t('form.required')}
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
                          {t('form.lastName')} {t('form.required')}
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
                          {t('form.email')} {t('form.required')}
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
                          {t('form.phone')}
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
                        {t('form.company')}
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
                        {t('form.subject')} {t('form.required')}
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-steel-300 focus:border-industrial-blue-500 focus:ring-2 focus:ring-industrial-blue-200 outline-none transition-all"
                      >
                        <option value="">{t('form.selectSubject')}</option>
                        <option value="quote">{t('form.subjectQuote')}</option>
                        <option value="capabilities">{t('form.subjectCapabilities')}</option>
                        <option value="materials">{t('form.subjectMaterials')}</option>
                        <option value="order">{t('form.subjectOrder')}</option>
                        <option value="other">{t('form.subjectOther')}</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-steel-700 mb-2"
                      >
                        {t('form.message')} {t('form.required')}
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        required
                        value={formData.message}
                        onChange={handleChange}
                        placeholder={t('form.messagePlaceholder')}
                        className="w-full px-4 py-3 rounded-lg border border-steel-300 focus:border-industrial-blue-500 focus:ring-2 focus:ring-industrial-blue-200 outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Honeypot field - hidden from real users, bots will fill it */}
                    <div className="hidden" aria-hidden="true">
                      <label htmlFor="website">Website</label>
                      <input
                        type="text"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </div>

                    {/* Error message */}
                    {formStatus === 'error' && errorMessage && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {errorMessage}
                      </div>
                    )}

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
                          {t('form.sending')}
                        </>
                      ) : (
                        <>
                          {t('form.send')}
                          <Send className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </button>
                    <p className="text-xs text-steel-400 mt-4">
                      Protected by reCAPTCHA.{' '}
                      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-steel-600">Privacy</a>
                      {' & '}
                      <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-steel-600">Terms</a>
                    </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-0">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3025.8076144377897!2d-74.24894168458889!3d40.62889397934186!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c3b32b6b0c0001%3A0x1234567890abcdef!2s1190%20Sylvan%20St%2C%20Linden%2C%20NJ%2007036!5e0!3m2!1sen!2sus!4v1699999999999!5m2!1sen!2sus"
          width="100%"
          height="384"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Pro Plastics Inc. Location - 1190 Sylvan St, Linden, NJ 07036"
          className="w-full h-96"
        />
      </section>
    </>
  );
}
