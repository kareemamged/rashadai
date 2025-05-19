-- إصلاح جميع مشاكل تسجيل الدخول
-- هذا الملف يقوم بتنفيذ جميع الإصلاحات اللازمة لحل مشاكل تسجيل الدخول

-- 1. إنشاء جدول profiles إذا لم يكن موجودًا
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

-- 2. إنشاء جدول admin_users إذا لم يكن موجودًا
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_users') THEN
    CREATE TABLE admin_users (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT 'moderator',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_login TIMESTAMP WITH TIME ZONE,
      avatar TEXT
    );
    
    RAISE NOTICE 'Created admin_users table';
  ELSE
    RAISE NOTICE 'admin_users table already exists';
  END IF;
END
$$;

-- 3. تمكين سياسات الأمان (RLS) على الجداول
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 4. حذف سياسات الأمان الموجودة (إذا كانت موجودة) لتجنب الأخطاء
DO $$
BEGIN
  -- حذف سياسات جدول profiles
  IF EXISTS (SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_select_self_policy') THEN
    DROP POLICY profiles_select_self_policy ON profiles;
  END IF;
  
  IF EXISTS (SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_select_admin_policy') THEN
    DROP POLICY profiles_select_admin_policy ON profiles;
  END IF;
  
  IF EXISTS (SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_update_self_policy') THEN
    DROP POLICY profiles_update_self_policy ON profiles;
  END IF;
  
  IF EXISTS (SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_update_admin_policy') THEN
    DROP POLICY profiles_update_admin_policy ON profiles;
  END IF;
  
  IF EXISTS (SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_insert_admin_policy') THEN
    DROP POLICY profiles_insert_admin_policy ON profiles;
  END IF;
  
  IF EXISTS (SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_select_policy') THEN
    DROP POLICY profiles_select_policy ON profiles;
  END IF;
  
  IF EXISTS (SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_update_policy') THEN
    DROP POLICY profiles_update_policy ON profiles;
  END IF;
  
  IF EXISTS (SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_insert_policy') THEN
    DROP POLICY profiles_insert_policy ON profiles;
  END IF;
  
  -- حذف سياسات جدول admin_users
  IF EXISTS (SELECT FROM pg_policies WHERE tablename = 'admin_users' AND policyname = 'admin_users_select_policy') THEN
    DROP POLICY admin_users_select_policy ON admin_users;
  END IF;
  
  RAISE NOTICE 'Dropped existing policies';
END
$$;

-- 5. إنشاء سياسات الأمان الجديدة
-- سياسات جدول profiles
CREATE POLICY profiles_select_policy ON profiles
  FOR SELECT USING (true);  -- السماح للجميع بقراءة جميع الملفات الشخصية

CREATE POLICY profiles_update_policy ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY profiles_insert_policy ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- سياسات جدول admin_users
CREATE POLICY admin_users_select_policy ON admin_users
  FOR SELECT USING (true);  -- السماح للجميع بقراءة جميع سجلات المشرفين

-- 6. إنشاء محفزات لتحديث عمود updated_at
-- محفز جدول profiles
DO $$
BEGIN
  -- حذف المحفز إذا كان موجودًا
  IF EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    DROP TRIGGER update_profiles_updated_at ON profiles;
  END IF;
  
  -- حذف الدالة إذا كانت موجودة
  IF EXISTS (SELECT FROM pg_proc WHERE proname = 'update_profiles_updated_at_column') THEN
    DROP FUNCTION update_profiles_updated_at_column();
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
END
$$;

-- محفز جدول admin_users
DO $$
BEGIN
  -- حذف المحفز إذا كان موجودًا
  IF EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_admin_users_updated_at') THEN
    DROP TRIGGER update_admin_users_updated_at ON admin_users;
  END IF;
  
  -- حذف الدالة إذا كانت موجودة
  IF EXISTS (SELECT FROM pg_proc WHERE proname = 'update_admin_users_updated_at_column') THEN
    DROP FUNCTION update_admin_users_updated_at_column();
  END IF;
  
  -- إنشاء الدالة
  CREATE OR REPLACE FUNCTION update_admin_users_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  
  -- إنشاء المحفز
  CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE PROCEDURE update_admin_users_updated_at_column();
END
$$;

-- 7. إنشاء محفز لإنشاء سجل في جدول profiles عند إنشاء مستخدم جديد
DO $$
BEGIN
  -- حذف المحفز إذا كان موجودًا
  IF EXISTS (SELECT FROM pg_trigger WHERE tgname = 'create_profile_after_signup') THEN
    DROP TRIGGER create_profile_after_signup ON auth.users;
  END IF;
  
  -- حذف الدالة إذا كانت موجودة
  IF EXISTS (SELECT FROM pg_proc WHERE proname = 'create_profile_for_user') THEN
    DROP FUNCTION create_profile_for_user();
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
END
$$;

-- 8. إنشاء سجلات في جدول profiles للمستخدمين الموجودين
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
END
$$;

-- 9. إنشاء سجلات في جدول admin_users للمستخدمين المشرفين
DO $$
DECLARE
  user_id UUID;
  admin_exists BOOLEAN;
BEGIN
  -- إنشاء سجل للمستخدم kemoamego@gmail.com
  SELECT id INTO user_id FROM auth.users WHERE email = 'kemoamego@gmail.com';
  
  IF user_id IS NOT NULL THEN
    SELECT EXISTS (SELECT 1 FROM admin_users WHERE id = user_id) INTO admin_exists;
    
    IF admin_exists THEN
      UPDATE admin_users
      SET role = 'super_admin',
          name = 'kareem amged',
          updated_at = NOW()
      WHERE id = user_id;
    ELSE
      INSERT INTO admin_users (id, name, email, role, created_at, updated_at)
      VALUES (
        user_id,
        'kareem amged',
        'kemoamego@gmail.com',
        'super_admin',
        NOW(),
        NOW()
      );
    END IF;
  END IF;
  
  -- إنشاء سجل للمستخدم kemoamego@icloud.com
  SELECT id INTO user_id FROM auth.users WHERE email = 'kemoamego@icloud.com';
  
  IF user_id IS NOT NULL THEN
    SELECT EXISTS (SELECT 1 FROM admin_users WHERE id = user_id) INTO admin_exists;
    
    IF admin_exists THEN
      UPDATE admin_users
      SET role = 'super_admin',
          name = 'kareem amged',
          updated_at = NOW()
      WHERE id = user_id;
    ELSE
      INSERT INTO admin_users (id, name, email, role, created_at, updated_at)
      VALUES (
        user_id,
        'kareem amged',
        'kemoamego@icloud.com',
        'super_admin',
        NOW(),
        NOW()
      );
    END IF;
  END IF;
END
$$;
