'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
  Shield,
  Phone,
  Upload,
  X,
  FileText,
} from 'lucide-react';
import { trackQuoteRequest, gtagQuoteFormSubmit } from '@/lib/firebase';
import { useLocale } from 'next-intl';
import ReCaptchaProvider, { useReCaptcha } from '@/components/ReCaptchaProvider';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

type Step = 1 | 2;

// Supported file extensions for CAD drawings and documents
const ACCEPTED_FILE_TYPES = [
  '.pdf',
  '.step', '.stp',    // STEP files
  '.iges', '.igs',    // IGES files
  '.dxf', '.dwg',     // AutoCAD files
  '.stl',             // 3D printing
  '.sldprt', '.sldasm', // SolidWorks
  '.ipt', '.iam',     // Inventor
  '.prt',             // Various CAD
  '.x_t', '.sat',     // Parasolid/ACIS
  '.png', '.jpg', '.jpeg', '.tif', '.tiff', // Images
].join(',');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function QuotePage() {
  return (
    <ReCaptchaProvider>
      <QuotePageContent />
    </ReCaptchaProvider>
  );
}

function QuotePageContent() {
  const router = useRouter();
  const locale = useLocale();
  const { executeRecaptcha } = useReCaptcha();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    // Step 1 - Project Details
    partType: '',
    quantity: '',
    material: '',
    materialOther: '',
    timeline: '',
    additionalInfo: '',
    // Step 2 - Contact
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError('File size must be less than 10MB');
      e.target.value = '';
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setFileError('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(1);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    setErrorMessage('');

    const apiUrl = process.env.NEXT_PUBLIC_CONTACT_API_URL;

    // Get reCAPTCHA token
    const recaptchaToken = await executeRecaptcha('quote_form');

    // Build the message with all quote details
    const quoteMessage = `
QUOTE REQUEST DETAILS
=====================

PROJECT INFO:
- Part Type: ${formData.partType}
- Quantity: ${formData.quantity}
- Material: ${formData.material}${formData.material === 'other' ? ` (${formData.materialOther})` : ''}
- Timeline: ${formData.timeline}
${file ? `- Attachment: ${file.name}` : ''}

Additional Info: ${formData.additionalInfo || 'None'}
    `.trim();

    // Prepare file attachment if present
    let attachment = null;
    if (file) {
      try {
        const base64Data = await fileToBase64(file);
        attachment = {
          filename: file.name,
          content: base64Data,
          contentType: file.type || 'application/octet-stream',
        };
      } catch {
        console.error('Error encoding file');
        setErrorMessage('Failed to process file attachment. Please try again.');
        setFormStatus('error');
        return;
      }
    }

    if (!apiUrl) {
      // Fallback for development
      console.log('Quote form submission:', { ...formData, message: quoteMessage, attachment: attachment ? { filename: attachment.filename, size: file?.size } : null });
      console.log('reCAPTCHA token:', recaptchaToken);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      trackQuoteRequest(formData.partType, formData.material);
      gtagQuoteFormSubmit();
      router.push(`/quote/thank-you?lang=${locale}`);
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          subject: 'quote',
          partType: formData.partType,
          message: quoteMessage,
          recaptchaToken,
          attachment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit quote request');
      }

      trackQuoteRequest(formData.partType, formData.material);
      gtagQuoteFormSubmit();
      router.push(`/quote/thank-you?lang=${locale}`);
    } catch (error) {
      console.error('Quote form error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit quote request. Please try again.');
      setFormStatus('error');
    }
  };

  const steps = [
    { number: 1, title: 'Project Details' },
    { number: 2, title: 'Contact Info' },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-industrial-blue-900 to-industrial-blue-800 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Request a Quote
            </h1>
            <p className="text-xl text-steel-300 leading-relaxed">
              Tell us about your project. We&apos;ll provide a detailed quote
              within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-steel-50 py-4 border-b border-steel-200">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center items-center gap-8 text-steel-500 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-precision-orange-500" />
              <span>24-hour quote turnaround</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-precision-orange-500" />
              <span>NDA available upon request</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-precision-orange-500" />
              <span>Questions? Call +1 (866) 925-5000</span>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 bg-white">
        <div className="container-custom max-w-4xl">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                        currentStep >= step.number
                          ? 'bg-precision-orange-400 text-white'
                          : 'bg-steel-200 text-steel-500'
                      }`}
                    >
                      {currentStep > step.number ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 hidden sm:block ${
                        currentStep >= step.number
                          ? 'text-industrial-blue-900 font-medium'
                          : 'text-steel-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 w-16 sm:w-24 mx-2 ${
                        currentStep > step.number ? 'bg-precision-orange-400' : 'bg-steel-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Step 1: Project Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-industrial-blue-900 mb-6">
                  Tell Us About Your Project
                </h2>

                {/* Part Type and Quantity */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-steel-700 mb-2">
                      Part Type *
                    </label>
                    <select
                      name="partType"
                      required
                      value={formData.partType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-steel-300 focus:border-industrial-blue-500 focus:ring-2 focus:ring-industrial-blue-200 outline-none transition-all"
                    >
                      <option value="">Select part type...</option>
                      <option value="machined">CNC Machined Part</option>
                      <option value="fabricated">Fabricated Component</option>
                      <option value="sheet">Cut Sheet/Panel</option>
                      <option value="rod-tube">Rod/Tube Stock</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-steel-700 mb-2">
                      Quantity *
                    </label>
                    <select
                      name="quantity"
                      required
                      value={formData.quantity}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-steel-300 focus:border-industrial-blue-500 focus:ring-2 focus:ring-industrial-blue-200 outline-none transition-all"
                    >
                      <option value="">Select quantity range...</option>
                      <option value="1-10">1-10 pieces</option>
                      <option value="11-50">11-50 pieces</option>
                      <option value="51-100">51-100 pieces</option>
                      <option value="101-500">101-500 pieces</option>
                      <option value="500+">500+ pieces</option>
                    </select>
                  </div>
                </div>

                {/* Material and Timeline */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-steel-700 mb-2">
                      Preferred Material *
                    </label>
                    <select
                      name="material"
                      required
                      value={formData.material}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-steel-300 focus:border-industrial-blue-500 focus:ring-2 focus:ring-industrial-blue-200 outline-none transition-all"
                    >
                      <option value="">Select material...</option>
                      <optgroup label="High Performance">
                        <option value="peek">PEEK</option>
                        <option value="ultem">Ultem (PEI)</option>
                        <option value="torlon">Torlon (PAI)</option>
                      </optgroup>
                      <optgroup label="Engineering">
                        <option value="delrin">Delrin (Acetal)</option>
                        <option value="nylon">Nylon 6/6</option>
                        <option value="acetal">Acetal Copolymer</option>
                      </optgroup>
                      <optgroup label="Fluoropolymer">
                        <option value="ptfe">PTFE (Teflon)</option>
                        <option value="pvdf">PVDF (Kynar)</option>
                      </optgroup>
                      <optgroup label="Standard">
                        <option value="uhmw">UHMW</option>
                        <option value="hdpe">HDPE</option>
                        <option value="polycarbonate">Polycarbonate</option>
                        <option value="acrylic">Acrylic</option>
                        <option value="pvc">PVC</option>
                      </optgroup>
                      <optgroup label="Thermoset">
                        <option value="phenolic">Phenolic</option>
                        <option value="g10">G-10/FR-4</option>
                      </optgroup>
                      <option value="need-help">Need help selecting</option>
                      <option value="other">Other (specify below)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-steel-700 mb-2">
                      Timeline *
                    </label>
                    <select
                      name="timeline"
                      required
                      value={formData.timeline}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-steel-300 focus:border-industrial-blue-500 focus:ring-2 focus:ring-industrial-blue-200 outline-none transition-all"
                    >
                      <option value="">Select timeline...</option>
                      <option value="rush">Rush (1-3 business days)</option>
                      <option value="expedited">Expedited (1 week)</option>
                      <option value="standard">Standard (2-3 weeks)</option>
                      <option value="flexible">Flexible / Best Price</option>
                    </select>
                  </div>
                </div>

                {formData.material === 'other' && (
                  <div>
                    <label className="block text-sm font-medium text-steel-700 mb-2">
                      Specify Material
                    </label>
                    <input
                      type="text"
                      name="materialOther"
                      value={formData.materialOther}
                      onChange={handleChange}
                      placeholder="Enter material name or specification"
                      className="w-full px-4 py-3 rounded-lg border border-steel-300 focus:border-industrial-blue-500 focus:ring-2 focus:ring-industrial-blue-200 outline-none transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-steel-700 mb-2">
                    Additional Information
                  </label>
                  <textarea
                    name="additionalInfo"
                    rows={4}
                    value={formData.additionalInfo}
                    onChange={handleChange}
                    placeholder="Any special requirements, certifications needed, surface finish specifications, or other details..."
                    className="w-full px-4 py-3 rounded-lg border border-steel-300 focus:border-industrial-blue-500 focus:ring-2 focus:ring-industrial-blue-200 outline-none transition-all resize-none"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-steel-700 mb-2">
                    Attach Drawing or Document (optional)
                  </label>
                  <p className="text-sm text-steel-500 mb-3">
                    Upload CAD files, drawings, or images. Max 10MB.
                  </p>

                  {!file ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-steel-300 border-dashed rounded-lg cursor-pointer bg-steel-50 hover:bg-steel-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-steel-400" />
                        <p className="text-sm text-steel-500">
                          <span className="font-medium text-industrial-blue-600">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-steel-400 mt-1">
                          PDF, STEP, DXF, DWG, STL, SolidWorks, and more
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept={ACCEPTED_FILE_TYPES}
                        onChange={handleFileChange}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-steel-50 rounded-lg border border-steel-200">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-industrial-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-steel-700 truncate max-w-[200px] sm:max-w-none">
                            {file.name}
                          </p>
                          <p className="text-xs text-steel-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-2 text-steel-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Remove file"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {fileError && (
                    <p className="mt-2 text-sm text-red-600">{fileError}</p>
                  )}
                </div>

                <div className="bg-industrial-blue-50 rounded-xl p-6">
                  <h3 className="font-semibold text-industrial-blue-900 mb-2">
                    Not sure which material to choose?
                  </h3>
                  <p className="text-steel-600 text-sm mb-4">
                    Our material experts can help you select the optimal plastic
                    for your application based on your requirements.
                  </p>
                  <Link
                    href="/materials"
                    className="text-precision-orange-500 font-medium text-sm hover:underline flex items-center gap-1"
                  >
                    Browse Material Database <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Step 2: Contact Info */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-industrial-blue-900 mb-6">
                  Your Contact Information
                </h2>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-steel-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-steel-300 focus:border-industrial-blue-500 focus:ring-2 focus:ring-industrial-blue-200 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-steel-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
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
                    <label className="block text-sm font-medium text-steel-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-steel-300 focus:border-industrial-blue-500 focus:ring-2 focus:ring-industrial-blue-200 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-steel-700 mb-2">
                      Phone (optional)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(555) 555-5555"
                      className="w-full px-4 py-3 rounded-lg border border-steel-300 focus:border-industrial-blue-500 focus:ring-2 focus:ring-industrial-blue-200 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-steel-700 mb-2">
                    Company (optional)
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-steel-300 focus:border-industrial-blue-500 focus:ring-2 focus:ring-industrial-blue-200 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Error message */}
            {formStatus === 'error' && errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {errorMessage}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-steel-200">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 px-6 py-3 text-steel-600 hover:text-industrial-blue-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {currentStep < 2 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={formStatus === 'submitting'}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Quote Request
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              )}
            </div>
            <p className="text-xs text-steel-400 mt-4 text-center">
              Protected by reCAPTCHA.{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-steel-600">Privacy</a>
              {' & '}
              <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-steel-600">Terms</a>
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
