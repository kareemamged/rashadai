import React, { useState, useEffect } from 'react';
import { AlertCircle, Send, CheckCircle, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAdminStore } from '../store/adminStore';
import { sendIssueReportEmail } from '../lib/emailService';

interface ReportIssueProps {
  userEmail?: string;
}

const ReportIssue: React.FC<ReportIssueProps> = ({ userEmail }) => {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState<'en' | 'ar'>(i18n.language === 'ar' ? 'ar' : 'en');
  const [issueType, setIssueType] = useState('bug');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // تهيئة المكون عند التحميل
  useEffect(() => {
    console.log('ReportIssue component loaded');
  }, []);

  // Update language when i18n language changes
  React.useEffect(() => {
    setLanguage(i18n.language === 'ar' ? 'ar' : 'en');
  }, [i18n.language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      setSubmitStatus({
        success: false,
        message: language === 'ar'
          ? 'يرجى تقديم وصف للمشكلة'
          : 'Please provide a description of the issue'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Get email settings from systemSettings
      const { systemSettings } = useAdminStore.getState();
      const fromEmail = systemSettings?.emailSettings?.reportIssue?.fromEmail || 'no-reply@rashadai.com';
      const toEmail = systemSettings?.emailSettings?.reportIssue?.toEmail || 'issues@rashadai.com';
      const subjectPrefix = systemSettings?.emailSettings?.reportIssue?.subjectPrefix || '[Issue Report]';

      console.log('Sending issue report to:', toEmail);
      console.log('From:', fromEmail);
      console.log('Subject:', `${subjectPrefix} ${issueType}`);
      console.log('Description:', description);
      console.log('User Email:', userEmail);

      // Send the issue report email
      const success = await sendIssueReportEmail(
        issueType,
        description,
        userEmail
      );

      if (success) {
        // Successful submission
        setSubmitStatus({
          success: true,
          message: language === 'ar'
            ? 'شكرًا على تقريرك! سننظر في هذه المشكلة.'
            : 'Thank you for your report! We will look into this issue.'
        });

        // Reset form
        setDescription('');
      } else {
        // Failed submission
        setSubmitStatus({
          success: false,
          message: language === 'ar'
            ? 'عذراً، حدث خطأ أثناء إرسال تقريرك. يرجى المحاولة مرة أخرى لاحقاً.'
            : 'Sorry, there was an error sending your report. Please try again later.'
        });
      }

    } catch (error) {
      setSubmitStatus({
        success: false,
        message: language === 'ar'
          ? 'فشل في إرسال تقريرك. يرجى المحاولة مرة أخرى.'
          : 'Failed to submit your report. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-4">
          <AlertCircle className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'} text-red-500`} />
          {language === 'ar' ? 'الإبلاغ عن مشكلة' : 'Report an Issue'}
        </h2>

        {submitStatus && (
          <div className={`mb-6 p-4 rounded-md flex items-start ${
            submitStatus.success
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {submitStatus.success ? (
              <CheckCircle className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'} flex-shrink-0 mt-0.5`} />
            ) : (
              <AlertCircle className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'} flex-shrink-0 mt-0.5`} />
            )}
            <p>{submitStatus.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="issue-type" className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'ar' ? 'نوع المشكلة' : 'Issue Type'}
            </label>
            <select
              id="issue-type"
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="bug">{language === 'ar' ? 'خطأ أو مشكلة تقنية' : 'Bug or Error'}</option>
              <option value="feature">{language === 'ar' ? 'طلب ميزة جديدة' : 'Feature Request'}</option>
              <option value="account">{language === 'ar' ? 'مشكلة في الحساب' : 'Account Issue'}</option>
              {/* <option value="payment">{language === 'ar' ? 'مشكلة في الدفع' : 'Payment Problem'}</option> */}
              <option value="other">{language === 'ar' ? 'أخرى' : 'Other'}</option>
            </select>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'ar' ? 'بريدك الإلكتروني' : 'Your Email'}
            </label>
            <input
              type="email"
              id="email"
              value={userEmail || ''}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
            />
            <p className="mt-1 text-xs text-gray-500">
              {language === 'ar' ? 'سنستخدم هذا البريد الإلكتروني للمتابعة بشأن تقريرك' : "We'll use this email to follow up on your report"}
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'ar' ? 'الوصف' : 'Description'}
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder={language === 'ar'
                ? 'يرجى وصف المشكلة بالتفصيل. قم بتضمين خطوات إعادة إنتاج المشكلة إن أمكن.'
                : 'Please describe the issue in detail. Include steps to reproduce if applicable.'
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader className={`animate-spin h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'جاري الإرسال...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <Send className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'إرسال التقرير' : 'Submit Report'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;
