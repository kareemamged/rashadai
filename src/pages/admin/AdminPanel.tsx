import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useLanguageStore } from '../../store/languageStore';

const AdminPanel = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { adminUser, isLoading, error: adminError, signInAdmin } = useAdminAuthStore();
  const { setLanguage } = useLanguageStore();

  // إذا كان المستخدم مسجل دخول بالفعل، توجيهه إلى لوحة التحكم
  useEffect(() => {
    if (adminUser) {
      console.log('Admin user already logged in, redirecting to dashboard');
      // استخدام setTimeout لتجنب مشاكل التوجيه
      const timer = setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [adminUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // استخدام المخزن الجديد لتسجيل دخول المشرف
      await signInAdmin(username, password);

      console.log('Login successful, setting success state');
      setLoginSuccess(true);

      // استخدام setTimeout لتجنب مشاكل التوجيه
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 100);
    } catch (error: any) {
      console.error('Admin login error:', error);
      setError(error.message || t('admin.loginFailed', 'Login failed'));
    }
  };

  // إذا تم تسجيل الدخول بنجاح، عرض رسالة التوجيه
  if (loginSuccess || adminUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <Activity className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-bold mb-2">Redirecting...</h2>
          <p className="text-gray-600">You are being redirected to the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center mb-8">
          <Activity className="h-10 w-10 text-blue-600 mr-2" />
          <span className="text-2xl font-bold text-gray-900">RashadAI Admin</span>
        </div>

        {(error || adminError) && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            {error || adminError}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {t('login.email', 'Email')}
            </label>
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {t('login.password', 'Password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher position="top-right" showLabel={true} />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
          >
            {isLoading ? t('common.loading', 'Loading...') : t('login.signIn', 'Sign In')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;