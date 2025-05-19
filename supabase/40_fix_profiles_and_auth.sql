-- إصلاح شامل لمشاكل جدول profiles وتسجيل الدخول
-- هذا الملف يقوم بإصلاح جميع المشاكل المتعلقة بجدول profiles وتسجيل الدخول

-- 1. إعادة إنشاء جدول profiles بشكل صحيح
DO $$
BEGIN
  -- حذف المحفزات المرتبطة بجدول profiles أولاً لتجنب الأخطاء
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  DROP TRIGGER IF EXISTS create_profile_after_signup ON auth.users;
  DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

  -- حذف الدوال المرتبطة بالمحفزات
  DROP FUNCTION IF EXISTS public.handle_new_user();
  DROP FUNCTION IF EXISTS public.create_profile_for_user();
  DROP FUNCTION IF EXISTS public.update_profiles_updated_at_column();

  -- حذف جدول profiles إذا كان موجوداً
  DROP TABLE IF EXISTS profiles CASCADE;

  -- إنشاء جدول profiles من جديد
  CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    avatar TEXT,
    country_code TEXT DEFAULT 'SA',
    phone TEXT,
    bio TEXT,
    language TEXT DEFAULT 'ar',
    website TEXT,
    gender TEXT,
    birth_date TEXT,
    profession TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  RAISE NOTICE 'تم إعادة إنشاء جدول profiles بنجاح';
END
$$;

-- 2. إنشاء سياسات الأمان (RLS) لجدول profiles
DO $$
BEGIN
  -- تمكين سياسات الأمان على جدول profiles
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

  -- حذف السياسات الموجودة
  DROP POLICY IF EXISTS profiles_select_policy ON profiles;
  DROP POLICY IF EXISTS profiles_insert_policy ON profiles;
  DROP POLICY IF EXISTS profiles_update_policy ON profiles;
  DROP POLICY IF EXISTS profiles_delete_policy ON profiles;

  -- إنشاء سياسات جديدة
  -- سياسة القراءة: يمكن للمستخدم قراءة ملفه الشخصي فقط
  CREATE POLICY profiles_select_policy ON profiles
    FOR SELECT USING (
      auth.uid() = id OR
      EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
    );

  -- سياسة الإدراج: يمكن للمستخدم إدراج ملفه الشخصي فقط
  CREATE POLICY profiles_insert_policy ON profiles
    FOR INSERT WITH CHECK (
      auth.uid() = id OR
      EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
    );

  -- سياسة التحديث: يمكن للمستخدم تحديث ملفه الشخصي فقط
  CREATE POLICY profiles_update_policy ON profiles
    FOR UPDATE USING (
      auth.uid() = id OR
      EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
    );

  -- سياسة الحذف: يمكن للمستخدم حذف ملفه الشخصي فقط
  CREATE POLICY profiles_delete_policy ON profiles
    FOR DELETE USING (
      auth.uid() = id OR
      EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
    );

  RAISE NOTICE 'تم إنشاء سياسات الأمان لجدول profiles بنجاح';
END
$$;

-- 3. إنشاء دالة لتحديث حقل updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_profiles_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء محفز لتحديث حقل updated_at تلقائياً
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_profiles_updated_at_column();

-- 4. إنشاء دالة لإنشاء سجل في جدول profiles عند إنشاء مستخدم جديد
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  profile_exists BOOLEAN;
BEGIN
  -- التحقق مما إذا كان هناك سجل موجود بالفعل
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = NEW.id
  ) INTO profile_exists;

  -- إذا لم يكن هناك سجل موجود، قم بإنشاء واحد
  IF NOT profile_exists THEN
    BEGIN
      INSERT INTO public.profiles (id, name, avatar, country_code, language, created_at, updated_at)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar', 'https://ui-avatars.com/api/?name=' || split_part(NEW.email, '@', 1) || '&background=random'),
        COALESCE(NEW.raw_user_meta_data->>'country_code', 'SA'),
        COALESCE(NEW.raw_user_meta_data->>'language', 'ar'),
        NOW(),
        NOW()
      );
      RAISE NOTICE 'تم إنشاء سجل في جدول profiles للمستخدم: %', NEW.email;
    EXCEPTION WHEN OTHERS THEN
      -- تجاهل أي أخطاء قد تحدث أثناء الإدراج
      RAISE NOTICE 'خطأ في إنشاء سجل للمستخدم %: %', NEW.id, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء محفز لإنشاء سجل في جدول profiles عند إنشاء مستخدم جديد
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 5. إنشاء سجلات في جدول profiles للمستخدمين الموجودين
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN
    SELECT u.id, u.email, u.raw_user_meta_data, u.created_at
    FROM auth.users u
    LEFT JOIN profiles p ON u.id = p.id
    WHERE p.id IS NULL
  LOOP
    BEGIN
      INSERT INTO profiles (id, name, avatar, country_code, language, created_at, updated_at)
      VALUES (
        user_record.id,
        COALESCE(user_record.raw_user_meta_data->>'name', split_part(user_record.email, '@', 1)),
        COALESCE(user_record.raw_user_meta_data->>'avatar', 'https://ui-avatars.com/api/?name=' || split_part(user_record.email, '@', 1) || '&background=random'),
        COALESCE(user_record.raw_user_meta_data->>'country_code', 'SA'),
        COALESCE(user_record.raw_user_meta_data->>'language', 'ar'),
        user_record.created_at,
        NOW()
      );
      RAISE NOTICE 'تم إنشاء سجل في جدول profiles للمستخدم الموجود: %', user_record.email;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'خطأ في إنشاء سجل للمستخدم الموجود %: %', user_record.id, SQLERRM;
    END;
  END LOOP;
END
$$;

-- 6. إصلاح مشكلة الصلاحيات على جدول auth.users
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

  RAISE NOTICE 'تم إصلاح مشكلة الصلاحيات على جدول auth.users بنجاح';
END
$$;

-- 7. منح صلاحيات إضافية للأدوار المختلفة
GRANT ALL ON TABLE profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE profiles TO authenticated;
GRANT SELECT ON TABLE profiles TO anon;

-- تم إصلاح جميع المشاكل المتعلقة بجدول profiles وتسجيل الدخول بنجاح
