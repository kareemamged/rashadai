import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/languageStore';
import { supabase } from '../../lib/supabase';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const ResetPasswordUpdate: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const isRtl = language === 'ar';

  useEffect(() => {
    // استخراج التوكن من عنوان URL
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    setToken(tokenParam);

    if (!tokenParam) {
      setError(t('auth.invalidOrExpiredLink'));
    }
  }, [location.search, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // التحقق من تطابق كلمات المرور
      if (password !== confirmPassword) {
        throw new Error(t('auth.passwordsDoNotMatch'));
      }

      // التحقق من قوة كلمة المرور
      if (password.length < 8) {
        throw new Error(t('auth.passwordTooShort'));
      }

      if (!token) {
        throw new Error(t('auth.invalidOrExpiredLink'));
      }

      // محاولة استخدام عدة طرق لإعادة تعيين كلمة المرور
      let success = false;
      let email = null;

      // الطريقة الأولى: استخدام وظيفة RPC المقترحة
      try {
        console.log('Trying update_password_with_token RPC function');
        const { data: data1, error: error1 } = await supabase.rpc('update_password_with_token', {
          email_param: null, // لا نعرف البريد الإلكتروني هنا
          token_param: token,
          new_password: password
        });

        if (!error1 && data1 && data1.success) {
          console.log('Password reset successful with update_password_with_token');
          success = true;
          email = data1.email;
        } else if (error1) {
          console.error('Error with update_password_with_token:', error1);
        }
      } catch (error1) {
        console.error('Exception with update_password_with_token:', error1);
      }

      // الطريقة الثانية: استخدام وظيفة RPC البديلة
      if (!success) {
        try {
          console.log('Trying reset_password_alt RPC function');
          const { data: data2, error: error2 } = await supabase.rpc('reset_password_alt', {
            p_token: token,
            p_password: password
          });

          if (!error2 && data2 && data2.success) {
            console.log('Password reset successful with reset_password_alt');
            success = true;
            email = data2.email;
          } else if (error2) {
            console.error('Error with reset_password_alt:', error2);
          } else if (data2 && !data2.success) {
            console.error('Password reset failed with reset_password_alt:', data2.message);
          }
        } catch (error2) {
          console.error('Exception with reset_password_alt:', error2);
        }
      }

      // الطريقة الثالثة: استخدام وظيفة RPC أخرى
      if (!success) {
        try {
          console.log('Trying simple_reset_password RPC function');

          // الحصول على معرف المستخدم من التوكن
          let userId = null;
          try {
            // محاولة استخراج معرف المستخدم من التوكن
            const { data: tokenData, error: tokenError } = await supabase.rpc('get_user_id_from_token', {
              p_token: token
            });

            if (!tokenError && tokenData) {
              userId = tokenData.user_id;
              console.log('Retrieved user ID from token:', userId);

              // الحصول على البريد الإلكتروني للمستخدم
              const { data: userData, error: userError } = await supabase
                .from('profiles')
                .select('email')
                .eq('id', userId)
                .single();

              if (!userError && userData && userData.email) {
                email = userData.email;
                console.log('Retrieved email from user profile:', email);
              } else {
                // محاولة الحصول على البريد الإلكتروني من جدول المستخدمين
                try {
                  const { data: authData } = await supabase.auth.admin.getUserById(userId);
                  if (authData && authData.user && authData.user.email) {
                    email = authData.user.email;
                    console.log('Retrieved email from auth user:', email);
                  }
                } catch (authError) {
                  console.error('Error getting user from auth admin API:', authError);

                  // محاولة استخراج البريد الإلكتروني من التوكن نفسه
                  try {
                    // التوكن يحتوي على البريد الإلكتروني المشفر بـ base64 في الجزء الأول
                    const tokenParts = token.split('-');
                    if (tokenParts.length >= 3) {
                      const emailBase64 = tokenParts[0];

                      // محاولة فك تشفير البريد الإلكتروني
                      try {
                        // طريقة 1: فك تشفير base64 قياسي
                        const decodedEmail = atob(emailBase64);
                        if (decodedEmail.includes('@')) {
                          email = decodedEmail;
                          console.log('Retrieved email from token (standard base64):', email);
                        }
                      } catch (decodeError1) {
                        console.error('Error decoding email with standard base64:', decodeError1);

                        // طريقة 2: تجربة فك تشفير base64 مع استبدال الأحرف الخاصة
                        try {
                          const fixedBase64 = emailBase64.replace(/-/g, '+').replace(/_/g, '/');
                          const decodedEmail = atob(fixedBase64);
                          if (decodedEmail.includes('@')) {
                            email = decodedEmail;
                            console.log('Retrieved email from token (fixed base64):', email);
                          }
                        } catch (decodeError2) {
                          console.error('Error decoding email with fixed base64:', decodeError2);
                        }
                      }
                    }
                  } catch (tokenParseError) {
                    console.error('Error parsing token for email:', tokenParseError);
                  }

                  // محاولة الحصول على البريد الإلكتروني من جدول password_reset_tokens
                  if (!email) {
                    try {
                      const { data: tokenEmailData, error: tokenEmailError } = await supabase
                        .from('password_reset_tokens')
                        .select('email')
                        .eq('token', token)
                        .single();

                      if (!tokenEmailError && tokenEmailData && tokenEmailData.email) {
                        email = tokenEmailData.email;
                        console.log('Retrieved email from password_reset_tokens:', email);
                      } else if (tokenEmailError) {
                        console.error('Error retrieving email from password_reset_tokens:', tokenEmailError);
                      }
                    } catch (tokenEmailError) {
                      console.error('Exception retrieving email from password_reset_tokens:', tokenEmailError);
                    }
                  }
                }
              }
            } else if (tokenError) {
              console.error('Error retrieving user ID from token:', tokenError);
            }
          } catch (tokenError) {
            console.error('Exception retrieving user ID from token:', tokenError);
          }

          if (userId) {
            const { data: data3, error: error3 } = await supabase.rpc('simple_reset_password', {
              p_user_id: userId,
              p_password: password
            });

            if (!error3 && data3 && data3.success) {
              console.log('Password reset successful with simple_reset_password');
              success = true;
            } else if (error3) {
              console.error('Error with simple_reset_password:', error3);
            }
          } else {
            console.error('Could not retrieve user ID from token');
          }
        } catch (error3) {
          console.error('Exception with simple_reset_password:', error3);
        }
      }

      // الطريقة الرابعة: استخدام وظيفة تحديث كلمة المرور المباشرة إذا كان لدينا البريد الإلكتروني
      if (!success && email) {
        try {
          console.log('Trying direct_update_password RPC function with email:', email);
          const { data: data4, error: error4 } = await supabase.rpc('direct_update_password', {
            p_email: email,
            p_password: password
          });

          if (!error4 && data4 && data4.success) {
            console.log('Password reset successful with direct_update_password');
            success = true;
          } else if (error4) {
            console.error('Error with direct_update_password:', error4);
          }
        } catch (error4) {
          console.error('Exception with direct_update_password:', error4);
        }
      }

      // إذا فشلت جميع المحاولات
      if (!success) {
        throw new Error(t('auth.resetPasswordError'));
      }

      // تم تحديث كلمة المرور بنجاح
      setSuccess(true);

      // توجيه المستخدم إلى صفحة تسجيل الدخول بعد 3 ثوانٍ
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Reset password update error:', error);
      setError(error.message || t('auth.resetPasswordError'));
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
            {t('auth.enterNewPassword')}
          </p>
        </div>

        {success ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className={`${isRtl ? 'mr-3' : 'ml-3'}`}>
                <h3 className="text-sm font-medium text-green-800">
                  {t('auth.passwordResetSuccess')}
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>{t('auth.redirectingToLogin')}</p>
                </div>
              </div>
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
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  {t('auth.newPassword')}
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder={t('auth.newPassword')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <div className="relative">
                <label htmlFor="confirm-password" className="sr-only">
                  {t('auth.confirmPassword')}
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder={t('auth.confirmPassword')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

            <div>
              <button
                type="submit"
                disabled={isLoading || !token}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {isLoading ? t('common.loading') : t('auth.resetPassword')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordUpdate;
