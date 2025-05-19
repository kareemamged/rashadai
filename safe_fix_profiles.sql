-- إنشاء وظيفة RPC آمنة للحصول على ملف شخصي محدد بواسطة معرف المستخدم
-- هذه الوظيفة تستخدم SECURITY DEFINER لتجاوز سياسات أمان الصفوف
CREATE OR REPLACE FUNCTION get_profile_by_id_safe(user_id UUID)
RETURNS SETOF profiles
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM profiles WHERE id = user_id;
$$;

-- إنشاء وظيفة RPC آمنة لتحديث الملف الشخصي بتجاوز سياسات أمان الصفوف
CREATE OR REPLACE FUNCTION update_profile_safe(
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
