-- إصلاح حقل "title" في المنشورات الموجودة

-- 1. تحديث حقل "title" للمنشورات التي لها title_en
UPDATE blog_posts
SET title = title_en
WHERE title IS NULL AND title_en IS NOT NULL;

-- 2. تحديث حقل "title" للمنشورات التي لها title_ar ولكن ليس لها title_en
UPDATE blog_posts
SET title = title_ar
WHERE title IS NULL AND title_ar IS NOT NULL AND title_en IS NULL;

-- 3. تحديث حقل "title" للمنشورات التي ليس لها title_en ولا title_ar
UPDATE blog_posts
SET title = 'Untitled Post'
WHERE title IS NULL AND title_en IS NULL AND title_ar IS NULL;

-- 4. التحقق من المنشورات بعد التحديث
SELECT id, title, title_en, title_ar, published, status FROM blog_posts;
