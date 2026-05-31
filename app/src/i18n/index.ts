import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import tl from './locales/tl';
import en from './locales/en';

i18n.use(initReactI18next).init({
  resources: {
    tl: { translation: tl },
    en: { translation: en },
  },
  lng: 'tl',
  fallbackLng: 'tl',
  interpolation: { escapeValue: false },
});

export default i18n;
