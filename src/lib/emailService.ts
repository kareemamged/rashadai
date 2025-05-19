import { useAdminStore } from '../store/adminStore';
import { sendEmailWithSmtp } from './smtpService';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
  replyTo?: string;
}

/**
 * إرسال بريد إلكتروني باستخدام خدمة SMTP
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
 * إرسال بريد إلكتروني من نموذج الاتصال
 */
export const sendContactFormEmail = async (
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<boolean> => {
  try {
    // الحصول على إعدادات البريد الإلكتروني من المتجر
    const { systemSettings } = useAdminStore.getState();
    const contactSettings = systemSettings.emailSettings?.contactForm;

    if (!contactSettings) {
      console.error('Contact form email settings are not configured');
      return false;
    }

    const fromEmail = contactSettings.fromEmail;
    const toEmail = contactSettings.toEmail;
    const subjectPrefix = contactSettings.subjectPrefix;

    // إنشاء محتوى البريد الإلكتروني
    const emailSubject = `${subjectPrefix} ${subject}`;
    const emailText = `
      Name: ${name}
      Email: ${email}
      Subject: ${subject}

      Message:
      ${message}
    `;

    const emailHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <h3>Message:</h3>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;

    // إرسال البريد الإلكتروني
    return await sendEmail({
      from: fromEmail,
      to: toEmail,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
      replyTo: email // للرد مباشرة على المرسل
    });
  } catch (error) {
    console.error('Error sending contact form email:', error);
    return false;
  }
};

/**
 * إرسال بريد إلكتروني من نموذج الإبلاغ عن مشكلة
 */
export const sendIssueReportEmail = async (
  issueType: string,
  description: string,
  userEmail?: string
): Promise<boolean> => {
  try {
    // الحصول على إعدادات البريد الإلكتروني من المتجر
    const { systemSettings } = useAdminStore.getState();
    const reportSettings = systemSettings.emailSettings?.reportIssue;

    if (!reportSettings) {
      console.error('Issue report email settings are not configured');
      return false;
    }

    const fromEmail = reportSettings.fromEmail;
    const toEmail = reportSettings.toEmail;
    const subjectPrefix = reportSettings.subjectPrefix;

    // إنشاء محتوى البريد الإلكتروني
    const emailSubject = `${subjectPrefix} ${issueType}`;
    const emailText = `
      Issue Type: ${issueType}
      User Email: ${userEmail || 'Not provided'}

      Description:
      ${description}
    `;

    const emailHtml = `
      <h2>New Issue Report</h2>
      <p><strong>Issue Type:</strong> ${issueType}</p>
      <p><strong>User Email:</strong> ${userEmail || 'Not provided'}</p>
      <h3>Description:</h3>
      <p>${description.replace(/\n/g, '<br>')}</p>
    `;

    // إرسال البريد الإلكتروني
    return await sendEmail({
      from: fromEmail,
      to: toEmail,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
      replyTo: userEmail // للرد مباشرة على المستخدم إذا كان متاحًا
    });
  } catch (error) {
    console.error('Error sending issue report email:', error);
    return false;
  }
};

/**
 * إرسال بريد إلكتروني تأكيد
 */
export const sendConfirmationEmail = async (email: string, confirmationUrl: string): Promise<{success: boolean; message: string}> => {
  try {
    // الحصول على إعدادات البريد الإلكتروني من المتجر
    const { systemSettings } = useAdminStore.getState();
    const smtpSettings = systemSettings.emailSettings?.smtp;
    const confirmationSettings = systemSettings.emailSettings?.confirmationEmail;

    // استخدام SMTP
    if (!smtpSettings || !smtpSettings.host || !smtpSettings.username) {
      return {
        success: false,
        message: 'SMTP settings are not configured properly'
      };
    }

    console.log('Sending confirmation email using SMTP');
    console.log('Email:', email);
    console.log('Confirmation URL:', confirmationUrl);

    // استخدام وظيفة إرسال البريد الإلكتروني من ملف smtpEmailService
    const { sendConfirmationEmail: sendWithSmtp } = await import('./smtpEmailService');
    return await sendWithSmtp(email, confirmationUrl);
  } catch (error: any) {
    console.error('Confirmation email sending failed:', error);
    return {
      success: false,
      message: `Confirmation email sending failed: ${error.message}`
    };
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

    // استخدام SMTP
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

    // استخدام وظيفة اختبار الاتصال من ملف smtpService
    const { testSmtpConnection: testConnection } = await import('./smtpService');
    return await testConnection(testEmail);
  } catch (error: any) {
    console.error('Email connection test failed:', error);
    return {
      success: false,
      message: `Email connection test failed: ${error.message}`
    };
  }
};
