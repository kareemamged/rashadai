-- إصلاح جميع بيانات المستخدمين في قاعدة البيانات

-- 1. إنشاء جدول profiles إذا لم يكن موجودًا
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar TEXT,
  country_code TEXT DEFAULT 'EG',
  phone TEXT,
  bio TEXT,
  language TEXT DEFAULT 'ar',
  website TEXT,
  gender TEXT,
  birth_date TEXT,
  profession TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. إضافة سياسات الأمان للجدول
-- إعادة تعيين سياسات الأمان
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- إضافة سياسات الأمان الجديدة
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- 3. التأكد من تفعيل RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. إنشاء وظيفة RPC للحصول على بيانات المستخدم من auth.users
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

-- 5. إنشاء وظيفة RPC لإنشاء ملف شخصي للمستخدم
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

-- 6. إنشاء وظيفة لتحديث جميع المستخدمين الحاليين
-- حذف الوظيفة أولاً إذا كانت موجودة
DROP FUNCTION IF EXISTS update_all_user_profiles();

-- إعادة إنشاء الوظيفة
CREATE FUNCTION update_all_user_profiles()
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record auth.users;
  profile_record profiles;
BEGIN
  -- مرور على جميع المستخدمين في auth.users
  FOR user_record IN SELECT * FROM auth.users
  LOOP
    -- التحقق مما إذا كان المستخدم لديه ملف شخصي
    SELECT * INTO profile_record FROM profiles WHERE id = user_record.id;

    IF profile_record.id IS NULL THEN
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
        user_record.id,
        user_record.email,
        COALESCE(user_record.raw_user_meta_data->>'name', split_part(user_record.email, '@', 1)),
        COALESCE(user_record.raw_user_meta_data->>'avatar', 'https://ui-avatars.com/api/?name=' || COALESCE(user_record.raw_user_meta_data->>'name', split_part(user_record.email, '@', 1)) || '&background=random'),
        COALESCE(user_record.raw_user_meta_data->>'country_code', 'EG'),
        COALESCE(user_record.raw_user_meta_data->>'language', 'ar'),
        user_record.created_at,
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        avatar = EXCLUDED.avatar,
        country_code = EXCLUDED.country_code,
        language = EXCLUDED.language,
        updated_at = NOW()
      RETURNING * INTO profile_record;
    ELSE
      -- تحديث الملف الشخصي الموجود
      UPDATE profiles SET
        name = COALESCE(user_record.raw_user_meta_data->>'name', profiles.name, split_part(user_record.email, '@', 1)),
        country_code = COALESCE(user_record.raw_user_meta_data->>'country_code', profiles.country_code, 'EG'),
        language = COALESCE(user_record.raw_user_meta_data->>'language', profiles.language, 'ar'),
        updated_at = NOW()
      WHERE id = user_record.id
      RETURNING * INTO profile_record;
    END IF;

    -- تحديث البيانات الوصفية للمستخدم
    UPDATE auth.users SET
      raw_user_meta_data = jsonb_build_object(
        'name', profile_record.name,
        'avatar', profile_record.avatar,
        'country_code', profile_record.country_code,
        'language', profile_record.language,
        'phone', profile_record.phone,
        'bio', profile_record.bio,
        'website', profile_record.website,
        'gender', profile_record.gender,
        'birth_date', profile_record.birth_date,
        'profession', profile_record.profession
      )
    WHERE id = user_record.id;

    RETURN NEXT profile_record;
  END LOOP;

  RETURN;
END;
$$;

-- 7. تنفيذ وظيفة تحديث جميع المستخدمين
SELECT * FROM update_all_user_profiles();

-- 8. التحقق من النتائج
SELECT id, email, name, country_code, language, updated_at FROM profiles LIMIT 10;
