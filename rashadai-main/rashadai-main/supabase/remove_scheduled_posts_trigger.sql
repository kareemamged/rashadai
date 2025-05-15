-- إزالة المشغل والوظائف المتعلقة بالمنشورات المجدولة

-- حذف المشغل
DROP TRIGGER IF EXISTS check_scheduled_posts_trigger ON blog_posts;

-- حذف الوظائف
DROP FUNCTION IF EXISTS check_scheduled_posts();
DROP FUNCTION IF EXISTS update_scheduled_posts();

-- إنشاء وظيفة بسيطة لتحديث المنشورات المجدولة يدويًا
CREATE OR REPLACE FUNCTION manual_update_scheduled_posts()
RETURNS void AS $$
BEGIN
  -- تحديث المنشورات المجدولة التي حان وقت نشرها
  UPDATE blog_posts
  SET 
    status = 'published',
    published = true,
    updated_at = NOW()
  WHERE 
    status = 'scheduled' 
    AND scheduled_at <= NOW();
END;
$$ LANGUAGE plpgsql;
