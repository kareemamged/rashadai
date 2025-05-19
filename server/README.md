# خادم البريد الإلكتروني لـ RashadAI

خادم بسيط لإرسال رسائل البريد الإلكتروني باستخدام SMTP مباشرة.

## المتطلبات

- Node.js (الإصدار 14 أو أحدث)
- npm أو yarn

## التثبيت

1. قم بتثبيت الاعتمادات:
```bash
npm install
# أو
yarn install
```

2. قم بإنشاء ملف `.env` (أو تعديل الملف الموجود) وأضف المتغيرات البيئية التالية:
```
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

## التشغيل

1. لتشغيل الخادم في وضع التطوير:
```bash
npm run dev
# أو
yarn dev
```

2. لتشغيل الخادم في وضع الإنتاج:
```bash
npm start
# أو
yarn start
```

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
      "user": "user@example.com",
      "pass": "password"
    }
  },
  "email": {
    "from": "sender@example.com",
    "to": "recipient@example.com",
    "subject": "Test Email",
    "text": "This is a test email",
    "html": "<p>This is a test email</p>",
    "replyTo": "reply@example.com"
  }
}
```

#### استجابة

```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "message-id"
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
      "user": "user@example.com",
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

## استخدام الخادم مع التطبيق الأمامي

1. تأكد من أن الخادم يعمل على المنفذ 3001 (أو المنفذ الذي حددته في ملف `.env`)
2. قم بتحديث ملف `src/lib/emailService.ts` في التطبيق الأمامي لاستخدام هذا الخادم
3. تأكد من أن متغير `CORS_ORIGIN` في ملف `.env` يشير إلى عنوان URL للتطبيق الأمامي

## الأمان

- تأكد من حماية كلمات المرور وبيانات الاعتماد الأخرى
- استخدم HTTPS في بيئة الإنتاج
- قم بتنفيذ المصادقة والتفويض المناسبين للوصول إلى نقاط النهاية API
