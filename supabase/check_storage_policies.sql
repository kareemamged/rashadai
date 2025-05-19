-- التحقق من سياسات مخزن الصور في Supabase

-- ملاحظة: هذا الاستعلام لا يعمل مباشرة في SQL، ولكنه يوفر إرشادات للتحقق من سياسات المخزن

/*
خطوات التحقق من سياسات المخزن في Supabase:

1. افتح لوحة تحكم Supabase
2. انتقل إلى قسم "Storage"
3. تحقق من وجود مخزن "images"
4. إذا لم يكن موجودًا، قم بإنشائه
5. انقر على مخزن "images"
6. انتقل إلى تبويب "Policies"
7. تأكد من وجود سياسة تسمح بالوصول العام للقراءة:
   - Policy Type: SELECT
   - Definition: true (للسماح بالوصول العام)
8. إذا لم تكن موجودة، قم بإنشائها:
   - انقر على "New Policy"
   - اختر "Get objects by prefix (public)"
   - اختر "For full bucket access"
   - انقر على "Create Policy"
9. تأكد أيضًا من وجود سياسة تسمح برفع الصور:
   - Policy Type: INSERT
   - Definition: true (للسماح بالرفع العام) أو role() = 'authenticated' (للمستخدمين المسجلين فقط)
*/

-- التحقق من المنشورات وروابط الصور الخاصة بها
SELECT id, title, image_url
FROM blog_posts
WHERE published = true
ORDER BY created_at DESC;
