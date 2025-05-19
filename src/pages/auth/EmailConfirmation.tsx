import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { resendConfirmationEmail } from '../../lib/supabase';
import { useToast } from '../../components/ToastContainer';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useLanguageStore } from '../../store/languageStore';
import { useAdminStore } from '../../store/adminStore';

const EmailConfirmation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { language } = useLanguageStore();
  const { systemSettings } = useAdminStore();

  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  // Extract email from location state or query params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const emailParam = searchParams.get('email');

    if (location.state?.email) {
      setEmail(location.state.email);
    } else if (emailParam) {
      setEmail(emailParam);
    }

    if (location.state?.nextAvailableAt) {
      const now = new Date();
      const diff = Math.max(0, Math.floor((new Date(location.state.nextAvailableAt).getTime() - now.getTime()) / 1000));
      setCountdown(diff);
    }

    if (location.state?.remainingAttempts !== undefined) {
      setRemainingAttempts(location.state.remainingAttempts);
    }
  }, [location]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleResendEmail = async () => {
    if (!email) {
      showToast(t('auth.emailConfirmation.enterEmail'), 'error');
      return;
    }

    if (countdown > 0) {
      showToast(t('auth.emailConfirmation.waitBeforeResend', { seconds: countdown }), 'error');
      return;
    }

    // التحقق من عدد المحاولات المتبقية
    if (remainingAttempts !== null && remainingAttempts <= 0) {
      showToast(t('auth.emailConfirmation.maxAttemptsReached'), 'error');
      return;
    }

    setIsLoading(true);

    try {
      // الحصول على إعدادات البريد الإلكتروني من المتجر
      const cooldownMinutes = systemSettings.emailSettings?.confirmationEmail?.cooldownMinutes || 3;
      const maxAttemptsPerDay = systemSettings.emailSettings?.confirmationEmail?.maxRequestsPerDay || 5;

      // تمرير اللغة الحالية إلى وظيفة إعادة إرسال البريد الإلكتروني
      const result = await resendConfirmationEmail(email, undefined, language);

      if (result.success) {
        showToast(t('auth.emailConfirmation.success'), 'success');

        // تحديث العد التنازلي للإرسال التالي
        if (result.next_available_at) {
          const now = new Date();
          const diff = Math.max(0, Math.floor((new Date(result.next_available_at).getTime() - now.getTime()) / 1000));
          setCountdown(diff);
        } else {
          // إذا لم يتم توفير وقت الإرسال التالي، استخدم القيمة الافتراضية
          setCountdown(cooldownMinutes * 60);
        }

        // تحديث عدد المحاولات المتبقية
        if (result.emailSendCount !== undefined && result.maxAttempts !== undefined) {
          const remaining = Math.max(0, result.maxAttempts - result.emailSendCount);
          setRemainingAttempts(remaining);
        } else if (result.emailSendCount !== undefined) {
          const remaining = Math.max(0, maxAttemptsPerDay - result.emailSendCount);
          setRemainingAttempts(remaining);
        }
      } else {
        // إذا كانت الرسالة تتعلق بتجاوز الحد الأقصى للمحاولات
        if (result.message?.includes('Maximum attempts') || result.message?.includes('الحد الأقصى')) {
          setRemainingAttempts(0);
          showToast(t('auth.emailConfirmation.maxAttemptsReached'), 'error');
        } else {
          showToast(result.message || t('auth.emailConfirmation.error'), 'error');
        }
      }
    } catch (error: any) {
      showToast(t('auth.emailConfirmation.error'), 'error');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Language Switcher */}
      <LanguageSwitcher position="top-right" showLabel={true} />

      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-8 py-10">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
              <Mail className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
            {t('auth.emailConfirmation.title')}
          </h2>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {t('auth.emailConfirmation.sentEmailTo')}
            </p>
            <p className="font-bold mt-2 text-gray-800 break-all">
              {email}
            </p>
            <p className="mt-4 text-gray-600">
              {t('auth.emailConfirmation.checkInbox')}
            </p>
            <p className="mt-2 text-gray-600">
              {t('auth.emailConfirmation.checkSpam')}
            </p>
          </div>

          <div className="mt-10">
            <button
              onClick={handleResendEmail}
              disabled={isLoading || countdown > 0 || (remainingAttempts !== null && remainingAttempts <= 0)}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                t('auth.emailConfirmation.resending')
              ) : countdown > 0 ? (
                t('auth.emailConfirmation.waitBeforeResend', { seconds: countdown })
              ) : remainingAttempts !== null && remainingAttempts <= 0 ? (
                t('auth.emailConfirmation.maxAttemptsReached')
              ) : (
                t('auth.emailConfirmation.resendButton')
              )}
            </button>

            {remainingAttempts !== null && remainingAttempts > 0 && (
              <p className="mt-2 text-sm text-gray-500 text-center">
                {t('auth.emailConfirmation.attemptsRemaining', { count: remainingAttempts })}
              </p>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              {t('auth.emailConfirmation.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
