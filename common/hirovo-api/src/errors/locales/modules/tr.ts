// import backendCommon from './backend/common/tr';
// import backendHirovo from './backend/hirovo/tr';
// import { uiTr } from './ui/tr';

// export default {
//   translation: {
//     ...backendCommon.translation,
//     ...backendHirovo.translation,
//     ...uiTr.translation
//   }
// };


import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import tr from './locales/tr'; // Senin dosyan

i18n
  .use(initReactI18next)
  .init({
    lng: 'tr',
    fallbackLng: 'tr',
    ns: ['ui', 'common', 'error', 'jobType', 'jobStatus'],
    defaultNS: 'ui',
    resources: {
      tr,
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
