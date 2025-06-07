import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import tr from '@locales/tr';
import en from '@locales/en';

const LANGUAGE_KEY = 'app-language';

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback: (lang: string) => void) => {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    const fallback = 'tr'; // default language
    callback(savedLanguage || fallback);
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    await AsyncStorage.setItem(LANGUAGE_KEY, lng);
  }
};

i18n
  .use(languageDetector as any)
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: tr.translation },
      en: { translation: en.translation }
    },
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
