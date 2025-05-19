import { sendEmailWithEmailJS } from './emailjs';
import { useAdminStore } from '../store/adminStore';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
  replyTo?: string;
}

/**
 * إرسال بريد إلكتروني باستخدام EmailJS كطريقة بديلة
 * يتم استخدام هذه الوظيفة عندما يفشل إرسال البريد الإلكتروني باستخدام SMTP
 */
export const sendEmailWithFallback = async (options: EmailOptions): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Using fallback email service (EmailJS)');
    console.log('Fallback email options:', options);

    // تحويل خيارات البريد الإلكتروني إلى الصيغة المطلوبة لـ EmailJS
    const emailJSOptions = {
      to_email: options.to,
      from_name: options.from || 'RashadAI',
      subject: options.subject,
      message: options.text,
      html_message: options.html || options.text,
      reply_to: options.replyTo || options.from || 'no-reply@rashadai.com',
      // إضافة حقول إضافية قد تكون مطلوبة في قالب EmailJS
      to_name: options.to.split('@')[0],
      name: options.to.split('@')[0],
      email: options.to,
      time: new Date().toISOString()
    };

    // إرسال البريد الإلكتروني باستخدام EmailJS
    const result = await sendEmailWithEmailJS(emailJSOptions);

    return result;
  } catch (error: any) {
    console.error('Error sending email with fallback service:', error);
    return {
      success: false,
      message: error.message || 'Failed to send email with fallback service'
    };
  }
};

/**
 * إرسال بريد إلكتروني تأكيد باستخدام طريقة بديلة
 * @param email البريد الإلكتروني للمستخدم
 * @param confirmationUrl رابط التأكيد
 * @param language لغة البريد الإلكتروني (ar أو en)
 * @returns وعد بنتيجة الإرسال
 */
export const sendConfirmationEmailWithFallback = async (
  email: string,
  confirmationUrl: string,
  language: string = 'ar'
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Sending confirmation email with fallback service to:', email);
    // لا نطبع رابط التأكيد للأمان
    console.log('Email language:', language);

    // الحصول على إعدادات البريد الإلكتروني من المتجر
    const { systemSettings } = useAdminStore.getState();
    const confirmationSettings = systemSettings.emailSettings?.confirmationEmail;

    // استخدام إعدادات البريد الإلكتروني من المتجر
    const fromEmail = confirmationSettings?.fromEmail || 'no-reply@rashadai.com';
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
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2>Email Confirmation</h2>
          <p>Hello ${email.split('@')[0]},</p>
          <p>Thank you for registering at RashadAI. To complete the registration process, please confirm your email by clicking the button below.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" style="background-color: #4169E1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Confirm Email</a>
          </div>
          <p>Or you can copy and paste the following link in your browser if the button doesn't work:</p>
          <div style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">
            ${confirmationUrl}
          </div>
          <p>If you didn't create an account at RashadAI, please ignore this email.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
            <p>RashadAI &copy; ${new Date().getFullYear()} All Rights Reserved</p>
          </div>
        </div>
      `;
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
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; direction: rtl; text-align: right;">
          <h2>تأكيد البريد الإلكتروني</h2>
          <p>مرحباً ${email.split('@')[0]}،</p>
          <p>شكراً لتسجيلك في RashadAI. لإكمال عملية التسجيل، يرجى تأكيد بريدك الإلكتروني بالنقر على الزر أدناه.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" style="background-color: #4169E1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">تأكيد البريد الإلكتروني</a>
          </div>
          <p>أو يمكنك نسخ الرابط التالي ولصقه في متصفحك إذا كان الزر لا يعمل:</p>
          <div style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all; direction: ltr; text-align: center;">
            ${confirmationUrl}
          </div>
          <p>إذا لم تقم بإنشاء حساب في RashadAI، يرجى تجاهل هذا البريد الإلكتروني.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
            <p>RashadAI &copy; ${new Date().getFullYear()} جميع الحقوق محفوظة</p>
          </div>
        </div>
      `;
    }

    // إرسال البريد الإلكتروني باستخدام الطريقة البديلة
    return await sendEmailWithFallback({
      from: fromEmail,
      to: email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
      replyTo: fromEmail
    });
  } catch (error: any) {
    console.error('Error sending confirmation email with fallback service:', error);
    return {
      success: false,
      message: error.message || 'Failed to send confirmation email with fallback service'
    };
  }
};

/**
 * إرسال بريد إلكتروني لإعادة تعيين كلمة المرور باستخدام طريقة بديلة
 * @param email البريد الإلكتروني للمستخدم
 * @param resetUrl رابط إعادة تعيين كلمة المرور
 * @param language لغة البريد الإلكتروني (ar أو en)
 * @returns وعد بنتيجة الإرسال
 */
export const sendPasswordResetEmailWithFallback = async (
  email: string,
  resetUrl: string,
  language: string = 'ar'
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Sending password reset email with fallback service to:', email);
    // لا نطبع رابط إعادة تعيين كلمة المرور للأمان
    console.log('Email language:', language);

    // الحصول على إعدادات البريد الإلكتروني من المتجر
    const { systemSettings } = useAdminStore.getState();
    const resetPasswordSettings = systemSettings.emailSettings?.resetPassword;

    // استخدام إعدادات البريد الإلكتروني من المتجر
    const fromEmail = resetPasswordSettings?.fromEmail || 'no-reply@rashadai.com';
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
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2>Password Reset</h2>
          <p>Hello ${email.split('@')[0]},</p>
          <p>You have requested to reset your password at RashadAI. Please click on the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4169E1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p>Or you can copy and paste the following link in your browser if the button doesn't work:</p>
          <div style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">
            ${resetUrl}
          </div>
          <p style="color: #e74c3c; font-weight: bold;">This link will expire in 24 hours.</p>
          <p>If you didn't request a password reset, please ignore this email. No changes have been made to your account.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
            <p>RashadAI &copy; ${new Date().getFullYear()} All Rights Reserved</p>
          </div>
        </div>
      `;
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
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; direction: rtl; text-align: right;">
          <h2>إعادة تعيين كلمة المرور</h2>
          <p>مرحباً ${email.split('@')[0]}،</p>
          <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في RashadAI. لإعادة تعيين كلمة المرور، يرجى النقر على الزر أدناه.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4169E1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">إعادة تعيين كلمة المرور</a>
          </div>
          <p>أو يمكنك نسخ الرابط التالي ولصقه في متصفحك إذا كان الزر لا يعمل:</p>
          <div style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all; direction: ltr; text-align: center;">
            ${resetUrl}
          </div>
          <p style="color: #e74c3c; font-weight: bold;">ستنتهي صلاحية هذا الرابط خلال 24 ساعة.</p>
          <p>إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني. لم يتم إجراء أي تغييرات على حسابك.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
            <p>RashadAI &copy; ${new Date().getFullYear()} جميع الحقوق محفوظة</p>
          </div>
        </div>
      `;
    }

    // إرسال البريد الإلكتروني باستخدام الطريقة البديلة
    return await sendEmailWithFallback({
      from: fromEmail,
      to: email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
      replyTo: fromEmail
    });
  } catch (error: any) {
    console.error('Error sending password reset email with fallback service:', error);
    return {
      success: false,
      message: error.message || 'Failed to send password reset email with fallback service'
    };
  }
};
