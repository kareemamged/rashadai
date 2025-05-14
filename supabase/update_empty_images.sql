-- تحديث روابط الصور الفارغة في قاعدة البيانات لاستخدام الصورة البديلة
-- ملاحظة: تم تعديل النظام ليكون رفع صورة المنشور إجباري على الناشر

-- 1. عرض المنشورات التي ليس لها صورة
SELECT id, title_en, image_url
FROM blog_posts
WHERE image_url IS NULL OR image_url = '';

-- 2. تحديث المنشورات التي ليس لها صورة لاستخدام الصورة البديلة
UPDATE blog_posts
SET image_url = 'https://voiwxfqryobznmxgpamq.supabase.co/storage/v1/object/public/images/blog/default.webp'
WHERE image_url IS NULL OR image_url = '';

-- 3. تحديث المنشورات التي تستخدم الصورة الافتراضية القديمة
UPDATE blog_posts
SET image_url = 'https://voiwxfqryobznmxgpamq.supabase.co/storage/v1/object/public/images/blog/default.webp'
WHERE image_url = '/images/blog/default.jpg' OR image_url = '/images/blog/default.webp';

-- 4. تحديث المنشورات التي تستخدم مسارات محلية أخرى
UPDATE blog_posts
SET image_url = 'https://voiwxfqryobznmxgpamq.supabase.co/storage/v1/object/public/images/blog/default.webp'
WHERE image_url LIKE '/images/%' AND image_url != 'https://voiwxfqryobznmxgpamq.supabase.co/storage/v1/object/public/images/blog/default.webp';

-- 5. عرض المنشورات بعد التحديث
SELECT id, title_en, image_url
FROM blog_posts
ORDER BY created_at DESC;
