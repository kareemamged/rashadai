-- التحقق من روابط الصور في قاعدة البيانات
SELECT id, title, image_url
FROM blog_posts
WHERE published = true
ORDER BY created_at DESC;
