-- هذا الملف يتحقق من جدول auth.users وجدول profiles ويصلح أي مشاكل محتملة

-- التحقق من وجود المستخدمين في جدول auth.users
DO $$
DECLARE
  users_count INTEGER;
BEGIN
  -- عدد المستخدمين في جدول auth.users
  SELECT COUNT(*) INTO users_count FROM auth.users;
  RAISE NOTICE 'عدد المستخدمين في جدول auth.users: %', users_count;
END
$$;

-- التحقق من وجود السجلات في جدول profiles
DO $$
DECLARE
  profiles_count INTEGER;
BEGIN
  -- عدد السجلات في جدول profiles
  SELECT COUNT(*) INTO profiles_count FROM profiles;
  RAISE NOTICE 'عدد السجلات في جدول profiles: %', profiles_count;
END
$$;

-- التحقق من المستخدمين الذين ليس لديهم سجل في جدول profiles
DO $$
DECLARE
  missing_profiles_count INTEGER;
  user_record RECORD;
BEGIN
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

-- إعادة ضبط الصلاحيات على جدول auth.users
DO $$
BEGIN
  -- منح الصلاحيات المناسبة على جدول auth.users
  GRANT USAGE ON SCHEMA auth TO postgres, service_role, anon, authenticated;
  GRANT ALL ON auth.users TO postgres, service_role;
  GRANT SELECT ON auth.users TO anon, authenticated;

  RAISE NOTICE 'تم إعادة ضبط الصلاحيات على جدول auth.users';
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

-- إعادة ضبط سياسات الأمان على جدول profiles
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

  RAISE NOTICE 'تم إعادة ضبط سياسات الأمان على جدول profiles';
END
$$;

-- التحقق من وجود الـ Trigger الذي ينشئ سجل في جدول profiles عند إنشاء مستخدم جديد
DO $$
DECLARE
  trigger_exists BOOLEAN;
BEGIN
  -- التحقق من وجود الـ Trigger
  SELECT EXISTS (
    SELECT FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
  ) INTO trigger_exists;

  -- إذا كان الـ Trigger غير موجود، نقوم بإنشائه
  IF NOT trigger_exists THEN
    -- إنشاء الـ Function الذي سيتم استدعاؤه من الـ Trigger
    EXECUTE 'CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $func$
    BEGIN
      -- إنشاء سجل جديد في جدول profiles للمستخدم الجديد
      INSERT INTO public.profiles (id, email, name, avatar_url, created_at, updated_at)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>''name'', NEW.email),
        NEW.raw_user_meta_data->>''avatar_url'',
        NEW.created_at,
        NEW.created_at
      );
      RETURN NEW;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE ''خطأ في إنشاء سجل في جدول profiles: %'', SQLERRM;
        RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER';

    -- إنشاء الـ Trigger
    EXECUTE 'CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()';

    RAISE NOTICE 'تم إنشاء الـ Trigger on_auth_user_created';
  ELSE
    RAISE NOTICE 'الـ Trigger on_auth_user_created موجود بالفعل';
  END IF;
END
$$;
