import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/ToastContainer';
import { useLanguageStore } from '../../store/languageStore';

/**
 * صفحة Callback تتعامل مع:
 * 1. تأكيد البريد الإلكتروني
 * 2. إعادة توجيه المستخدم بعد تسجيل الدخول/التسجيل
 */
const Callback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { language } = useLanguageStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // تحليل معلمات URL
        const params = new URLSearchParams(location.search);
        const email = params.get('email');
        const isConfirmation = params.get('confirmation') === 'true';
        const token = params.get('token');
        const type = params.get('type');

        console.log('Callback params:', { email, isConfirmation, token, type });

        // التعامل مع تأكيد البريد الإلكتروني
        if (isConfirmation && email) {
          await handleEmailConfirmation(email);
          return;
        }

        // التعامل مع إعادة تعيين كلمة المرور
        if (type === 'recovery' && token) {
          navigate(`/reset-password/update?token=${token}`, { replace: true });
          return;
        }

        // التعامل مع حالة تسجيل الدخول العادية
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          setStatus('error');
          setMessage(t('auth.callback.sessionError'));
          setTimeout(() => navigate('/login', { replace: true }), 3000);
          return;
        }

        if (data?.session) {
          // المستخدم مسجل الدخول، توجيه إلى الصفحة الرئيسية
          setStatus('success');
          setMessage(t('auth.callback.loginSuccess'));
          setTimeout(() => navigate('/chat', { replace: true }), 1500);
        } else {
          // المستخدم غير مسجل الدخول، توجيه إلى صفحة تسجيل الدخول
          setStatus('error');
          setMessage(t('auth.callback.loginRequired'));
          setTimeout(() => navigate('/login', { replace: true }), 3000);
        }
      } catch (error: any) {
        console.error('Callback error:', error);
        setStatus('error');
        setMessage(error.message || t('auth.callback.genericError'));
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [location, navigate, t, showToast]);

  /**
   * التعامل مع تأكيد البريد الإلكتروني
   */
  const handleEmailConfirmation = async (email: string) => {
    try {
      console.log('Confirming email:', email);

      // الحصول على توكن التأكيد من معلمات URL
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      // التحقق من وجود التوكن
      if (!token) {
        console.error('No confirmation token provided');
        setStatus('error');
        setMessage(t('auth.callback.invalidToken'));
        showToast(t('auth.callback.invalidToken'), 'error');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
        return;
      }

      // التحقق من صحة التوكن
      // التوكن يكون بالصيغة: base64(email)-timestamp-randomString-signaturePart
      const tokenParts = token.split('-');
      if (tokenParts.length < 4) {
        console.error('Invalid token format');
        setStatus('error');
        setMessage(t('auth.callback.invalidToken'));
        showToast(t('auth.callback.invalidToken'), 'error');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
        return;
      }

      // التحقق من الطابع الزمني (صالح لمدة 24 ساعة)
      const timestamp = parseInt(tokenParts[1]);
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;

      if (isNaN(timestamp) || now - timestamp > oneDayMs) {
        console.error('Token has expired');
        setStatus('error');
        setMessage(t('auth.callback.tokenExpired'));
        showToast(t('auth.callback.tokenExpired'), 'error');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
        return;
      }

      // التحقق من التوقيع للتأكد من صحة التوكن
      const providedSignature = tokenParts[3];
      const expectedSignature = btoa(`${tokenParts[0]}:${timestamp}:${tokenParts[2].substring(0, 10)}`).replace(/=/g, '');

      if (providedSignature !== expectedSignature) {
        console.error('Invalid token signature');
        setStatus('error');
        setMessage(t('auth.callback.invalidToken'));
        showToast(t('auth.callback.invalidToken'), 'error');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
        return;
      }

      // استخراج البريد الإلكتروني من التوكن والتحقق من تطابقه مع البريد المرسل في المعلمات
      let tokenEmail;
      try {
        const emailBase64 = tokenParts[0];
        tokenEmail = decodeURIComponent(atob(emailBase64));
      } catch (decodeError) {
        console.error('Error decoding email from token:', decodeError);
        try {
          tokenEmail = atob(tokenParts[0]);
        } catch (fallbackError) {
          console.error('Fallback decoding also failed:', fallbackError);
          setStatus('error');
          setMessage(t('auth.callback.invalidToken'));
          showToast(t('auth.callback.invalidToken'), 'error');
          setTimeout(() => navigate('/login', { replace: true }), 3000);
          return;
        }
      }

      if (tokenEmail !== email) {
        console.error('Email mismatch in token');
        setStatus('error');
        setMessage(t('auth.callback.emailMismatch'));
        showToast(t('auth.callback.emailMismatch'), 'error');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
        return;
      }

      // استدعاء وظيفة RPC لتأكيد البريد الإلكتروني
      console.log('Calling confirm_user_email RPC with email:', email);
      let { data, error } = await supabase.rpc('confirm_user_email', {
        p_email: email
      });

      console.log('RPC response:', { data, error });

      if (error) {
        console.error('Error confirming email:', error);

        // محاولة تأكيد البريد الإلكتروني باستخدام طريقة بديلة
        try {
          console.log('Trying alternative method to confirm email');

          // الحصول على معرف المستخدم
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();

          if (userError) {
            console.error('Error getting user ID:', userError);
            throw new Error('Could not get user ID');
          }

          if (!userData || !userData.id) {
            console.error('User ID not found');
            throw new Error('User ID not found');
          }

          console.log('Found user ID:', userData.id);

          // تحديث حالة تأكيد البريد الإلكتروني مباشرة في جدول auth.users
          // هذا يتطلب صلاحيات خاصة، لذلك قد لا يعمل
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            userData.id,
            { email_confirm: true }
          );

          if (updateError) {
            console.error('Error updating user email confirmation status:', updateError);
            throw new Error('Could not update email confirmation status');
          }

          console.log('Email confirmed successfully using alternative method');
          setStatus('success');
          setMessage(t('auth.callback.confirmationSuccess'));
          showToast(t('auth.callback.confirmationSuccess'), 'success');
          setTimeout(() => navigate('/login', { replace: true }), 3000);
          return;
        } catch (alternativeError) {
          console.error('Alternative method failed:', alternativeError);
          setStatus('error');
          setMessage(t('auth.callback.confirmationError'));
          showToast(t('auth.callback.confirmationError'), 'error');
          setTimeout(() => navigate('/login', { replace: true }), 3000);
          return;
        }
      }

      if (data && data.success) {
        console.log('Email confirmed successfully:', data);
        setStatus('success');
        setMessage(t('auth.callback.confirmationSuccess'));
        showToast(t('auth.callback.confirmationSuccess'), 'success');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      } else {
        console.error('Email confirmation failed:', data);
        setStatus('error');
        setMessage(data?.message || t('auth.callback.confirmationError'));
        showToast(data?.message || t('auth.callback.confirmationError'), 'error');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
    } catch (error: any) {
      console.error('Email confirmation error:', error);
      setStatus('error');
      setMessage(error.message || t('auth.callback.confirmationError'));
      showToast(error.message || t('auth.callback.confirmationError'), 'error');
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          {status === 'loading' && <Activity className="h-12 w-12 text-blue-600 animate-spin" />}
          {status === 'success' && <CheckCircle className="h-12 w-12 text-green-600" />}
          {status === 'error' && <AlertCircle className="h-12 w-12 text-red-600" />}
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {status === 'loading' && t('auth.callback.processing')}
          {status === 'success' && t('auth.callback.success')}
          {status === 'error' && t('auth.callback.error')}
        </h2>
        {message && (
          <p className="mt-2 text-center text-sm text-gray-600">
            {message}
          </p>
        )}
        {isProcessing && (
          <div className="mt-6 flex justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
              <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
              <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Callback;
