import { create } from 'zustand';
import { changeLanguage } from '../i18n/i18n';

interface LanguageState {
  language: string;
  setLanguage: (language: string) => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  // Inicializar con el idioma guardado en localStorage o el idioma del navegador
  language: localStorage.getItem('language') || navigator.language.split('-')[0] || 'en',
  
  // Función para cambiar el idioma
  setLanguage: (language: string) => {
    // Guardar en localStorage
    localStorage.setItem('language', language);
    
    // Cambiar el idioma en i18next
    changeLanguage(language);
    
    // Actualizar el estado
    set({ language });
  },
  
  // Función para alternar entre inglés y árabe
  toggleLanguage: () => {
    const currentLanguage = get().language;
    const newLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
    get().setLanguage(newLanguage);
  }
}));
