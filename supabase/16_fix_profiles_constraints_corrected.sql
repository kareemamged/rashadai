-- التحقق من وجود قيود على جدول profiles
SELECT conname, contype, conrelid::regclass
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass;

-- إزالة سياسات الأمان الموجودة على جدول profiles أولاً
DROP POLICY IF EXISTS profiles_select_policy ON profiles;
DROP POLICY IF EXISTS profiles_update_policy ON profiles;
DROP POLICY IF EXISTS profiles_insert_anon_policy ON profiles;
DROP POLICY IF EXISTS profiles_insert_auth_policy ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- إزالة القيود الموجودة على جدول profiles إذا كانت تسبب مشاكل
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_pkey CASCADE;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey CASCADE;

-- إعادة إنشاء القيود الأساسية
ALTER TABLE profiles ADD PRIMARY KEY (id);
ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- التأكد من أن جميع الأعمدة المطلوبة موجودة وبالنوع الصحيح
-- لا نقوم بتغيير نوع عمود id لأنه مستخدم في سياسات الأمان
ALTER TABLE profiles
  ALTER COLUMN email TYPE TEXT,
  ALTER COLUMN name TYPE TEXT;

-- إعادة إنشاء سياسات الأمان
-- تمكين RLS على جدول profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح للمستخدمين المصادق عليهم بقراءة جميع الملفات الشخصية
CREATE POLICY profiles_select_policy ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- سياسة للسماح للمستخدمين المصادق عليهم بتحديث ملفاتهم الشخصية فقط
CREATE POLICY profiles_update_policy ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- سياسة للسماح للمستخدمين غير المصادق عليهم بإدراج ملف شخصي جديد (للتسجيل)
CREATE POLICY profiles_insert_anon_policy ON profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- سياسة للسماح للمستخدمين المصادق عليهم بإدراج ملف شخصي جديد
CREATE POLICY profiles_insert_auth_policy ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
