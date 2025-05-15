-- حذف جدول admin_users الحالي إذا كان موجودًا
DROP TABLE IF EXISTS admin_users;

-- إنشاء جدول admin_users من جديد
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'content_admin', 'moderator')),
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- تمكين سياسة أمان الصفوف
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسة للمشرف الأعلى للاطلاع على أي مستخدم مشرف
CREATE POLICY admin_users_super_admin_select_policy ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
  );

-- إنشاء سياسة للمستخدمين المشرفين للاطلاع على بياناتهم الخاصة
CREATE POLICY admin_users_self_select_policy ON admin_users
  FOR SELECT USING (
    auth.uid() = id
  );

-- إنشاء سياسة للمشرف الأعلى لإدراج مستخدمين مشرفين
CREATE POLICY admin_users_super_admin_insert_policy ON admin_users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
  );

-- إنشاء سياسة للمشرف الأعلى لتحديث مستخدمين مشرفين
CREATE POLICY admin_users_super_admin_update_policy ON admin_users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
  );

-- إنشاء سياسة للمستخدمين المشرفين لتحديث بياناتهم الخاصة
CREATE POLICY admin_users_self_update_policy ON admin_users
  FOR UPDATE USING (
    auth.uid() = id
  );

-- إنشاء سياسة للمشرف الأعلى لحذف مستخدمين مشرفين
CREATE POLICY admin_users_super_admin_delete_policy ON admin_users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
  );

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

-- إدراج مستخدمين مشرفين لـ kemoamego@gmail.com و kemoamego@icloud.com إذا كانوا موجودين في auth.users
DO $$
DECLARE
  gmail_user_id UUID;
  icloud_user_id UUID;
BEGIN
  -- الحصول على معرفات المستخدمين من auth.users
  SELECT id INTO gmail_user_id FROM auth.users WHERE email = 'kemoamego@gmail.com';
  SELECT id INTO icloud_user_id FROM auth.users WHERE email = 'kemoamego@icloud.com';
  
  -- إدراج مستخدم مشرف لـ kemoamego@gmail.com إذا كان المستخدم موجودًا
  IF gmail_user_id IS NOT NULL THEN
    INSERT INTO admin_users (id, name, email, role, created_at, updated_at)
    VALUES (
      gmail_user_id,
      'kareem amged',
      'kemoamego@gmail.com',
      'super_admin',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'super_admin',
        name = 'kareem amged',
        updated_at = NOW();
    
    RAISE NOTICE 'Added admin user for kemoamego@gmail.com with ID: %', gmail_user_id;
  ELSE
    RAISE NOTICE 'User kemoamego@gmail.com not found in auth.users';
  END IF;
  
  -- إدراج مستخدم مشرف لـ kemoamego@icloud.com إذا كان المستخدم موجودًا
  IF icloud_user_id IS NOT NULL THEN
    INSERT INTO admin_users (id, name, email, role, created_at, updated_at)
    VALUES (
      icloud_user_id,
      'kareem amged',
      'kemoamego@icloud.com',
      'super_admin',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'super_admin',
        name = 'kareem amged',
        updated_at = NOW();
    
    RAISE NOTICE 'Added admin user for kemoamego@icloud.com with ID: %', icloud_user_id;
  ELSE
    RAISE NOTICE 'User kemoamego@icloud.com not found in auth.users';
  END IF;
END
$$;
