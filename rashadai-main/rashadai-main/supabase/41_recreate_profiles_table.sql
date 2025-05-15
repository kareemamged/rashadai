-- إعادة إنشاء جدول profiles بشكل صحيح

-- حذف المحفزات المرتبطة بجدول profiles أولاً لتجنب الأخطاء
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS create_profile_after_signup ON auth.users CASCADE;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles CASCADE;

-- حذف المحفز create_profile_trigger على جدول auth.users
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users CASCADE;

-- حذف الدوال المرتبطة بالمحفزات مع CASCADE
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_for_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_profiles_updated_at_column() CASCADE;

-- حذف جدول profiles إذا كان موجوداً
DROP TABLE IF EXISTS profiles CASCADE;

-- إنشاء جدول profiles من جديد
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar TEXT,
  country_code TEXT DEFAULT 'SA',
  phone TEXT,
  bio TEXT,
  language TEXT DEFAULT 'ar',
  website TEXT,
  gender TEXT,
  birth_date TEXT,
  profession TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
