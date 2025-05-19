-- إصلاح بسيط لمشكلة المنشورات

-- 1. تحديث جميع المنشورات لتكون منشورة
UPDATE blog_posts
SET published = true, status = 'published';

-- 2. التحقق من المنشورات بعد التحديث
SELECT id, title_en, published, status FROM blog_posts;
