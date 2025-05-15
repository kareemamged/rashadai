import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../store/languageStore';

const LanguageTest: React.FC = () => {
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguageStore();

  return (
    <div className="max-w-4xl mx-auto my-12 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6">{t('settings.language.title')}</h2>
      
      <div className="mb-6">
        <p className="mb-2">{t('common.appName')}</p>
        <p className="mb-2">{t('header.services')}</p>
        <p className="mb-2">{t('header.ourVision')}</p>
        <p className="mb-2">{t('header.testimonials')}</p>
        <p className="mb-2">{t('header.blog')}</p>
      </div>
      
      <div className="mb-6">
        <p className="mb-2">{t('home.hero.title')}</p>
        <p className="mb-2">{t('home.hero.subtitle')}</p>
      </div>
      
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <button
          onClick={toggleLanguage}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
        </button>
        <p>
          {t('settings.language.select')}: {language === 'ar' ? t('settings.language.arabic') : t('settings.language.english')}
        </p>
      </div>
    </div>
  );
};

export default LanguageTest;
