-- إصلاح روابط الصور في قاعدة البيانات

-- 1. عرض روابط الصور الحالية
SELECT id, title, image_url
FROM blog_posts
WHERE published = true
ORDER BY created_at DESC;

-- 2. إصلاح الروابط التي تبدأ بـ /images/blog/
UPDATE blog_posts
SET image_url = REPLACE(image_url, '/images/blog/', 'https://voiwxfqryobznmxgpamq.supabase.co/storage/v1/object/public/images/blog/')
WHERE image_url LIKE '/images/blog/%';

-- 3. إصلاح الروابط التي تبدأ بـ /blog/
UPDATE blog_posts
SET image_url = REPLACE(image_url, '/blog/', 'https://voiwxfqryobznmxgpamq.supabase.co/storage/v1/object/public/images/blog/')
WHERE image_url LIKE '/blog/%';

-- 4. إصلاح الروابط التي تبدأ بـ blog/
UPDATE blog_posts
SET image_url = CONCAT('https://voiwxfqryobznmxgpamq.supabase.co/storage/v1/object/public/images/', image_url)
WHERE image_url LIKE 'blog/%';

-- 5. إصلاح الروابط التي لا تحتوي على مسار
UPDATE blog_posts
SET image_url = CONCAT('https://voiwxfqryobznmxgpamq.supabase.co/storage/v1/object/public/images/blog/', image_url)
WHERE image_url NOT LIKE 'http%' 
  AND image_url NOT LIKE '/images/%' 
  AND image_url NOT LIKE '/blog/%' 
  AND image_url NOT LIKE 'blog/%'
  AND image_url NOT LIKE 'https://voiwxfqryobznmxgpamq.supabase.co/%';

-- 6. تعيين صورة افتراضية للمنشورات التي ليس لها صورة
UPDATE blog_posts
SET image_url = 'https://voiwxfqryobznmxgpamq.supabase.co/storage/v1/object/public/images/blog/default.webp'
WHERE image_url IS NULL OR image_url = '';

-- 7. عرض روابط الصور بعد الإصلاح
SELECT id, title, image_url
FROM blog_posts
WHERE published = true
ORDER BY created_at DESC;
