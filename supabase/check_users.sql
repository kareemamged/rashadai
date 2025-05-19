-- التحقق من المستخدمين الموجودين في قاعدة البيانات
-- يمكن تنفيذ هذا الملف في SQL Editor في Supabase Dashboard

-- عرض جميع المستخدمين في جدول auth.users
SELECT 
  id, 
  email, 
  email_confirmed_at, 
  last_sign_in_at, 
  created_at, 
  updated_at, 
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- عرض جميع الملفات الشخصية في جدول profiles
SELECT 
  id, 
  email, 
  name, 
  country_code, 
  language, 
  created_at, 
  updated_at
FROM public.profiles
ORDER BY created_at DESC;

-- التحقق من وجود جدول unconfirmed_users
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'unconfirmed_users'
) AS unconfirmed_users_table_exists;

-- عرض المستخدمين غير المؤكدين إذا كان الجدول موجودًا
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'unconfirmed_users'
  ) THEN
    EXECUTE 'SELECT * FROM public.unconfirmed_users ORDER BY created_at DESC';
  ELSE
    RAISE NOTICE 'جدول unconfirmed_users غير موجود';
  END IF;
END
$$;

-- التحقق من وجود وظيفة check_email_confirmed_alt
SELECT EXISTS (
  SELECT FROM pg_proc
  WHERE proname = 'check_email_confirmed_alt'
) AS check_email_confirmed_alt_function_exists;

-- التحقق من وجود وظيفة simple_auth_check
SELECT EXISTS (
  SELECT FROM pg_proc
  WHERE proname = 'simple_auth_check'
) AS simple_auth_check_function_exists;

-- التحقق من وجود وظيفة direct_register_user
SELECT EXISTS (
  SELECT FROM pg_proc
  WHERE proname = 'direct_register_user'
) AS direct_register_user_function_exists;

-- التحقق من وجود وظيفة register_new_user
SELECT EXISTS (
  SELECT FROM pg_proc
  WHERE proname = 'register_new_user'
) AS register_new_user_function_exists;

-- التحقق من وجود وظيفة update_password_with_token
SELECT EXISTS (
  SELECT FROM pg_proc
  WHERE proname = 'update_password_with_token'
) AS update_password_with_token_function_exists;

-- التحقق من وجود وظيفة reset_password_with_token
SELECT EXISTS (
  SELECT FROM pg_proc
  WHERE proname = 'reset_password_with_token'
) AS reset_password_with_token_function_exists;
