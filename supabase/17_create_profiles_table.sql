-- التحقق من وجود جدول profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    -- إنشاء جدول profiles إذا لم يكن موجودًا
    CREATE TABLE profiles (
      id UUID PRIMARY KEY,
      email TEXT,
      name TEXT,
      role TEXT DEFAULT 'user',
      avatar_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- إضافة قيد المفتاح الأجنبي
    ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  ELSE
    -- التأكد من وجود جميع الأعمدة المطلوبة
    BEGIN
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error adding columns: %', SQLERRM;
    END;
  END IF;
END
$$;
