'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Upload,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Clock,
  Shield,
  Phone,
} from 'lucide-react';

type Step = 1 | 2 | 3 | 4;

interface FileInfo {
  name: string;
  size: string;
}

export default function QuotePage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>([]);
  const [formData, setFormData] = useState({
    // Step 1 - Part Details
    partType: '',
    quantity: '',
    tolerance: '',
    // Step 2 - Material
    material: '',
    materialOther: '',
    // Step 3 - Timeline
    timeline: '',
    additionalInfo: '',
    // Step 4 - Contact
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: FileInfo[] = Array.from(files).map((file) => ({
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      }));
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setFormStatus('success');
  };

  const steps = [
    { number: 1, title: 'Part Details' },
    { number: 2, title: 'Material' },
    { number: 3, title: 'Timeline' },
    { number: 4, title: 'Contact Info' },
  ];

  if (formStatus === 'success') {
    return (
      <>
        <section className="bg-gradient-to-br from-industrial-blue-900 to-industrial-blue-800 text-white py-20">
          <div className="container-custom">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Request a Quote
              </h1>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container-custom max-w-2xl">
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-industrial-blue-900 mb-4">
                Quote Request Submitted!
              </h2>
              <p className="text-steel-600 text-lg mb-8">
                Thank you for your quote request. Our team will review your
                requirements and get back to you within 24 hours with a detailed
                quote.
              </p>
              <div className="bg-steel-50 rounded-xl p-6 mb-8 text-left">
                <h3 className="font-semibold text-industrial-blue-900 mb-4">
                  What happens next?
                </h3>
                <ol className="space-y-3 text-steel-600">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-precision-orange-400 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      1
                    </span>
                    <span>Our engineering team reviews your drawings and requirements</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-precision-orange-400 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      2
                    </span>
                    <span>We&apos;ll reach out if we need any clarification</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-precision-orange-400 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      3
                    </span>
                    <span>You&apos;ll receive a detailed quote via email within 24 hours</span>
                  </li>
                </ol>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/" className="btn-secondary">
                  Return Home
                </Link>
                <Link href="/capabilities" className="btn-outline">
                  View Capabilities
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

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
              Upload your drawings and specifications. We&apos;ll provide a
              detailed quote within 24 hours.
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
              <span>Questions? Call (866) 925-5000</span>
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
            {/* Step 1: Part Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-industrial-blue-900 mb-6">
                  Tell Us About Your Part
                </h2>

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

                <div className="grid sm:grid-cols-2 gap-6">
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

                  <div>
                    <label className="block text-sm font-medium text-steel-700 mb-2">
                      Tolerance Required
                    </label>
                    <select
                      name="tolerance"
                      value={formData.tolerance}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-steel-300 focus:border-industrial-blue-500 focus:ring-2 focus:ring-industrial-blue-200 outline-none transition-all"
                    >
                      <option value="">Select tolerance...</option>
                      <option value="standard">Standard (±0.005")</option>
                      <option value="precision">Precision (±0.002")</option>
                      <option value="high-precision">High Precision (±0.001")</option>
                      <option value="as-drawn">As Specified on Drawing</option>
                    </select>
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-steel-700 mb-2">
                    Upload Drawings (PDF, DXF, DWG, STEP, IGES)
                  </label>
                  <div className="border-2 border-dashed border-steel-300 rounded-xl p-8 text-center hover:border-precision-orange-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.dxf,.dwg,.step,.stp,.iges,.igs"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-steel-400 mx-auto mb-4" />
                      <p className="text-steel-600 mb-2">
                        Drag and drop files here, or{' '}
                        <span className="text-precision-orange-500 font-medium">
                          browse
                        </span>
                      </p>
                      <p className="text-steel-400 text-sm">
                        Max file size: 50MB
                      </p>
                    </label>
                  </div>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-steel-50 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-steel-500" />
                            <div>
                              <p className="text-sm font-medium text-steel-700">
                                {file.name}
                              </p>
                              <p className="text-xs text-steel-400">{file.size}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-steel-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Material */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-industrial-blue-900 mb-6">
                  Material Selection
                </h2>

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

            {/* Step 3: Timeline */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-industrial-blue-900 mb-6">
                  Timeline & Additional Details
                </h2>

                <div>
                  <label className="block text-sm font-medium text-steel-700 mb-2">
                    Required Timeline *
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

                <div>
                  <label className="block text-sm font-medium text-steel-700 mb-2">
                    Additional Information
                  </label>
                  <textarea
                    name="additionalInfo"
                    rows={5}
                    value={formData.additionalInfo}
                    onChange={handleChange}
                    placeholder="Any special requirements, certifications needed, surface finish specifications, or other details..."
                    className="w-full px-4 py-3 rounded-lg border border-steel-300 focus:border-industrial-blue-500 focus:ring-2 focus:ring-industrial-blue-200 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Contact Info */}
            {currentStep === 4 && (
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
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(555) 555-5555"
                      className="w-full px-4 py-3 rounded-lg border border-steel-300 focus:border-industrial-blue-500 focus:ring-2 focus:ring-industrial-blue-200 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-steel-700 mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-steel-300 focus:border-industrial-blue-500 focus:ring-2 focus:ring-industrial-blue-200 outline-none transition-all"
                  />
                </div>
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

              {currentStep < 4 ? (
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
          </form>
        </div>
      </section>
    </>
  );
}
