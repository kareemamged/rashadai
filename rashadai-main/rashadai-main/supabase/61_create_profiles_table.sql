-- الجزء الأول: إنشاء جدول profiles وإعداد سياسات الأمان

-- 1. إنشاء جدول profiles إذا لم يكن موجودًا
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar TEXT,
  country_code TEXT DEFAULT 'EG',
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

-- 2. إضافة سياسات الأمان للجدول
-- إعادة تعيين سياسات الأمان
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- إضافة سياسات الأمان الجديدة
CREATE POLICY "Profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- 3. التأكد من تفعيل RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
