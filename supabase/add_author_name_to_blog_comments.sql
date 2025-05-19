-- إضافة عمود author_name إلى جدول blog_comments

-- التحقق من وجود عمود author_name في جدول blog_comments وإضافته إذا لم يكن موجودًا
DO $$
BEGIN
  -- التحقق من وجود جدول blog_comments
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'blog_comments'
  ) THEN
    -- التحقق من وجود عمود author_name
    IF NOT EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'blog_comments'
      AND column_name = 'author_name'
    ) THEN
      -- إضافة عمود author_name إذا لم يكن موجودًا
      ALTER TABLE blog_comments
      ADD COLUMN author_name TEXT;
      
      RAISE NOTICE 'تمت إضافة عمود author_name إلى جدول blog_comments';
      
      -- تحديث قيم عمود author_name بناءً على عمود user_name
      UPDATE blog_comments
      SET author_name = user_name
      WHERE user_name IS NOT NULL;
      
      -- تحديث قيم عمود author_name بناءً على بيانات المستخدمين
      UPDATE blog_comments c
      SET author_name = COALESCE(p.name, u.email)
      FROM auth.users u
      LEFT JOIN profiles p ON u.id = p.id
      WHERE c.user_id = u.id AND c.author_name IS NULL;
      
      RAISE NOTICE 'تم تحديث قيم عمود author_name للتعليقات الحالية';
    ELSE
      RAISE NOTICE 'عمود author_name موجود بالفعل في جدول blog_comments';
    END IF;
  ELSE
    RAISE NOTICE 'جدول blog_comments غير موجود';
  END IF;
END
$$;
