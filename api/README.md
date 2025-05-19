# Serverless Email API

هذا الملف يحتوي على وظائف Serverless لإرسال رسائل البريد الإلكتروني باستخدام SMTP مباشرة. يتم استخدامه في بيئة Vercel.

## نقاط النهاية API

### إرسال بريد إلكتروني

```
POST /api/send-email
```

#### طلب

```json
{
  "smtp": {
    "host": "smtp.example.com",
    "port": 465,
    "secure": true,
    "auth": {
      "user": "username@example.com",
      "pass": "password"
    }
  },
  "email": {
    "from": "sender@example.com",
    "to": "recipient@example.com",
    "subject": "Test Email",
    "text": "This is a test email",
    "html": "<h1>This is a test email</h1>",
    "replyTo": "reply@example.com"
  }
}
```

#### استجابة

```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "1234567890"
}
```

### اختبار اتصال SMTP

```
POST /api/test-smtp
```

#### طلب

```json
{
  "smtp": {
    "host": "smtp.example.com",
    "port": 465,
    "secure": true,
    "auth": {
      "user": "username@example.com",
      "pass": "password"
    }
  },
  "testEmail": "test@example.com"
}
```

#### استجابة

```json
{
  "success": true,
  "message": "SMTP connection test successful. A test email has been sent to test@example.com."
}
```

## استخدام API في التطبيق

يتم استخدام هذا API في التطبيق من خلال ملف `src/lib/apiConfig.js` الذي يحدد عناوين API بناءً على بيئة التشغيل:

```javascript
// تحديد عنوان API بناءً على بيئة التشغيل
const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = isDevelopment ? 'http://localhost:3001/api' : '/api';

export const API_ENDPOINTS = {
  SEND_EMAIL: `${API_BASE_URL}/send-email`,
  TEST_SMTP: `${API_BASE_URL}/test-smtp`
};
```

## الأمان

- تأكد من حماية كلمات المرور وبيانات الاعتماد الأخرى
- استخدم HTTPS في بيئة الإنتاج
- قم بتنفيذ المصادقة والتفويض المناسبين للوصول إلى نقاط النهاية API
