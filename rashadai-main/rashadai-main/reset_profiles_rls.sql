-- تعطيل سياسات أمان الصفوف مؤقتًا لجدول profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- حذف جميع سياسات أمان الصفوف الحالية لجدول profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by users who created them" ON profiles;
DROP POLICY IF EXISTS "Profiles are editable by users who created them" ON profiles;
DROP POLICY IF EXISTS "Profiles can be created by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view any profile" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow anonymous users to view any profile" ON profiles;

-- إعادة تمكين سياسات أمان الصفوف لجدول profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات أمان الصفوف الجديدة لجدول profiles
-- سياسة للقراءة: يمكن لأي شخص قراءة أي ملف شخصي
CREATE POLICY "profiles_select_policy"
ON profiles FOR SELECT
USING (true);

-- سياسة للإدراج: يمكن للمستخدمين المصادق عليهم إدراج ملفهم الشخصي فقط
CREATE POLICY "profiles_insert_policy"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- سياسة للتحديث: يمكن للمستخدمين المصادق عليهم تحديث ملفهم الشخصي فقط
CREATE POLICY "profiles_update_policy"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- سياسة للحذف: يمكن للمستخدمين المصادق عليهم حذف ملفهم الشخصي فقط
CREATE POLICY "profiles_delete_policy"
ON profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- إنشاء وظيفة RPC للحصول على ملف شخصي محدد بواسطة معرف المستخدم
CREATE OR REPLACE FUNCTION get_profile_by_id(user_id UUID)
RETURNS SETOF profiles
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM profiles WHERE id = user_id;
$$;

-- إنشاء وظيفة RPC لتحديث الملف الشخصي
CREATE OR REPLACE FUNCTION update_profile_bypass_rls(
  p_user_id UUID,
  p_profile_data JSONB
)
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER
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
                  WHEN p_profile_data->>'birth_date' IS NULL OR p_profile_data->>'birth_date' = '' 
                  THEN birth_date 
                  ELSE (p_profile_data->>'birth_date')::text::date 
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
        ELSE (p_profile_data->>'birth_date')::text::date 
      END,
      p_profile_data->>'profession',
      NOW(),
      NOW()
    )
    RETURNING * INTO updated_profile;
  END IF;
  
  RETURN updated_profile;
END;
$$;
