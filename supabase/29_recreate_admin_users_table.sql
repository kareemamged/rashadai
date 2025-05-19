-- إعادة إنشاء جدول admin_users من الصفر

-- حذف الجدول إذا كان موجودًا
DROP TABLE IF EXISTS admin_users CASCADE;

-- إنشاء الجدول من جديد
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  avatar TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء دالة لتحديث وقت التعديل
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء محفز لتحديث وقت التعديل
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON admin_users
FOR EACH ROW
EXECUTE FUNCTION update_admin_users_updated_at();

-- تعطيل RLS على جدول admin_users
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- حذف جميع سياسات الأمان على جدول admin_users
DROP POLICY IF EXISTS admin_users_select_policy ON admin_users;
DROP POLICY IF EXISTS admin_users_insert_policy ON admin_users;
DROP POLICY IF EXISTS admin_users_update_policy ON admin_users;
DROP POLICY IF EXISTS admin_users_delete_policy ON admin_users;
DROP POLICY IF EXISTS admin_users_select_anon_policy ON admin_users;
DROP POLICY IF EXISTS admin_users_insert_anon_policy ON admin_users;
DROP POLICY IF EXISTS admin_users_update_anon_policy ON admin_users;
DROP POLICY IF EXISTS admin_users_delete_anon_policy ON admin_users;
DROP POLICY IF EXISTS admin_users_select_auth_policy ON admin_users;
DROP POLICY IF EXISTS admin_users_insert_auth_policy ON admin_users;
DROP POLICY IF EXISTS admin_users_update_auth_policy ON admin_users;
DROP POLICY IF EXISTS admin_users_delete_auth_policy ON admin_users;

-- إعادة ضبط الصلاحيات على جدول admin_users
GRANT ALL ON TABLE admin_users TO postgres, service_role;
GRANT SELECT ON TABLE admin_users TO authenticated;
GRANT SELECT ON TABLE admin_users TO anon;

-- إنشاء سياسات أمان بسيطة على جدول admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسة للسماح بقراءة جميع السجلات
CREATE POLICY admin_users_select_policy ON admin_users
  FOR SELECT
  USING (true);

-- إنشاء حساب مسؤول افتراضي
INSERT INTO admin_users (email, name, password, role, avatar)
VALUES (
  'kemoamego@icloud.com',
  'kareem amged',
  crypt('admin123', gen_salt('bf')),
  'super_admin',
  'https://ui-avatars.com/api/?name=kareem+amged&background=random'
);
