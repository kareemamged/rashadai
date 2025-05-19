-- إنشاء نظام آمن لتحديث المنشورات المجدولة

-- 1. إنشاء جدول لتتبع آخر تحديث للمنشورات المجدولة
CREATE TABLE IF NOT EXISTS scheduled_posts_tracker (
  id SERIAL PRIMARY KEY,
  last_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_running BOOLEAN DEFAULT FALSE
);

-- إدراج سجل أولي إذا لم يكن موجودًا
INSERT INTO scheduled_posts_tracker (id, last_check, is_running)
SELECT 1, NOW(), FALSE
WHERE NOT EXISTS (SELECT 1 FROM scheduled_posts_tracker WHERE id = 1);

-- 2. إنشاء وظيفة آمنة لتحديث المنشورات المجدولة
CREATE OR REPLACE FUNCTION safe_update_scheduled_posts()
RETURNS void AS $$
DECLARE
  is_already_running BOOLEAN;
BEGIN
  -- التحقق مما إذا كانت العملية قيد التشغيل بالفعل
  SELECT is_running INTO is_already_running FROM scheduled_posts_tracker WHERE id = 1;
  
  -- إذا كانت العملية قيد التشغيل بالفعل، فلا تفعل شيئًا
  IF is_already_running THEN
    RETURN;
  END IF;
  
  -- تحديث حالة التشغيل
  UPDATE scheduled_posts_tracker SET is_running = TRUE, last_check = NOW() WHERE id = 1;
  
  -- تحديث المنشورات المجدولة
  UPDATE blog_posts
  SET 
    status = 'published',
    published = true,
    updated_at = NOW()
  WHERE 
    status = 'scheduled' 
    AND scheduled_at <= NOW();
    
  -- إعادة تعيين حالة التشغيل
  UPDATE scheduled_posts_tracker SET is_running = FALSE WHERE id = 1;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;
