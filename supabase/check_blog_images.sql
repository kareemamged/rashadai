-- التحقق من مسارات الصور في جدول المنشورات

-- 1. عرض مسارات الصور الحالية
SELECT id, title, image_url FROM blog_posts;

-- 2. التحقق من المنشورات التي ليس لها صور
SELECT id, title FROM blog_posts WHERE image_url IS NULL OR image_url = '';

-- 3. تحديث المنشورات التي ليس لها صور لاستخدام الصورة الافتراضية
UPDATE blog_posts
SET image_url = '/images/blog/default.webp'
WHERE image_url IS NULL OR image_url = '';

-- 4. التحقق من المنشورات التي تستخدم مسارات نسبية بدون الدومين الكامل
SELECT id, title, image_url FROM blog_posts 
WHERE image_url LIKE '/images/%' OR image_url LIKE 'images/%';

-- 5. التحقق من المنشورات التي تستخدم روابط Supabase Storage
SELECT id, title, image_url FROM blog_posts 
WHERE image_url LIKE '%supabase.co%';

-- 6. التحقق من النتائج بعد التحديث
SELECT id, title, image_url FROM blog_posts;
