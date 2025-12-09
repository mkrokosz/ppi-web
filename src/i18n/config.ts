export const locales = ['en', 'es', 'fr', 'it', 'pt', 'ja', 'hi'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

// Native names for each language (used for current language display)
export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  ja: '日本語',
  pt: 'Português',
  hi: 'हिन्दी',
};

// Localized names for each language in each locale
// localeNamesLocalized[viewingLocale][targetLocale] = name
export const localeNamesLocalized: Record<Locale, Record<Locale, string>> = {
  en: {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    it: 'Italian',
    ja: 'Japanese',
    pt: 'Portuguese',
    hi: 'Hindi',
  },
  es: {
    en: 'Inglés (English)',
    es: 'Español',
    fr: 'Francés',
    it: 'Italiano',
    ja: 'Japonés',
    pt: 'Portugués',
    hi: 'Hindi',
  },
  fr: {
    en: 'Anglais (English)',
    es: 'Espagnol',
    fr: 'Français',
    it: 'Italien',
    ja: 'Japonais',
    pt: 'Portugais',
    hi: 'Hindi',
  },
  it: {
    en: 'Inglese (English)',
    es: 'Spagnolo',
    fr: 'Francese',
    it: 'Italiano',
    ja: 'Giapponese',
    pt: 'Portoghese',
    hi: 'Hindi',
  },
  ja: {
    en: '英語 (English)',
    es: 'スペイン語',
    fr: 'フランス語',
    it: 'イタリア語',
    ja: '日本語',
    pt: 'ポルトガル語',
    hi: 'ヒンディー語',
  },
  pt: {
    en: 'Inglês (English)',
    es: 'Espanhol',
    fr: 'Francês',
    it: 'Italiano',
    ja: 'Japonês',
    pt: 'Português',
    hi: 'Hindi',
  },
  hi: {
    en: 'अंग्रेज़ी (English)',
    es: 'स्पेनिश',
    fr: 'फ़्रेंच',
    it: 'इतालवी',
    ja: 'जापानी',
    pt: 'पुर्तगाली',
    hi: 'हिन्दी',
  },
};

// Add more languages here in the future:
// 'fr': 'Français',
// 'de': 'Deutsch',
// 'zh': '中文',
// 'ja': '日本語',
// 'pt': 'Português',
