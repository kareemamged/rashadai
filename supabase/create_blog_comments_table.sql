-- إنشاء جدول blog_comments من الصفر

-- التحقق من وجود جدول blog_comments وإنشائه إذا لم يكن موجودًا
DO $$
BEGIN
  -- التحقق من وجود جدول blog_comments
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'blog_comments'
  ) THEN
    -- إنشاء جدول blog_comments
    CREATE TABLE blog_comments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
      user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      content TEXT NOT NULL,
      approved BOOLEAN DEFAULT FALSE,
      status TEXT DEFAULT 'pending',
      author_name TEXT,
      author_email TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    RAISE NOTICE 'تم إنشاء جدول blog_comments';
    
    -- إنشاء سياسات الأمان لجدول blog_comments
    -- سياسة للسماح لأي شخص بعرض التعليقات المعتمدة
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
    
    -- تفعيل RLS على الجدول
    ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'تم إنشاء سياسات الأمان لجدول blog_comments';
  ELSE
    RAISE NOTICE 'جدول blog_comments موجود بالفعل';
  END IF;
END
$$;
