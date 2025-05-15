-- الجزء الثاني: إنشاء وظائف المساعدة

-- 1. إنشاء وظيفة RPC للحصول على بيانات المستخدم من auth.users
-- حذف الوظيفة أولاً إذا كانت موجودة
DROP FUNCTION IF EXISTS get_auth_user_by_email(text);

-- إعادة إنشاء الوظيفة
CREATE FUNCTION get_auth_user_by_email(email_param TEXT)
RETURNS SETOF auth.users
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM auth.users WHERE email = email_param;
END;
$$;

-- 2. إنشاء وظيفة RPC لإنشاء ملف شخصي للمستخدم
-- حذف الوظيفة أولاً إذا كانت موجودة
DROP FUNCTION IF EXISTS create_user_profile(UUID, TEXT, TEXT);

-- إعادة إنشاء الوظيفة
CREATE FUNCTION create_user_profile(user_id UUID, user_email TEXT, user_name TEXT DEFAULT NULL)
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_profile profiles;
  default_name TEXT;
BEGIN
  -- تعيين الاسم الافتراضي إذا لم يتم توفيره
  IF user_name IS NULL THEN
    default_name := split_part(user_email, '@', 1);
  ELSE
    default_name := user_name;
  END IF;
  
  -- إدراج ملف شخصي جديد
  INSERT INTO profiles (
    id, 
    email, 
    name, 
    avatar, 
    country_code, 
    language, 
    created_at, 
    updated_at
  ) VALUES (
    user_id, 
    user_email, 
    default_name, 
    'https://ui-avatars.com/api/?name=' || default_name || '&background=random', 
    'EG', 
    'ar', 
    NOW(), 
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    avatar = EXCLUDED.avatar,
    country_code = EXCLUDED.country_code,
    language = EXCLUDED.language,
    updated_at = NOW()
  RETURNING * INTO new_profile;
  
  RETURN new_profile;
END;
$$;
