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
