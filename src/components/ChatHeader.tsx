import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Bot, User, LogOut, Settings, ChevronDown, Bell, MessageSquare, ArrowLeft, Globe } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getCountryByCode } from '../data/countries';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../store/languageStore';
import ProfileIcon from './ProfileIcon';
import LanguageSelector from './LanguageSelector';

const ChatHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  useTranslation(); // استخدام الهوك بدون تخزين القيم
  const { language, setLanguage } = useLanguageStore();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const country = user?.country_code ? getCountryByCode(user.country_code) : undefined;

  const toggleLanguage = () => {
    const newLanguage = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLanguage);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // إغلاق قائمة الإشعارات عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const goBack = () => {
    // العودة للصفحة السابقة بدلاً من الصفحة الرئيسية
    navigate(-1);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm py-3 px-4 md:px-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto flex justify-between items-center">
        {/* Left side with logo and assistant info */}
        <div className="flex items-center">
          {/* Back button */}
          <button
            onClick={goBack}
            className={`${language === 'ar' ? 'ml-4' : 'mr-4'} p-2 rounded-full hover:bg-gray-100 transition-colors`}
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          {/* Logo */}
          <Link to="/chat" className="flex items-center">
            {window.designSettings?.logo ? (
              <img src={window.designSettings.logo} alt="Logo" className={`h-8 w-auto ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
            ) : (
              <Bot className={`h-8 w-8 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
            )}
            <span className="text-xl font-bold text-blue-700">{window.siteName || 'RashadAI'}</span>
          </Link>
        </div>

        {/* Right side navigation */}
        <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : ''} space-x-4`}>
          {/* Language Selector */}
          <LanguageSelector />

          {/* Notifications */}
          {/* <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-full hover:bg-gray-100 relative"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {isNotificationsOpen && (
              <div className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200`}>
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className={`font-semibold text-gray-800 ${language === 'ar' ? 'text-right' : ''}`}>
                    {language === 'ar' ? 'الإشعارات' : 'Notifications'}
                  </h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                    <p className={`text-sm text-gray-800 ${language === 'ar' ? 'text-right' : ''}`}>
                      {language === 'ar' ? 'تم تحديث سياسة الخصوصية الخاصة بنا' : 'Our privacy policy has been updated'}
                    </p>
                    <p className={`text-xs text-gray-500 mt-1 ${language === 'ar' ? 'text-right' : ''}`}>
                      {language === 'ar' ? 'منذ ساعتين' : '2 hours ago'}
                    </p>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                    <p className={`text-sm text-gray-800 ${language === 'ar' ? 'text-right' : ''}`}>
                      {language === 'ar' ? 'تمت إضافة ميزات جديدة إلى الدردشة الطبية' : 'New features added to medical chat'}
                    </p>
                    <p className={`text-xs text-gray-500 mt-1 ${language === 'ar' ? 'text-right' : ''}`}>
                      {language === 'ar' ? 'منذ يوم واحد' : '1 day ago'}
                    </p>
                  </div>
                </div>
                <div className="px-4 py-2 border-t border-gray-100">
                  <button className={`text-sm text-blue-600 hover:text-blue-800 ${language === 'ar' ? 'w-full text-right' : ''}`}>
                    {language === 'ar' ? 'عرض جميع الإشعارات' : 'View all notifications'}
                  </button>
                </div>
              </div>
            )}
          </div> */}

          {/* Help button removed as requested */}

          {/* User profile */}
          {user ? (
            <ProfileIcon
              onSignOut={handleSignOut}
              showName={true}
              countryFlag={country?.flag}
            />
          ) : (
            <Link
              to="/login"
              className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
