-- وظيفة لتحديث البروفايل مع تجاوز سياسات RLS (نسخة مصححة)
-- هذه الوظيفة تسمح بتحديث بيانات البروفايل حتى عندما تكون جلسة المصادقة غير متوفرة
-- تم تصحيح مشكلة تعارض أنواع البيانات في COALESCE

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
  -- التحقق من وجود المستخدم في profiles
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = p_user_id
  ) INTO v_exists;

  IF v_exists THEN
    -- تحديث السجل الموجود
    UPDATE profiles
    SET
      name = COALESCE(p_profile_data->>'name', name),
      country_code = COALESCE(p_profile_data->>'country_code', country_code),
      language = COALESCE(p_profile_data->>'language', language),
      phone = COALESCE(p_profile_data->>'phone', phone),
      bio = COALESCE(p_profile_data->>'bio', bio),
      website = COALESCE(p_profile_data->>'website', website),
      gender = COALESCE(p_profile_data->>'gender', gender),
      profession = COALESCE(p_profile_data->>'profession', profession),
      avatar = COALESCE(p_profile_data->>'avatar', avatar),
      updated_at = v_updated_at
    WHERE id = p_user_id
    RETURNING to_jsonb(profiles.*) INTO v_result;
  ELSE
    -- إنشاء سجل جديد
    INSERT INTO profiles (
      id,
      email,
      name,
      country_code,
      language,
      phone,
      bio,
      website,
      gender,
      profession,
      avatar,
      created_at,
      updated_at
    )
    VALUES (
      p_user_id,
      p_profile_data->>'email',
      p_profile_data->>'name',
      COALESCE(p_profile_data->>'country_code', 'EG'),
      COALESCE(p_profile_data->>'language', 'ar'),
      p_profile_data->>'phone',
      p_profile_data->>'bio',
      p_profile_data->>'website',
      p_profile_data->>'gender',
      p_profile_data->>'profession',
      p_profile_data->>'avatar',
      v_updated_at,
      v_updated_at
    )
    RETURNING to_jsonb(profiles.*) INTO v_result;
  END IF;

  RETURN v_result;
END;
$$;

-- منح الصلاحيات للوظيفة
GRANT EXECUTE ON FUNCTION update_profile_bypass_rls TO authenticated, anon, service_role;

-- اختبار الوظيفة
COMMENT ON FUNCTION update_profile_bypass_rls IS 'وظيفة لتحديث بيانات البروفايل مع تجاوز سياسات RLS. تستخدم عندما تكون جلسة المصادقة غير متوفرة.';
