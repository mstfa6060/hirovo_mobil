import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { uiTr } from '@errors/locales/modules/ui/tr';
import { uiEn } from '@errors/locales/modules/ui/en'; // varsa

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'tr',
    lng: 'tr',
    resources: {
      tr: uiTr,
      en: uiEn,
    },
    interpolation: {
      escapeValue: false,
    },
  })
  .then(() => {
    // Init tamamlandı
    console.log('i18next initialized ✅');
  })
  .catch(err => {
    console.error('i18next init error ❌', err);
  });

export default i18n;
