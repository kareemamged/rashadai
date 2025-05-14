-- إصلاح مشاكل تحديث الملف الشخصي في قاعدة البيانات
-- هذا الملف يقوم بإصلاح مشكلة عدم تحديث بيانات الحساب في قاعدة البيانات

-- 1. التحقق من وجود جدول profiles وإمكانية الوصول إليه
DO $$
BEGIN
    -- التحقق من وجود جدول profiles
    IF EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'profiles'
    ) THEN
        RAISE NOTICE 'جدول profiles موجود';
    ELSE
        RAISE EXCEPTION 'جدول profiles غير موجود!';
    END IF;
END
$$;

-- 2. التحقق من وجود الوظائف المخصصة لتحديث الملف الشخصي
DO $$
BEGIN
    -- التحقق من وجود الوظائف المخصصة
    IF EXISTS (
        SELECT FROM pg_proc
        WHERE proname = 'update_profile_safe'
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        RAISE NOTICE 'وظيفة update_profile_safe موجودة';
    ELSE
        RAISE NOTICE 'وظيفة update_profile_safe غير موجودة!';
    END IF;
END
$$;

-- 3. إنشاء وظيفة جديدة لتحديث الملف الشخصي بشكل آمن
CREATE OR REPLACE FUNCTION update_profile_safe_v2(
  p_user_id UUID,
  p_profile_data JSONB
)
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_profile profiles;
  profile_exists BOOLEAN;
BEGIN
  -- التحقق من وجود الملف الشخصي
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = p_user_id) INTO profile_exists;
  
  -- إذا كان الملف الشخصي موجودًا، قم بتحديثه
  IF profile_exists THEN
    UPDATE profiles
    SET
      name = COALESCE(p_profile_data->>'name', name),
      avatar = COALESCE(p_profile_data->>'avatar', avatar),
      country_code = COALESCE(p_profile_data->>'country_code', country_code),
      phone = COALESCE(p_profile_data->>'phone', phone),
      bio = COALESCE(p_profile_data->>'bio', bio),
      language = COALESCE(p_profile_data->>'language', language),
      website = COALESCE(p_profile_data->>'website', website),
      gender = COALESCE(p_profile_data->>'gender', gender),
      birth_date = CASE 
                    WHEN p_profile_data->>'birth_date' IS NULL THEN birth_date
                    WHEN p_profile_data->>'birth_date' = '' THEN NULL
                    ELSE (p_profile_data->>'birth_date')::DATE
                   END,
      profession = COALESCE(p_profile_data->>'profession', profession),
      updated_at = NOW()
    WHERE id = p_user_id
    RETURNING * INTO updated_profile;
  ELSE
    -- إذا لم يكن الملف الشخصي موجودًا، قم بإنشائه
    INSERT INTO profiles (
      id,
      name,
      avatar,
      country_code,
      phone,
      bio,
      language,
      website,
      gender,
      birth_date,
      profession,
      created_at,
      updated_at
    ) VALUES (
      p_user_id,
      p_profile_data->>'name',
      p_profile_data->>'avatar',
      p_profile_data->>'country_code',
      p_profile_data->>'phone',
      p_profile_data->>'bio',
      p_profile_data->>'language',
      p_profile_data->>'website',
      p_profile_data->>'gender',
      CASE 
        WHEN p_profile_data->>'birth_date' IS NULL OR p_profile_data->>'birth_date' = '' 
        THEN NULL 
        ELSE (p_profile_data->>'birth_date')::DATE 
      END,
      p_profile_data->>'profession',
      NOW(),
      NOW()
    )
    RETURNING * INTO updated_profile;
  END IF;
  
  -- إرجاع الملف الشخصي المحدث
  RETURN QUERY SELECT * FROM profiles WHERE id = p_user_id;
END;
$$;

-- 4. إنشاء وظيفة للتحقق من وجود ملف شخصي وإنشائه إذا لم يكن موجودًا
CREATE OR REPLACE FUNCTION ensure_profile_exists(
  p_user_id UUID,
  p_email TEXT,
  p_name TEXT DEFAULT NULL
)
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_exists BOOLEAN;
  default_name TEXT;
  updated_profile profiles;
BEGIN
  -- التحقق من وجود الملف الشخصي
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = p_user_id) INTO profile_exists;
  
  -- إذا لم يكن الملف الشخصي موجودًا، قم بإنشائه
  IF NOT profile_exists THEN
    -- استخدام الاسم المقدم أو استخراجه من البريد الإلكتروني
    default_name := COALESCE(p_name, split_part(p_email, '@', 1));
    
    -- إنشاء ملف شخصي جديد
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
      p_user_id,
      p_email,
      default_name,
      'https://ui-avatars.com/api/?name=' || default_name || '&background=random',
      'EG',
      'ar',
      NOW(),
      NOW()
    )
    RETURNING * INTO updated_profile;
  END IF;
  
  -- إرجاع الملف الشخصي
  RETURN QUERY SELECT * FROM profiles WHERE id = p_user_id;
END;
$$;

-- 5. منح صلاحيات تنفيذ الوظائف للمستخدمين المصادق عليهم وغير المصادق عليهم
GRANT EXECUTE ON FUNCTION update_profile_safe_v2(UUID, JSONB) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION ensure_profile_exists(UUID, TEXT, TEXT) TO authenticated, anon;
