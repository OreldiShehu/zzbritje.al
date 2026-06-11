import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import al from './locales/al.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import it from './locales/it.json';
import nl from './locales/nl.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      al: { translation: al },
      fr: { translation: fr },
      de: { translation: de },
      it: { translation: it },
      nl: { translation: nl },
    },
    fallbackLng: 'al',
    supportedLngs: ['al', 'en', 'fr', 'de', 'it', 'nl'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'zbritje_lang',
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

export const LANGUAGES = [
  { code: 'al', label: 'Shqip', flag: '🇦🇱' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
];
