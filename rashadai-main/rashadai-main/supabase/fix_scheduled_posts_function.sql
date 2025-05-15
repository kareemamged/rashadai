-- إصلاح وظيفة update_scheduled_posts التي تسبب تجاوز عمق المكدس

-- حذف المشغلات والوظائف الموجودة
DROP TRIGGER IF EXISTS check_scheduled_posts_trigger ON blog_posts;
DROP FUNCTION IF EXISTS check_scheduled_posts();
DROP FUNCTION IF EXISTS update_scheduled_posts();

-- إنشاء وظيفة جديدة لتحديث المنشورات المجدولة
-- هذه الوظيفة تقوم بتحديث المنشورات المجدولة مباشرة بدون استدعاء وظائف أخرى
CREATE OR REPLACE FUNCTION check_scheduled_posts()
RETURNS trigger AS $$
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

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- إنشاء مشغل لتنفيذ الوظيفة عند إدراج أو تحديث المنشورات
CREATE TRIGGER check_scheduled_posts_trigger
AFTER INSERT OR UPDATE ON blog_posts
FOR EACH STATEMENT
EXECUTE FUNCTION check_scheduled_posts();
