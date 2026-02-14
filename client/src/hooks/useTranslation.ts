import { useState, useEffect } from 'react';
import { translations, Language, TranslationKeys } from '../locales/translations';

const STORAGE_KEY = 'glwa-language';

export function useTranslation() {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem(STORAGE_KEY) as Language;
    if (savedLang && translations[savedLang]) {
      setLanguage(savedLang);
    } else {
      // 브라우저 언어 감지
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('es')) setLanguage('es');
      else if (browserLang.startsWith('zh')) setLanguage('zh');
      else if (browserLang.startsWith('ja')) setLanguage('ja');
      else if (browserLang.startsWith('ko')) setLanguage('ko');
      else setLanguage('en');
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  return {
    t: translations[language],
    language,
    changeLanguage,
    languages: [
      { code: 'en', name: 'English', flag: '🇬🇧' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'zh', name: '中文', flag: '🇨🇳' },
      { code: 'ja', name: '日本語', flag: '🇯🇵' },
      { code: 'ko', name: '한국어', flag: '🇰🇷' }
    ] as const
  };
}
