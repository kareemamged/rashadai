-- التأكد من وجود جميع الأعمدة المطلوبة في جدول profiles
ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- التأكد من أن جميع المستخدمين الحاليين لديهم سجلات في جدول profiles
INSERT INTO profiles (id, email, name)
SELECT id, email, email
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.users.id
);

-- تعديل سياسات الأمان لجدول profiles للسماح بإنشاء سجلات جديدة
DROP POLICY IF EXISTS profiles_insert_self_policy ON profiles;
CREATE POLICY profiles_insert_self_policy ON profiles
  FOR INSERT
  WITH CHECK (true);

-- إضافة سياسة تسمح للنظام بإدراج سجلات جديدة
DROP POLICY IF EXISTS profiles_insert_system_policy ON profiles;
CREATE POLICY profiles_insert_system_policy ON profiles
  FOR INSERT
  WITH CHECK (true);

-- إضافة سياسة تسمح للنظام بتحديث سجلات
DROP POLICY IF EXISTS profiles_update_system_policy ON profiles;
CREATE POLICY profiles_update_system_policy ON profiles
  FOR UPDATE
  USING (true);
