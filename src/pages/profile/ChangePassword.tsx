import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Save, Loader, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import ChatHeader from '../../components/ChatHeader';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user, updatePassword } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState<'en' | 'ar'>(i18n.language === 'ar' ? 'ar' : 'en');
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setLanguage(i18n.language === 'ar' ? 'ar' : 'en');
  }, [i18n.language]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    // التحقق من وجود كلمة المرور الحالية
    if (!formData.currentPassword.trim()) {
      setError(language === 'ar' ? 'يرجى إدخال كلمة المرور الحالية' : 'Please enter your current password');
      setIsLoading(false);
      return;
    }

    // التحقق من وجود كلمة المرور الجديدة
    if (!formData.newPassword.trim()) {
      setError(language === 'ar' ? 'يرجى إدخال كلمة المرور الجديدة' : 'Please enter a new password');
      setIsLoading(false);
      return;
    }

    // التحقق من تطابق كلمات المرور
    if (formData.newPassword !== formData.confirmPassword) {
      setError(language === 'ar' ? 'كلمات المرور الجديدة غير متطابقة' : 'New passwords do not match');
      setIsLoading(false);
      return;
    }

    // التحقق من طول كلمة المرور
    if (formData.newPassword.length < 6) {
      setError(language === 'ar' ? 'يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل' : 'New password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    // التحقق من أن كلمة المرور الجديدة مختلفة عن الحالية
    if (formData.newPassword === formData.currentPassword) {
      setError(language === 'ar' ? 'كلمة المرور الجديدة يجب أن تكون مختلفة عن كلمة المرور الحالية' : 'New password must be different from current password');
      setIsLoading(false);
      return;
    }

    try {
      // في Supabase، لا يمكننا التحقق من كلمة المرور الحالية مباشرة
      // لذلك سنقوم بتحديث كلمة المرور مباشرة
      await updatePassword(formData.currentPassword, formData.newPassword);
      setSuccessMessage(language === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      // إظهار رسالة النجاح لمدة أطول
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      console.error('Password update error:', error);

      // Handle Supabase errors
      if (error.message?.includes('Current password is incorrect') ||
          error.message?.includes('Invalid login credentials') ||
          error.message?.includes('auth')) {
        setError(language === 'ar' ? 'كلمة المرور الحالية غير صحيحة' : 'Current password is incorrect');
      } else if (error.message?.includes('rate limit')) {
        setError(language === 'ar' ? 'لقد تجاوزت الحد المسموح من المحاولات، يرجى المحاولة لاحقًا' : 'Too many attempts, please try again later');
      } else {
        setError(error.message || (language === 'ar' ? 'حدث خطأ أثناء تغيير كلمة المرور' : 'An error occurred while changing the password'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <ChatHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
            </h1>

            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center"
                >
                  <CheckCircle className={`h-5 w-5 flex-shrink-0 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  <span>{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center"
                >
                  <AlertCircle className={`h-5 w-5 flex-shrink-0 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    id="currentPassword"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    required
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${language === 'ar' ? 'pl-10' : 'pr-10'}`}
                  />
                  <button
                    type="button"
                    className={`absolute inset-y-0 ${language === 'ar' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center text-gray-500 hover:text-gray-700`}
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    required
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${language === 'ar' ? 'pl-10' : 'pr-10'}`}
                  />
                  <button
                    type="button"
                    className={`absolute inset-y-0 ${language === 'ar' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center text-gray-500 hover:text-gray-700`}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                {language === 'ar' ? 'يجب أن تكون كلمة المرور 6 أحرف على الأقل' : 'Password must be at least 6 characters long'}
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${language === 'ar' ? 'pl-10' : 'pr-10'}`}
                  />
                  <button
                    type="button"
                    className={`absolute inset-y-0 ${language === 'ar' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center text-gray-500 hover:text-gray-700`}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className={`flex ${language === 'ar' ? 'justify-start' : 'justify-end'}`}>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <Loader className={`animate-spin h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                      {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Lock className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                      {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
