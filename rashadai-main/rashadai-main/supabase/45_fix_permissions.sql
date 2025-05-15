-- إصلاح مشكلة الصلاحيات

-- 1. إصلاح مشكلة الصلاحيات على جدول auth.users
DO $$
BEGIN
  -- منح صلاحيات للمستخدمين المصادق عليهم وغير المصادق عليهم
  GRANT USAGE ON SCHEMA auth TO authenticated, anon;
  GRANT SELECT ON auth.users TO authenticated, anon;

  -- إعادة ضبط سياسات RLS على جدول auth.users
  ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

  -- حذف جميع سياسات الأمان على جدول auth.users
  DROP POLICY IF EXISTS users_select_policy ON auth.users;

  -- إنشاء سياسة للسماح بقراءة جميع السجلات
  CREATE POLICY users_select_policy ON auth.users
    FOR SELECT
    USING (true);

  -- تمكين RLS على جدول auth.users
  ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
END
$$;

-- 2. منح صلاحيات إضافية للأدوار المختلفة
GRANT ALL ON TABLE profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE profiles TO authenticated;
GRANT SELECT ON TABLE profiles TO anon;
