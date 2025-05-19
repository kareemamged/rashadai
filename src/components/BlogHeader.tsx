import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Activity, User, LogOut, Settings, MessageSquare, Moon, Sun, Globe } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';

const BlogHeader: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check for dark mode on component mount
  useEffect(() => {
    // Check localStorage for theme setting
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        const theme = parsedSettings.appearance?.theme;

        if (theme === 'dark') {
          setIsDarkMode(true);
        } else if (theme === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setIsDarkMode(prefersDark);
        }
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    // Apply theme
    const root = document.documentElement;
    if (newDarkMode) {
      root.classList.add('dark');
      document.body.style.backgroundColor = '#1a1a1a';
      document.body.style.color = '#f3f4f6';
    } else {
      root.classList.remove('dark');
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    }

    // Save to localStorage if settings exist
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        parsedSettings.appearance = {
          ...parsedSettings.appearance,
          theme: newDarkMode ? 'dark' : 'light'
        };
        localStorage.setItem('userSettings', JSON.stringify(parsedSettings));
      } catch (error) {
        console.error('Error updating settings:', error);
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className={`py-4 transition-all duration-300 sticky top-0 z-10 ${
      scrolled ? 'bg-white shadow-md' : 'bg-white/80 backdrop-blur-md'
    }`} dir={currentLanguage === 'en' ? 'ltr' : 'rtl'} lang={currentLanguage}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            {window.designSettings?.logo ? (
              <img src={window.designSettings.logo} alt="Logo" className={`h-8 w-auto ${currentLanguage === 'en' ? 'mr-2' : 'ml-2'}`} />
            ) : (
              <Activity className={`h-8 w-8 text-blue-600 ${currentLanguage === 'en' ? 'mr-2' : 'ml-2'}`} />
            )}
            <span className="text-xl font-bold text-blue-700">{window.siteName || 'RashadAI'}</span>
          </Link>

          <nav className={`hidden md:flex items-center ${currentLanguage === 'en' ? 'space-x-8' : 'space-x-reverse space-x-8'}`}>
            <Link
              to="/blog"
              className={`transition-colors ${
                location.pathname === '/blog' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {currentLanguage === 'en' ? 'All Posts' : 'جميع المنشورات'}
            </Link>
            <Link
              to="/blog/category/news"
              className={`transition-colors ${
                location.pathname === '/blog/category/news' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {currentLanguage === 'en' ? 'News' : 'أخبار'}
            </Link>
            <Link
              to="/blog/category/tips"
              className={`transition-colors ${
                location.pathname === '/blog/category/tips' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {currentLanguage === 'en' ? 'Tips' : 'نصائح'}
            </Link>
          </nav>

          <div className={`flex items-center ${currentLanguage === 'en' ? 'space-x-4' : 'space-x-reverse space-x-4'}`}>
            <Link to="/" className="flex items-center text-gray-600 hover:text-blue-600">
              <span className={currentLanguage === 'en' ? 'mr-1' : 'ml-1'}>{currentLanguage === 'en' ? 'Back to Main' : 'العودة للرئيسية'}</span>
              <FileText className="h-4 w-4" />
            </Link>
            
            <button
              onClick={() => i18n.changeLanguage(currentLanguage === 'en' ? 'ar' : 'en')}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle language"
              title={currentLanguage === 'en' ? "Switch to Arabic" : "Switch to English"}
            >
              <Globe className="h-5 w-5 text-blue-600" />
            </button>

            {/* <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </button> */}

            

            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 rounded-full hover:bg-gray-100 p-1 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-gray-200">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name || 'User profile'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-blue-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                  </div>
                </button>

                {isProfileMenuOpen && (
                  <div className={`absolute ${currentLanguage === 'en' ? 'right-0' : 'left-0'} mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200`}>
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className={`text-sm font-medium text-gray-900 ${currentLanguage === 'ar' ? 'text-right' : ''}`}>{user.name || user.email.split('@')[0]}</p>
                      <p className={`text-sm text-gray-500 truncate ${currentLanguage === 'ar' ? 'text-right' : ''}`}>{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <User className={`h-4 w-4 ${currentLanguage === 'en' ? 'mr-2' : 'ml-2'}`} />
                      {currentLanguage === 'en' ? 'Profile' : 'الملف الشخصي'}
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings className={`h-4 w-4 ${currentLanguage === 'en' ? 'mr-2' : 'ml-2'}`} />
                      {currentLanguage === 'en' ? 'Settings' : 'الإعدادات'}
                    </Link>
                    <Link
                      to="/chat-history"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <MessageSquare className={`h-4 w-4 ${currentLanguage === 'en' ? 'mr-2' : 'ml-2'}`} />
                      {currentLanguage === 'en' ? 'Chat History' : 'سجل المحادثات'}
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className={`h-4 w-4 ${currentLanguage === 'en' ? 'mr-2' : 'ml-2'}`} />
                      {currentLanguage === 'en' ? 'Logout' : 'تسجيل الخروج'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {currentLanguage === 'en' ? 'Login' : 'تسجيل الدخول'}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default BlogHeader;