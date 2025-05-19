-- إنشاء وظيفة للحصول على جميع المستخدمين من جدول profiles
CREATE OR REPLACE FUNCTION get_all_profiles()
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM profiles;
END;
$$;

-- منح صلاحيات تنفيذ الوظيفة للمستخدمين المصادق عليهم وغير المصادق عليهم
GRANT EXECUTE ON FUNCTION get_all_profiles() TO authenticated, anon;

-- إنشاء وظيفة للحصول على مستخدم محدد من جدول profiles
CREATE OR REPLACE FUNCTION get_profile_by_id(user_id UUID)
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM profiles WHERE id = user_id;
END;
$$;

-- منح صلاحيات تنفيذ الوظيفة للمستخدمين المصادق عليهم وغير المصادق عليهم
GRANT EXECUTE ON FUNCTION get_profile_by_id(UUID) TO authenticated, anon;

-- إنشاء وظيفة للحصول على المستخدمين حسب الدور
CREATE OR REPLACE FUNCTION get_profiles_by_role(role_param TEXT)
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM profiles WHERE role = role_param;
END;
$$;

-- منح صلاحيات تنفيذ الوظيفة للمستخدمين المصادق عليهم وغير المصادق عليهم
GRANT EXECUTE ON FUNCTION get_profiles_by_role(TEXT) TO authenticated, anon;
