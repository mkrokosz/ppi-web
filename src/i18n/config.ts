export const locales = ['en', 'es', 'fr', 'it', 'pt', 'ja', 'zh', 'hi', 'ar'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

// Native names for each language (used for current language display)
export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  pt: 'Português',
  ja: '日本語',
  zh: '简体中文',
  hi: 'हिन्दी',
  ar: 'العربية',
};

// RTL locales
export const rtlLocales: Locale[] = ['ar'];

// Localized names for each language in each locale
// localeNamesLocalized[viewingLocale][targetLocale] = name
export const localeNamesLocalized: Record<Locale, Record<Locale, string>> = {
  en: {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    it: 'Italian',
    pt: 'Portuguese',
    ja: 'Japanese',
    zh: 'Chinese',
    hi: 'Hindi',
    ar: 'Arabic',
  },
  es: {
    en: 'Inglés (English)',
    es: 'Español',
    fr: 'Francés',
    it: 'Italiano',
    pt: 'Portugués',
    ja: 'Japonés',
    zh: 'Chino',
    hi: 'Hindi',
    ar: 'Árabe',
  },
  fr: {
    en: 'Anglais (English)',
    es: 'Espagnol',
    fr: 'Français',
    it: 'Italien',
    pt: 'Portugais',
    ja: 'Japonais',
    zh: 'Chinois',
    hi: 'Hindi',
    ar: 'Arabe',
  },
  it: {
    en: 'Inglese (English)',
    es: 'Spagnolo',
    fr: 'Francese',
    it: 'Italiano',
    pt: 'Portoghese',
    ja: 'Giapponese',
    zh: 'Cinese',
    hi: 'Hindi',
    ar: 'Arabo',
  },
  pt: {
    en: 'Inglês (English)',
    es: 'Espanhol',
    fr: 'Francês',
    it: 'Italiano',
    pt: 'Português',
    ja: 'Japonês',
    zh: 'Chinês',
    hi: 'Hindi',
    ar: 'Árabe',
  },
  ja: {
    en: '英語 (English)',
    es: 'スペイン語',
    fr: 'フランス語',
    it: 'イタリア語',
    pt: 'ポルトガル語',
    ja: '日本語',
    zh: '中国語',
    hi: 'ヒンディー語',
    ar: 'アラビア語',
  },
  zh: {
    en: '英语 (English)',
    es: '西班牙语',
    fr: '法语',
    it: '意大利语',
    pt: '葡萄牙语',
    ja: '日语',
    zh: '简体中文',
    hi: '印地语',
    ar: '阿拉伯语',
  },
  hi: {
    en: 'अंग्रेज़ी (English)',
    es: 'स्पेनिश',
    fr: 'फ़्रेंच',
    it: 'इतालवी',
    pt: 'पुर्तगाली',
    ja: 'जापानी',
    zh: 'चीनी',
    hi: 'हिन्दी',
    ar: 'अरबी',
  },
  ar: {
    en: 'الإنجليزية (English)',
    es: 'الإسبانية',
    fr: 'الفرنسية',
    it: 'الإيطالية',
    pt: 'البرتغالية',
    ja: 'اليابانية',
    zh: 'الصينية',
    hi: 'الهندية',
    ar: 'العربية',
  },
};

// Add more languages here in the future:
// 'fr': 'Français',
// 'de': 'Deutsch',
// 'zh': '中文',
// 'ja': '日本語',
// 'pt': 'Português',
