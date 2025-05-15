-- هذا الملف يصحح مشكلة التكرار اللانهائي في سياسات الأمان

-- تعطيل RLS على جميع الجداول مؤقتًا
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', r.tablename);
    RAISE NOTICE 'تم تعطيل RLS على جدول %', r.tablename;
  END LOOP;
END
$$;

-- حذف جميع سياسات الأمان على جدول admin_users
DO $$
BEGIN
  -- حذف جميع سياسات الأمان الموجودة على جدول admin_users
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
  
  RAISE NOTICE 'تم حذف جميع سياسات الأمان على جدول admin_users';
END
$$;

-- إعادة ضبط الصلاحيات على جدول admin_users
DO $$
BEGIN
  -- منح الصلاحيات المناسبة على جدول admin_users
  GRANT ALL ON TABLE admin_users TO postgres, service_role;
  GRANT SELECT ON TABLE admin_users TO authenticated;
  GRANT SELECT ON TABLE admin_users TO anon;
  
  RAISE NOTICE 'تم إعادة ضبط الصلاحيات على جدول admin_users';
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
  
  -- إنشاء سياسة للسماح بإدراج سجلات جديدة للمستخدمين المصادق عليهم
  CREATE POLICY admin_users_insert_policy ON admin_users
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
  
  -- إنشاء سياسة للسماح بتحديث السجلات للمستخدمين المصادق عليهم
  CREATE POLICY admin_users_update_policy ON admin_users
    FOR UPDATE
    TO authenticated
    USING (true);
  
  -- إنشاء سياسة للسماح بحذف السجلات للمستخدمين المصادق عليهم
  CREATE POLICY admin_users_delete_policy ON admin_users
    FOR DELETE
    TO authenticated
    USING (true);
  
  RAISE NOTICE 'تم إنشاء سياسات أمان بسيطة على جدول admin_users';
END
$$;

-- إعادة ضبط الصلاحيات على جدول profiles
DO $$
BEGIN
  -- منح الصلاحيات المناسبة على جدول profiles
  GRANT ALL ON TABLE profiles TO postgres, service_role;
  GRANT SELECT, INSERT, UPDATE ON TABLE profiles TO authenticated;
  GRANT SELECT, INSERT ON TABLE profiles TO anon;
  
  RAISE NOTICE 'تم إعادة ضبط الصلاحيات على جدول profiles';
END
$$;

-- حذف جميع سياسات الأمان على جدول profiles
DO $$
BEGIN
  -- حذف جميع سياسات الأمان الموجودة على جدول profiles
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
  
  RAISE NOTICE 'تم حذف جميع سياسات الأمان على جدول profiles';
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
  
  -- إنشاء سياسة للسماح بتحديث السجلات للمستخدمين المصادق عليهم
  CREATE POLICY profiles_update_policy ON profiles
    FOR UPDATE
    TO authenticated
    USING (true);
  
  -- إنشاء سياسة للسماح بحذف السجلات للمستخدمين المصادق عليهم
  CREATE POLICY profiles_delete_policy ON profiles
    FOR DELETE
    TO authenticated
    USING (true);
  
  RAISE NOTICE 'تم إنشاء سياسات أمان بسيطة على جدول profiles';
END
$$;
