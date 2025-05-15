-- إصلاح مشكلة الوصول إلى جدول auth.users

-- إنشاء وظيفة للوصول إلى جدول auth.users
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

-- إنشاء وظيفة للوصول إلى جدول auth.users بواسطة المعرف
CREATE OR REPLACE FUNCTION public.get_auth_user_by_id(user_id UUID)
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
GRANT EXECUTE ON FUNCTION public.get_auth_user_by_id TO authenticated, anon;
