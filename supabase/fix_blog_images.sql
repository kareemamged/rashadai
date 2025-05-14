-- إصلاح مشكلة صور المنشورات

-- 1. التحقق من سياسات الوصول لمخزن الصور
-- إنشاء سياسة تسمح بالوصول العام للقراءة لمجلد blog في مخزن images
BEGIN;

-- التحقق من وجود مخزن images
DO $$
BEGIN
    -- محاولة إنشاء مخزن images إذا لم يكن موجودًا
    -- ملاحظة: هذا لا يعمل مباشرة في SQL، ولكن يمكن تنفيذه من خلال واجهة Supabase أو API
    -- هذا مجرد تذكير بأنه يجب التأكد من وجود المخزن
    RAISE NOTICE 'تأكد من وجود مخزن images في Supabase Storage';
END $$;

-- إنشاء سياسة وصول عامة للقراءة لمخزن images
-- ملاحظة: هذا لا يعمل مباشرة في SQL، ولكن يمكن تنفيذه من خلال واجهة Supabase أو API
-- هذا مجرد تذكير بأنه يجب التأكد من وجود سياسة الوصول
DO $$
BEGIN
    RAISE NOTICE 'تأكد من وجود سياسة وصول عامة للقراءة لمخزن images في Supabase Storage';
END $$;

-- 2. التحقق من حقل image_url في جدول blog_posts
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'blog_posts' AND column_name = 'image_url';

-- 3. التحقق من المنشورات التي لها صور
SELECT id, title, image_url
FROM blog_posts
WHERE image_url IS NOT NULL;

-- 4. التحقق من المنشورات التي ليس لها صور
SELECT id, title, image_url
FROM blog_posts
WHERE image_url IS NULL OR image_url = '';

-- 5. تحديث المنشورات التي ليس لها صور لاستخدام صورة افتراضية
UPDATE blog_posts
SET image_url = '/images/blog/default.webp'
WHERE image_url IS NULL OR image_url = '';

-- 6. التحقق من تنسيق روابط الصور وإصلاحها
-- إذا كانت الروابط تبدأ بـ /blog/
UPDATE blog_posts
SET image_url = CONCAT('https://voiwxfqryobznmxgpamq.supabase.co/storage/v1/object/public/images/blog/', SUBSTRING(image_url, 7))
WHERE image_url LIKE '/blog/%';

-- إذا كانت الروابط تبدأ بـ blog/ (بدون / في البداية)
UPDATE blog_posts
SET image_url = CONCAT('https://voiwxfqryobznmxgpamq.supabase.co/storage/v1/object/public/images/', image_url)
WHERE image_url LIKE 'blog/%';

-- إذا كانت الروابط تحتوي على اسم الملف فقط (بدون مسار)
UPDATE blog_posts
SET image_url = CONCAT('https://voiwxfqryobznmxgpamq.supabase.co/storage/v1/object/public/images/blog/', image_url)
WHERE image_url NOT LIKE 'http%' AND image_url NOT LIKE '/images/%' AND image_url NOT LIKE '/blog/%' AND image_url NOT LIKE 'blog/%';

-- 7. التحقق من المنشورات بعد التحديث
SELECT id, title, image_url
FROM blog_posts;

COMMIT;
