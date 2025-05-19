-- إنشاء دالة لمنح صلاحيات المشرف للمستخدم
CREATE OR REPLACE FUNCTION grant_admin_access(user_email TEXT, admin_role TEXT DEFAULT 'super_admin')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER -- تعمل بصلاحيات منشئ الدالة
AS $$
DECLARE
  user_id UUID;
  result TEXT;
BEGIN
  -- الحصول على معرف المستخدم
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;

  IF user_id IS NULL THEN
    RETURN 'User not found with email: ' || user_email;
  END IF;

  -- التحقق من وجود سجل في جدول profiles
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    -- إنشاء سجل في جدول profiles إذا لم يكن موجودًا
    INSERT INTO profiles (id, name, email, role, created_at, updated_at)
    SELECT
      user_id,
      COALESCE((raw_user_meta_data->>'name')::TEXT, 'Admin User'),
      user_email,
      'admin',
      NOW(),
      NOW()
    FROM auth.users
    WHERE id = user_id;

    result := 'Created profile for user: ' || user_email || '. ';
  ELSE
    -- تحديث دور المستخدم في جدول profiles
    UPDATE profiles
    SET role = 'admin',
        updated_at = NOW()
    WHERE id = user_id;

    result := 'Updated profile for user: ' || user_email || '. ';
  END IF;

  -- التحقق من وجود سجل في جدول admin_users
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE id = user_id) THEN
    -- إنشاء سجل في جدول admin_users إذا لم يكن موجودًا
    BEGIN
      -- التحقق من وجود الأعمدة المطلوبة
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'admin_users' AND column_name = 'updated_at'
      ) THEN
        -- إذا كان عمود updated_at موجودًا
        INSERT INTO admin_users (id, name, email, role, created_at, updated_at)
        SELECT
          user_id,
          COALESCE((raw_user_meta_data->>'name')::TEXT, 'Admin User'),
          user_email,
          admin_role,
          NOW(),
          NOW()
        FROM auth.users
        WHERE id = user_id;
      ELSE
        -- إذا لم يكن عمود updated_at موجودًا
        INSERT INTO admin_users (id, name, email, role)
        SELECT
          user_id,
          COALESCE((raw_user_meta_data->>'name')::TEXT, 'Admin User'),
          user_email,
          admin_role
        FROM auth.users
        WHERE id = user_id;
      END IF;
    END;

    result := result || 'Created admin user with role: ' || admin_role;
  ELSE
    -- تحديث دور المستخدم في جدول admin_users
    BEGIN
      -- التحقق من وجود الأعمدة المطلوبة
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'admin_users' AND column_name = 'updated_at'
      ) THEN
        -- إذا كان عمود updated_at موجودًا
        UPDATE admin_users
        SET role = admin_role,
            updated_at = NOW()
        WHERE id = user_id;
      ELSE
        -- إذا لم يكن عمود updated_at موجودًا
        UPDATE admin_users
        SET role = admin_role
        WHERE id = user_id;
      END IF;
    END;

    result := result || 'Updated admin user with role: ' || admin_role;
  END IF;

  RETURN result;
END;
$$;

-- إنشاء دالة لإلغاء صلاحيات المشرف من المستخدم
CREATE OR REPLACE FUNCTION revoke_admin_access(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER -- تعمل بصلاحيات منشئ الدالة
AS $$
DECLARE
  user_id UUID;
  result TEXT;
BEGIN
  -- الحصول على معرف المستخدم
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;

  IF user_id IS NULL THEN
    RETURN 'User not found with email: ' || user_email;
  END IF;

  -- تحديث دور المستخدم في جدول profiles
  UPDATE profiles
  SET role = 'user',
      updated_at = NOW()
  WHERE id = user_id;

  -- حذف سجل المستخدم من جدول admin_users
  DELETE FROM admin_users
  WHERE id = user_id;

  RETURN 'Revoked admin access for user: ' || user_email;
END;
$$;

-- مثال على استخدام الدالة
-- SELECT grant_admin_access('kemoamego@gmail.com', 'super_admin');
-- SELECT grant_admin_access('kemoamego@icloud.com', 'super_admin');
-- SELECT revoke_admin_access('some_user@example.com');
