-- هذا الملف يصحح مشكلة تسجيل الدخول في Supabase بشكل نهائي

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

-- التحقق من وجود جدول profiles وإنشائه إذا لم يكن موجودًا
DO $$
BEGIN
  -- التحقق من وجود جدول profiles
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'profiles'
  ) THEN
    -- إنشاء جدول profiles
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      name TEXT,
      avatar_url TEXT,
      country_code TEXT,
      phone TEXT,
      bio TEXT,
      language TEXT DEFAULT 'ar',
      website TEXT,
      gender TEXT,
      birth_date TEXT,
      profession TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    RAISE NOTICE 'تم إنشاء جدول profiles';
  ELSE
    RAISE NOTICE 'جدول profiles موجود بالفعل';
    
    -- التحقق من وجود الأعمدة المطلوبة وإضافتها إذا لم تكن موجودة
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'website') THEN
      ALTER TABLE public.profiles ADD COLUMN website TEXT;
      RAISE NOTICE 'تمت إضافة عمود website إلى جدول profiles';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'gender') THEN
      ALTER TABLE public.profiles ADD COLUMN gender TEXT;
      RAISE NOTICE 'تمت إضافة عمود gender إلى جدول profiles';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'birth_date') THEN
      ALTER TABLE public.profiles ADD COLUMN birth_date TEXT;
      RAISE NOTICE 'تمت إضافة عمود birth_date إلى جدول profiles';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'profession') THEN
      ALTER TABLE public.profiles ADD COLUMN profession TEXT;
      RAISE NOTICE 'تمت إضافة عمود profession إلى جدول profiles';
    END IF;
  END IF;
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

-- مزامنة جدول profiles مع جدول auth.users
DO $$
DECLARE
  user_record RECORD;
  profile_exists BOOLEAN;
BEGIN
  -- الحصول على جميع المستخدمين من جدول auth.users
  FOR user_record IN
    SELECT id, email, raw_user_meta_data, created_at
    FROM auth.users
  LOOP
    -- التحقق من وجود سجل في جدول profiles للمستخدم
    SELECT EXISTS (
      SELECT FROM profiles WHERE id = user_record.id
    ) INTO profile_exists;
    
    -- إذا لم يكن هناك سجل في جدول profiles، نقوم بإنشائه
    IF NOT profile_exists THEN
      INSERT INTO profiles (
        id,
        email,
        name,
        avatar_url,
        country_code,
        language,
        created_at,
        updated_at
      )
      VALUES (
        user_record.id,
        user_record.email,
        COALESCE(user_record.raw_user_meta_data->>'name', user_record.email),
        COALESCE(user_record.raw_user_meta_data->>'avatar', 'https://ui-avatars.com/api/?name=' || COALESCE(user_record.raw_user_meta_data->>'name', user_record.email) || '&background=random'),
        COALESCE(user_record.raw_user_meta_data->>'country_code', 'US'),
        COALESCE(user_record.raw_user_meta_data->>'language', 'ar'),
        user_record.created_at,
        now()
      );
      
      RAISE NOTICE 'تم إنشاء سجل في جدول profiles للمستخدم: %', user_record.email;
    END IF;
  END LOOP;
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
