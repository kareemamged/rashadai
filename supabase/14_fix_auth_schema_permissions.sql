-- منح صلاحيات للوصول إلى مخطط auth
GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;

-- منح صلاحيات للوصول إلى جدول auth.users
GRANT SELECT ON TABLE auth.users TO anon;
GRANT SELECT ON TABLE auth.users TO authenticated;
GRANT SELECT ON TABLE auth.users TO service_role;

-- تعديل سياسات الأمان لجدول profiles للسماح بالقراءة العامة
DROP POLICY IF EXISTS profiles_select_public_policy ON profiles;
CREATE POLICY profiles_select_public_policy ON profiles
  FOR SELECT
  USING (true);
