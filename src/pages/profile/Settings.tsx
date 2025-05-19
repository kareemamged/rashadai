import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Settings as SettingsIcon, User, Lock, Bell, Shield, Palette, Loader, Save, Moon, Sun, Type } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import ChatHeader from '../../components/ChatHeader';
import DeletionAlert from '../../components/DeletionAlert';
import { useTranslation } from 'react-i18next';

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      app: true,
    },
    privacy: {
      saveHistory: true,
      shareData: false,
    },
    appearance: {
      theme: 'light',
      fontSize: 'medium',
    },
  });
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState<'en' | 'ar'>(i18n.language === 'ar' ? 'ar' : 'en');

  useEffect(() => {
    setLanguage(i18n.language === 'ar' ? 'ar' : 'en');
  }, [i18n.language]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Load settings from localStorage if available
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prevSettings => ({
          ...prevSettings,
          ...parsedSettings
        }));

        // Apply theme and font size from saved settings
        applyTheme(parsedSettings.appearance?.theme || 'light');
        applyFontSize(parsedSettings.appearance?.fontSize || 'medium');
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, [user, navigate]);

  // Function to apply theme
  const applyTheme = (theme: string) => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.style.backgroundColor = '#1a1a1a';
      document.body.style.color = '#f3f4f6';
    } else if (theme === 'light') {
      root.classList.remove('dark');
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    } else if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        document.body.style.backgroundColor = '#1a1a1a';
        document.body.style.color = '#f3f4f6';
      } else {
        root.classList.remove('dark');
        document.body.style.backgroundColor = '';
        document.body.style.color = '';
      }
    }
  };

  // Function to apply font size
  const applyFontSize = (fontSize: string) => {
    const root = document.documentElement;

    switch (fontSize) {
      case 'small':
        root.style.fontSize = '14px';
        break;
      case 'medium':
        root.style.fontSize = '16px';
        break;
      case 'large':
        root.style.fontSize = '18px';
        break;
      default:
        root.style.fontSize = '16px';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');

    try {
      // Save settings to localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings));

      // Apply theme and font size
      applyTheme(settings.appearance.theme);
      applyFontSize(settings.appearance.fontSize);

      // Simulate server request
      await new Promise(resolve => setTimeout(resolve, 800));

      setSuccessMessage('Settings saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle theme change
  const handleThemeChange = (theme: string) => {
    setSettings({
      ...settings,
      appearance: {
        ...settings.appearance,
        theme
      }
    });

    // Apply theme immediately for better UX
    applyTheme(theme);
  };

  // Handle font size change
  const handleFontSizeChange = (fontSize: string) => {
    setSettings({
      ...settings,
      appearance: {
        ...settings.appearance,
        fontSize
      }
    });

    // Apply font size immediately for better UX
    applyFontSize(fontSize);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <ChatHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {language === 'ar' ? 'الإعدادات العامة' : 'General Settings'}
          </h1>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="md:flex">
              {/* Sidebar */}
              <div className="md:w-64 bg-gray-50 p-6 border-r border-gray-200">
                <nav className="space-y-1">
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                  >
                    <User className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'} text-gray-500`} />
                    {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
                  </Link>
                  <Link
                    to="/change-password"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                  >
                    <Lock className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'} text-gray-500`} />
                    {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md"
                  >
                    <SettingsIcon className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'} text-blue-500`} />
                    {language === 'ar' ? 'الإعدادات العامة' : 'General Settings'}
                  </Link>
                </nav>
              </div>

              {/* Main content */}
              <div className="flex-1 p-6">
                {/* إضافة تنبيه حذف الحساب */}
                <DeletionAlert />

                {successMessage && (
                  <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    {successMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Notifications */}
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                      <Bell className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'} text-gray-500`} />
                      {language === 'ar' ? 'إعدادات الإشعارات' : 'Notification Settings'}
                    </h2>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center">
                        <input
                          id="email-notifications"
                          type="checkbox"
                          checked={settings.notifications.email}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              email: e.target.checked
                            }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="email-notifications" className="ml-3 block text-sm text-gray-700">
                          {language === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="app-notifications"
                          type="checkbox"
                          checked={settings.notifications.app}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              app: e.target.checked
                            }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="app-notifications" className="ml-3 block text-sm text-gray-700">
                        {language === 'ar' ? 'إشعارات التطبيق' : 'App Notifications'}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Privacy */}
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                      <Shield className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'} text-gray-500`} />
                      {language === 'ar' ? 'إعدادات الخصوصية' : 'Privacy Settings'}
                    </h2>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center">
                        <input
                          id="save-history"
                          type="checkbox"
                          checked={settings.privacy.saveHistory}
                          onChange={(e) => setSettings({
                            ...settings,
                            privacy: {
                              ...settings.privacy,
                              saveHistory: e.target.checked
                            }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="save-history" className="ml-3 block text-sm text-gray-700">
                          {language === 'ar' ? 'حفظ سجل الدردشة' : 'Save Chat History'}
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="share-data"
                          type="checkbox"
                          checked={settings.privacy.shareData}
                          onChange={(e) => setSettings({
                            ...settings,
                            privacy: {
                              ...settings.privacy,
                              shareData: e.target.checked
                            }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="share-data" className="ml-3 block text-sm text-gray-700">
                          {language === 'ar' ? 'شارك بياناتك لتحسين الخدمة' : 'Share Data to Improve Service'}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Appearance */}
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                      <Palette className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'} text-gray-500`} />
                      {language === 'ar' ? 'إعدادات المظهر' : 'Appearance Settings'}
                    </h2>
                    <div className="mt-4 space-y-6">
                      {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          {language === 'ar' ? 'السمة' : 'Theme'}
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          <div
                            className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${settings.appearance.theme === 'light'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                              }`}
                            onClick={() => handleThemeChange('light')}
                          >
                            <Sun className="h-6 w-6 text-yellow-500 mb-2" />
                            <span className="text-sm font-medium">{language === 'ar' ? 'فاتح' : 'Light'}</span>
                          </div>
                          <div
                            className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${settings.appearance.theme === 'dark'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                              }`}
                            onClick={() => handleThemeChange('dark')}
                          >
                            <Moon className="h-6 w-6 text-indigo-600 mb-2" />
                            <span className="text-sm font-medium">{language === 'ar' ? 'داكن' : 'Dark'}</span>
                          </div>
                          <div
                            className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${settings.appearance.theme === 'system'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                              }`}
                            onClick={() => handleThemeChange('system')}
                          >
                            <div className="flex mb-2">
                              <Sun className="h-6 w-6 text-yellow-500" />
                              <Moon className="h-6 w-6 text-indigo-600 -ml-1" />
                            </div>
                            <span className="text-sm font-medium">{language === 'ar' ? 'النظام' : 'System'}</span>
                          </div>
                        </div>
                      </div> */}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          {language === 'ar' ? 'حجم الخط' : 'Font Size'}
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          <div
                            className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${settings.appearance.fontSize === 'small'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                              }`}
                            onClick={() => handleFontSizeChange('small')}
                          >
                            <Type className="h-5 w-5 text-gray-600 mb-2" />
                            <span className="text-xs font-medium">{language === 'ar' ? 'صغير' : 'Small'}</span>
                          </div>
                          <div
                            className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${settings.appearance.fontSize === 'medium'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                              }`}
                            onClick={() => handleFontSizeChange('medium')}
                          >
                            <Type className="h-6 w-6 text-gray-600 mb-2" />
                            <span className="text-sm font-medium">{language === 'ar' ? 'متوسط' : 'Medium'}</span>
                          </div>
                          <div
                            className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${settings.appearance.fontSize === 'large'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                              }`}
                            onClick={() => handleFontSizeChange('large')}
                          >
                            <Type className="h-7 w-7 text-gray-600 mb-2" />
                            <span className="text-base font-medium">{language === 'ar' ? 'كبير' : 'Large'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`flex ${language === 'ar' ? 'justify-start' : 'justify-end'}`}>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <Loader className={`animate-spin h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                          {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                        </>
                      ) : (
                        <>
                          <Save className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                          {language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
