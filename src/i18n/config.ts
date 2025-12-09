export const locales = ['en', 'es', 'hi'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  hi: 'हिन्दी',
};

// Add more languages here in the future:
// 'fr': 'Français',
// 'de': 'Deutsch',
// 'zh': '中文',
// 'ja': '日本語',
// 'pt': 'Português',
