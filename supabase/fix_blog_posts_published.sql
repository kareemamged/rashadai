-- إصلاح مشكلة عدم ظهور المنشورات المنشورة في صفحة المدونة

-- 1. التحقق من المنشورات الموجودة
SELECT id, title_en, title_ar, published, status FROM blog_posts;

-- 2. تحديث جميع المنشورات التي حالتها 'published' لتكون منشورة
UPDATE blog_posts
SET published = true
WHERE status = 'published' AND published IS NOT TRUE;

-- 3. تحديث جميع المنشورات التي حالتها 'draft' لتكون غير منشورة
UPDATE blog_posts
SET published = false
WHERE status = 'draft' AND published IS NOT FALSE;

-- 4. إنشاء منشور نموذجي للتأكد من عمل الصفحة
INSERT INTO blog_posts (
  title_en,
  title_ar,
  summary_en,
  summary_ar,
  content_en,
  content_ar,
  category,
  status,
  published,
  created_at,
  updated_at,
  image_url
) VALUES (
  'Test Post - Please Delete',
  'منشور اختباري - يرجى الحذف',
  'This is a test post to verify that the blog page is working correctly.',
  'هذا منشور اختباري للتحقق من أن صفحة المدونة تعمل بشكل صحيح.',
  'This is a test post created to verify that the blog page is displaying posts correctly. You can delete this post after confirming that everything is working as expected.',
  'هذا منشور اختباري تم إنشاؤه للتحقق من أن صفحة المدونة تعرض المنشورات بشكل صحيح. يمكنك حذف هذا المنشور بعد التأكد من أن كل شيء يعمل كما هو متوقع.',
  'tips',
  'published',
  true,
  NOW(),
  NOW(),
  '/images/blog/default.webp'
);
