import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'react-native-localize';

import { uiTr } from '@errors/locales/modules/ui/tr';
import { uiEn } from '@errors/locales/modules/ui/en';
import { uiAr } from '@errors/locales/modules/ui/ar';
import { uiZh } from '@errors/locales/modules/ui/zh';
import { uiDe } from '@errors/locales/modules/ui/de';
import { uiEs } from '@errors/locales/modules/ui/es';
import { uiFr } from '@errors/locales/modules/ui/fr';
import { uiHi } from '@errors/locales/modules/ui/hi';
import { uiPt } from '@errors/locales/modules/ui/pt';
import { uiRu } from '@errors/locales/modules/ui/ru';

import backendCommonTr from '@errors/locales/modules/backend/common/tr';
import backendHirovoTr from '@errors/locales/modules/backend/hirovo/tr';

// 🔀 Merge fonksiyonu
const mergeTranslations = (...objects: any[]) =>
  objects.reduce((acc, obj) => {
    for (const ns in obj.translation) {
      acc[ns] = {
        ...(acc[ns] || {}),
        ...obj.translation[ns],
      };
    }
    return acc;
  }, {} as any);

// 🇹🇷 Türkçe kaynakları birleştir
const trMerged = {
  translation: mergeTranslations(uiTr, backendCommonTr, backendHirovoTr)
};

// 🌐 Tüm kaynaklar
const resources = {
  tr: trMerged,
  en: uiEn,
  ar: uiAr,
  zh: uiZh,
  de: uiDe,
  es: uiEs,
  fr: uiFr,
  hi: uiHi,
  pt: uiPt,
  ru: uiRu,
};

// 📱 Cihaz dili
const deviceLanguageRaw = Localization.getLocales()?.[0]?.languageCode ?? 'en';
const deviceLanguage = (Object.keys(resources).includes(deviceLanguageRaw)
  ? deviceLanguageRaw
  : 'en') as keyof typeof resources;

// 🧠 i18next başlat
i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    lng: deviceLanguage,
    resources,
    interpolation: {
      escapeValue: false,
    },
  })
  .then(() => {
    console.log(`i18next initialized ✅ Dil: ${deviceLanguage}`);
  })
  .catch(err => {
    console.error('i18next init error ❌', err);
  });

export default i18n;
