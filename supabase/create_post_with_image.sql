-- إنشاء منشور نموذجي مع صورة

-- 1. إنشاء منشور نموذجي مع صورة
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
  'Test Post with Image',
  'Test Post with Image',
  'منشور اختباري مع صورة',
  'This is a test post with an image.',
  'This is a test post with an image.',
  'هذا منشور اختباري مع صورة.',
  'tips',
  'published',
  true,
  NOW(),
  NOW(),
  'https://voiwxfqryobznmxgpamq.supabase.co/storage/v1/object/public/images/blog/default.webp'
);

-- 2. التحقق من إنشاء المنشور
SELECT id, title, title_en, title_ar, published, status, image_url FROM blog_posts
ORDER BY created_at DESC LIMIT 1;
