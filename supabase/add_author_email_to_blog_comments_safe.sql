-- إضافة عمود author_email إلى جدول blog_comments بطريقة آمنة

-- التحقق من وجود عمود author_email في جدول blog_comments وإضافته إذا لم يكن موجودًا
DO $$
BEGIN
  -- التحقق من وجود جدول blog_comments
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'blog_comments'
  ) THEN
    -- التحقق من وجود عمود author_email
    IF NOT EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'blog_comments'
      AND column_name = 'author_email'
    ) THEN
      -- إضافة عمود author_email إذا لم يكن موجودًا
      ALTER TABLE blog_comments
      ADD COLUMN author_email TEXT;
      
      RAISE NOTICE 'تمت إضافة عمود author_email إلى جدول blog_comments';
      
      -- تحديث قيم عمود author_email بناءً على بيانات المستخدمين
      BEGIN
        UPDATE blog_comments c
        SET author_email = u.email
        FROM auth.users u
        WHERE c.user_id = u.id;
        
        RAISE NOTICE 'تم تحديث قيم عمود author_email للتعليقات الحالية';
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'خطأ في تحديث قيم عمود author_email: %', SQLERRM;
      END;
    ELSE
      RAISE NOTICE 'عمود author_email موجود بالفعل في جدول blog_comments';
    END IF;
  ELSE
    RAISE NOTICE 'جدول blog_comments غير موجود';
  END IF;
END
$$;
