-- هذا الملف يصحح مشكلة التكرار اللانهائي في جدول admin_users

-- تعطيل RLS على جدول admin_users
ALTER TABLE IF EXISTS admin_users DISABLE ROW LEVEL SECURITY;

-- حذف جميع سياسات الأمان على جدول admin_users
DROP POLICY IF EXISTS admin_users_select_policy ON admin_users;
DROP POLICY IF EXISTS admin_users_insert_policy ON admin_users;
DROP POLICY IF EXISTS admin_users_update_policy ON admin_users;
DROP POLICY IF EXISTS admin_users_delete_policy ON admin_users;
DROP POLICY IF EXISTS admin_users_select_anon_policy ON admin_users;
DROP POLICY IF EXISTS admin_users_insert_anon_policy ON admin_users;
DROP POLICY IF EXISTS admin_users_update_anon_policy ON admin_users;
DROP POLICY IF EXISTS admin_users_delete_anon_policy ON admin_users;
DROP POLICY IF EXISTS admin_users_select_auth_policy ON admin_users;
DROP POLICY IF EXISTS admin_users_insert_auth_policy ON admin_users;
DROP POLICY IF EXISTS admin_users_update_auth_policy ON admin_users;
DROP POLICY IF EXISTS admin_users_delete_auth_policy ON admin_users;

-- إعادة ضبط الصلاحيات على جدول admin_users
GRANT ALL ON TABLE admin_users TO postgres, service_role;
GRANT SELECT ON TABLE admin_users TO authenticated;
GRANT SELECT ON TABLE admin_users TO anon;

-- تعطيل RLS على جدول profiles
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;

-- حذف جميع سياسات الأمان على جدول profiles
DROP POLICY IF EXISTS profiles_select_policy ON profiles;
DROP POLICY IF EXISTS profiles_insert_policy ON profiles;
DROP POLICY IF EXISTS profiles_update_policy ON profiles;
DROP POLICY IF EXISTS profiles_delete_policy ON profiles;
DROP POLICY IF EXISTS profiles_select_anon_policy ON profiles;
DROP POLICY IF EXISTS profiles_insert_anon_policy ON profiles;
DROP POLICY IF EXISTS profiles_update_anon_policy ON profiles;
DROP POLICY IF EXISTS profiles_delete_anon_policy ON profiles;
DROP POLICY IF EXISTS profiles_select_auth_policy ON profiles;
DROP POLICY IF EXISTS profiles_insert_auth_policy ON profiles;
DROP POLICY IF EXISTS profiles_update_auth_policy ON profiles;
DROP POLICY IF EXISTS profiles_delete_auth_policy ON profiles;

-- إعادة ضبط الصلاحيات على جدول profiles
GRANT ALL ON TABLE profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE profiles TO authenticated;
GRANT SELECT, INSERT ON TABLE profiles TO anon;

-- إصلاح مشكلة التكرار اللانهائي في جدول admin_users
DO $$
DECLARE
  policy_exists BOOLEAN;
BEGIN
  -- التحقق من وجود سياسات أمان تسبب التكرار اللانهائي
  SELECT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'admin_users'
    AND policyname LIKE '%recursive%'
  ) INTO policy_exists;
  
  IF policy_exists THEN
    RAISE NOTICE 'تم العثور على سياسات أمان تسبب التكرار اللانهائي، جاري حذفها...';
    
    -- حذف جميع سياسات الأمان على جدول admin_users
    DROP POLICY IF EXISTS admin_users_select_policy ON admin_users;
    DROP POLICY IF EXISTS admin_users_insert_policy ON admin_users;
    DROP POLICY IF EXISTS admin_users_update_policy ON admin_users;
    DROP POLICY IF EXISTS admin_users_delete_policy ON admin_users;
    DROP POLICY IF EXISTS admin_users_select_anon_policy ON admin_users;
    DROP POLICY IF EXISTS admin_users_insert_anon_policy ON admin_users;
    DROP POLICY IF EXISTS admin_users_update_anon_policy ON admin_users;
    DROP POLICY IF EXISTS admin_users_delete_anon_policy ON admin_users;
    DROP POLICY IF EXISTS admin_users_select_auth_policy ON admin_users;
    DROP POLICY IF EXISTS admin_users_insert_auth_policy ON admin_users;
    DROP POLICY IF EXISTS admin_users_update_auth_policy ON admin_users;
    DROP POLICY IF EXISTS admin_users_delete_auth_policy ON admin_users;
  ELSE
    RAISE NOTICE 'لم يتم العثور على سياسات أمان تسبب التكرار اللانهائي';
  END IF;
END
$$;

-- إنشاء سياسات أمان بسيطة على جدول admin_users
DO $$
BEGIN
  -- تمكين RLS على جدول admin_users
  ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
  
  -- إنشاء سياسة للسماح بقراءة جميع السجلات
  CREATE POLICY admin_users_select_policy ON admin_users
    FOR SELECT
    USING (true);
  
  RAISE NOTICE 'تم إنشاء سياسات أمان بسيطة على جدول admin_users';
END
$$;

-- إنشاء سياسات أمان بسيطة على جدول profiles
DO $$
BEGIN
  -- تمكين RLS على جدول profiles
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  
  -- إنشاء سياسة للسماح بقراءة جميع السجلات
  CREATE POLICY profiles_select_policy ON profiles
    FOR SELECT
    USING (true);
  
  -- إنشاء سياسة للسماح بإدراج سجلات جديدة للمستخدمين المصادق عليهم وغير المصادق عليهم
  CREATE POLICY profiles_insert_policy ON profiles
    FOR INSERT
    WITH CHECK (true);
  
  RAISE NOTICE 'تم إنشاء سياسات أمان بسيطة على جدول profiles';
END
$$;
