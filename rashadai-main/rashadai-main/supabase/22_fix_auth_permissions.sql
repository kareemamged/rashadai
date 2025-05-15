-- هذا الملف يصحح مشكلة الصلاحيات في نظام المصادقة

-- إعادة ضبط الصلاحيات على جدول auth.users
DO $$
BEGIN
  -- منح الصلاحيات المناسبة على schema auth
  GRANT USAGE ON SCHEMA auth TO postgres, service_role, anon, authenticated;
  
  -- منح الصلاحيات المناسبة على جدول auth.users
  GRANT ALL ON auth.users TO postgres, service_role;
  GRANT SELECT ON auth.users TO anon, authenticated;
  
  RAISE NOTICE 'تم إعادة ضبط الصلاحيات على schema auth وجدول auth.users';
END
$$;

-- إعادة ضبط الصلاحيات على جدول profiles
DO $$
BEGIN
  -- منح الصلاحيات المناسبة على جدول profiles
  GRANT ALL ON TABLE profiles TO postgres, service_role;
  GRANT SELECT, INSERT, UPDATE ON TABLE profiles TO authenticated;
  GRANT SELECT, INSERT ON TABLE profiles TO anon;
  
  RAISE NOTICE 'تم إعادة ضبط الصلاحيات على جدول profiles';
END
$$;

-- تعطيل RLS مؤقتًا على جدول profiles للتحقق من المشكلة
DO $$
BEGIN
  -- تعطيل RLS على جدول profiles
  ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
  
  RAISE NOTICE 'تم تعطيل RLS على جدول profiles مؤقتًا';
END
$$;

-- التحقق من وجود المستخدمين في جدول auth.users وإنشاء سجلات في جدول profiles لهم
DO $$
DECLARE
  users_count INTEGER;
  profiles_count INTEGER;
  missing_profiles_count INTEGER;
  user_record RECORD;
BEGIN
  -- عدد المستخدمين في جدول auth.users
  SELECT COUNT(*) INTO users_count FROM auth.users;
  RAISE NOTICE 'عدد المستخدمين في جدول auth.users: %', users_count;
  
  -- عدد السجلات في جدول profiles
  SELECT COUNT(*) INTO profiles_count FROM profiles;
  RAISE NOTICE 'عدد السجلات في جدول profiles: %', profiles_count;
  
  -- عدد المستخدمين الذين ليس لديهم سجل في جدول profiles
  SELECT COUNT(*) INTO missing_profiles_count
  FROM auth.users u
  LEFT JOIN profiles p ON u.id = p.id
  WHERE p.id IS NULL;
  
  RAISE NOTICE 'عدد المستخدمين الذين ليس لديهم سجل في جدول profiles: %', missing_profiles_count;
  
  -- إنشاء سجلات في جدول profiles للمستخدمين الذين ليس لديهم سجل
  IF missing_profiles_count > 0 THEN
    FOR user_record IN
      SELECT u.id, u.email, u.raw_user_meta_data, u.created_at
      FROM auth.users u
      LEFT JOIN profiles p ON u.id = p.id
      WHERE p.id IS NULL
    LOOP
      INSERT INTO profiles (id, email, name, avatar_url, created_at, updated_at)
      VALUES (
        user_record.id,
        user_record.email,
        COALESCE(user_record.raw_user_meta_data->>'name', user_record.email),
        user_record.raw_user_meta_data->>'avatar_url',
        user_record.created_at,
        user_record.created_at
      );
      RAISE NOTICE 'تم إنشاء سجل في جدول profiles للمستخدم: %', user_record.email;
    END LOOP;
  END IF;
END
$$;

-- إعادة تمكين RLS على جدول profiles وإنشاء سياسات الأمان المناسبة
DO $$
BEGIN
  -- تمكين RLS على جدول profiles
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  
  -- حذف سياسات الأمان الموجودة
  DROP POLICY IF EXISTS profiles_select_policy ON profiles;
  DROP POLICY IF EXISTS profiles_update_policy ON profiles;
  DROP POLICY IF EXISTS profiles_insert_anon_policy ON profiles;
  DROP POLICY IF EXISTS profiles_insert_auth_policy ON profiles;
  
  -- إنشاء سياسات الأمان الجديدة
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
  
  RAISE NOTICE 'تم إعادة تمكين RLS على جدول profiles وإنشاء سياسات الأمان المناسبة';
END
$$;

-- إنشاء سياسة للسماح للمستخدمين غير المصادق عليهم بقراءة جميع الملفات الشخصية
DO $$
BEGIN
  DROP POLICY IF EXISTS profiles_select_anon_policy ON profiles;
  
  CREATE POLICY profiles_select_anon_policy ON profiles
    FOR SELECT
    TO anon
    USING (true);
  
  RAISE NOTICE 'تم إنشاء سياسة للسماح للمستخدمين غير المصادق عليهم بقراءة جميع الملفات الشخصية';
END
$$;

-- إنشاء سياسة للسماح للمستخدمين غير المصادق عليهم بتحديث ملفاتهم الشخصية
DO $$
BEGIN
  DROP POLICY IF EXISTS profiles_update_anon_policy ON profiles;
  
  CREATE POLICY profiles_update_anon_policy ON profiles
    FOR UPDATE
    TO anon
    USING (true);
  
  RAISE NOTICE 'تم إنشاء سياسة للسماح للمستخدمين غير المصادق عليهم بتحديث ملفاتهم الشخصية';
END
$$;

-- إنشاء سياسة للسماح للمستخدمين غير المصادق عليهم بحذف ملفاتهم الشخصية
DO $$
BEGIN
  DROP POLICY IF EXISTS profiles_delete_anon_policy ON profiles;
  
  CREATE POLICY profiles_delete_anon_policy ON profiles
    FOR DELETE
    TO anon
    USING (true);
  
  RAISE NOTICE 'تم إنشاء سياسة للسماح للمستخدمين غير المصادق عليهم بحذف ملفاتهم الشخصية';
END
$$;

-- إنشاء سياسة للسماح للمستخدمين المصادق عليهم بحذف ملفاتهم الشخصية
DO $$
BEGIN
  DROP POLICY IF EXISTS profiles_delete_auth_policy ON profiles;
  
  CREATE POLICY profiles_delete_auth_policy ON profiles
    FOR DELETE
    TO authenticated
    USING (auth.uid() = id);
  
  RAISE NOTICE 'تم إنشاء سياسة للسماح للمستخدمين المصادق عليهم بحذف ملفاتهم الشخصية';
END
$$;
