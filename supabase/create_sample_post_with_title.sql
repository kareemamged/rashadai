-- إنشاء منشور نموذجي مع تحديد قيمة لحقل "title"

-- 1. إنشاء منشور نموذجي
INSERT INTO blog_posts (
  title,
  title_en,
  title_ar,
  content,
  content_en,
  content_ar,
  category,
  status,
  published,
  created_at,
  updated_at,
  image_url
) VALUES (
  'Sample Post - Test',
  'Sample Post - Test',
  'منشور نموذجي - اختبار',
  'This is a sample post for testing purposes.',
  'This is a sample post for testing purposes.',
  'هذا منشور نموذجي لأغراض الاختبار.',
  'tips',
  'published',
  true,
  NOW(),
  NOW(),
  '/images/blog/default.webp'
);

-- 2. التحقق من إنشاء المنشور
SELECT id, title, title_en, title_ar, published, status FROM blog_posts
ORDER BY created_at DESC LIMIT 1;
