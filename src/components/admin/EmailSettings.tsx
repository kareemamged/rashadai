import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/languageStore';
import { useAdminStore } from '../../store/adminStore';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { testSmtpConnection } from '../../lib/emailService';
import {
  Settings as SettingsIcon,
  Mail,
  Server,
  Lock,
  AlertTriangle,
  Save,
  Send,
  MessageSquare,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const EmailSettings: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const { systemSettings, updateSystemSettings, fetchSystemSettings } = useAdminStore();
  const { adminUser } = useAdminAuthStore();
  const [isRTL, setIsRTL] = useState(language === 'ar');
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);

  // Form state
  const [formValues, setFormValues] = useState({
    smtp: {
      host: systemSettings.emailSettings?.smtp?.host || '',
      port: systemSettings.emailSettings?.smtp?.port || '',
      encryption: systemSettings.emailSettings?.smtp?.encryption || 'SSL',
      username: systemSettings.emailSettings?.smtp?.username || '',
      password: systemSettings.emailSettings?.smtp?.password || '',
    },
    contactForm: {
      fromEmail: systemSettings.emailSettings?.contactForm?.fromEmail || '',
      toEmail: systemSettings.emailSettings?.contactForm?.toEmail || '',
      subjectPrefix: systemSettings.emailSettings?.contactForm?.subjectPrefix || '',
    },
    reportIssue: {
      fromEmail: systemSettings.emailSettings?.reportIssue?.fromEmail || '',
      toEmail: systemSettings.emailSettings?.reportIssue?.toEmail || '',
      subjectPrefix: systemSettings.emailSettings?.reportIssue?.subjectPrefix || '',
    },
  });

  // Update RTL state when language changes
  useEffect(() => {
    setIsRTL(language === 'ar');
  }, [language]);

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        await fetchSystemSettings();
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  // Update form values when systemSettings changes
  useEffect(() => {
    if (systemSettings.emailSettings) {
      setFormValues({
        smtp: {
          host: systemSettings.emailSettings.smtp?.host || '',
          port: systemSettings.emailSettings.smtp?.port || '',
          encryption: systemSettings.emailSettings.smtp?.encryption || 'SSL',
          username: systemSettings.emailSettings.smtp?.username || '',
          password: systemSettings.emailSettings.smtp?.password || '',
        },
        contactForm: {
          fromEmail: systemSettings.emailSettings.contactForm?.fromEmail || '',
          toEmail: systemSettings.emailSettings.contactForm?.toEmail || '',
          subjectPrefix: systemSettings.emailSettings.contactForm?.subjectPrefix || '',
        },
        reportIssue: {
          fromEmail: systemSettings.emailSettings.reportIssue?.fromEmail || '',
          toEmail: systemSettings.emailSettings.reportIssue?.toEmail || '',
          subjectPrefix: systemSettings.emailSettings.reportIssue?.subjectPrefix || '',
        },
      });
    }
  }, [systemSettings]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Handle nested properties
    if (name.includes('.')) {
      const [section, property] = name.split('.');
      setFormValues({
        ...formValues,
        [section]: {
          ...formValues[section as keyof typeof formValues],
          [property]: value,
        },
      });
    } else {
      setFormValues({
        ...formValues,
        [name]: value,
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    setTestResult(null);

    try {
      // Update settings using the store function
      await updateSystemSettings({
        emailSettings: formValues
      });

      // Show success message
      setSuccessMessage(t('admin.settings.settingsSaved', 'Settings saved successfully'));
      setTimeout(() => setSuccessMessage(''), 3000);

      // Refresh settings from database
      await fetchSystemSettings();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setErrorMessage(error.message || t('admin.settings.unknownError', 'An unknown error occurred.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle SMTP connection test
  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!testEmail) {
      setTestResult({
        success: false,
        message: t('admin.settings.testEmailRequired', 'Please enter a test email address')
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // First save the current settings
      await updateSystemSettings({
        emailSettings: formValues
      });

      // Then test the connection
      const result = await testSmtpConnection(testEmail);
      setTestResult(result);
    } catch (error: any) {
      console.error('Error testing SMTP connection:', error);
      setTestResult({
        success: false,
        message: error.message || t('admin.settings.unknownError', 'An unknown error occurred.')
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('admin.settings.emailSettings', 'Email Settings')}</h1>

      <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-md">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">
              {t('admin.settings.demoMode', 'Demo Mode')}
            </p>
            <p className="text-sm mt-1">
              {t('admin.settings.demoModeDescription', 'This is a demonstration of email settings. In production, you would need to implement a server-side email service using these settings. Currently, emails are simulated and not actually sent.')}
            </p>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          <div>{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* SMTP Settings */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Server className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-500`} />
            {t('admin.settings.smtpSettings', 'SMTP Configuration')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.smtpHost', 'SMTP Host')}
              </label>
              <input
                type="text"
                name="smtp.host"
                value={formValues.smtp.host}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="mail.example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.smtpPort', 'SMTP Port')}
              </label>
              <input
                type="text"
                name="smtp.port"
                value={formValues.smtp.port}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="465"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.smtpEncryption', 'Encryption')}
              </label>
              <select
                name="smtp.encryption"
                value={formValues.smtp.encryption}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="SSL">SSL</option>
                <option value="TLS">TLS</option>
                <option value="STARTTLS">STARTTLS</option>
                <option value="None">None</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.smtpUsername', 'SMTP Username')}
              </label>
              <input
                type="text"
                name="smtp.username"
                value={formValues.smtp.username}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="no-reply@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.smtpPassword', 'SMTP Password')}
              </label>
              <input
                type="password"
                name="smtp.password"
                value={formValues.smtp.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        {/* Contact Form Settings */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <MessageSquare className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-500`} />
            {t('admin.settings.contactFormSettings', 'Contact Form Settings')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.fromEmail', 'From Email')}
              </label>
              <input
                type="email"
                name="contactForm.fromEmail"
                value={formValues.contactForm.fromEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="no-reply@rashadai.com"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('admin.settings.fromEmailHelp', 'The email address that will appear as the sender')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.toEmail', 'To Email')}
              </label>
              <input
                type="email"
                name="contactForm.toEmail"
                value={formValues.contactForm.toEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="support@rashadai.com"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('admin.settings.toEmailHelp', 'The email address that will receive contact form submissions')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.subjectPrefix', 'Subject Prefix')}
              </label>
              <input
                type="text"
                name="contactForm.subjectPrefix"
                value={formValues.contactForm.subjectPrefix}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="[Contact Form]"
              />
            </div>
          </div>
        </div>

        {/* Report Issue Settings */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <AlertCircle className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-500`} />
            {t('admin.settings.reportIssueSettings', 'Report Issue Settings')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.fromEmail', 'From Email')}
              </label>
              <input
                type="email"
                name="reportIssue.fromEmail"
                value={formValues.reportIssue.fromEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="no-reply@rashadai.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.toEmail', 'To Email')}
              </label>
              <input
                type="email"
                name="reportIssue.toEmail"
                value={formValues.reportIssue.toEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="issues@rashadai.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.subjectPrefix', 'Subject Prefix')}
              </label>
              <input
                type="text"
                name="reportIssue.subjectPrefix"
                value={formValues.reportIssue.subjectPrefix}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="[Issue Report]"
              />
            </div>
          </div>
        </div>

        {/* Test Connection */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Send className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-500`} />
            {t('admin.settings.testConnection', 'Test SMTP Connection')}
          </h2>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              {t('admin.settings.testConnectionDescription', 'Test your SMTP settings by sending a test email. Save your settings first before testing.')}
            </p>

            {testResult && (
              <div className={`p-4 mb-4 rounded-md ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <div className="flex items-start">
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-medium">
                      {testResult.success
                        ? t('admin.settings.testSuccess', 'Connection Successful')
                        : t('admin.settings.testFailed', 'Connection Failed')}
                    </p>
                    <p className="text-sm mt-1">{testResult.message}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-end gap-4">
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.settings.testEmailAddress', 'Test Email Address')}
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="your@email.com"
                />
              </div>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 h-10"
              >
                <Send className="h-4 w-4 mr-2" />
                {isTesting ? t('common.testing', 'Testing...') : t('admin.settings.sendTest', 'Send Test')}
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="p-6 bg-gray-50 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Save className="h-5 w-5 mr-2" />
            {isLoading ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmailSettings;
