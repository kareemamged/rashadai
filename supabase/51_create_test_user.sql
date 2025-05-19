-- إنشاء مستخدم اختباري في Supabase

-- ملاحظة: هذا الملف لا يمكن تنفيذه مباشرة من خلال SQL Editor
-- يجب تنفيذه من خلال واجهة Supabase الإدارية في قسم Authentication > Users

/*
لإنشاء مستخدم جديد، يجب اتباع الخطوات التالية:

1. الذهاب إلى لوحة تحكم Supabase
2. الانتقال إلى قسم Authentication
3. الانتقال إلى تبويب Users
4. النقر على زر "Add User"
5. إدخال البريد الإلكتروني وكلمة المرور للمستخدم الجديد
6. النقر على زر "Create User"

بعد إنشاء المستخدم، يمكنك تنفيذ الأوامر التالية لتحديث بيانات المستخدم:
*/

-- تحديث بيانات المستخدم في جدول profiles
-- استبدل 'user_id_here' بمعرف المستخدم الذي تم إنشاؤه
UPDATE profiles
SET
  name = 'اسم المستخدم',
  country_code = 'EG', -- مصر كدولة افتراضية
  language = 'ar',
  updated_at = NOW()
WHERE
  id = 'user_id_here';

-- يمكنك أيضًا تحديث بيانات المستخدم في جدول auth.users
-- استبدل 'user_id_here' بمعرف المستخدم الذي تم إنشاؤه
UPDATE auth.users
SET
  raw_user_meta_data = jsonb_build_object(
    'name', 'اسم المستخدم',
    'country_code', 'EG', -- مصر كدولة افتراضية
    'language', 'ar'
  )
WHERE
  id = 'user_id_here';
