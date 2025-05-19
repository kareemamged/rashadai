import React, { useState, useEffect } from 'react';
import { Menu, X, Activity, User, Moon, Sun, MessageSquare, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';
import ProfileIcon from './ProfileIcon';
import LanguageSelector from './LanguageSelector';

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleConsultation = () => {
    navigate('/consultation');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

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
    } else {
      // Check if user prefers dark mode
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  // Toggle dark mode
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${isScrolled
        ? 'bg-white shadow-md py-3'
        : 'bg-white py-4'
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            {window.designSettings?.logo ? (
              <img src={window.designSettings.logo} alt="Logo" className="h-8 w-auto mr-2 rtl:mr-0 rtl:ml-2" />
            ) : (
              <Activity className="h-8 w-8 text-primary mr-2 rtl:mr-0 rtl:ml-2" />
            )}
            <span className="text-xl font-bold text-secondary">{window.siteName || 'RashadAI'}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8 rtl:space-x-reverse">
            <Link to="/services" className="text-gray-700 hover:text-primary font-medium">
              {t('header.services')}
            </Link>
            <Link to="/vision" className="text-gray-700 hover:text-primary font-medium">
              {t('header.ourVision')}
            </Link>
            <Link to="/testimonials" className="text-gray-700 hover:text-primary font-medium">
              {t('header.testimonials')}
            </Link>
            <Link to="/blog" className="text-gray-700 hover:text-primary font-medium">
              {t('header.blog')}
            </Link>
          </nav>

          {/* <div className="hidden lg:flex items-center space-x-4 rtl:space-x-reverse">
            <LanguageSelector />

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
              title={isDarkMode ? t('header.lightMode') : t('header.darkMode')}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </button>

            <button
              onClick={handleConsultation}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
            >
              {t('header.startConsultation')}
            </button>

            {!user && (
              <Link
                to="/login"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {t('header.login')}
              </Link>
            )}
          </div> */}

          {/* Mobile Navigation Toggle and Profile Icon - now visible on screens below 1026px (lg breakpoint) */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <LanguageSelector />
            {user ?
              <ProfileIcon onSignOut={handleSignOut} />
              : (
                <Link
                  to="/login"
                  onClick={toggleMenu}
                  className="text-primary py-3 border-t border-gray-100 rtl:text-right block"
                >
                  {t('header.login')}
                </Link>
              )
            }

            <div className="lg:hidden">
              <button
                onClick={toggleMenu}
                className="text-gray-600 hover:text-primary focus:outline-none"
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu - now visible on screens below 1026px (lg breakpoint) */}
      {isOpen && (
        <div className="lg:hidden bg-white shadow-lg">
          <div className="flex flex-col py-4 px-4">
            <Link
              to="/services"
              onClick={toggleMenu}
              className="text-gray-700 py-3 border-b border-gray-100 rtl:text-right"
            >
              {t('header.services')}
            </Link>
            <Link
              to="/vision"
              onClick={toggleMenu}
              className="text-gray-700 py-3 border-b border-gray-100 rtl:text-right"
            >
              {t('header.ourVision')}
            </Link>
            <Link
              to="/testimonials"
              onClick={toggleMenu}
              className="text-gray-700 py-3 border-b border-gray-100 rtl:text-right"
            >
              {t('header.testimonials')}
            </Link>
            <Link
              to="/blog"
              onClick={toggleMenu}
              className="text-gray-700 py-3 border-b border-gray-100 rtl:text-right"
            >
              {t('header.blog')}
            </Link>
            <Link
              to="/#faq"
              onClick={toggleMenu}
              className="text-gray-700 py-3 mb-4 rtl:text-right"
            >
              {t('header.faq')}
            </Link>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => {
                  handleConsultation();
                  toggleMenu();
                }}
                className="bg-primary hover:bg-primary hover:brightness-90 text-white font-medium py-2 px-6 rounded-full"
              >
                {t('header.startConsultation')}
              </button>

              {/* <div className="flex items-center space-x-2 rtl:space-x-reverse">

                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-gray-700" />
                  )}
                </button>
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={toggleMenu}
                      className="text-gray-700 py-3 border-t border-gray-100 flex items-center rtl:flex-row-reverse rtl:text-right"
                    >
                      <User className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                      {t('header.profile')}
                    </Link>
                    <Link
                      to="/chat-history"
                      onClick={toggleMenu}
                      className="text-gray-700 py-3 border-b border-gray-100 flex items-center rtl:flex-row-reverse rtl:text-right"
                    >
                      <MessageSquare className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                      {t('header.chatHistory')}
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        toggleMenu();
                      }}
                      className="text-red-600 py-3 flex items-center w-full rtl:flex-row-reverse rtl:text-right"
                    >
                      <LogOut className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                      {t('header.logout')}
                    </button>
                  </>
                ) : (

                )}
              </div> */}
            </div>

          </div>
        </div>
      )}
    </header>
  );
};

export default Header;