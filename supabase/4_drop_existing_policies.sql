-- حذف سياسات الأمان الموجودة (إذا كانت موجودة) لتجنب الأخطاء
-- حذف سياسات جدول profiles
DROP POLICY IF EXISTS profiles_select_self_policy ON profiles;
DROP POLICY IF EXISTS profiles_select_admin_policy ON profiles;
DROP POLICY IF EXISTS profiles_update_self_policy ON profiles;
DROP POLICY IF EXISTS profiles_update_admin_policy ON profiles;
DROP POLICY IF EXISTS profiles_insert_admin_policy ON profiles;
DROP POLICY IF EXISTS profiles_select_policy ON profiles;
DROP POLICY IF EXISTS profiles_update_policy ON profiles;
DROP POLICY IF EXISTS profiles_insert_policy ON profiles;

-- حذف سياسات جدول admin_users
DROP POLICY IF EXISTS admin_users_select_policy ON admin_users;
