-- إصلاح مشاكل تسجيل الدخول في Supabase
-- هذا الملف يقوم بإصلاح مشاكل تسجيل الدخول عن طريق:
-- 1. التحقق من وجود جدول profiles وإنشائه إذا لم يكن موجودًا
-- 2. إضافة سياسات الأمان (RLS) المناسبة
-- 3. إنشاء محفز لإنشاء سجل في جدول profiles عند إنشاء مستخدم جديد
-- 4. إنشاء سجلات في جدول profiles للمستخدمين الموجودين

-- التحقق من وجود جدول profiles وإنشائه إذا لم يكن موجودًا
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    CREATE TABLE profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      name TEXT,
      email TEXT,
      avatar TEXT,
      role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      country_code TEXT,
      language TEXT DEFAULT 'ar',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    RAISE NOTICE 'Created profiles table';
  ELSE
    RAISE NOTICE 'Profiles table already exists';
  END IF;
END
$$;

-- تمكين سياسات الأمان (RLS) على جدول profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- حذف سياسات الأمان الموجودة (إذا كانت موجودة) لتجنب الأخطاء
DO $$
BEGIN
  -- حذف سياسة profiles_select_self_policy إذا كانت موجودة
  IF EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'profiles_select_self_policy'
  ) THEN
    DROP POLICY profiles_select_self_policy ON profiles;
    RAISE NOTICE 'Dropped policy profiles_select_self_policy';
  END IF;
  
  -- حذف سياسة profiles_select_admin_policy إذا كانت موجودة
  IF EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'profiles_select_admin_policy'
  ) THEN
    DROP POLICY profiles_select_admin_policy ON profiles;
    RAISE NOTICE 'Dropped policy profiles_select_admin_policy';
  END IF;
  
  -- حذف سياسة profiles_update_self_policy إذا كانت موجودة
  IF EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'profiles_update_self_policy'
  ) THEN
    DROP POLICY profiles_update_self_policy ON profiles;
    RAISE NOTICE 'Dropped policy profiles_update_self_policy';
  END IF;
  
  -- حذف سياسة profiles_update_admin_policy إذا كانت موجودة
  IF EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'profiles_update_admin_policy'
  ) THEN
    DROP POLICY profiles_update_admin_policy ON profiles;
    RAISE NOTICE 'Dropped policy profiles_update_admin_policy';
  END IF;
  
  -- حذف سياسة profiles_insert_admin_policy إذا كانت موجودة
  IF EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'profiles_insert_admin_policy'
  ) THEN
    DROP POLICY profiles_insert_admin_policy ON profiles;
    RAISE NOTICE 'Dropped policy profiles_insert_admin_policy';
  END IF;
END
$$;

-- إنشاء سياسة للسماح للمستخدمين بقراءة ملفاتهم الشخصية
CREATE POLICY profiles_select_policy ON profiles
  FOR SELECT USING (true);  -- السماح للجميع بقراءة جميع الملفات الشخصية

-- إنشاء سياسة للسماح للمستخدمين بتحديث ملفاتهم الشخصية
CREATE POLICY profiles_update_policy ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- إنشاء سياسة للسماح للمستخدمين بإدراج ملفاتهم الشخصية
CREATE POLICY profiles_insert_policy ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- إنشاء دالة لتحديث عمود updated_at
DO $$
BEGIN
  -- حذف المحفز إذا كان موجودًا
  IF EXISTS (
    SELECT FROM pg_trigger 
    WHERE tgname = 'update_profiles_updated_at'
  ) THEN
    DROP TRIGGER update_profiles_updated_at ON profiles;
    RAISE NOTICE 'Dropped trigger update_profiles_updated_at';
  END IF;
  
  -- حذف الدالة إذا كانت موجودة
  IF EXISTS (
    SELECT FROM pg_proc 
    WHERE proname = 'update_profiles_updated_at_column'
  ) THEN
    DROP FUNCTION update_profiles_updated_at_column();
    RAISE NOTICE 'Dropped function update_profiles_updated_at_column';
  END IF;
  
  -- إنشاء الدالة
  CREATE OR REPLACE FUNCTION update_profiles_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  
  -- إنشاء المحفز
  CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_profiles_updated_at_column();
  
  RAISE NOTICE 'Created trigger update_profiles_updated_at';
END
$$;

-- إنشاء دالة لإنشاء سجل في جدول profiles عند إنشاء مستخدم جديد
DO $$
BEGIN
  -- حذف المحفز إذا كان موجودًا
  IF EXISTS (
    SELECT FROM pg_trigger 
    WHERE tgname = 'create_profile_after_signup'
  ) THEN
    DROP TRIGGER create_profile_after_signup ON auth.users;
    RAISE NOTICE 'Dropped trigger create_profile_after_signup';
  END IF;
  
  -- حذف الدالة إذا كانت موجودة
  IF EXISTS (
    SELECT FROM pg_proc 
    WHERE proname = 'create_profile_for_user'
  ) THEN
    DROP FUNCTION create_profile_for_user();
    RAISE NOTICE 'Dropped function create_profile_for_user';
  END IF;
  
  -- إنشاء الدالة
  CREATE OR REPLACE FUNCTION create_profile_for_user()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO profiles (id, name, email, avatar, role, country_code, language)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'avatar', 'https://ui-avatars.com/api/?name=' || split_part(NEW.email, '@', 1) || '&background=random'),
      CASE 
        WHEN NEW.email IN ('kemoamego@gmail.com', 'kemoamego@icloud.com') THEN 'admin'
        ELSE 'user'
      END,
      COALESCE(NEW.raw_user_meta_data->>'country_code', 'US'),
      COALESCE(NEW.raw_user_meta_data->>'language', 'ar')
    )
    ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        email = EXCLUDED.email,
        avatar = EXCLUDED.avatar,
        role = EXCLUDED.role,
        country_code = EXCLUDED.country_code,
        language = EXCLUDED.language,
        updated_at = NOW();
    
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  
  -- إنشاء المحفز
  CREATE TRIGGER create_profile_after_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE PROCEDURE create_profile_for_user();
  
  RAISE NOTICE 'Created trigger create_profile_after_signup';
END
$$;

-- إنشاء سجلات في جدول profiles للمستخدمين الموجودين
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT * FROM auth.users
  LOOP
    INSERT INTO profiles (id, name, email, avatar, role, country_code, language)
    VALUES (
      user_record.id,
      COALESCE(user_record.raw_user_meta_data->>'name', split_part(user_record.email, '@', 1)),
      user_record.email,
      COALESCE(user_record.raw_user_meta_data->>'avatar', 'https://ui-avatars.com/api/?name=' || split_part(user_record.email, '@', 1) || '&background=random'),
      CASE 
        WHEN user_record.email IN ('kemoamego@gmail.com', 'kemoamego@icloud.com') THEN 'admin'
        ELSE 'user'
      END,
      COALESCE(user_record.raw_user_meta_data->>'country_code', 'US'),
      COALESCE(user_record.raw_user_meta_data->>'language', 'ar')
    )
    ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        email = EXCLUDED.email,
        avatar = EXCLUDED.avatar,
        role = EXCLUDED.role,
        country_code = EXCLUDED.country_code,
        language = EXCLUDED.language,
        updated_at = NOW();
  END LOOP;
  
  RAISE NOTICE 'Created or updated profiles for all existing users';
END
$$;
