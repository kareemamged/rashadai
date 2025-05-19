import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/ToastContainer';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import LanguageSwitcher from '../../components/LanguageSwitcher';

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
      // تم تعطيل التحقق من تأكيد البريد الإلكتروني مؤقتًا
      console.log('Email confirmation check is temporarily bypassed in Register.tsx');

      // توجيه المستخدم مباشرة إلى صفحة الدردشة
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

    // استخدام طريقة التسجيل المباشرة مع Supabase
    try {
      console.log('Attempting to register with Supabase Auth directly');

      // إنشاء المستخدم باستخدام Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
            country_code: 'EG',
            language: 'ar'
          }
        }
      });

      if (authError) {
        console.error('Error registering with Supabase Auth:', authError);
        throw authError;
      }

      if (authData && authData.user) {
        console.log('Successfully registered user with Supabase Auth:', authData.user.id);

        // تأكيد البريد الإلكتروني تلقائيًا
        try {
          // محاولة تأكيد البريد الإلكتروني باستخدام وظيفة SQL إذا كانت موجودة
          try {
            const { data: confirmData, error: confirmError } = await supabase
              .rpc('auto_confirm_email_direct', { p_email: formData.email });

            if (confirmError) {
              // إذا كان الخطأ بسبب عدم وجود الوظيفة، نتجاهله ونستمر
              if (confirmError.message.includes('function') && confirmError.message.includes('does not exist')) {
                console.warn('Function auto_confirm_email_direct does not exist, skipping');
              } else {
                console.warn('Error auto-confirming email with SQL function:', confirmError);
              }
            } else {
              console.log('Auto-confirmed email with SQL function:', confirmData);
            }
          } catch (sqlError) {
            console.warn('Exception during SQL auto-confirmation, proceeding anyway:', sqlError);
          }
        } catch (confirmError) {
          console.warn('Exception during email auto-confirmation:', confirmError);
        }

        // إنشاء ملف تعريف المستخدم مباشرة
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              email: formData.email,
              name: formData.name,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
              country_code: 'EG',
              language: 'ar',
              email_confirmed: true,
              created_at: new Date(),
              updated_at: new Date()
            });

          if (profileError) {
            console.warn('Error creating user profile:', profileError);
          } else {
            console.log('Successfully created user profile');
          }
        } catch (profileError) {
          console.warn('Exception during profile creation:', profileError);
        }

        showToast(t('auth.register.success'), 'success');

        // توجيه المستخدم مباشرة إلى صفحة تسجيل الدخول
        navigate('/login');
        return;
      } else if (rpcData && !rpcData.success && rpcData.message === 'User with this email already exists') {
        console.error('User already exists');
        setError(t('auth.register.errors.emailExists'));
        showToast(t('auth.register.errors.emailExists'), 'error');
        return;
      } else {
        console.error('RPC registration failed:', rpcError || rpcData?.message);
      }
    } catch (rpcError) {
      console.error('Error using RPC function for registration:', rpcError);
    }

    // إذا فشلت وظيفة RPC الجديدة، نحاول استخدام الوظيفة القديمة
    try {
      console.log('Attempting to register with standard RPC function');
      const { data: stdRpcData, error: stdRpcError } = await supabase.rpc('direct_register_user', {
        p_email: formData.email,
        p_password: formData.password,
        p_name: formData.name,
        p_country_code: 'EG',
        p_language: 'ar'
      });

      if (!stdRpcError && stdRpcData && stdRpcData.success) {
        console.log('Successfully registered user with standard RPC function:', stdRpcData);

        // محاولة تأكيد البريد الإلكتروني تلقائيًا
        try {
          const { data: confirmData, error: confirmError } = await supabase.rpc('auto_confirm_email', {
            p_email: formData.email
          });

          if (!confirmError && confirmData && confirmData.success) {
            console.log('Successfully auto-confirmed email:', confirmData);
            showToast(t('auth.register.success'), 'success');
            navigate('/login');
            return;
          } else {
            console.warn('Auto-confirm email failed, redirecting to login anyway:', confirmError || confirmData?.message);
            showToast(t('auth.register.success'), 'success');
            navigate('/login');
            return;
          }
        } catch (confirmError) {
          console.error('Error auto-confirming email:', confirmError);
          showToast(t('auth.register.success'), 'success');
          navigate('/login');
          return;
        }
      }

      console.warn('Standard RPC registration failed, falling back to signUp method:', stdRpcError || stdRpcData?.message);
    } catch (stdRpcError) {
      console.error('Error using standard RPC function for registration:', stdRpcError);
    }

    // If both RPC methods fail, try the standard method
    try {
      // Default country code to 'EG' for Egypt
      await signUp(formData.email, formData.password, 'EG', formData.name);

      // Show success toast instead of alert
      showToast(t('auth.register.success'), 'success');

      // محاولة تأكيد البريد الإلكتروني تلقائيًا
      try {
        const { data: confirmData, error: confirmError } = await supabase.rpc('auto_confirm_email', {
          p_email: formData.email
        });

        if (!confirmError && confirmData && confirmData.success) {
          console.log('Successfully auto-confirmed email after signUp:', confirmData);
          showToast(t('auth.register.success'), 'success');
          navigate('/login');
        } else {
          console.warn('Auto-confirm email failed after signUp, redirecting to login anyway:', confirmError || confirmData?.message);
          showToast(t('auth.register.success'), 'success');
          navigate('/login');
        }
      } catch (confirmError) {
        console.error('Error auto-confirming email after signUp:', confirmError);
        showToast(t('auth.register.success'), 'success');
        navigate('/login');
      }
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
        // Log more detailed error for debugging
        console.error('Database error during signup. Please check if the profiles table exists in Supabase and RLS policies are set correctly.');

        // Both methods failed
        setError(t('auth.register.errors.databaseError'));
        showToast('حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى لاحقًا.', 'error');
      } else {
        setError(err.message || t('auth.register.errors.generic'));
        showToast(t('auth.register.errors.generic'), 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Language Switcher */}
      <LanguageSwitcher position="top-right" showLabel={true} />

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

          {/* <div className="alert alert-info mt-4">
            <small>
              <i className="fas fa-info-circle me-2"></i>
              بعد التسجيل، يمكنك تسجيل الدخول مباشرة باستخدام بريدك الإلكتروني وكلمة المرور.
            </small>
          </div>

          <div className="text-center mt-4">
            <p>{t('auth.register.haveAccount')} <Link to="/login" className="text-primary">{t('auth.register.signIn')}</Link></p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Register;