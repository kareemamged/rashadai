-- التحقق من وجود عمود role في جدول profiles وإضافته إذا لم يكن موجودًا
DO $$
BEGIN
  -- التحقق من وجود جدول profiles
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'profiles'
  ) THEN
    -- التحقق من وجود عمود role
    IF NOT EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'role'
    ) THEN
      -- إضافة عمود role إذا لم يكن موجودًا
      ALTER TABLE profiles
      ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

      RAISE NOTICE 'تمت إضافة عمود role إلى جدول profiles';

      -- تحديث قيم عمود role للمستخدمين الحاليين
      UPDATE profiles
      SET role = CASE
        WHEN email IN ('kemoamego@gmail.com', 'kemoamego@icloud.com') THEN 'admin'
        ELSE 'user'
      END;

      RAISE NOTICE 'تم تحديث قيم عمود role للمستخدمين الحاليين';
    ELSE
      RAISE NOTICE 'عمود role موجود بالفعل في جدول profiles';
    END IF;
  ELSE
    -- إنشاء جدول profiles إذا لم يكن موجودًا
    CREATE TABLE profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      name TEXT,
      email TEXT,
      avatar TEXT,
      role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      country_code TEXT,
      language TEXT DEFAULT 'ar',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    RAISE NOTICE 'تم إنشاء جدول profiles مع عمود role';

    -- إدراج سجلات للمستخدمين الحاليين
    INSERT INTO profiles (id, email, name, role)
    SELECT
      id,
      email,
      COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
      CASE
        WHEN email IN ('kemoamego@gmail.com', 'kemoamego@icloud.com') THEN 'admin'
        ELSE 'user'
      END
    FROM auth.users
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'تم إدراج سجلات للمستخدمين الحاليين في جدول profiles';
  END IF;
END
$$;

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  content_en TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('tips', 'news')),
  published BOOLEAN DEFAULT false,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  dislikes_count INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policy for anyone to select published posts
CREATE POLICY blog_posts_select_policy ON blog_posts
  FOR SELECT USING (
    published = true OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create policy for admins to insert posts
CREATE POLICY blog_posts_insert_policy ON blog_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create policy for admins to update posts
CREATE POLICY blog_posts_update_policy ON blog_posts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create policy for admins to delete posts
CREATE POLICY blog_posts_delete_policy ON blog_posts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create a function to update the updated_at timestamp (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at timestamp (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_blog_posts_updated_at'
  ) THEN
    CREATE TRIGGER update_blog_posts_updated_at
      BEFORE UPDATE ON blog_posts
      FOR EACH ROW
      EXECUTE PROCEDURE update_updated_at_column();
  END IF;
END
$$;

-- Create blog_comments table
CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  author_name TEXT,
  author_email TEXT,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0,
  dislikes_count INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Create policy for anyone to select approved comments
CREATE POLICY blog_comments_select_policy ON blog_comments
  FOR SELECT USING (
    approved = true OR status = 'approved' OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    ) OR
    auth.uid() = user_id
  );

-- Create policy for authenticated users to insert comments
CREATE POLICY blog_comments_insert_policy ON blog_comments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- Create policy for admins to update comments
CREATE POLICY blog_comments_update_policy ON blog_comments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    ) OR
    auth.uid() = user_id
  );

-- Create policy for admins to delete comments
CREATE POLICY blog_comments_delete_policy ON blog_comments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    ) OR
    auth.uid() = user_id
  );

-- Create a trigger to update the updated_at timestamp (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_blog_comments_updated_at'
  ) THEN
    CREATE TRIGGER update_blog_comments_updated_at
      BEFORE UPDATE ON blog_comments
      FOR EACH ROW
      EXECUTE PROCEDURE update_updated_at_column();
  END IF;
END
$$;
