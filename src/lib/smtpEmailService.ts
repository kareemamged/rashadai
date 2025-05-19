import { useAdminStore } from '../store/adminStore';
import { API_ENDPOINTS } from './apiConfig';
import {
  sendConfirmationEmailWithFallback,
  sendEmailWithFallback,
  sendPasswordResetEmailWithFallback
} from './fallbackEmailService';

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
        from: options.from || smtpConfig.username,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || '',
        replyTo: options.replyTo || options.from || smtpConfig.username
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
    console.log('Response data:', result);

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send email');
    }

    return {
      success: result.success,
      message: result.message
    };
  } catch (error: any) {
    console.error('Error sending email with SMTP:', error);
    console.log('Trying fallback email service...');

    // استخدام الطريقة البديلة في حالة فشل SMTP
    try {
      const fallbackResult = await sendEmailWithFallback(options);
      console.log('Fallback email service result:', fallbackResult);

      if (fallbackResult.success) {
        return fallbackResult;
      }

      return {
        success: false,
        message: 'Failed to send email with both SMTP and fallback service'
      };
    } catch (fallbackError: any) {
      console.error('Error sending email with fallback service:', fallbackError);
      return {
        success: false,
        message: error.message || 'Failed to send email'
      };
    }
  }
};

/**
 * إرسال بريد إلكتروني تأكيد باستخدام SMTP
 * @param email البريد الإلكتروني للمستخدم
 * @param confirmationUrl رابط التأكيد
 * @param language لغة البريد الإلكتروني (ar أو en)
 * @returns وعد بنتيجة الإرسال
 */
export const sendConfirmationEmail = async (
  email: string,
  confirmationUrl: string,
  language: string = 'ar'
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Sending confirmation email to:', email);
    // Sensitive data removed from logs
    console.log('Email language:', language);

    // الحصول على إعدادات البريد الإلكتروني من المتجر
    const { systemSettings } = useAdminStore.getState();
    const smtpSettings = systemSettings.emailSettings?.smtp;
    const confirmationSettings = systemSettings.emailSettings?.confirmationEmail;

    if (!smtpSettings || !smtpSettings.host || !smtpSettings.username) {
      console.error('SMTP settings are not configured properly');
      return {
        success: false,
        message: 'SMTP settings are not configured properly'
      };
    }

    // استخدام إعدادات البريد الإلكتروني من المتجر
    // استخدام اسم المستخدم SMTP كعنوان المرسل لتجنب أخطاء المصادقة
    const fromEmail = smtpSettings.username;
    const subjectPrefix = confirmationSettings?.subjectPrefix || '[Email Confirmation]';

    // إنشاء محتوى البريد الإلكتروني حسب اللغة
    let emailSubject, emailText, emailHtml;

    if (language === 'en') {
      // English email content
      emailSubject = `${subjectPrefix} Confirm Your Account at RashadAI`;
      emailText = `
        Hello,

        Thank you for registering at RashadAI. Please confirm your email by clicking on the following link:

        ${confirmationUrl}

        If you didn't create an account, please ignore this email.

        Best regards,
        RashadAI Team
      `;

      // استخدام قالب البريد الإلكتروني الإنجليزي
      emailHtml = getEnglishConfirmationEmailTemplate(email, confirmationUrl);
    } else {
      // Arabic email content (default)
      emailSubject = `${subjectPrefix} تأكيد حسابك في RashadAI`;
      emailText = `
        مرحباً،

        شكراً لتسجيلك في RashadAI. يرجى تأكيد بريدك الإلكتروني بالنقر على الرابط التالي:

        ${confirmationUrl}

        إذا لم تقم بإنشاء حساب، يرجى تجاهل هذا البريد الإلكتروني.

        مع تحيات،
        فريق RashadAI
      `;

      // استخدام قالب البريد الإلكتروني العربي
      emailHtml = getArabicConfirmationEmailTemplate(email, confirmationUrl);
    }

    // إرسال البريد الإلكتروني
    const result = await sendEmailWithSmtp(
      {
        from: fromEmail,
        to: email,
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
        replyTo: fromEmail // استخدام نفس عنوان البريد الإلكتروني للإرسال والرد
      },
      {
        host: smtpSettings.host,
        port: smtpSettings.port,
        username: smtpSettings.username,
        password: smtpSettings.password,
        encryption: smtpSettings.encryption
      }
    );

    return result;
  } catch (error: any) {
    console.error('Error sending confirmation email with SMTP:', error);
    console.log('Trying fallback email service...');

    // استخدام الطريقة البديلة في حالة فشل SMTP
    try {
      const fallbackResult = await sendConfirmationEmailWithFallback(email, confirmationUrl, language);
      console.log('Fallback email service result:', fallbackResult);

      if (fallbackResult.success) {
        return fallbackResult;
      }

      return {
        success: false,
        message: 'Failed to send confirmation email with both SMTP and fallback service'
      };
    } catch (fallbackError: any) {
      console.error('Error sending confirmation email with fallback service:', fallbackError);
      return {
        success: false,
        message: error.message || 'Failed to send confirmation email'
      };
    }
  }
};

/**
 * الحصول على قالب HTML لبريد تأكيد الحساب باللغة العربية
 * @param email البريد الإلكتروني للمستخدم
 * @param confirmationUrl رابط التأكيد
 * @returns قالب HTML
 */
export const getArabicConfirmationEmailTemplate = (email: string, confirmationUrl: string): string => {
  // استخراج اسم المستخدم من البريد الإلكتروني
  const username = email.split('@')[0];

  // إنشاء قالب HTML باللغة العربية
  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تأكيد البريد الإلكتروني</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          padding: 20px;
        }
        .card {
          background-color: #fff;
          border-radius: 10px;
          padding: 30px;
          text-align: center;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .logo {
          margin-bottom: 20px;
        }
        .logo img {
          width: 120px;
          height: auto;
        }
        .header {
          background-color: #4169E1;
          color: white;
          padding: 20px;
          border-radius: 10px 10px 0 0;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          color: white;
        }
        .content {
          padding: 20px;
        }
        h2 {
          color: #333;
          font-size: 20px;
          margin-bottom: 20px;
        }
        p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 20px;
          text-align: right;
        }
        .button {
          display: inline-block;
          background-color: #4169E1;
          color: white !important;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
        }
        .link {
          color: #4169E1;
          word-break: break-all;
          direction: ltr;
          text-align: center;
          display: block;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 5px;
          margin: 10px 0;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #666;
          font-size: 12px;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        .social-icons {
          margin: 15px 0;
        }
        .social-icons a {
          margin: 0 5px;
          display: inline-block;
        }
        .social-icons img {
          width: 24px;
          height: 24px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <h1>تأكيد البريد الإلكتروني</h1>
          </div>



          <div class="content">
            <h2>مرحباً ${username}،</h2>

            <p>شكراً لتسجيلك في RashadAI. لإكمال عملية التسجيل، يرجى تأكيد بريدك الإلكتروني بالنقر على الزر أدناه.</p>

            <a href="${confirmationUrl}" class="button">تأكيد البريد الإلكتروني</a>

            <p>أو يمكنك نسخ الرابط التالي ولصقه في متصفحك إذا كان الزر لا يعمل:</p>

            <div class="link">${confirmationUrl}</div>

            <p>إذا لم تقم بإنشاء حساب في RashadAI، يرجى تجاهل هذا البريد الإلكتروني.</p>
          </div>

          <div class="footer">
            <p>RashadAI &copy; ${new Date().getFullYear()} جميع الحقوق محفوظة</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * الحصول على قالب HTML لبريد تأكيد الحساب باللغة الإنجليزية
 * @param email البريد الإلكتروني للمستخدم
 * @param confirmationUrl رابط التأكيد
 * @returns قالب HTML
 */
export const getEnglishConfirmationEmailTemplate = (email: string, confirmationUrl: string): string => {
  // استخراج اسم المستخدم من البريد الإلكتروني
  const username = email.split('@')[0];

  // إنشاء قالب HTML باللغة الإنجليزية
  return `
    <!DOCTYPE html>
    <html lang="en" dir="ltr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Confirmation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          padding: 20px;
        }
        .card {
          background-color: #fff;
          border-radius: 10px;
          padding: 30px;
          text-align: center;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .logo {
          margin-bottom: 20px;
        }
        .logo img {
          width: 120px;
          height: auto;
        }
        .header {
          background-color: #4169E1;
          color: white;
          padding: 20px;
          border-radius: 10px 10px 0 0;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          color: white;
        }
        .content {
          padding: 20px;
        }
        h2 {
          color: #333;
          font-size: 20px;
          margin-bottom: 20px;
        }
        p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 20px;
          text-align: left;
        }
        .button {
          display: inline-block;
          background-color: #4169E1;
          color: white !important;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
        }
        .link {
          color: #4169E1;
          word-break: break-all;
          direction: ltr;
          text-align: center;
          display: block;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 5px;
          margin: 10px 0;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #666;
          font-size: 12px;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        .social-icons {
          margin: 15px 0;
        }
        .social-icons a {
          margin: 0 5px;
          display: inline-block;
        }
        .social-icons img {
          width: 24px;
          height: 24px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <h1>Email Confirmation</h1>
          </div>

          <div class="content">
            <h2>Hello ${username},</h2>

            <p>Thank you for registering at RashadAI. To complete the registration process, please confirm your email by clicking the button below.</p>

            <a href="${confirmationUrl}" class="button">Confirm Email</a>

            <p>Or you can copy and paste the following link in your browser if the button doesn't work:</p>

            <div class="link">${confirmationUrl}</div>

            <p>If you didn't create an account at RashadAI, please ignore this email.</p>
          </div>

          <div class="footer">
            <p>RashadAI &copy; ${new Date().getFullYear()} All Rights Reserved</p>


          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * الحصول على قالب HTML لبريد تأكيد الحساب (للتوافق مع الكود القديم)
 * @param email البريد الإلكتروني للمستخدم
 * @param confirmationUrl رابط التأكيد
 * @returns قالب HTML
 */
export const getConfirmationEmailTemplate = (email: string, confirmationUrl: string): string => {
  return getArabicConfirmationEmailTemplate(email, confirmationUrl);
};

/**
 * إرسال بريد إلكتروني لإعادة تعيين كلمة المرور باستخدام SMTP
 * @param email البريد الإلكتروني للمستخدم
 * @param resetUrl رابط إعادة تعيين كلمة المرور
 * @param language لغة البريد الإلكتروني (ar أو en)
 * @returns وعد بنتيجة الإرسال
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string,
  language: string = 'ar'
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Sending password reset email to:', email);
    // Sensitive data removed from logs
    console.log('Email language:', language);

    // الحصول على إعدادات البريد الإلكتروني من المتجر
    const { systemSettings } = useAdminStore.getState();
    const smtpSettings = systemSettings.emailSettings?.smtp;
    const resetPasswordSettings = systemSettings.emailSettings?.resetPassword;

    if (!smtpSettings || !smtpSettings.host || !smtpSettings.username) {
      console.error('SMTP settings are not configured properly');
      return {
        success: false,
        message: 'SMTP settings are not configured properly'
      };
    }

    // استخدام إعدادات البريد الإلكتروني من المتجر
    // استخدام اسم المستخدم SMTP كعنوان المرسل لتجنب أخطاء المصادقة
    const fromEmail = smtpSettings.username;
    const subjectPrefix = resetPasswordSettings?.subjectPrefix || '[Password Reset]';

    // إنشاء محتوى البريد الإلكتروني حسب اللغة
    let emailSubject, emailText, emailHtml;

    if (language === 'en') {
      // English email content
      emailSubject = `${subjectPrefix} Reset Your Password at RashadAI`;
      emailText = `
        Hello,

        You have requested to reset your password at RashadAI. Please click on the following link to reset your password:

        ${resetUrl}

        This link will expire in 24 hours.

        If you didn't request a password reset, please ignore this email.

        Best regards,
        RashadAI Team
      `;

      // استخدام قالب البريد الإلكتروني الإنجليزي
      emailHtml = getEnglishPasswordResetEmailTemplate(email, resetUrl);
    } else {
      // Arabic email content (default)
      emailSubject = `${subjectPrefix} إعادة تعيين كلمة المرور في RashadAI`;
      emailText = `
        مرحباً،

        لقد طلبت إعادة تعيين كلمة المرور الخاصة بك في RashadAI. يرجى النقر على الرابط التالي لإعادة تعيين كلمة المرور:

        ${resetUrl}

        ستنتهي صلاحية هذا الرابط خلال 24 ساعة.

        إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.

        مع تحيات،
        فريق RashadAI
      `;

      // استخدام قالب البريد الإلكتروني العربي
      emailHtml = getArabicPasswordResetEmailTemplate(email, resetUrl);
    }

    // إرسال البريد الإلكتروني
    const result = await sendEmailWithSmtp(
      {
        from: fromEmail,
        to: email,
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
        replyTo: fromEmail // استخدام نفس عنوان البريد الإلكتروني للإرسال والرد
      },
      {
        host: smtpSettings.host,
        port: smtpSettings.port,
        username: smtpSettings.username,
        password: smtpSettings.password,
        encryption: smtpSettings.encryption
      }
    );

    return result;
  } catch (error: any) {
    console.error('Error sending password reset email with SMTP:', error);
    console.log('Trying fallback email service for password reset...');

    // استخدام الطريقة البديلة في حالة فشل SMTP
    try {
      const fallbackResult = await sendPasswordResetEmailWithFallback(email, resetUrl, language);
      console.log('Fallback email service result for password reset:', fallbackResult);

      if (fallbackResult.success) {
        return fallbackResult;
      }

      return {
        success: false,
        message: 'Failed to send password reset email with both SMTP and fallback service'
      };
    } catch (fallbackError: any) {
      console.error('Error sending password reset email with fallback service:', fallbackError);
      return {
        success: false,
        message: error.message || 'Failed to send password reset email'
      };
    }
  }
};

/**
 * الحصول على قالب HTML لبريد إعادة تعيين كلمة المرور باللغة العربية
 * @param email البريد الإلكتروني للمستخدم
 * @param resetUrl رابط إعادة تعيين كلمة المرور
 * @returns قالب HTML
 */
export const getArabicPasswordResetEmailTemplate = (email: string, resetUrl: string): string => {
  // استخراج اسم المستخدم من البريد الإلكتروني
  const username = email.split('@')[0];

  // إنشاء قالب HTML باللغة العربية
  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>إعادة تعيين كلمة المرور</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          padding: 20px;
        }
        .card {
          background-color: #fff;
          border-radius: 10px;
          padding: 30px;
          text-align: center;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .logo {
          margin-bottom: 20px;
        }
        .logo img {
          width: 120px;
          height: auto;
        }
        .header {
          background-color: #4169E1;
          color: white;
          padding: 20px;
          border-radius: 10px 10px 0 0;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          color: white;
        }
        .content {
          padding: 20px;
        }
        h2 {
          color: #333;
          font-size: 20px;
          margin-bottom: 20px;
        }
        p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 20px;
          text-align: right;
        }
        .button {
          display: inline-block;
          background-color: #4169E1;
          color: white !important;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
        }
        .link {
          color: #4169E1;
          word-break: break-all;
          direction: ltr;
          text-align: center;
          display: block;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 5px;
          margin: 10px 0;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #666;
          font-size: 12px;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        .social-icons {
          margin: 15px 0;
        }
        .social-icons a {
          margin: 0 5px;
          display: inline-block;
        }
        .social-icons img {
          width: 24px;
          height: 24px;
        }
        .warning {
          color: #e74c3c;
          font-weight: bold;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <h1>إعادة تعيين كلمة المرور</h1>
          </div>

          <div class="content">
            <h2>مرحباً ${username}،</h2>

            <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في RashadAI. لإعادة تعيين كلمة المرور، يرجى النقر على الزر أدناه.</p>

            <a href="${resetUrl}" class="button">إعادة تعيين كلمة المرور</a>

            <p>أو يمكنك نسخ الرابط التالي ولصقه في متصفحك إذا كان الزر لا يعمل:</p>

            <div class="link">${resetUrl}</div>

            <p class="warning">ستنتهي صلاحية هذا الرابط خلال 24 ساعة.</p>

            <p>إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني. لم يتم إجراء أي تغييرات على حسابك.</p>
          </div>

          <div class="footer">
            <p>RashadAI &copy; ${new Date().getFullYear()} جميع الحقوق محفوظة</p>


          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * الحصول على قالب HTML لبريد إعادة تعيين كلمة المرور باللغة الإنجليزية
 * @param email البريد الإلكتروني للمستخدم
 * @param resetUrl رابط إعادة تعيين كلمة المرور
 * @returns قالب HTML
 */
export const getEnglishPasswordResetEmailTemplate = (email: string, resetUrl: string): string => {
  // استخراج اسم المستخدم من البريد الإلكتروني
  const username = email.split('@')[0];

  // إنشاء قالب HTML باللغة الإنجليزية
  return `
    <!DOCTYPE html>
    <html lang="en" dir="ltr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          padding: 20px;
        }
        .card {
          background-color: #fff;
          border-radius: 10px;
          padding: 30px;
          text-align: center;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .logo {
          margin-bottom: 20px;
        }
        .logo img {
          width: 120px;
          height: auto;
        }
        .header {
          background-color: #4169E1;
          color: white;
          padding: 20px;
          border-radius: 10px 10px 0 0;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          color: white;
        }
        .content {
          padding: 20px;
        }
        h2 {
          color: #333;
          font-size: 20px;
          margin-bottom: 20px;
        }
        p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 20px;
          text-align: left;
        }
        .button {
          display: inline-block;
          background-color: #4169E1;
          color: white !important;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
        }
        .link {
          color: #4169E1;
          word-break: break-all;
          direction: ltr;
          text-align: center;
          display: block;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 5px;
          margin: 10px 0;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #666;
          font-size: 12px;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        .social-icons {
          margin: 15px 0;
        }
        .social-icons a {
          margin: 0 5px;
          display: inline-block;
        }
        .social-icons img {
          width: 24px;
          height: 24px;
        }
        .warning {
          color: #e74c3c;
          font-weight: bold;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <h1>Password Reset</h1>
          </div>

          <div class="content">
            <h2>Hello ${username},</h2>

            <p>We received a request to reset the password for your RashadAI account. To reset your password, please click the button below.</p>

            <a href="${resetUrl}" class="button">Reset Password</a>

            <p>Or you can copy and paste the following link in your browser if the button doesn't work:</p>

            <div class="link">${resetUrl}</div>

            <p class="warning">This link will expire in 24 hours.</p>

            <p>If you didn't request a password reset, please ignore this email. No changes have been made to your account.</p>
          </div>

          <div class="footer">
            <p>RashadAI &copy; ${new Date().getFullYear()} All Rights Reserved</p>


          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
