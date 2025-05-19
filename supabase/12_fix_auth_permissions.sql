-- منح صلاحيات للمستخدمين المصادق عليهم للوصول إلى جدول profiles
GRANT SELECT, INSERT, UPDATE ON TABLE profiles TO authenticated;
GRANT USAGE ON SEQUENCE profiles_id_seq TO authenticated;

-- منح صلاحيات للمستخدمين غير المصادق عليهم للوصول إلى جدول profiles (للتسجيل)
GRANT SELECT, INSERT ON TABLE profiles TO anon;
GRANT USAGE ON SEQUENCE profiles_id_seq TO anon;

-- منح صلاحيات للخدمة للوصول إلى جدول profiles
GRANT ALL ON TABLE profiles TO service_role;
GRANT USAGE ON SEQUENCE profiles_id_seq TO service_role;

-- تعديل سياسات الأمان لجدول profiles للسماح بالتسجيل
DROP POLICY IF EXISTS profiles_insert_anon_policy ON profiles;
CREATE POLICY profiles_insert_anon_policy ON profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);
