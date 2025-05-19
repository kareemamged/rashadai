import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar archivos de traducción
import enTranslation from './locales/en.json';
import arTranslation from './locales/ar.json';

// Intentar cargar traducciones personalizadas desde localStorage
const loadCustomTranslations = () => {
  try {
    const storedEnTranslations = localStorage.getItem('translations_en');
    const storedArTranslations = localStorage.getItem('translations_ar');

    return {
      en: storedEnTranslations ? JSON.parse(storedEnTranslations) : enTranslation,
      ar: storedArTranslations ? JSON.parse(storedArTranslations) : arTranslation
    };
  } catch (error) {
    console.warn('Error loading custom translations from localStorage:', error);
    return {
      en: enTranslation,
      ar: arTranslation
    };
  }
};

const translations = loadCustomTranslations();

// Configuración de i18next
i18n
  // Detectar el idioma del navegador
  .use(LanguageDetector)
  // Integración con React
  .use(initReactI18next)
  // Inicializar i18next
  .init({
    resources: {
      en: {
        translation: translations.en
      },
      ar: {
        translation: translations.ar
      }
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false // React ya escapa los valores
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

// Función para cambiar el idioma y actualizar la dirección del documento
export const changeLanguage = (language: string) => {
  i18n.changeLanguage(language).then(() => {
    // Actualizar la dirección del documento según el idioma
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';

    // Añadir o quitar la clase RTL al body
    if (language === 'ar') {
      document.body.classList.add('rtl');
      document.body.style.direction = 'rtl';
      document.body.style.textAlign = 'right';
    } else {
      document.body.classList.remove('rtl');
      document.body.style.direction = 'ltr';
      document.body.style.textAlign = 'left';
    }

    // Forzar actualización de la dirección en todos los elementos con dir explícito
    const elementsWithDir = document.querySelectorAll('[dir]');
    elementsWithDir.forEach(el => {
      if (el instanceof HTMLElement) {
        if (language === 'ar') {
          el.dir = 'rtl';
        } else {
          el.dir = 'ltr';
        }
      }
    });
  });
};

// Establecer la dirección inicial según el idioma actual
document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = i18n.language;

if (i18n.language === 'ar') {
  document.body.classList.add('rtl');
  document.body.style.direction = 'rtl';
} else {
  document.body.style.direction = 'ltr';
}

export default i18n;
