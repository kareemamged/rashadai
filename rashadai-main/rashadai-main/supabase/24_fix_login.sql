-- هذا الملف يصحح مشكلة تسجيل الدخول في Supabase

-- إعادة ضبط الصلاحيات على جدول auth.users
DO $$
BEGIN
  -- منح الصلاحيات المناسبة على schema auth
  GRANT USAGE ON SCHEMA auth TO postgres, service_role, anon, authenticated;

  -- منح الصلاحيات المناسبة على جدول auth.users
  GRANT ALL ON auth.users TO postgres, service_role;
  GRANT SELECT ON auth.users TO anon, authenticated;

  -- منح الصلاحيات المناسبة على جدول auth.refresh_tokens
  GRANT ALL ON auth.refresh_tokens TO postgres, service_role;
  GRANT SELECT, INSERT, UPDATE, DELETE ON auth.refresh_tokens TO anon, authenticated;

  -- منح الصلاحيات المناسبة على جدول auth.audit_log_entries
  GRANT ALL ON auth.audit_log_entries TO postgres, service_role;
  GRANT SELECT, INSERT ON auth.audit_log_entries TO anon, authenticated;

  -- منح الصلاحيات المناسبة على جدول auth.instances
  GRANT ALL ON auth.instances TO postgres, service_role;
  GRANT SELECT ON auth.instances TO anon, authenticated;

  -- منح الصلاحيات المناسبة على جدول auth.schema_migrations
  GRANT ALL ON auth.schema_migrations TO postgres, service_role;
  GRANT SELECT ON auth.schema_migrations TO anon, authenticated;

  -- منح الصلاحيات المناسبة على جدول auth.sessions
  GRANT ALL ON auth.sessions TO postgres, service_role;
  GRANT SELECT, INSERT, UPDATE, DELETE ON auth.sessions TO anon, authenticated;

  RAISE NOTICE 'تم إعادة ضبط الصلاحيات على schema auth وجداول auth';
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

-- تعطيل RLS مؤقتًا على جدول profiles
DO $$
BEGIN
  -- تعطيل RLS على جدول profiles
  ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

  RAISE NOTICE 'تم تعطيل RLS على جدول profiles مؤقتًا';
END
$$;

-- إنشاء مستخدم اختبار جديد
DO $$
DECLARE
  user_id UUID;
  profile_exists BOOLEAN;
BEGIN
  -- التحقق من وجود المستخدم
  SELECT id INTO user_id FROM auth.users WHERE email = 'test@example.com';

  -- إذا كان المستخدم موجودًا، نقوم بحذفه
  IF user_id IS NOT NULL THEN
    -- التحقق من وجود سجل في جدول profiles
    SELECT EXISTS (
      SELECT FROM profiles WHERE id = user_id
    ) INTO profile_exists;

    -- إذا كان هناك سجل في جدول profiles، نقوم بحذفه
    IF profile_exists THEN
      DELETE FROM profiles WHERE id = user_id;
      RAISE NOTICE 'تم حذف السجل الموجود في جدول profiles للمستخدم: test@example.com';
    END IF;

    -- حذف المستخدم من جدول auth.users
    DELETE FROM auth.users WHERE id = user_id;
    RAISE NOTICE 'تم حذف المستخدم الموجود: test@example.com';
  END IF;

  -- إنشاء المستخدم الجديد
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    uuid_generate_v4(),
    'authenticated',
    'authenticated',
    'test@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Test User", "avatar": "https://ui-avatars.com/api/?name=Test+User&background=random", "country_code": "US", "language": "ar"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO user_id;

  -- التحقق من وجود سجل في جدول profiles للمستخدم الجديد
  SELECT EXISTS (
    SELECT FROM profiles WHERE id = user_id
  ) INTO profile_exists;

  -- إذا لم يكن هناك سجل في جدول profiles، نقوم بإنشائه
  IF NOT profile_exists THEN
    -- إنشاء سجل في جدول profiles للمستخدم الجديد
    INSERT INTO profiles (id, email, name, avatar_url, created_at, updated_at)
    VALUES (
      user_id,
      'test@example.com',
      'Test User',
      'https://ui-avatars.com/api/?name=Test+User&background=random',
      now(),
      now()
    );
    RAISE NOTICE 'تم إنشاء سجل في جدول profiles للمستخدم الجديد';
  ELSE
    RAISE NOTICE 'السجل موجود بالفعل في جدول profiles للمستخدم الجديد';
  END IF;

  RAISE NOTICE 'تم إنشاء مستخدم اختبار جديد: test@example.com مع كلمة المرور: password123';
END
$$;

-- إعادة تمكين RLS على جدول profiles
DO $$
BEGIN
  -- تمكين RLS على جدول profiles
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

  -- حذف سياسات الأمان الموجودة
  DROP POLICY IF EXISTS profiles_select_policy ON profiles;
  DROP POLICY IF EXISTS profiles_update_policy ON profiles;
  DROP POLICY IF EXISTS profiles_insert_anon_policy ON profiles;
  DROP POLICY IF EXISTS profiles_insert_auth_policy ON profiles;
  DROP POLICY IF EXISTS profiles_select_anon_policy ON profiles;
  DROP POLICY IF EXISTS profiles_update_anon_policy ON profiles;
  DROP POLICY IF EXISTS profiles_delete_anon_policy ON profiles;
  DROP POLICY IF EXISTS profiles_delete_auth_policy ON profiles;

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

  -- سياسة للسماح للمستخدمين غير المصادق عليهم بقراءة جميع الملفات الشخصية
  CREATE POLICY profiles_select_anon_policy ON profiles
    FOR SELECT
    TO anon
    USING (true);

  -- سياسة للسماح للمستخدمين المصادق عليهم بحذف ملفاتهم الشخصية فقط
  CREATE POLICY profiles_delete_auth_policy ON profiles
    FOR DELETE
    TO authenticated
    USING (auth.uid() = id);

  RAISE NOTICE 'تم إعادة تمكين RLS على جدول profiles وإنشاء سياسات الأمان المناسبة';
END
$$;
