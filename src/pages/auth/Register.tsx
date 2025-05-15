import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/ToastContainer';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const navigate = useNavigate();
  const { signUp, user } = useAuthStore();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/chat');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.register.errors.passwordsNotMatch'));
      return;
    }

    if (!formData.acceptTerms) {
      setError(t('auth.register.errors.agreeTerms'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.register.errors.passwordLength'));
      return;
    }

    setIsLoading(true);

    try {
      // Default country code to 'US' since we removed the country field
      await signUp(formData.email, formData.password, 'US', formData.name);

      // Show success toast instead of alert
      showToast(t('auth.register.success'), 'success');

      // Navigate to login page
      navigate('/login');
    } catch (err: any) {
      console.error('Signup error:', err);

      // Handle Supabase errors
      if (err.message?.includes('email already registered')) {
        setError(t('auth.register.errors.emailExists'));
        showToast(t('auth.register.errors.emailExists'), 'error');
      } else if (err.message?.includes('password')) {
        setError(t('auth.register.errors.invalidPassword'));
        showToast(t('auth.register.errors.invalidPassword'), 'error');
      } else if (err.message?.includes('Database error saving new user')) {
        // This is likely due to missing profiles table or RLS policies
        setError(t('auth.register.errors.databaseError'));
        showToast(t('auth.register.errors.databaseError'), 'error');

        // Log more detailed error for debugging
        console.error('Database error during signup. Please check if the profiles table exists in Supabase and RLS policies are set correctly.');

        // Try to show a more helpful message to the user
        showToast('يرجى التواصل مع مسؤول النظام. قد تكون هناك مشكلة في إعدادات قاعدة البيانات.', 'error');
      } else {
        setError(err.message || t('auth.register.errors.generic'));
        showToast(t('auth.register.errors.generic'), 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Activity className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t('auth.register.title')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('auth.register.haveAccount')}{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            {t('auth.login.title')}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg rtl:text-right">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 rtl:text-right">
                {t('auth.register.fullName')}
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rtl:text-right"
                  placeholder={t('auth.register.fullNamePlaceholder')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 rtl:text-right">
                {t('auth.register.email')}
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rtl:text-right"
                  placeholder="example@example.com"
                />
              </div>
            </div>



            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 rtl:text-right">
                {t('auth.register.password')}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rtl:text-right"
                  placeholder="******"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 rtl:text-right">{t('auth.register.passwordHint')}</p>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 rtl:text-right">
                {t('auth.register.confirmPassword')}
              </label>
              <div className="mt-1">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rtl:text-right"
                  placeholder="******"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="accept-terms"
                name="accept-terms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="accept-terms" className="ltr:ml-2 rtl:mr-2 block text-sm text-gray-900 rtl:text-right">
                {t('auth.register.agreeToTerms')}{' '}
                <Link to="/privacy" className="text-primary hover:text-primary hover:opacity-80">
                  {t('legal.privacy.title')}
                </Link>
                {' '}{t('common.and')}{' '}
                <Link to="/cookies" className="text-primary hover:text-primary hover:opacity-80">
                  {t('legal.cookies.title')}
                </Link>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t('auth.register.creating') : t('auth.register.createButton')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;