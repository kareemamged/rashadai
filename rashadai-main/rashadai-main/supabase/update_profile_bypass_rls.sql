-- وظيفة لتحديث البروفايل مع تجاوز سياسات RLS
-- هذه الوظيفة تسمح بتحديث بيانات البروفايل حتى عندما تكون جلسة المصادقة غير متوفرة

-- إنشاء الوظيفة
CREATE OR REPLACE FUNCTION update_profile_bypass_rls(
  p_user_id UUID,
  p_profile_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- تشغيل الوظيفة بصلاحيات المالك (تجاوز RLS)
AS $$
DECLARE
  v_result JSONB;
  v_exists BOOLEAN;
  v_updated_at TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  -- التحقق من وجود المستخدم في جدول profiles
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = p_user_id
  ) INTO v_exists;

  -- إذا كان المستخدم موجود، قم بتحديث البيانات
  IF v_exists THEN
    -- تحديث البيانات
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
      birth_date = COALESCE(p_profile_data->>'birth_date', birth_date),
      profession = COALESCE(p_profile_data->>'profession', profession),
      updated_at = v_updated_at
    WHERE id = p_user_id
    RETURNING to_jsonb(profiles.*) INTO v_result;
  ELSE
    -- إذا لم يكن المستخدم موجود، قم بإنشاء سجل جديد
    INSERT INTO profiles (
      id,
      email,
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
    )
    VALUES (
      p_user_id,
      p_profile_data->>'email',
      p_profile_data->>'name',
      p_profile_data->>'avatar',
      COALESCE(p_profile_data->>'country_code', 'EG'),
      p_profile_data->>'phone',
      p_profile_data->>'bio',
      COALESCE(p_profile_data->>'language', 'ar'),
      p_profile_data->>'website',
      p_profile_data->>'gender',
      p_profile_data->>'birth_date',
      p_profile_data->>'profession',
      COALESCE(p_profile_data->>'created_at', NOW()),
      v_updated_at
    )
    RETURNING to_jsonb(profiles.*) INTO v_result;
  END IF;

  -- إرجاع البيانات المحدثة
  RETURN v_result;
END;
$$;

-- منح الصلاحيات للوظيفة
GRANT EXECUTE ON FUNCTION update_profile_bypass_rls TO authenticated, anon, service_role;

-- اختبار الوظيفة
COMMENT ON FUNCTION update_profile_bypass_rls IS 'وظيفة لتحديث بيانات البروفايل مع تجاوز سياسات RLS. تستخدم عندما تكون جلسة المصادقة غير متوفرة.';
