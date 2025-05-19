-- تحديث جدول blog_posts لدعم المتطلبات الجديدة

-- إضافة أعمدة جديدة إلى جدول blog_posts إذا لم تكن موجودة
DO $$
BEGIN
  -- إضافة عمود summary_en للوصف المختصر باللغة الإنجليزية
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'summary_en'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN summary_en TEXT;
  END IF;

  -- إضافة عمود summary_ar للوصف المختصر باللغة العربية
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'summary_ar'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN summary_ar TEXT;
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
    ALTER TABLE blog_posts ADD COLUMN status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled'));
  END IF;

  -- تحديث الأعمدة الموجودة للمنشورات الحالية
  UPDATE blog_posts
  SET 
    summary_en = SUBSTRING(content_en, 1, 200),
    summary_ar = SUBSTRING(content_ar, 1, 200),
    status = CASE WHEN published = true THEN 'published' ELSE 'draft' END
  WHERE summary_en IS NULL OR summary_ar IS NULL;

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
