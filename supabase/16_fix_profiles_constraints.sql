-- التحقق من وجود قيود على جدول profiles
SELECT conname, contype, conrelid::regclass, consrc
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass;

-- إزالة القيود الموجودة على جدول profiles إذا كانت تسبب مشاكل
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_pkey CASCADE;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey CASCADE;

-- إعادة إنشاء القيود الأساسية
ALTER TABLE profiles ADD PRIMARY KEY (id);
ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- التأكد من أن جميع الأعمدة المطلوبة موجودة وبالنوع الصحيح
ALTER TABLE profiles 
  ALTER COLUMN id TYPE UUID USING id::UUID,
  ALTER COLUMN email TYPE TEXT,
  ALTER COLUMN name TYPE TEXT,
  ALTER COLUMN role TYPE TEXT,
  ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE,
  ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE;
