import { useAdminStore } from '../store/adminStore';
import { API_ENDPOINTS } from './apiConfig';

interface SmtpConfig {
  host: string;
  port: string | number;
  username: string;
  password: string;
  encryption: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
  replyTo?: string;
}

/**
 * إرسال بريد إلكتروني باستخدام SMTP مباشرة
 * هذه الوظيفة تستخدم خادم Node.js المحلي لإرسال البريد الإلكتروني
 */
export const sendEmailWithSmtp = async (options: EmailOptions, smtpConfig: SmtpConfig): Promise<{ success: boolean; message: string }> => {
  try {
    // تحويل إعدادات SMTP إلى الصيغة المطلوبة للخادم
    const secure = smtpConfig.encryption === 'SSL' || smtpConfig.encryption === 'TLS';

    // إعداد بيانات الطلب
    const requestData = {
      smtp: {
        host: smtpConfig.host,
        port: Number(smtpConfig.port),
        secure: secure,
        auth: {
          user: smtpConfig.username,
          pass: smtpConfig.password
        }
      },
      email: {
        from: smtpConfig.username, // Always use SMTP username as sender
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || '',
        replyTo: smtpConfig.username // Always use SMTP username as reply-to
      }
    };

    // إرسال الطلب إلى خادم البريد الإلكتروني
    console.log('Sending email request to:', API_ENDPOINTS.SEND_EMAIL);
    console.log('Request data:', JSON.stringify(requestData));

    const response = await fetch(API_ENDPOINTS.SEND_EMAIL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    console.log('Response status:', response.status);

    // تحليل الاستجابة
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send email');
    }

    return {
      success: result.success,
      message: result.message
    };
  } catch (error: any) {
    console.error('Error sending email with SMTP:', error);
    return {
      success: false,
      message: error.message || 'Failed to send email'
    };
  }
};

/**
 * إرسال بريد إلكتروني باستخدام إعدادات SMTP من المتجر
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    // الحصول على إعدادات البريد الإلكتروني من المتجر
    const { systemSettings } = useAdminStore.getState();
    const smtpSettings = systemSettings.emailSettings?.smtp;

    if (!smtpSettings || !smtpSettings.host || !smtpSettings.username) {
      console.error('SMTP settings are not configured properly');
      return false;
    }

    console.log('Sending email with the following settings:');
    console.log('SMTP Host:', smtpSettings.host);
    console.log('SMTP Port:', smtpSettings.port);
    console.log('SMTP Username:', smtpSettings.username);
    console.log('From:', options.from || smtpSettings.username);
    console.log('To:', options.to);
    console.log('Subject:', options.subject);

    // إرسال البريد الإلكتروني باستخدام SMTP
    const result = await sendEmailWithSmtp(options, {
      host: smtpSettings.host,
      port: smtpSettings.port,
      username: smtpSettings.username,
      password: smtpSettings.password,
      encryption: smtpSettings.encryption
    });

    return result.success;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

/**
 * اختبار اتصال SMTP
 */
export const testSmtpConnection = async (testEmail: string): Promise<{success: boolean; message: string}> => {
  try {
    // الحصول على إعدادات البريد الإلكتروني من المتجر
    const { systemSettings } = useAdminStore.getState();
    const smtpSettings = systemSettings.emailSettings?.smtp;

    if (!smtpSettings || !smtpSettings.host || !smtpSettings.username) {
      return {
        success: false,
        message: 'SMTP settings are not configured properly'
      };
    }

    console.log('Testing SMTP connection with the following settings:');
    console.log('SMTP Host:', smtpSettings.host);
    console.log('SMTP Port:', smtpSettings.port);
    console.log('SMTP Username:', smtpSettings.username);
    console.log('Test Email:', testEmail);

    // تحويل إعدادات SMTP إلى الصيغة المطلوبة للخادم
    const secure = smtpSettings.encryption === 'SSL' || smtpSettings.encryption === 'TLS';

    // إعداد بيانات الطلب
    const requestData = {
      smtp: {
        host: smtpSettings.host,
        port: Number(smtpSettings.port),
        secure: secure,
        auth: {
          user: smtpSettings.username,
          pass: smtpSettings.password
        }
      },
      testEmail: testEmail
    };

    // إرسال الطلب إلى خادم البريد الإلكتروني
    console.log('Testing SMTP connection with API:', API_ENDPOINTS.TEST_SMTP);
    console.log('Request data:', JSON.stringify(requestData));

    const response = await fetch(API_ENDPOINTS.TEST_SMTP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    console.log('Response status:', response.status);

    // تحليل الاستجابة
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to test SMTP connection');
    }

    return {
      success: result.success,
      message: result.message
    };
  } catch (error: any) {
    console.error('SMTP connection test failed:', error);
    return {
      success: false,
      message: `SMTP connection test failed: ${error.message}`
    };
  }
};
