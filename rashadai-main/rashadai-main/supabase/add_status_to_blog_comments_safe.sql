-- إضافة عمود status إلى جدول blog_comments بطريقة آمنة

-- التحقق من وجود عمود status في جدول blog_comments وإضافته إذا لم يكن موجودًا
DO $$
BEGIN
  -- التحقق من وجود جدول blog_comments
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'blog_comments'
  ) THEN
    -- التحقق من وجود عمود status
    IF NOT EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'blog_comments'
      AND column_name = 'status'
    ) THEN
      -- إضافة عمود status إذا لم يكن موجودًا
      ALTER TABLE blog_comments
      ADD COLUMN status TEXT DEFAULT 'pending';
      
      RAISE NOTICE 'تمت إضافة عمود status إلى جدول blog_comments';
      
      -- تحديث قيم عمود status بناءً على عمود approved
      BEGIN
        UPDATE blog_comments
        SET status = CASE 
          WHEN approved = true THEN 'approved'
          ELSE 'pending'
        END;
        
        RAISE NOTICE 'تم تحديث قيم عمود status للتعليقات الحالية';
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'خطأ في تحديث قيم عمود status: %', SQLERRM;
      END;
    ELSE
      RAISE NOTICE 'عمود status موجود بالفعل في جدول blog_comments';
    END IF;
  ELSE
    RAISE NOTICE 'جدول blog_comments غير موجود';
  END IF;
END
$$;
