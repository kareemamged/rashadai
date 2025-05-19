import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/languageStore';
import { updatePassword, getCurrentUser, supabase } from '../../lib/supabase';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const NewPassword: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const isRtl = language === 'ar';

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Log the full URL for debugging
        console.log('Current URL:', window.location.href);

        // Extract URL parameters
        const searchParams = new URLSearchParams(location.search);

        // Check for custom reset token
        const customToken = searchParams.get('token');
        if (customToken) {
          console.log('Found custom reset token in URL');

          try {
            // التحقق من صلاحية التوكن
            // التوكن يكون بالصيغة: base64(email)-timestamp-randomString
            const tokenParts = customToken.split('-');
            if (tokenParts.length < 3) {
              console.error('Invalid token format');
              setIsAuthenticated(false);
              return;
            }

            // استخراج البريد الإلكتروني من التوكن
            try {
              const emailBase64 = tokenParts[0];
              // استخدام atob بدلاً من Buffer لفك التشفير (متاح في المتصفح)
              let email;
              try {
                email = decodeURIComponent(atob(emailBase64));
              } catch (decodeError) {
                console.error('Error decoding email from token:', decodeError);
                // محاولة استخدام طريقة بديلة لفك التشفير
                try {
                  email = atob(emailBase64);
                } catch (fallbackError) {
                  console.error('Fallback decoding also failed:', fallbackError);
                  setError(t('auth.invalidOrExpiredLink'));
                  setIsAuthenticated(false);
                  return;
                }
              }

              // التحقق من الطابع الزمني (صالح لمدة 24 ساعة)
              const timestamp = parseInt(tokenParts[1]);
              const now = Date.now();
              const oneDayMs = 24 * 60 * 60 * 1000;

              if (isNaN(timestamp) || now - timestamp > oneDayMs) {
                console.error('Token has expired');
                setError(t('auth.tokenExpired'));
                setIsAuthenticated(false);
                return;
              }

              // التحقق من استخدام التوكن سابقًا
              const usedTokensKey = 'used_reset_tokens';
              const usedTokensJson = localStorage.getItem(usedTokensKey);
              const usedTokens = usedTokensJson ? JSON.parse(usedTokensJson) : [];

              if (usedTokens.includes(customToken)) {
                console.error('Token has already been used');
                setError(t('auth.tokenUsed'));
                setIsAuthenticated(false);
                return;
              }

              console.log('Custom token is valid');
              setIsAuthenticated(true);
              return;
            } catch (decodeError) {
              console.error('Error decoding email from token:', decodeError);
              setIsAuthenticated(false);
            }
          } catch (tokenError) {
            console.error('Error verifying custom token:', tokenError);
            setIsAuthenticated(false);
          }
        } else {
          // Extract URL parameters from different possible locations
          const hash = location.hash;
          const hashParams = new URLSearchParams(hash.replace('#', ''));

          console.log('Search params:', Object.fromEntries(searchParams.entries()));
          console.log('Hash params:', Object.fromEntries(hashParams.entries()));

          // Look for reset password parameters in URL
          const accessToken = searchParams.get('access_token') || hashParams.get('access_token');
          const refreshToken = searchParams.get('refresh_token') || hashParams.get('refresh_token');
          const type = searchParams.get('type') || hashParams.get('type');

          // Check for token in the URL fragment (Supabase sometimes puts it there)
          const urlFragment = window.location.href.split('#')[1];
          console.log('URL fragment:', urlFragment);

          // Try to extract token from fragment if it exists
          let fragmentToken = null;
          if (urlFragment && urlFragment.includes('access_token')) {
            try {
              const fragmentParams = new URLSearchParams(urlFragment);
              fragmentToken = fragmentParams.get('access_token');
              console.log('Found token in fragment:', !!fragmentToken);
            } catch (e) {
              console.error('Error parsing fragment:', e);
            }
          }

          // Use any token we found
          const finalAccessToken = accessToken || fragmentToken;

          console.log('Final URL params:', {
            accessToken: !!finalAccessToken,
            refreshToken: !!refreshToken,
            type
          });

          // If we have an access token, use it to create a session
          if (finalAccessToken) {
            console.log('Found token in URL, attempting to set session');

            try {
              // Create session using the access token
              const { data, error } = await supabase.auth.setSession({
                access_token: finalAccessToken,
                refresh_token: refreshToken || ''
              });

              if (error) {
                console.error('Error setting session:', error);
                setIsAuthenticated(false);
              } else if (data.session) {
                console.log('Session set successfully');
                setIsAuthenticated(true);
                return;
              }
            } catch (sessionError) {
              console.error('Exception setting session:', sessionError);
              setIsAuthenticated(false);
            }
          } else {
            // Check for existing session as fallback
            const user = await getCurrentUser();
            console.log('Current user check result:', !!user);
            setIsAuthenticated(!!user);
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      // التحقق من تطابق كلمتي المرور
      if (password !== confirmPassword) {
        throw new Error(t('auth.passwordsDoNotMatch'));
      }

      // التحقق من طول كلمة المرور
      if (password.length < 6) {
        throw new Error(t('auth.passwordTooShort'));
      }

      // الحصول على التوكن المخصص من عنوان URL إذا كان موجودًا
      const searchParams = new URLSearchParams(location.search);
      const customToken = searchParams.get('token');

      if (!customToken && !isAuthenticated) {
        throw new Error(t('auth.invalidOrExpiredLink'));
      }

      // تحديث كلمة المرور
      try {
        // التحقق من آخر محاولة لتحديث كلمة المرور
        const lastUpdateAttemptKey = 'last_password_update_attempt';
        const lastUpdateTime = localStorage.getItem(lastUpdateAttemptKey);
        const now = Date.now();

        if (lastUpdateTime && now - parseInt(lastUpdateTime) < 5000) {
          // إذا كانت آخر محاولة قبل أقل من 5 ثوانٍ، ننتظر قليلاً
          await new Promise(resolve => setTimeout(resolve, 5000));
        }

        // تخزين وقت المحاولة الحالية
        localStorage.setItem(lastUpdateAttemptKey, now.toString());

        let result;
        if (customToken) {
          console.log('Using custom token for password update');
          result = await updatePassword(password, customToken);
        } else {
          result = await updatePassword(password);
        }

        // إضافة تأخير قصير للتأكد من معالجة الطلب
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (result.success) {
          if (result.message) {
            setMessage(result.message);
          } else {
            setSuccess(true);

            // توجيه المستخدم إلى صفحة تسجيل الدخول بعد 3 ثوانٍ
            setTimeout(() => {
              navigate('/login');
            }, 3000);
          }
        } else if (result.message) {
          setMessage(result.message);
        }
      } catch (updateError: any) {
        console.error('Update password error:', updateError);

        // إذا كان الخطأ يتعلق بانتهاء صلاحية الرابط أو استخدامه من قبل
        if (updateError.message.includes('expired') || updateError.message.includes('already been used')) {
          throw updateError;
        } else if (updateError.message.includes('security purposes') ||
                  updateError.message.includes('Too Many Requests')) {
          // مشكلة في الطلبات المتكررة
          setMessage('For security purposes, please wait before requesting another password reset.');
        } else if (updateError.message.includes('AuthApiError') ||
                  updateError.message.includes('Failed to fetch') ||
                  updateError.message.includes('NetworkError')) {
          // مشكلة في الاتصال بـ Supabase
          setMessage('Could not reset password. Please try again later or request a new link.');
        } else {
          // محاولة إرسال رابط جديد
          try {
            if (customToken) {
              const emailBase64 = customToken.split('-')[0];
              let email;

              try {
                email = decodeURIComponent(atob(emailBase64));
              } catch (decodeError) {
                try {
                  email = atob(emailBase64);
                } catch (fallbackError) {
                  throw new Error(t('auth.invalidOrExpiredLink'));
                }
              }

              if (email) {
                // التحقق من آخر وقت تم فيه إرسال طلب إعادة تعيين كلمة المرور
                const lastResetRequestKey = 'last_reset_request_time';
                const lastResetTime = localStorage.getItem(lastResetRequestKey);

                if (lastResetTime && now - parseInt(lastResetTime) < 20000) {
                  // إذا كان آخر طلب تم إرساله قبل أقل من 20 ثانية، نعرض رسالة للمستخدم
                  setMessage('For security purposes, please wait at least 20 seconds before requesting another password reset.');
                  return;
                }

                // تخزين وقت الطلب الحالي
                localStorage.setItem(lastResetRequestKey, now.toString());

                try {
                  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin + '/reset-password/update'
                  });

                  if (resetError) {
                    if (resetError.message.includes('security purposes') ||
                        resetError.message.includes('Too Many Requests')) {
                      setMessage('For security purposes, please wait before requesting another password reset.');
                    } else {
                      throw resetError;
                    }
                  } else {
                    setMessage('A new password reset link has been sent to your email.');
                  }
                } catch (resetError) {
                  console.error('Error sending new reset link:', resetError);
                  throw new Error('Could not reset password. Please try again later.');
                }

                return;
              }
            }

            throw new Error(t('auth.invalidOrExpiredLink'));
          } catch (resetError: any) {
            throw resetError;
          }
        }
      }
    } catch (error: any) {
      console.error('Update password error:', error);
      setError(error.message || t('auth.updatePasswordError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Language Switcher */}
        <LanguageSwitcher position="top-right" showLabel={true} />

        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {t('common.loading')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {language === 'ar'
                ? 'جاري التحقق من صلاحية الرابط...'
                : 'Verifying your link...'}
            </p>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Language Switcher */}
        <LanguageSwitcher position="top-right" showLabel={true} />

        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {t('auth.invalidOrExpiredLink')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t('auth.requestNewLink')}
            </p>
            <div className="mt-4 rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className={`${isRtl ? 'mr-3' : 'ml-3'}`}>
                  <h3 className="text-sm font-medium text-yellow-800">
                    {t('auth.invalidOrExpiredLink')}
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>{error || t('auth.requestNewLink')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => navigate('/reset-password')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {t('auth.resetPassword')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Language Switcher */}
      <LanguageSwitcher position="top-right" showLabel={true} />

      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t('auth.setNewPassword')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.setNewPasswordDescription')}
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
                    {t('auth.passwordUpdatedSuccess')}
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>{t('auth.redirectingToLogin')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          </div>
        ) : message ? (
          <div className="mt-8">
            <div className={`rounded-md ${message.includes('security purposes') || message.includes('wait') ? 'bg-yellow-50' : 'bg-blue-50'} p-4 mb-4`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className={`h-5 w-5 ${message.includes('security purposes') || message.includes('wait') ? 'text-yellow-400' : 'text-blue-400'}`} aria-hidden="true" />
                </div>
                <div className={`${isRtl ? 'mr-3' : 'ml-3'}`}>
                  <h3 className={`text-sm font-medium ${message.includes('security purposes') || message.includes('wait') ? 'text-yellow-800' : 'text-blue-800'}`}>
                    {message.includes('security purposes') || message.includes('wait') ? t('common.warning') : t('common.info')}
                  </h3>
                  <div className={`mt-2 text-sm ${message.includes('security purposes') || message.includes('wait') ? 'text-yellow-700' : 'text-blue-700'}`}>
                    <p>{message}</p>
                    {message.includes('security purposes') || message.includes('wait') ? (
                      <div className="mt-2">
                        <div className="w-full bg-yellow-200 rounded-full h-2.5">
                          <div className="bg-yellow-500 h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                        </div>
                        <p className="text-xs mt-1 text-yellow-600">{t('common.pleaseWait')}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/reset-password')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {t('auth.resetPassword')}
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary bg-white border-primary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ml-2"
              >
                {t('auth.loginButton')}
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
                    {error.includes('expired') || error.includes('already been used') ? (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => navigate('/reset-password')}
                          className="text-sm text-red-600 hover:text-red-800 underline"
                        >
                          {t('auth.requestNewLink')}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="password" className={`block text-sm font-medium text-gray-700 ${isRtl ? 'text-right' : 'text-left'}`}>
                  {t('auth.newPassword')}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className={`appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm ${isRtl ? 'text-right' : 'text-left'}`}
                    placeholder={t('auth.newPassword')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    dir={isRtl ? 'rtl' : 'ltr'}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="relative">
                <label htmlFor="confirm-password" className={`block text-sm font-medium text-gray-700 ${isRtl ? 'text-right' : 'text-left'}`}>
                  {t('auth.confirmPassword')}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className={`appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm ${isRtl ? 'text-right' : 'text-left'}`}
                    placeholder={t('auth.confirmPassword')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    dir={isRtl ? 'rtl' : 'ltr'}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {isLoading ? t('common.loading') : t('auth.updatePassword')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewPassword;
