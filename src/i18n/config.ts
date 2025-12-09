export const locales = ['en', 'es', 'fr', 'hi'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

// Native names for each language (used for current language display)
export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  hi: 'हिन्दी',
};

// Localized names for each language in each locale
// localeNamesLocalized[viewingLocale][targetLocale] = name
export const localeNamesLocalized: Record<Locale, Record<Locale, string>> = {
  en: {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    hi: 'Hindi',
  },
  es: {
    en: 'Inglés (English)',
    es: 'Español',
    fr: 'Francés',
    hi: 'Hindi',
  },
  fr: {
    en: 'Anglais (English)',
    es: 'Espagnol',
    fr: 'Français',
    hi: 'Hindi',
  },
  hi: {
    en: 'अंग्रेज़ी (English)',
    es: 'स्पेनिश',
    fr: 'फ़्रेंच',
    hi: 'हिन्दी',
  },
};

// Add more languages here in the future:
// 'fr': 'Français',
// 'de': 'Deutsch',
// 'zh': '中文',
// 'ja': '日本語',
// 'pt': 'Português',
