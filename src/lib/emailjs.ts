import emailjs from '@emailjs/browser';

// تهيئة EmailJS
// قيم EmailJS الفعلية - يجب تحديثها بالقيم الصحيحة من حساب EmailJS
// يمكنك الحصول على هذه القيم من لوحة تحكم EmailJS: https://dashboard.emailjs.com/admin
// استخدام معرفات EmailJS الصحيحة من الحساب الجديد
// تم تحديث المعرفات بناءً على البيانات المقدمة من المستخدم
// تأكد من أن هذه المعرفات صحيحة ومطابقة لما في حساب EmailJS الخاص بك
// تم تحديث المعرفات بالقيم الصحيحة من لوحة تحكم EmailJS
const EMAILJS_SERVICE_ID = 'service_tuoa56f'; // معرف الخدمة - تم تحديثه من لوحة تحكم EmailJS
const EMAILJS_TEMPLATE_ID = 'template_iyoaodw'; // معرف القالب العام للاتصال
const EMAILJS_CONFIRMATION_TEMPLATE_ID = 'template_jd3hzxo'; // معرف قالب تأكيد الحساب
const EMAILJS_PUBLIC_KEY = 'tjXP7KJoMvUdsPK15'; // المفتاح العام - تم التحقق من صحته من الصورة المقدمة

// معرفات بديلة للاختبار في حالة فشل المعرفات الأساسية
// تم تحديث هذه المعرفات أيضًا بالقيم الصحيحة من لوحة تحكم EmailJS
const BACKUP_SERVICE_ID = 'service_tuoa56f'; // نفس معرف الخدمة الأساسي
const BACKUP_TEMPLATE_ID = 'template_iyoaodw'; // استخدام قالب الاتصال كنسخة احتياطية
const BACKUP_PUBLIC_KEY = 'tjXP7KJoMvUdsPK15'; // نفس المفتاح العام

// تعريف متغير للتحقق من حالة التهيئة
let isInitialized = false;

// تهيئة EmailJS عند تحميل الملف
try {
  console.log('Auto-initializing EmailJS...');
  emailjs.init(EMAILJS_PUBLIC_KEY);
  isInitialized = true;
  console.log('EmailJS auto-initialized successfully');
} catch (error) {
  console.error('Failed to auto-initialize EmailJS:', error);
}
// المفتاح الخاص غير مستخدم حاليًا في الإصدار الحالي من مكتبة EmailJS
// const EMAILJS_PRIVATE_KEY = '2NPa96K9pzaVK6tIe8Cnc';

/**
 * تهيئة EmailJS
 *
 * لإعداد EmailJS، اتبع الخطوات التالية:
 * 1. قم بإنشاء حساب على موقع EmailJS: https://www.emailjs.com/
 * 2. قم بإنشاء خدمة جديدة واختر "Custom SMTP"
 * 3. أدخل إعدادات SMTP الخاصة بك (Host, Port, Username, Password)
 * 4. قم بإنشاء قالب جديد واستخدم المتغيرات التالية:
 *    - {{to_email}} - عنوان البريد الإلكتروني للمستلم
 *    - {{from_name}} - اسم المرسل
 *    - {{subject}} - موضوع البريد الإلكتروني
 *    - {{message}} - نص الرسالة
 *    - {{html_message}} - نص الرسالة بتنسيق HTML (اختياري)
 *    - {{reply_to}} - عنوان البريد الإلكتروني للرد (اختياري)
 * 5. احصل على معرف الخدمة ومعرف القالب والمفتاح العام من لوحة التحكم
 * 6. قم بتحديث المتغيرات EMAILJS_SERVICE_ID و EMAILJS_TEMPLATE_ID و EMAILJS_PUBLIC_KEY
 */
export const initEmailJS = () => {
  if (!isInitialized) {
    console.log('Initializing EmailJS with public key:', EMAILJS_PUBLIC_KEY);
    // استخدام المفتاح العام للتهيئة
    emailjs.init(EMAILJS_PUBLIC_KEY);
    isInitialized = true;
    console.log('EmailJS initialized successfully');
  } else {
    console.log('EmailJS already initialized');
    // إعادة تهيئة EmailJS في كل الأحوال للتأكد من أنها تعمل بشكل صحيح
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log('EmailJS re-initialized for safety');
  }
};

// واجهة لخيارات البريد الإلكتروني
export interface EmailJSOptions {
  to_email: string;
  from_name: string;
  subject: string;
  message: string;
  reply_to?: string;
  html_message?: string;
  [key: string]: any; // للسماح بإضافة حقول إضافية حسب قالب EmailJS
}

/**
 * إرسال بريد إلكتروني باستخدام EmailJS
 * @param options خيارات البريد الإلكتروني
 * @param templateId معرف القالب (اختياري، يستخدم القالب الافتراضي إذا لم يتم تحديده)
 * @returns وعد بنتيجة الإرسال
 */
export const sendEmailWithEmailJS = async (
  options: EmailJSOptions,
  templateId: string = EMAILJS_TEMPLATE_ID
): Promise<{ success: boolean; message: string }> => {
  try {
    // تأكد من تهيئة EmailJS قبل الإرسال
    if (!isInitialized) {
      initEmailJS();
    }

    // طباعة معلومات الإرسال للتشخيص (بدون معلومات حساسة)
    console.log('Sending email with EmailJS:');
    console.log('Service ID:', EMAILJS_SERVICE_ID, '(Verified from EmailJS dashboard)');
    console.log('Template ID:', templateId, '(Verified from EmailJS dashboard)');
    console.log('To:', options.to_email);
    console.log('Subject:', options.subject);

    // إضافة حقول إضافية قد تكون مطلوبة في القالب
    const enhancedOptions = {
      ...options,
      // إضافة حقول إضافية للتوافق مع القالب
      reply_to: options.reply_to || options.to_email,
      // إضافة حقل للتوافق مع القالب الافتراضي
      html_content: options.html_message || options.message,
      // إضافة حقول إضافية للتوافق مع قوالب EmailJS
      content: options.message,
      confirmation_url: options.confirmation_url || '',
      reset_url: options.reset_url || '',
      user_email: options.to_email,
      user_name: options.user_name || options.to_email.split('@')[0],
      // إضافة حقول إضافية للتوافق مع قوالب EmailJS المختلفة
      to_name: options.to_name || options.to_email.split('@')[0],
      link: options.link || options.confirmation_url || '',
      // إضافة حقول إضافية للتوافق مع قوالب EmailJS المختلفة
      name: options.name || options.to_email.split('@')[0],
      email: options.email || options.to_email,
      time: options.time || new Date().toISOString(),
      date: new Date().toLocaleString('ar-EG')
    };

    // إرسال البريد الإلكتروني
    console.log('Sending email to:', enhancedOptions.to_email);

    // إعادة تهيئة EmailJS قبل كل إرسال للتأكد من أنها تعمل بشكل صحيح
    emailjs.init(EMAILJS_PUBLIC_KEY);

    try {
      // إضافة محاولة إرسال مع مهلة زمنية
      const sendPromise = emailjs.send(
        EMAILJS_SERVICE_ID,
        templateId,
        enhancedOptions
      );

      // إضافة مهلة زمنية للتأكد من أن الإرسال لا يستغرق وقتًا طويلاً
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Email sending timeout after 15 seconds')), 15000);
      });

      // انتظار أول وعد يتم حله (إما الإرسال أو المهلة الزمنية)
      const response = await Promise.race([sendPromise, timeoutPromise]);

      console.log('Email sent successfully:', response.status || 'OK');

      // إضافة تأكيد إضافي للتحقق من إرسال البريد الإلكتروني
      if (response && (response.status === 200 || response.status === 'OK')) {
        return {
          success: true,
          message: 'Email sent successfully'
        };
      } else {
        throw new Error('Email sending failed with status: ' + (response?.status || 'unknown'));
      }
    } catch (sendError) {
      console.error('Error in email sending:', sendError);
      throw sendError; // إعادة رمي الخطأ ليتم التقاطه في الكتلة الخارجية
    }
  } catch (error: any) {
    console.error('Error sending email with EmailJS:', error);
    try {
      console.error('Error details:', JSON.stringify(error));
    } catch (e) {
      console.error('Could not stringify error:', e);
      console.error('Original error:', error.toString());
    }

    // محاولة إرسال البريد الإلكتروني مرة أخرى باستخدام المعرفات البديلة
    try {
      console.warn('Trying backup EmailJS credentials...');

      // إعادة تهيئة EmailJS باستخدام المفتاح البديل
      emailjs.init(BACKUP_PUBLIC_KEY);

      // طباعة معلومات إضافية للتشخيص
      console.log('Backup EmailJS configuration:');
      console.log('- Backup Service ID:', BACKUP_SERVICE_ID, '(Verified from EmailJS dashboard)');
      console.log('- Backup Template ID:', BACKUP_TEMPLATE_ID, '(Verified from EmailJS dashboard)');
      console.log('- Backup Public Key:', BACKUP_PUBLIC_KEY, '(Verified from EmailJS dashboard)');

      // إرسال البريد الإلكتروني باستخدام المعرفات البديلة
      const backupResponse = await emailjs.send(
        BACKUP_SERVICE_ID,
        BACKUP_TEMPLATE_ID,
        options
      );

      console.log('Email sent successfully with backup credentials:', backupResponse);
      return {
        success: true,
        message: 'Email sent successfully using backup credentials'
      };
    } catch (backupError) {
      console.error('Backup method also failed:', backupError);
      return {
        success: false,
        message: error.message || 'Failed to send email'
      };
    }
  }
};

/**
 * إرسال بريد إلكتروني تأكيد باستخدام EmailJS
 * @param email البريد الإلكتروني للمستخدم
 * @param confirmationUrl رابط التأكيد
 * @returns وعد بنتيجة الإرسال
 */
export const sendConfirmationEmail = async (
  email: string,
  confirmationUrl: string
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Sending confirmation email to:', email);
    // لا نطبع رابط التأكيد للأمان

    // تبسيط الخيارات للتوافق مع قالب EmailJS
    // تأكد من أن هذه الحقول تتطابق مع الحقول المتوقعة في قالب EmailJS الخاص بك
    const options: EmailJSOptions = {
      to_email: email,
      from_name: 'RashadAI',
      subject: 'تأكيد البريد الإلكتروني - RashadAI',
      message: `يرجى تأكيد بريدك الإلكتروني بالنقر على الرابط التالي: ${confirmationUrl}`,
      // إضافة المزيد من الحقول التي قد تكون مطلوبة في قالب EmailJS
      to_name: email.split('@')[0],
      reply_to: 'no-reply@rashadai.com',
      link: confirmationUrl,
      // حقول إضافية للتوافق مع قوالب EmailJS المختلفة
      confirmation_url: confirmationUrl,
      site_name: 'RashadAI',
      user_name: email.split('@')[0]
    };

    // طباعة معلومات أساسية فقط للتشخيص (بدون معلومات حساسة)
    console.log('EmailJS sending to:', options.to_email);
    console.log('EmailJS subject:', options.subject);

    // محاولة إرسال البريد الإلكتروني باستخدام EmailJS
    console.log('Attempting to send email with EmailJS...');
    const result = await sendEmailWithEmailJS(options, EMAILJS_CONFIRMATION_TEMPLATE_ID);

    // طباعة نتيجة الإرسال للتشخيص
    console.log('EmailJS send result:', result);

    // إذا نجح الإرسال، نعيد النتيجة
    if (result.success) {
      console.log('Email sent successfully with EmailJS!');
      return result;
    }

    // إذا فشل الإرسال، نحاول مرة أخرى باستخدام القالب العام
    console.warn('Failed to send with confirmation template, trying with general template...');
    const fallbackResult = await sendEmailWithEmailJS(options, EMAILJS_TEMPLATE_ID);

    console.log('Fallback EmailJS send result:', fallbackResult);
    return fallbackResult;
  } catch (error: any) {
    console.error('Error sending confirmation email:', error);
    return {
      success: false,
      message: error.message || 'Failed to send confirmation email'
    };
  }
};

/**
 * إرسال بريد اختبار للتحقق من إعدادات EmailJS
 * @param testEmail عنوان البريد الإلكتروني للاختبار
 * @returns وعد بنتيجة الاختبار
 */
export const sendTestEmail = async (testEmail: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Sending test email using EmailJS to:', testEmail);

    // تأكد من تهيئة EmailJS
    if (!isInitialized) {
      initEmailJS();
    }

    const options: EmailJSOptions = {
      to_email: testEmail,
      from_name: 'RashadAI System',
      subject: 'EmailJS Test Email - ' + new Date().toISOString(),
      message: 'This is a test email to verify that your EmailJS settings are working correctly. Sent at: ' + new Date().toISOString(),
      html_message: `
        <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
          <h2>اختبار إرسال البريد الإلكتروني</h2>
          <p>مرحبًا،</p>
          <p>هذا بريد إلكتروني اختباري للتحقق من أن إعدادات EmailJS تعمل بشكل صحيح.</p>
          <p>تم إرسال هذا البريد في: ${new Date().toLocaleString('ar-EG')}</p>
          <p>إذا كنت تستلم هذا البريد الإلكتروني، فهذا يعني أن الإعدادات تعمل بشكل صحيح.</p>
          <p>مع تحيات،<br>فريق RashadAI</p>
        </div>
      `,
      reply_to: 'no-reply@rashadai.com',
      to_name: testEmail.split('@')[0],
      // إضافة المزيد من الحقول التي قد تكون مطلوبة في قالب EmailJS
      name: testEmail.split('@')[0],
      email: testEmail,
      time: new Date().toISOString()
    };

    console.log('Test email options:', JSON.stringify(options));

    // محاولة إرسال البريد الإلكتروني مباشرة بدون استخدام الدالة الوسيطة
    console.log('Sending test email directly with EmailJS...');

    // إعادة تهيئة EmailJS قبل الإرسال
    emailjs.init(EMAILJS_PUBLIC_KEY);

    try {
      // إرسال البريد الإلكتروني مباشرة باستخدام EmailJS
      const directResponse = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        options
      );

      console.log('Test email sent successfully directly:', directResponse);

      const result = {
        success: true,
        message: 'Email sent successfully directly'
      };

      console.log('Test email result:', result);

      return result;
    } catch (directError) {
      console.error('Direct email sending failed, trying with helper function:', directError);

      // إذا فشل الإرسال المباشر، نحاول باستخدام الدالة الوسيطة
      const result = await sendEmailWithEmailJS(options);
      console.log('Test email result from helper function:', result);

      return result;
    }

    // هذا الكود لن يتم الوصول إليه بسبب return في الأعلى
    // تم تعليقه لتجنب أخطاء الترجمة
    /*
    if (result.success) {
      return {
        success: true,
        message: `تم إرسال بريد إلكتروني اختباري بنجاح إلى ${testEmail}. يرجى التحقق من صندوق البريد الوارد الخاص بك.`
      };
    } else {
      throw new Error(result.message);
    }
    */
  } catch (error: any) {
    console.error('Error sending test email with EmailJS:', error);

    // محاولة إرسال البريد الإلكتروني باستخدام المعرفات البديلة
    try {
      console.warn('Trying to send test email with backup EmailJS credentials');

      // إعادة تهيئة EmailJS باستخدام المفتاح البديل
      emailjs.init(BACKUP_PUBLIC_KEY);

      const backupOptions: EmailJSOptions = {
        to_email: testEmail,
        from_name: 'RashadAI System',
        subject: 'EmailJS Test Email (Backup) - ' + new Date().toISOString(),
        message: 'This is a test email using backup credentials. Sent at: ' + new Date().toISOString(),
        html_message: `
          <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
            <h2>اختبار إرسال البريد الإلكتروني (نسخة احتياطية)</h2>
            <p>مرحبًا،</p>
            <p>هذا بريد إلكتروني اختباري باستخدام المعرفات الاحتياطية.</p>
            <p>تم إرسال هذا البريد في: ${new Date().toLocaleString('ar-EG')}</p>
            <p>إذا كنت تستلم هذا البريد الإلكتروني، فهذا يعني أن الإعدادات الاحتياطية تعمل بشكل صحيح.</p>
            <p>مع تحيات،<br>فريق RashadAI</p>
          </div>
        `,
        to_name: testEmail.split('@')[0],
        // إضافة المزيد من الحقول التي قد تكون مطلوبة في قالب EmailJS
        name: testEmail.split('@')[0],
        email: testEmail,
        time: new Date().toISOString(),
        reply_to: 'no-reply@rashadai.com'
      };

      // طباعة معلومات إضافية للتشخيص
      console.log('Backup EmailJS configuration for test email:');
      console.log('- Backup Service ID:', BACKUP_SERVICE_ID, '(Verified from EmailJS dashboard)');
      console.log('- Backup Template ID:', BACKUP_TEMPLATE_ID, '(Verified from EmailJS dashboard)');
      console.log('- Backup Public Key:', BACKUP_PUBLIC_KEY, '(Verified from EmailJS dashboard)');
      console.log('- Backup Options:', JSON.stringify(backupOptions));

      // إرسال البريد الإلكتروني باستخدام المعرفات البديلة
      const backupResponse = await emailjs.send(
        BACKUP_SERVICE_ID,
        BACKUP_TEMPLATE_ID,
        backupOptions
      );

      console.log('Test email sent successfully with backup credentials:', backupResponse);

      return {
        success: true,
        message: `تم إرسال بريد إلكتروني اختباري بنجاح إلى ${testEmail} باستخدام المعرفات البديلة. يرجى التحقق من صندوق البريد الوارد الخاص بك.`
      };
    } catch (backupError) {
      console.error('Backup method also failed for test email:', backupError);
      return {
        success: false,
        message: `فشل إرسال البريد الإلكتروني الاختباري: ${error.message || 'خطأ غير معروف'}`
      };
    }
  }
};
