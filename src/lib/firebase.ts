import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported, logEvent, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "proplastics-c162d.firebaseapp.com",
  projectId: "proplastics-c162d",
  storageBucket: "proplastics-c162d.firebasestorage.app",
  messagingSenderId: "474568609148",
  appId: "1:474568609148:web:e287a6d099a2b8221168f9",
  measurementId: "G-CG7964FG5H",
};

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let analyticsInstance: Analytics | null = null;

// Initialize Analytics (client-side only)
export const initAnalytics = async () => {
  if (typeof window !== 'undefined' && await isSupported()) {
    analyticsInstance = getAnalytics(app);
    return analyticsInstance;
  }
  return null;
};

// Get analytics instance
export const getAnalyticsInstance = () => analyticsInstance;

// Track phone call clicks
export const trackPhoneClick = (phoneNumber: string, location: string) => {
  if (analyticsInstance) {
    logEvent(analyticsInstance, 'phone_click', {
      phone_number: phoneNumber,
      click_location: location,
    });
  }
};

// Track phone copy (when user clicks copy button)
export const trackPhoneCopy = (phoneNumber: string, location: string) => {
  if (analyticsInstance) {
    logEvent(analyticsInstance, 'phone_copy', {
      phone_number: phoneNumber,
      click_location: location,
    });
  }
};

// Track email clicks
export const trackEmailClick = (email: string, location: string) => {
  if (analyticsInstance) {
    logEvent(analyticsInstance, 'email_click', {
      email_address: email,
      click_location: location,
    });
  }
};

// Track email copy (when user clicks copy button)
export const trackEmailCopy = (email: string, location: string) => {
  if (analyticsInstance) {
    logEvent(analyticsInstance, 'email_copy', {
      email_address: email,
      click_location: location,
    });
  }
};

// Track address copy (when user clicks copy button)
export const trackAddressCopy = (location: string) => {
  if (analyticsInstance) {
    logEvent(analyticsInstance, 'address_copy', {
      click_location: location,
    });
  }
};

// Track directions click (when user clicks address or "Get Directions" link)
export const trackDirectionsClick = (location: string) => {
  if (analyticsInstance) {
    logEvent(analyticsInstance, 'directions_click', {
      click_location: location,
    });
  }
};

// Track contact form submission
export const trackContactFormSubmit = (subject: string) => {
  if (analyticsInstance) {
    logEvent(analyticsInstance, 'contact_form_submit', {
      form_subject: subject,
    });
  }
};

// Track quote request submission
export const trackQuoteRequest = (partType: string, material: string) => {
  if (analyticsInstance) {
    logEvent(analyticsInstance, 'quote_request', {
      part_type: partType,
      material: material,
    });
  }
};

// Track Request Quote button clicks
export const trackQuoteButtonClick = (location: string) => {
  if (analyticsInstance) {
    logEvent(analyticsInstance, 'quote_button_click', {
      click_location: location,
    });
  }
};

export { app };

// ===========================================
// Google Ads Conversion Tracking (gtag)
// ===========================================

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Google Ads conversion labels
const GOOGLE_ADS_CONVERSIONS = {
  email_click: 'AW-17791759320/-b45COCeqNAbENjn4qNC',
  email_copy: 'AW-17791759320/g19FCOOeqNAbENjn4qNC',
  phone_click: 'AW-17791759320/7ao8CLChqNAbENjn4qNC',
  phone_copy: 'AW-17791759320/xix2CLOhqNAbENjn4qNC',
  directions_click: 'AW-17791759320/eyCACLahqNAbENjn4qNC',
  address_copy: 'AW-17791759320/ZrRrCLmhqNAbENjn4qNC',
  click_to_call: 'AW-17791759320/vHH3CMOF5M4bENjn4qNC',
  request_quote_button: 'AW-17791759320/s2OwCJiKhNAbENjn4qNC',
  contact_form_submit: 'AW-17791759320/uK1RCKDgotAbENjn4qNC',
  quote_form_submit: 'AW-17791759320/i0mVCKPgotAbENjn4qNC',
} as const;

// Send conversion to Google Ads
const sendGoogleAdsConversion = (conversionLabel: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: conversionLabel,
    });
  }
};

// Google Ads conversion tracking functions
export const gtagEmailClick = () => sendGoogleAdsConversion(GOOGLE_ADS_CONVERSIONS.email_click);
export const gtagEmailCopy = () => sendGoogleAdsConversion(GOOGLE_ADS_CONVERSIONS.email_copy);
export const gtagPhoneClick = () => sendGoogleAdsConversion(GOOGLE_ADS_CONVERSIONS.phone_click);
export const gtagPhoneCopy = () => sendGoogleAdsConversion(GOOGLE_ADS_CONVERSIONS.phone_copy);
export const gtagDirectionsClick = () => sendGoogleAdsConversion(GOOGLE_ADS_CONVERSIONS.directions_click);
export const gtagAddressCopy = () => sendGoogleAdsConversion(GOOGLE_ADS_CONVERSIONS.address_copy);
export const gtagClickToCall = () => sendGoogleAdsConversion(GOOGLE_ADS_CONVERSIONS.click_to_call);
export const gtagRequestQuoteButton = () => sendGoogleAdsConversion(GOOGLE_ADS_CONVERSIONS.request_quote_button);
export const gtagContactFormSubmit = () => sendGoogleAdsConversion(GOOGLE_ADS_CONVERSIONS.contact_form_submit);
export const gtagQuoteFormSubmit = () => sendGoogleAdsConversion(GOOGLE_ADS_CONVERSIONS.quote_form_submit);
