-- إنشاء سياسات الأمان لجدول admin_users

-- سياسة تسمح للمشرفين بعرض جميع المشرفين
CREATE POLICY admin_users_select_policy ON admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- سياسة تسمح للمشرف بتحديث بياناته فقط
CREATE POLICY admin_users_update_self_policy ON admin_users
  FOR UPDATE
  USING (auth.uid() = id);
