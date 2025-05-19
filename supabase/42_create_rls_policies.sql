-- إنشاء سياسات الأمان (RLS) لجدول profiles

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
