-- إنشاء سياسات الأمان لجدول profiles

-- سياسة تسمح للمستخدم بعرض ملفه الشخصي فقط
CREATE POLICY profiles_select_self_policy ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- سياسة تسمح للمستخدم بتحديث ملفه الشخصي فقط
CREATE POLICY profiles_update_self_policy ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- سياسة تسمح للمستخدم بإدراج ملفه الشخصي فقط
CREATE POLICY profiles_insert_self_policy ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- سياسة تسمح للمشرفين بعرض جميع الملفات الشخصية
CREATE POLICY profiles_select_admin_policy ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );
