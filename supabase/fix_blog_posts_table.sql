-- تحديث جدول blog_posts لدعم المتطلبات الجديدة

-- التحقق من وجود الأعمدة قبل محاولة استخدامها
DO $$
DECLARE
  content_en_exists BOOLEAN;
  content_ar_exists BOOLEAN;
BEGIN
  -- التحقق من وجود عمود content_en
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'content_en'
  ) INTO content_en_exists;
  
  -- التحقق من وجود عمود content_ar
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'content_ar'
  ) INTO content_ar_exists;
  
  -- إضافة عمود summary_en للوصف المختصر باللغة الإنجليزية
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'summary_en'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN summary_en TEXT;
    
    -- تحديث قيم summary_en فقط إذا كان عمود content_en موجودًا
    IF content_en_exists THEN
      UPDATE blog_posts
      SET summary_en = SUBSTRING(content_en, 1, 200)
      WHERE summary_en IS NULL;
    END IF;
  END IF;

  -- إضافة عمود summary_ar للوصف المختصر باللغة العربية
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'summary_ar'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN summary_ar TEXT;
    
    -- تحديث قيم summary_ar فقط إذا كان عمود content_ar موجودًا
    IF content_ar_exists THEN
      UPDATE blog_posts
      SET summary_ar = SUBSTRING(content_ar, 1, 200)
      WHERE summary_ar IS NULL;
    END IF;
  END IF;

  -- إضافة عمود scheduled_at لجدولة نشر المنشور
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'scheduled_at'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN scheduled_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- إضافة عمود status لحالة المنشور (مسودة، منشور، مجدول)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'status'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN status TEXT DEFAULT 'draft';
    
    -- تحديث قيم status بناءً على قيمة published
    UPDATE blog_posts
    SET status = CASE WHEN published = true THEN 'published' ELSE 'draft' END
    WHERE status IS NULL;
    
    -- إضافة قيد CHECK للتأكد من أن قيمة status صحيحة
    ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_status_check 
      CHECK (status IN ('draft', 'published', 'scheduled'));
  END IF;

  RAISE NOTICE 'تم تحديث جدول blog_posts بنجاح';
END
$$;

-- إنشاء وظيفة لتحديث حالة المنشورات المجدولة
CREATE OR REPLACE FUNCTION update_scheduled_posts()
RETURNS void AS $$
BEGIN
  -- تحديث حالة المنشورات المجدولة التي حان وقت نشرها
  UPDATE blog_posts
  SET 
    status = 'published',
    published = true,
    updated_at = NOW()
  WHERE 
    status = 'scheduled' 
    AND scheduled_at <= NOW();
    
  RAISE NOTICE 'تم تحديث المنشورات المجدولة';
END;
$$ LANGUAGE plpgsql;

-- إنشاء وظيفة لتحديث حالة المنشورات المجدولة بشكل دوري
CREATE OR REPLACE FUNCTION check_scheduled_posts()
RETURNS trigger AS $$
BEGIN
  PERFORM update_scheduled_posts();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء محفز لتشغيل الوظيفة عند تحديث أي منشور
DROP TRIGGER IF EXISTS check_scheduled_posts_trigger ON blog_posts;
CREATE TRIGGER check_scheduled_posts_trigger
AFTER INSERT OR UPDATE ON blog_posts
FOR EACH STATEMENT
EXECUTE FUNCTION check_scheduled_posts();

-- تحديث سياسات الأمان لجدول blog_posts
DO $$
BEGIN
  -- حذف السياسات الموجودة
  DROP POLICY IF EXISTS blog_posts_select_policy ON blog_posts;
  DROP POLICY IF EXISTS blog_posts_insert_policy ON blog_posts;
  DROP POLICY IF EXISTS blog_posts_update_policy ON blog_posts;
  DROP POLICY IF EXISTS blog_posts_delete_policy ON blog_posts;

  -- إنشاء سياسة للسماح لأي شخص بعرض المنشورات المنشورة
  CREATE POLICY blog_posts_select_policy ON blog_posts
    FOR SELECT USING (
      status = 'published' OR
      EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
      )
    );

  -- إنشاء سياسة للسماح للمشرفين بإضافة منشورات
  CREATE POLICY blog_posts_insert_policy ON blog_posts
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
      )
    );

  -- إنشاء سياسة للسماح للمشرفين بتحديث المنشورات
  CREATE POLICY blog_posts_update_policy ON blog_posts
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
      )
    );

  -- إنشاء سياسة للسماح للمشرفين بحذف المنشورات
  CREATE POLICY blog_posts_delete_policy ON blog_posts
    FOR DELETE USING (
      EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
      )
    );
END
$$;
