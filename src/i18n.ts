import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en, pt, es } from './locales';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, pt: { translation: pt }, es: { translation: es } },
  lng: localStorage.getItem('i18nextLng') || 'pt',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;