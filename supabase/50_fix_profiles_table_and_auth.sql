-- إعادة إنشاء جدول profiles وإصلاح سياسات الأمان

-- 1. حذف جدول profiles الحالي إذا كان موجودًا
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. إنشاء جدول profiles جديد
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar TEXT,
  country_code TEXT,
  phone TEXT,
  bio TEXT,
  language TEXT DEFAULT 'ar',
  website TEXT,
  gender TEXT,
  birth_date DATE,
  profession TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. إنشاء دالة لتحديث حقل updated_at تلقائيًا
CREATE OR REPLACE FUNCTION update_profiles_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. إنشاء محفز لتحديث حقل updated_at تلقائيًا
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_profiles_updated_at_column();

-- 5. إنشاء دالة لإنشاء سجل في جدول profiles عند إنشاء مستخدم جديد
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar, country_code, language, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'https://ui-avatars.com/api/?name=' || split_part(NEW.email, '@', 1) || '&background=random'),
    COALESCE(NEW.raw_user_meta_data->>'country_code', 'EG'), -- مصر كدولة افتراضية
    COALESCE(NEW.raw_user_meta_data->>'language', 'ar'),
    NEW.created_at,
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. إنشاء محفز لإنشاء سجل في جدول profiles عند إنشاء مستخدم جديد
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 7. إنشاء سياسات الأمان لجدول profiles
-- سياسة القراءة: يمكن للجميع قراءة جميع السجلات
DROP POLICY IF EXISTS profiles_select_policy ON profiles;
CREATE POLICY profiles_select_policy ON profiles
  FOR SELECT
  USING (true);

-- سياسة الإدراج: يمكن للمستخدمين المصادق عليهم إدراج سجلات خاصة بهم فقط
DROP POLICY IF EXISTS profiles_insert_policy ON profiles;
CREATE POLICY profiles_insert_policy ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- سياسة التحديث: يمكن للمستخدمين المصادق عليهم تحديث سجلاتهم الخاصة فقط
DROP POLICY IF EXISTS profiles_update_policy ON profiles;
CREATE POLICY profiles_update_policy ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- سياسة الحذف: يمكن للمستخدمين المصادق عليهم حذف سجلاتهم الخاصة فقط
DROP POLICY IF EXISTS profiles_delete_policy ON profiles;
CREATE POLICY profiles_delete_policy ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- 8. تمكين RLS على جدول profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 9. إنشاء سجلات في جدول profiles للمستخدمين الموجودين
INSERT INTO profiles (id, email, name, avatar, country_code, language, created_at, updated_at)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
  COALESCE(raw_user_meta_data->>'avatar', 'https://ui-avatars.com/api/?name=' || split_part(email, '@', 1) || '&background=random'),
  COALESCE(raw_user_meta_data->>'country_code', 'EG'), -- مصر كدولة افتراضية
  COALESCE(raw_user_meta_data->>'language', 'ar'),
  created_at,
  created_at
FROM
  auth.users
ON CONFLICT (id) DO NOTHING;

-- 10. إصلاح مشكلة الوصول إلى جدول auth.users
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

-- 11. إصلاح مشكلة الوصول إلى جدول storage.objects
-- سياسة القراءة: يمكن للجميع قراءة جميع الملفات
DROP POLICY IF EXISTS storage_objects_select_policy ON storage.objects;
CREATE POLICY storage_objects_select_policy ON storage.objects
  FOR SELECT
  USING (true);

-- سياسة الإدراج: يمكن للمستخدمين المصادق عليهم إدراج ملفات
DROP POLICY IF EXISTS storage_objects_insert_policy ON storage.objects;
CREATE POLICY storage_objects_insert_policy ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- سياسة التحديث: يمكن للمستخدمين المصادق عليهم تحديث الملفات التي قاموا بإنشائها
DROP POLICY IF EXISTS storage_objects_update_policy ON storage.objects;
CREATE POLICY storage_objects_update_policy ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (true);

-- سياسة الحذف: يمكن للمستخدمين المصادق عليهم حذف الملفات التي قاموا بإنشائها
DROP POLICY IF EXISTS storage_objects_delete_policy ON storage.objects;
CREATE POLICY storage_objects_delete_policy ON storage.objects
  FOR DELETE
  TO authenticated
  USING (true);

-- 12. إنشاء دلو avatars إذا لم يكن موجودًا
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 13. إصلاح مشكلة الوصول إلى جدول auth.users
GRANT ALL ON TABLE auth.users TO postgres, service_role;
GRANT SELECT ON TABLE auth.users TO authenticated;
GRANT SELECT ON TABLE auth.users TO anon;

-- 14. إصلاح مشكلة الوصول إلى جدول profiles
GRANT ALL ON TABLE profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE profiles TO authenticated;
GRANT SELECT ON TABLE profiles TO anon;

-- 15. إصلاح مشكلة الوصول إلى جدول storage.objects
GRANT ALL ON TABLE storage.objects TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE storage.objects TO authenticated;
GRANT SELECT ON TABLE storage.objects TO anon;
