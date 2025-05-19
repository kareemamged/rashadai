-- التحقق من وجود المستخدم kemoamego@icloud.com
SELECT id FROM auth.users WHERE email = 'kemoamego@icloud.com';

-- إذا كان المستخدم غير موجود، يمكنك إنشاؤه من خلال واجهة Supabase أو باستخدام API

-- إضافة المستخدم إلى جدول admin_users (بعد التأكد من وجوده في auth.users)
INSERT INTO admin_users (id, name, email, role)
SELECT id, 'kareem amged', 'kemoamego@icloud.com', 'super_admin'
FROM auth.users
WHERE email = 'kemoamego@icloud.com'
AND NOT EXISTS (
  SELECT 1 FROM admin_users WHERE email = 'kemoamego@icloud.com'
);
