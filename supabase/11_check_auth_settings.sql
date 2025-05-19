-- التحقق من إعدادات المصادقة
SELECT * FROM auth.config;

-- التحقق من وجود جدول profiles
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
);

-- التحقق من هيكل جدول profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles';

-- التحقق من وجود المحفز on_auth_user_created
SELECT tgname, tgrelid::regclass, tgtype, tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- التحقق من سياسات الأمان لجدول profiles
SELECT * FROM pg_policies WHERE tablename = 'profiles';
