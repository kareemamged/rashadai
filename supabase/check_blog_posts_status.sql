-- التحقق من حالة المنشورات وإصلاح أي مشاكل إضافية

-- 1. عرض جميع المنشورات مع حالتها
SELECT 
  id, 
  title_en, 
  published, 
  status, 
  created_at, 
  updated_at 
FROM blog_posts
ORDER BY created_at DESC;

-- 2. عرض عدد المنشورات حسب الحالة
SELECT 
  status, 
  published, 
  COUNT(*) as count 
FROM blog_posts 
GROUP BY status, published;

-- 3. التحقق من المنشورات التي لها حالة غير متسقة (published = true ولكن status != 'published')
SELECT 
  id, 
  title_en, 
  published, 
  status 
FROM blog_posts 
WHERE (published = true AND status != 'published') 
   OR (published = false AND status = 'published');

-- 4. إصلاح المنشورات التي لها حالة غير متسقة
UPDATE blog_posts
SET status = 'published'
WHERE published = true AND status != 'published';

UPDATE blog_posts
SET status = 'draft'
WHERE published = false AND status = 'published';

-- 5. التحقق من المنشورات التي ليس لها عنوان باللغة الإنجليزية أو العربية
SELECT 
  id, 
  title, 
  title_en, 
  title_ar 
FROM blog_posts 
WHERE (title_en IS NULL OR title_en = '') 
   OR (title_ar IS NULL OR title_ar = '');

-- 6. إصلاح المنشورات التي ليس لها عنوان باللغة الإنجليزية أو العربية
UPDATE blog_posts
SET title_en = title
WHERE (title_en IS NULL OR title_en = '') AND title IS NOT NULL;

UPDATE blog_posts
SET title_ar = 'بدون عنوان'
WHERE title_ar IS NULL OR title_ar = '';

-- 7. التحقق من المنشورات التي ليس لها محتوى باللغة الإنجليزية أو العربية
SELECT 
  id, 
  title_en, 
  content, 
  content_en, 
  content_ar 
FROM blog_posts 
WHERE (content_en IS NULL OR content_en = '') 
   OR (content_ar IS NULL OR content_ar = '');

-- 8. إصلاح المنشورات التي ليس لها محتوى باللغة الإنجليزية أو العربية
UPDATE blog_posts
SET content_en = content
WHERE (content_en IS NULL OR content_en = '') AND content IS NOT NULL;

UPDATE blog_posts
SET content_ar = 'لا يوجد محتوى باللغة العربية'
WHERE content_ar IS NULL OR content_ar = '';
