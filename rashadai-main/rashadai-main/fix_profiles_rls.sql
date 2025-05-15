-- 0. حذف الوظائف الموجودة أولاً لتجنب أخطاء تغيير نوع الإرجاع
DROP FUNCTION IF EXISTS update_profile_safe(UUID, JSONB);
DROP FUNCTION IF EXISTS get_profile_safe(UUID);
DROP FUNCTION IF EXISTS update_profile_direct(UUID, JSONB);
DROP FUNCTION IF EXISTS update_profile_direct_v2(UUID, JSONB);
DROP FUNCTION IF EXISTS update_profile_bypass_rls(UUID, JSONB);

-- 1. حذف جميع سياسات أمان الصفوف الحالية لجدول profiles
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- حذف جميع السياسات الموجودة على جدول profiles
    FOR policy_record IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', policy_record.policyname);
        RAISE NOTICE 'تم حذف السياسة: %', policy_record.policyname;
    END LOOP;
END
$$;

-- تعطيل سياسات أمان الصفوف مؤقتًا لجدول profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- إعادة تمكين سياسات أمان الصفوف لجدول profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات أمان الصفوف الجديدة لجدول profiles
-- سياسة للقراءة: يمكن للمستخدمين المصادق عليهم قراءة أي ملف شخصي
CREATE POLICY "profiles_select_auth_policy"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- سياسة للإدراج: يمكن للمستخدمين المصادق عليهم إدراج ملفهم الشخصي فقط
CREATE POLICY "profiles_insert_auth_policy"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- سياسة للتحديث: يمكن للمستخدمين المصادق عليهم تحديث ملفهم الشخصي فقط
CREATE POLICY "profiles_update_auth_policy"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- سياسة للحذف: يمكن للمستخدمين المصادق عليهم حذف ملفهم الشخصي فقط
CREATE POLICY "profiles_delete_auth_policy"
ON profiles FOR DELETE
TO authenticated
USING (id = auth.uid());

-- سياسة للقراءة: يمكن للمستخدمين غير المصادق عليهم قراءة أي ملف شخصي
CREATE POLICY "profiles_select_anon_policy"
ON profiles FOR SELECT
TO anon
USING (true);

-- إنشاء وظيفة RPC آمنة لتحديث الملف الشخصي بتجاوز سياسات أمان الصفوف
CREATE OR REPLACE FUNCTION update_profile_safe(
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
BEGIN
  -- تحديث الملف الشخصي
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

  -- إذا لم يتم العثور على الملف الشخصي، قم بإنشائه
  IF updated_profile IS NULL THEN
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

  RETURN QUERY SELECT * FROM profiles WHERE id = p_user_id;
END;
$$;

-- وظيفة للحصول على ملف شخصي محدد بواسطة معرف المستخدم
CREATE OR REPLACE FUNCTION get_profile_safe(user_id UUID)
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT * FROM profiles WHERE id = user_id;
END;
$$;

-- وظيفة للتحقق من وجود ملف شخصي
CREATE OR REPLACE FUNCTION check_profile_exists(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id) INTO profile_exists;
  RETURN profile_exists;
END;
$$;

-- منح صلاحيات تنفيذ الوظائف للمستخدمين المصادق عليهم وغير المصادق عليهم
GRANT EXECUTE ON FUNCTION update_profile_safe(UUID, JSONB) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_profile_safe(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION check_profile_exists(UUID) TO authenticated, anon;
