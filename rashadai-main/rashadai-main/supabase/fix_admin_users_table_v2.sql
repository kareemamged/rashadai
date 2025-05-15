-- إصلاح جدول admin_users
-- هذا الملف يقوم بإصلاح جدول admin_users عن طريق:
-- 1. التحقق من وجود جدول admin_users وإنشائه إذا لم يكن موجودًا
-- 2. إضافة الأعمدة المفقودة إلى جدول admin_users
-- 3. إنشاء محفز لتحديث عمود updated_at
-- 4. إنشاء سجلات للمستخدمين المشرفين

-- التحقق من وجود جدول admin_users وإنشائه إذا لم يكن موجودًا
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

-- إضافة الأعمدة المفقودة إلى جدول admin_users
DO $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  -- التحقق من وجود عمود created_at
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' AND column_name = 'created_at'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    ALTER TABLE admin_users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE 'Added created_at column to admin_users table';
  END IF;

  -- التحقق من وجود عمود updated_at
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' AND column_name = 'updated_at'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    ALTER TABLE admin_users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE 'Added updated_at column to admin_users table';
  END IF;

  -- التحقق من وجود عمود last_login
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' AND column_name = 'last_login'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    ALTER TABLE admin_users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Added last_login column to admin_users table';
  END IF;

  -- التحقق من وجود عمود avatar
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' AND column_name = 'avatar'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    ALTER TABLE admin_users ADD COLUMN avatar TEXT;
    RAISE NOTICE 'Added avatar column to admin_users table';
  END IF;
END
$$;

-- إنشاء محفز لتحديث عمود updated_at
DO $$
BEGIN
  -- حذف المحفز إذا كان موجودًا
  IF EXISTS (
    SELECT FROM pg_trigger 
    WHERE tgname = 'update_admin_users_updated_at'
  ) THEN
    DROP TRIGGER update_admin_users_updated_at ON admin_users;
    RAISE NOTICE 'Dropped trigger update_admin_users_updated_at';
  END IF;
  
  -- حذف الدالة إذا كانت موجودة
  IF EXISTS (
    SELECT FROM pg_proc 
    WHERE proname = 'update_admin_users_updated_at_column'
  ) THEN
    DROP FUNCTION update_admin_users_updated_at_column();
    RAISE NOTICE 'Dropped function update_admin_users_updated_at_column';
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
  
  RAISE NOTICE 'Created trigger update_admin_users_updated_at';
END
$$;

-- تمكين سياسات الأمان (RLS) على جدول admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- حذف سياسات الأمان الموجودة (إذا كانت موجودة) لتجنب الأخطاء
DO $$
BEGIN
  -- حذف سياسة admin_users_select_policy إذا كانت موجودة
  IF EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'admin_users' AND policyname = 'admin_users_select_policy'
  ) THEN
    DROP POLICY admin_users_select_policy ON admin_users;
    RAISE NOTICE 'Dropped policy admin_users_select_policy';
  END IF;
END
$$;

-- إنشاء سياسة للسماح للمستخدمين بقراءة سجلات المشرفين
CREATE POLICY admin_users_select_policy ON admin_users
  FOR SELECT USING (true);  -- السماح للجميع بقراءة جميع سجلات المشرفين

-- إنشاء سجلات للمستخدمين المشرفين
DO $$
DECLARE
  user_id UUID;
  admin_exists BOOLEAN;
BEGIN
  -- التحقق من وجود المستخدم kemoamego@gmail.com
  SELECT id INTO user_id FROM auth.users WHERE email = 'kemoamego@gmail.com';
  
  IF user_id IS NOT NULL THEN
    -- التحقق من وجود المستخدم في admin_users
    SELECT EXISTS (
      SELECT 1 FROM admin_users WHERE id = user_id
    ) INTO admin_exists;
    
    IF admin_exists THEN
      -- تحديث المستخدم الموجود
      UPDATE admin_users
      SET role = 'super_admin',
          name = 'kareem amged',
          updated_at = NOW()
      WHERE id = user_id;
      
      RAISE NOTICE 'Updated existing admin user for kemoamego@gmail.com';
    ELSE
      -- إنشاء مستخدم مشرف جديد
      INSERT INTO admin_users (id, name, email, role, created_at, updated_at)
      VALUES (
        user_id,
        'kareem amged',
        'kemoamego@gmail.com',
        'super_admin',
        NOW(),
        NOW()
      );
      
      RAISE NOTICE 'Created new admin user for kemoamego@gmail.com';
    END IF;
  ELSE
    RAISE NOTICE 'User kemoamego@gmail.com not found in auth.users';
  END IF;
  
  -- التحقق من وجود المستخدم kemoamego@icloud.com
  SELECT id INTO user_id FROM auth.users WHERE email = 'kemoamego@icloud.com';
  
  IF user_id IS NOT NULL THEN
    -- التحقق من وجود المستخدم في admin_users
    SELECT EXISTS (
      SELECT 1 FROM admin_users WHERE id = user_id
    ) INTO admin_exists;
    
    IF admin_exists THEN
      -- تحديث المستخدم الموجود
      UPDATE admin_users
      SET role = 'super_admin',
          name = 'kareem amged',
          updated_at = NOW()
      WHERE id = user_id;
      
      RAISE NOTICE 'Updated existing admin user for kemoamego@icloud.com';
    ELSE
      -- إنشاء مستخدم مشرف جديد
      INSERT INTO admin_users (id, name, email, role, created_at, updated_at)
      VALUES (
        user_id,
        'kareem amged',
        'kemoamego@icloud.com',
        'super_admin',
        NOW(),
        NOW()
      );
      
      RAISE NOTICE 'Created new admin user for kemoamego@icloud.com';
    END IF;
  ELSE
    RAISE NOTICE 'User kemoamego@icloud.com not found in auth.users';
  END IF;
END
$$;
