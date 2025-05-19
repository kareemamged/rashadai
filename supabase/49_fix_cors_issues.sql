-- إصلاح مشاكل CORS في Supabase

-- ملاحظة: هذا الملف لا يمكن تنفيذه مباشرة من خلال SQL Editor
-- يجب تنفيذه من خلال واجهة Supabase الإدارية في قسم Authentication > URL Configuration

/*
لإصلاح مشاكل CORS، يجب اتباع الخطوات التالية:

1. الذهاب إلى لوحة تحكم Supabase
2. الانتقال إلى قسم Authentication
3. الانتقال إلى تبويب URL Configuration
4. إضافة الروابط التالية إلى قسم "Redirect URLs":
   - http://localhost:3000/**
   - http://localhost:5173/**
   - https://[your-domain].com/**
   - https://[your-domain].vercel.app/**

5. إضافة الروابط التالية إلى قسم "Allowed domains for CORS (Cross-Origin Resource Sharing)":
   - http://localhost:3000
   - http://localhost:5173
   - https://[your-domain].com
   - https://[your-domain].vercel.app
*/

-- يمكن أيضًا تنفيذ الأمر التالي لتمكين CORS لجميع المجالات (غير آمن للإنتاج)
-- هذا مفيد فقط للتطوير المحلي
UPDATE auth.config
SET redirect_urls = ARRAY['*'],
    site_url = '*';

-- تأكد من تحديث هذه القيم بالقيم الصحيحة قبل نشر التطبيق للإنتاج
