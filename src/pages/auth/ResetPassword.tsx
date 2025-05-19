import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/languageStore';
import { resetPassword } from '../../lib/supabase';
import { AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useToast } from '../../components/ToastContainer';

const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const isRtl = language === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // التحقق من صحة البريد الإلكتروني بشكل أكثر دقة
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        throw new Error(t('auth.invalidEmail'));
      }

      // إرسال رابط إعادة تعيين كلمة المرور
      const result = await resetPassword(email);
      setSuccess(true);

      // عرض عدد المحاولات المتبقية إذا كان متاحًا
      if (result && result.remainingRequests !== undefined) {
        setRemainingAttempts(result.remainingRequests);
        // عرض رسالة نجاح مع عدد المحاولات المتبقية
        showToast(`${t('auth.emailSent')} (${t('auth.remainingAttempts', { count: result.remainingRequests })})`, 'success');
      } else {
        // عرض رسالة نجاح بدون عدد المحاولات
        showToast(t('auth.emailSent'), 'success');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);

      // التحقق من نوع الخطأ وعرض رسالة مناسبة
      if (error.message === 'maxAttemptsReached') {
        setError(t('auth.maxAttemptsReached'));
      } else if (error.message === 'User not found with this email address') {
        setError(t('auth.invalidEmail'));
      } else {
        setError(error.message || t('auth.resetPasswordError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Language Switcher */}
      <LanguageSwitcher position="top-right" showLabel={true} />

      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t('auth.resetPassword')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.resetPasswordDescription')}
          </p>
        </div>

        {success ? (
          <div className="mt-8">
            <div className="rounded-md bg-green-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
                </div>
                <div className={`${isRtl ? 'mr-3' : 'ml-3'}`}>
                  <h3 className="text-sm font-medium text-green-800">
                    {t('auth.resetPasswordSuccess')}
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>{t('auth.resetPasswordSuccessDescription')}</p>
                    {remainingAttempts !== null && (
                      <p className="mt-2">
                        {t('auth.remainingAttempts', { count: remainingAttempts })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <ArrowLeft className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                {t('auth.backToLogin')}
              </button>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className={`${isRtl ? 'mr-3' : 'ml-3'}`}>
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  {t('auth.email')}
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm ${isRtl ? 'text-right' : 'text-left'}`}
                  placeholder={t('auth.email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir={isRtl ? 'rtl' : 'ltr'}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {isLoading ? t('common.loading') : t('auth.sendResetLink')}
              </button>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-sm">
                <Link
                  to="/login"
                  className="font-medium text-primary hover:text-primary-dark"
                >
                  {t('auth.backToLogin')}
                </Link>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
