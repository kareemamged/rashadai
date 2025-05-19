-- إصلاح مشكلة الوصول إلى جدول auth.users

-- حذف الوظائف الموجودة أولاً
DROP FUNCTION IF EXISTS public.get_auth_user(UUID);
DROP FUNCTION IF EXISTS public.get_auth_user_by_email(TEXT);
DROP FUNCTION IF EXISTS public.get_all_auth_users();
DROP FUNCTION IF EXISTS public.exec_sql(TEXT);
DROP FUNCTION IF EXISTS public.create_profile_for_user(UUID, TEXT, TEXT, TEXT, TEXT);

-- 1. إنشاء وظيفة للوصول إلى جدول auth.users
CREATE OR REPLACE FUNCTION public.get_auth_user(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.created_at
  FROM auth.users u
  WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- منح صلاحيات تنفيذ الوظيفة للمستخدمين المصادق عليهم وغير المصادق عليهم
GRANT EXECUTE ON FUNCTION public.get_auth_user TO authenticated, anon;

-- 2. إنشاء وظيفة للوصول إلى جدول auth.users بواسطة البريد الإلكتروني
CREATE OR REPLACE FUNCTION public.get_auth_user_by_email(email_param TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.created_at
  FROM auth.users u
  WHERE u.email = email_param;
END;
$$ LANGUAGE plpgsql;

-- منح صلاحيات تنفيذ الوظيفة للمستخدمين المصادق عليهم وغير المصادق عليهم
GRANT EXECUTE ON FUNCTION public.get_auth_user_by_email TO authenticated, anon;

-- 3. إنشاء وظيفة للحصول على جميع المستخدمين
CREATE OR REPLACE FUNCTION public.get_all_auth_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.created_at
  FROM auth.users u;
END;
$$ LANGUAGE plpgsql;

-- منح صلاحيات تنفيذ الوظيفة للمستخدمين المصادق عليهم وغير المصادق عليهم
GRANT EXECUTE ON FUNCTION public.get_all_auth_users TO authenticated, anon;

-- 4. إنشاء وظيفة لتنفيذ استعلام SQL مباشرة
CREATE OR REPLACE FUNCTION public.exec_sql(sql TEXT)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql;

-- منح صلاحيات تنفيذ الوظيفة للمستخدمين المصادق عليهم
GRANT EXECUTE ON FUNCTION public.exec_sql TO authenticated;

-- 5. إنشاء وظيفة لإنشاء ملف شخصي للمستخدم
CREATE OR REPLACE FUNCTION public.create_profile_for_user(
  user_id UUID,
  user_email TEXT,
  user_name TEXT DEFAULT NULL,
  user_country_code TEXT DEFAULT 'EG', -- مصر كدولة افتراضية
  user_language TEXT DEFAULT 'ar'
)
RETURNS SETOF profiles
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_name TEXT;
BEGIN
  -- تحديد اسم المستخدم
  IF user_name IS NULL THEN
    profile_name := split_part(user_email, '@', 1);
  ELSE
    profile_name := user_name;
  END IF;

  -- إدراج سجل جديد في جدول profiles
  RETURN QUERY
  INSERT INTO profiles (
    id,
    email,
    name,
    avatar,
    country_code,
    language,
    created_at,
    updated_at
  )
  VALUES (
    user_id,
    user_email,
    profile_name,
    'https://ui-avatars.com/api/?name=' || profile_name || '&background=random',
    user_country_code,
    user_language,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    name = EXCLUDED.name,
    country_code = EXCLUDED.country_code,
    language = EXCLUDED.language,
    updated_at = NOW()
  RETURNING *;
END;
$$ LANGUAGE plpgsql;

-- منح صلاحيات تنفيذ الوظيفة للمستخدمين المصادق عليهم وغير المصادق عليهم
GRANT EXECUTE ON FUNCTION public.create_profile_for_user TO authenticated, anon;
