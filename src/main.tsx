import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n/i18n'; // Importar configuración de i18n
import { supabase } from './lib/supabase';
import { initEmailJS } from './lib/emailjs';

// Establecer la dirección inicial según el idioma guardado
const savedLanguage = localStorage.getItem('language');
if (savedLanguage === 'ar') {
  document.documentElement.dir = 'rtl';
  document.documentElement.lang = 'ar';
  document.body.classList.add('rtl');
  document.body.style.direction = 'rtl';
  document.body.style.textAlign = 'right';

  // Agregar una regla CSS global para forzar la dirección en elementos específicos
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    html[lang="ar"] .blog-content,
    html[lang="ar"] .post-content,
    html[lang="ar"] .comment-content {
      direction: rtl !important;
      text-align: right !important;
    }

    html[lang="en"] .blog-content,
    html[lang="en"] .post-content,
    html[lang="en"] .comment-content {
      direction: ltr !important;
      text-align: left !important;
    }
  `;
  document.head.appendChild(styleEl);
} else {
  document.documentElement.dir = 'ltr';
  document.documentElement.lang = 'en';
  document.body.classList.remove('rtl');
  document.body.style.direction = 'ltr';
  document.body.style.textAlign = 'left';
}

// Load SEO settings from Supabase
async function loadSEOSettings() {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Error loading SEO settings:', error);
      return;
    }

    if (data) {
      // Create a settings object with the structure expected by updateSEOTags
      const settings = {
        siteName: data.site_name,
        siteDescription: data.site_description,
        contactEmail: data.contact_email,
        contactPhone: data.contact_phone,
        seo: data.seo_settings || {},
        socialMedia: data.social_media || {},
        contactInfo: data.contact_info || {}
      };

      // Set global variables for use throughout the app
      window.siteName = settings.siteName;
      window.siteDescription = settings.siteDescription;
      window.systemSettings = settings;

      // Update SEO tags if the function exists
      if (typeof window.updateSEOTags === 'function') {
        window.updateSEOTags(settings);
      }
    }
  } catch (error) {
    console.error('Error in loadSEOSettings:', error);
  }
}

// Initialize EmailJS
initEmailJS();

// Load SEO settings
loadSEOSettings();



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
