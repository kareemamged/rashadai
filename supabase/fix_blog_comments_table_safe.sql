-- إصلاح جدول blog_comments بإضافة الأعمدة المطلوبة بطريقة آمنة

-- التحقق من وجود الأعمدة المطلوبة في جدول blog_comments وإضافتها إذا لم تكن موجودة
DO $$
DECLARE
  has_user_name BOOLEAN := FALSE;
BEGIN
  -- التحقق من وجود جدول blog_comments
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'blog_comments'
  ) THEN
    -- التحقق من وجود عمود user_name
    has_user_name := EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'blog_comments'
      AND column_name = 'user_name'
    );
    
    -- 1. التحقق من وجود عمود status
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
      UPDATE blog_comments
      SET status = CASE 
        WHEN approved = true THEN 'approved'
        ELSE 'pending'
      END;
      
      RAISE NOTICE 'تم تحديث قيم عمود status للتعليقات الحالية';
    ELSE
      RAISE NOTICE 'عمود status موجود بالفعل في جدول blog_comments';
    END IF;
    
    -- 2. التحقق من وجود عمود author_name
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
      
      -- تحديث قيم عمود author_name بناءً على عمود user_name إذا كان موجودًا
      IF has_user_name THEN
        UPDATE blog_comments
        SET author_name = user_name
        WHERE user_name IS NOT NULL;
        
        RAISE NOTICE 'تم تحديث قيم عمود author_name بناءً على عمود user_name';
      ELSE
        -- تحديث قيم عمود author_name بناءً على بيانات المستخدمين
        UPDATE blog_comments c
        SET author_name = COALESCE(p.name, u.email, 'Anonymous')
        FROM auth.users u
        LEFT JOIN profiles p ON u.id = p.id
        WHERE c.user_id = u.id;
        
        RAISE NOTICE 'تم تحديث قيم عمود author_name بناءً على بيانات المستخدمين';
      END IF;
    ELSE
      RAISE NOTICE 'عمود author_name موجود بالفعل في جدول blog_comments';
    END IF;
    
    -- 3. التحقق من وجود عمود author_email
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
      UPDATE blog_comments c
      SET author_email = u.email
      FROM auth.users u
      WHERE c.user_id = u.id;
      
      RAISE NOTICE 'تم تحديث قيم عمود author_email للتعليقات الحالية';
    ELSE
      RAISE NOTICE 'عمود author_email موجود بالفعل في جدول blog_comments';
    END IF;
    
    -- 4. التحقق من وجود عمود author_id
    IF NOT EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'blog_comments'
      AND column_name = 'author_id'
    ) THEN
      -- إضافة عمود author_id إذا لم يكن موجودًا
      ALTER TABLE blog_comments
      ADD COLUMN author_id TEXT;
      
      RAISE NOTICE 'تمت إضافة عمود author_id إلى جدول blog_comments';
      
      -- تحديث قيم عمود author_id بناءً على عمود user_id
      UPDATE blog_comments
      SET author_id = user_id::text
      WHERE user_id IS NOT NULL;
      
      RAISE NOTICE 'تم تحديث قيم عمود author_id للتعليقات الحالية';
    ELSE
      RAISE NOTICE 'عمود author_id موجود بالفعل في جدول blog_comments';
    END IF;
  ELSE
    RAISE NOTICE 'جدول blog_comments غير موجود';
  END IF;
END
$$;
