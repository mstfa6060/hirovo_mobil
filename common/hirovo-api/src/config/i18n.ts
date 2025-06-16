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

const resources = {
  ar: uiAr,
  de: uiDe,
  en: uiEn,
  es: uiEs,
  fr: uiFr,
  hi: uiHi,
  pt: uiPt,
  ru: uiRu,
  tr: uiTr,
  zh: uiZh,
};

// Cihaz dilini al
const deviceLanguageRaw = Localization.getLocales()?.[0]?.languageCode ?? 'en';

// Desteklenen dil mi kontrol et
const deviceLanguage = (Object.keys(resources).includes(deviceLanguageRaw)
  ? deviceLanguageRaw
  : 'en') as keyof typeof resources;

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
