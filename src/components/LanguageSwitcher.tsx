import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../store/languageStore';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  showLabel?: boolean;
  position?: 'top-right' | 'top-left' | 'inline';
}

/**
 * مكون لتبديل اللغة بين العربية والإنجليزية
 * يعرض أيقونة وإسم اللغة الأخرى
 */
const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '', 
  showLabel = true,
  position = 'top-right'
}) => {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  const isRtl = language === 'ar';

  const toggleLanguage = () => {
    const newLanguage = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLanguage);
  };

  // تحديد الفئات CSS بناءً على الموضع
  let positionClasses = '';
  if (position === 'top-right') {
    positionClasses = 'absolute top-4 right-4';
  } else if (position === 'top-left') {
    positionClasses = 'absolute top-4 left-4';
  } else {
    positionClasses = 'inline-flex';
  }

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center p-2 rounded-full hover:bg-gray-100 transition-colors ${positionClasses} ${className}`}
      aria-label="Toggle language"
      title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      {showLabel && (
        <span className={`text-sm font-medium text-gray-700 ${isRtl ? 'ml-2' : 'mr-2'}`}>
          {language === 'ar' ? 'English' : 'العربية'}
        </span>
      )}
      <Globe className="h-5 w-5 text-blue-600" />
    </button>
  );
};

export default LanguageSwitcher;
