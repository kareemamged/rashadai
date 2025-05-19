-- هذا الملف يصحح مشكلة الـ Trigger الذي ينشئ سجل في جدول profiles عند إنشاء مستخدم جديد

-- التحقق من وجود الـ Trigger
DO $$
DECLARE
  trigger_exists BOOLEAN;
BEGIN
  -- التحقق من وجود الـ Trigger
  SELECT EXISTS (
    SELECT FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
  ) INTO trigger_exists;

  -- إذا كان الـ Trigger موجود، نقوم بحذفه وإعادة إنشائه
  IF trigger_exists THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    RAISE NOTICE 'تم حذف الـ Trigger on_auth_user_created';
  END IF;
END
$$;

-- إنشاء الـ Function الذي سيتم استدعاؤه من الـ Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- إنشاء سجل جديد في جدول profiles للمستخدم الجديد
  INSERT INTO public.profiles (id, email, name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.created_at,
    NEW.created_at
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'خطأ في إنشاء سجل في جدول profiles: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء الـ Trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- التأكد من أن جدول profiles موجود وله الأعمدة المطلوبة
DO $$
BEGIN
  -- التأكد من وجود جدول profiles
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    -- إنشاء جدول profiles إذا لم يكن موجودًا
    CREATE TABLE profiles (
      id UUID PRIMARY KEY,
      email TEXT,
      name TEXT,
      role TEXT DEFAULT 'user',
      avatar_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- إضافة قيد المفتاح الأجنبي
    ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  ELSE
    -- التأكد من وجود جميع الأعمدة المطلوبة
    BEGIN
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error adding columns: %', SQLERRM;
    END;
  END IF;
END
$$;

-- منح الصلاحيات المناسبة
GRANT ALL ON TABLE profiles TO postgres;
GRANT ALL ON TABLE profiles TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE profiles TO authenticated;
GRANT SELECT, INSERT ON TABLE profiles TO anon;

-- تمكين RLS على جدول profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات الأمان
-- سياسة للسماح للمستخدمين المصادق عليهم بقراءة جميع الملفات الشخصية
DROP POLICY IF EXISTS profiles_select_policy ON profiles;
CREATE POLICY profiles_select_policy ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- سياسة للسماح للمستخدمين المصادق عليهم بتحديث ملفاتهم الشخصية فقط
DROP POLICY IF EXISTS profiles_update_policy ON profiles;
CREATE POLICY profiles_update_policy ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- سياسة للسماح للمستخدمين غير المصادق عليهم بإدراج ملف شخصي جديد (للتسجيل)
DROP POLICY IF EXISTS profiles_insert_anon_policy ON profiles;
CREATE POLICY profiles_insert_anon_policy ON profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- سياسة للسماح للمستخدمين المصادق عليهم بإدراج ملف شخصي جديد
DROP POLICY IF EXISTS profiles_insert_auth_policy ON profiles;
CREATE POLICY profiles_insert_auth_policy ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
