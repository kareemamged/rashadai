import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n/i18n'; // Importar configuración de i18n

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
