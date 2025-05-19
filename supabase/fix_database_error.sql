-- إصلاح مشكلة "Database error granting user" في Supabase
-- يمكن تنفيذ هذا الملف في SQL Editor في Supabase Dashboard

-- 1. إصلاح سياسات RLS (Row Level Security) لجدول auth.users
BEGIN;

-- التحقق من وجود سياسات RLS على جدول auth.users
DO $$
DECLARE
  policy_count INT;
BEGIN
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'users' AND schemaname = 'auth';
  
  IF policy_count > 0 THEN
    RAISE NOTICE 'Found % RLS policies on auth.users table', policy_count;
  ELSE
    RAISE NOTICE 'No RLS policies found on auth.users table';
  END IF;
END $$;

-- إعادة ضبط الصلاحيات على جدول auth.users
GRANT USAGE ON SCHEMA auth TO postgres, service_role, anon, authenticated;
GRANT ALL ON auth.users TO postgres, service_role;
GRANT SELECT ON auth.users TO anon, authenticated;

-- 2. إصلاح سياسات RLS لجدول profiles
-- إزالة سياسات RLS الحالية
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by users who created them" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are editable by users who created them" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- إنشاء سياسات RLS جديدة
-- السماح للمستخدمين بعرض ملفاتهم الشخصية
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- السماح للمستخدمين بتحديث ملفاتهم الشخصية
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- السماح للمشرفين بعرض جميع الملفات الشخصية
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid()
  )
);

-- السماح للمشرفين بتحديث جميع الملفات الشخصية
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid()
  )
);

-- 3. إصلاح مشكلة الـ triggers
-- التحقق من وجود triggers على جدول auth.users
DO $$
DECLARE
  trigger_count INT;
BEGIN
  SELECT COUNT(*) INTO trigger_count FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass;
  
  IF trigger_count > 0 THEN
    RAISE NOTICE 'Found % triggers on auth.users table', trigger_count;
  ELSE
    RAISE NOTICE 'No triggers found on auth.users table';
  END IF;
END $$;

-- 4. إنشاء وظيفة لتسجيل الدخول بطريقة بديلة
CREATE OR REPLACE FUNCTION public.alternative_sign_in(
  p_email TEXT,
  p_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_password TEXT;
  v_confirmed TIMESTAMP WITH TIME ZONE;
  v_user_data JSONB;
  v_profile RECORD;
BEGIN
  -- البحث عن المستخدم في جدول auth.users
  SELECT id, encrypted_password, email_confirmed_at, raw_user_meta_data
  INTO v_user_id, v_password, v_confirmed, v_user_data
  FROM auth.users
  WHERE email = p_email;
  
  -- التحقق من وجود المستخدم
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'User not found'
    );
  END IF;
  
  -- التحقق من تأكيد البريد الإلكتروني
  IF v_confirmed IS NULL THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'Email not confirmed',
      'code', 'email_not_confirmed'
    );
  END IF;
  
  -- التحقق من صحة كلمة المرور
  IF NOT (v_password = crypt(p_password, v_password)) THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'Invalid login credentials'
    );
  END IF;
  
  -- الحصول على بيانات الملف الشخصي
  SELECT * INTO v_profile FROM public.profiles WHERE id = v_user_id;
  
  -- إنشاء النتيجة
  RETURN json_build_object(
    'success', TRUE,
    'user_id', v_user_id,
    'email', p_email,
    'profile', row_to_json(v_profile),
    'user_metadata', v_user_data
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', SQLERRM
    );
END;
$$;

COMMIT;
