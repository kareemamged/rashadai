-- إضافة الأعمدة المفقودة إلى جدول admin_users إذا لم تكن موجودة
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
    EXECUTE 'ALTER TABLE admin_users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()';
    RAISE NOTICE 'Added created_at column to admin_users table';
  END IF;

  -- التحقق من وجود عمود updated_at
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' AND column_name = 'updated_at'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    EXECUTE 'ALTER TABLE admin_users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()';
    RAISE NOTICE 'Added updated_at column to admin_users table';
  END IF;

  -- التحقق من وجود عمود last_login
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' AND column_name = 'last_login'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    EXECUTE 'ALTER TABLE admin_users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE';
    RAISE NOTICE 'Added last_login column to admin_users table';
  END IF;

  -- التحقق من وجود عمود avatar
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' AND column_name = 'avatar'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    EXECUTE 'ALTER TABLE admin_users ADD COLUMN avatar TEXT';
    RAISE NOTICE 'Added avatar column to admin_users table';
  END IF;
END
$$;

-- إنشاء محفز لتحديث عمود updated_at
DO $$
DECLARE
  trigger_exists BOOLEAN;
BEGIN
  -- التحقق من وجود المحفز
  SELECT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_admin_users_updated_at'
  ) INTO trigger_exists;
  
  IF NOT trigger_exists THEN
    -- إنشاء دالة لتحديث عمود updated_at
    CREATE OR REPLACE FUNCTION update_admin_users_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    -- إنشاء محفز لتحديث عمود updated_at
    CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE PROCEDURE update_admin_users_updated_at_column();
    
    RAISE NOTICE 'Created trigger for updating updated_at column';
  END IF;
END
$$;

-- إنشاء مستخدم مشرف جديد أو تحديث المستخدم الموجود
DO $$
DECLARE
  user_id UUID;
  admin_exists BOOLEAN;
BEGIN
  -- التحقق من وجود المستخدم في auth.users
  SELECT id INTO user_id FROM auth.users WHERE email = 'kemoamego@gmail.com';
  
  IF user_id IS NULL THEN
    RAISE NOTICE 'User kemoamego@gmail.com not found in auth.users';
    RETURN;
  END IF;
  
  -- التحقق من وجود المستخدم في admin_users
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE id = user_id
  ) INTO admin_exists;
  
  IF admin_exists THEN
    -- تحديث المستخدم الموجود
    UPDATE admin_users
    SET role = 'super_admin',
        name = 'kareem amged'
    WHERE id = user_id;
    
    -- تحديث updated_at إذا كان العمود موجودًا
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'admin_users' AND column_name = 'updated_at'
    ) THEN
      UPDATE admin_users
      SET updated_at = NOW()
      WHERE id = user_id;
    END IF;
    
    RAISE NOTICE 'Updated existing admin user for kemoamego@gmail.com';
  ELSE
    -- إنشاء مستخدم مشرف جديد
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'admin_users' AND column_name = 'updated_at'
    ) THEN
      -- إذا كان عمود updated_at موجودًا
      INSERT INTO admin_users (id, name, email, role, created_at, updated_at)
      VALUES (
        user_id,
        'kareem amged',
        'kemoamego@gmail.com',
        'super_admin',
        NOW(),
        NOW()
      );
    ELSE
      -- إذا لم يكن عمود updated_at موجودًا
      INSERT INTO admin_users (id, name, email, role)
      VALUES (
        user_id,
        'kareem amged',
        'kemoamego@gmail.com',
        'super_admin'
      );
    END IF;
    
    RAISE NOTICE 'Created new admin user for kemoamego@gmail.com';
  END IF;
  
  -- كرر نفس العملية للمستخدم kemoamego@icloud.com
  SELECT id INTO user_id FROM auth.users WHERE email = 'kemoamego@icloud.com';
  
  IF user_id IS NULL THEN
    RAISE NOTICE 'User kemoamego@icloud.com not found in auth.users';
    RETURN;
  END IF;
  
  -- التحقق من وجود المستخدم في admin_users
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE id = user_id
  ) INTO admin_exists;
  
  IF admin_exists THEN
    -- تحديث المستخدم الموجود
    UPDATE admin_users
    SET role = 'super_admin',
        name = 'kareem amged'
    WHERE id = user_id;
    
    -- تحديث updated_at إذا كان العمود موجودًا
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'admin_users' AND column_name = 'updated_at'
    ) THEN
      UPDATE admin_users
      SET updated_at = NOW()
      WHERE id = user_id;
    END IF;
    
    RAISE NOTICE 'Updated existing admin user for kemoamego@icloud.com';
  ELSE
    -- إنشاء مستخدم مشرف جديد
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'admin_users' AND column_name = 'updated_at'
    ) THEN
      -- إذا كان عمود updated_at موجودًا
      INSERT INTO admin_users (id, name, email, role, created_at, updated_at)
      VALUES (
        user_id,
        'kareem amged',
        'kemoamego@icloud.com',
        'super_admin',
        NOW(),
        NOW()
      );
    ELSE
      -- إذا لم يكن عمود updated_at موجودًا
      INSERT INTO admin_users (id, name, email, role)
      VALUES (
        user_id,
        'kareem amged',
        'kemoamego@icloud.com',
        'super_admin'
      );
    END IF;
    
    RAISE NOTICE 'Created new admin user for kemoamego@icloud.com';
  END IF;
END
$$;
