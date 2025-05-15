-- إعادة إنشاء جدول profiles من الصفر

-- حذف الجدول إذا كان موجودًا
DROP TABLE IF EXISTS profiles CASCADE;

-- إنشاء الجدول من جديد
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء دالة لتحديث وقت التعديل
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء محفز لتحديث وقت التعديل
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_profiles_updated_at();

-- تعطيل RLS على جدول profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

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

-- إنشاء سياسات أمان بسيطة على جدول profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسة للسماح بقراءة جميع السجلات
CREATE POLICY profiles_select_policy ON profiles
  FOR SELECT
  USING (true);

-- إنشاء سياسة للسماح بإدراج سجلات جديدة للمستخدمين المصادق عليهم وغير المصادق عليهم
CREATE POLICY profiles_insert_policy ON profiles
  FOR INSERT
  WITH CHECK (true);

-- إنشاء سياسة للسماح بتحديث سجلات المستخدم الخاصة به فقط
CREATE POLICY profiles_update_policy ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- إنشاء سياسة للسماح بحذف سجلات المستخدم الخاصة به فقط
CREATE POLICY profiles_delete_policy ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- إنشاء دالة لإنشاء سجل في جدول profiles عند إنشاء مستخدم جديد
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'https://ui-avatars.com/api/?name=' || split_part(NEW.email, '@', 1) || '&background=random'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- حذف المحفز إذا كان موجودًا
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- إنشاء محفز لإنشاء سجل في جدول profiles عند إنشاء مستخدم جديد
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
