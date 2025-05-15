import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/ToastContainer';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, user } = useAuthStore();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/chat');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);
      navigate('/chat');
    } catch (err: any) {
      console.error('Login error:', err);

      // Handle Supabase errors
      if (err.message === 'Invalid login credentials') {
        setError(t('auth.login.errors.invalidCredentials'));
      } else if (err.message === 'Email not confirmed') {
        setError(t('auth.login.errors.emailNotConfirmed'));
      } else if (err.message && err.message.includes('blocked')) {
        // إذا كان الخطأ يتعلق بحظر الحساب
        // استخدام الرسالة الأصلية مباشرة بدلاً من محاولة الترجمة
        setError(err.message);

        // تسجيل الرسالة في وحدة التحكم للتشخيص
        console.log('Block error message:', err.message);
      } else {
        setError(err.message || t('auth.login.errors.generic'));
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
          {t('auth.login.title')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('auth.login.noAccount')}{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            {t('auth.login.createAccount')}
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 rtl:text-right">
                {t('auth.login.email')}
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rtl:text-right"
                  placeholder="example@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 rtl:text-right">
                {t('auth.login.password')}
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ltr:pr-10 rtl:pl-10 rtl:text-right"
                  placeholder="******"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 ltr:right-0 rtl:left-0 ltr:pr-3 rtl:pl-3 flex items-center text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ltr:ml-2 rtl:mr-2 block text-sm text-gray-900 rtl:text-right">
                  {t('auth.login.rememberMe')}
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-primary hover:text-primary hover:opacity-80">
                  {t('auth.login.forgotPassword')}
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t('auth.login.signingIn') : t('auth.login.signInButton')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;