-- إصلاح مشكلة عمود role في جدول profiles

-- 1. التحقق من وجود عمود role في جدول profiles وإضافته إذا لم يكن موجودًا
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
  
  -- تمكين سياسات الأمان على جدول profiles
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  
  -- إنشاء سياسة للسماح للمستخدمين بعرض ملفاتهم الشخصية
  DROP POLICY IF EXISTS profiles_select_policy ON profiles;
  CREATE POLICY profiles_select_policy ON profiles
    FOR SELECT USING (
      auth.uid() = id OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );
  
  -- إنشاء سياسة للسماح للمستخدمين بتحديث ملفاتهم الشخصية
  DROP POLICY IF EXISTS profiles_update_policy ON profiles;
  CREATE POLICY profiles_update_policy ON profiles
    FOR UPDATE USING (
      auth.uid() = id OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );
  
  RAISE NOTICE 'تم تمكين سياسات الأمان على جدول profiles';
END
$$;

-- 2. إعادة إنشاء سياسات الأمان لجدول blog_posts
DO $$
BEGIN
  -- التحقق من وجود جدول blog_posts
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'blog_posts'
  ) THEN
    -- حذف السياسات الحالية
    DROP POLICY IF EXISTS blog_posts_select_policy ON blog_posts;
    DROP POLICY IF EXISTS blog_posts_insert_policy ON blog_posts;
    DROP POLICY IF EXISTS blog_posts_update_policy ON blog_posts;
    DROP POLICY IF EXISTS blog_posts_delete_policy ON blog_posts;
    
    -- إنشاء سياسات جديدة
    -- سياسة للسماح لأي شخص بعرض المنشورات المنشورة
    CREATE POLICY blog_posts_select_policy ON blog_posts
      FOR SELECT USING (
        published = true OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
    
    -- سياسة للسماح للمشرفين بإدراج منشورات
    CREATE POLICY blog_posts_insert_policy ON blog_posts
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
    
    -- سياسة للسماح للمشرفين بتحديث المنشورات
    CREATE POLICY blog_posts_update_policy ON blog_posts
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
    
    -- سياسة للسماح للمشرفين بحذف المنشورات
    CREATE POLICY blog_posts_delete_policy ON blog_posts
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
    
    RAISE NOTICE 'تم إعادة إنشاء سياسات الأمان لجدول blog_posts';
  END IF;
END
$$;

-- 3. إعادة إنشاء سياسات الأمان لجدول blog_comments
DO $$
BEGIN
  -- التحقق من وجود جدول blog_comments
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'blog_comments'
  ) THEN
    -- حذف السياسات الحالية
    DROP POLICY IF EXISTS blog_comments_select_policy ON blog_comments;
    DROP POLICY IF EXISTS blog_comments_insert_policy ON blog_comments;
    DROP POLICY IF EXISTS blog_comments_update_policy ON blog_comments;
    DROP POLICY IF EXISTS blog_comments_delete_policy ON blog_comments;
    
    -- إنشاء سياسات جديدة
    -- سياسة للسماح لأي شخص بعرض التعليقات المعتمدة
    CREATE POLICY blog_comments_select_policy ON blog_comments
      FOR SELECT USING (
        approved = true OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        ) OR
        auth.uid() = user_id
      );
    
    -- سياسة للسماح للمستخدمين المسجلين بإضافة تعليقات
    CREATE POLICY blog_comments_insert_policy ON blog_comments
      FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
      );
    
    -- سياسة للسماح للمشرفين وأصحاب التعليقات بتحديث التعليقات
    CREATE POLICY blog_comments_update_policy ON blog_comments
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        ) OR
        auth.uid() = user_id
      );
    
    -- سياسة للسماح للمشرفين وأصحاب التعليقات بحذف التعليقات
    CREATE POLICY blog_comments_delete_policy ON blog_comments
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        ) OR
        auth.uid() = user_id
      );
    
    RAISE NOTICE 'تم إعادة إنشاء سياسات الأمان لجدول blog_comments';
  END IF;
END
$$;
