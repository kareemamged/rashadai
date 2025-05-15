-- إصلاح بسيط لسياسات أمان الصفوف (RLS) لجدول blog_posts
-- يجب تنفيذ هذا السكريبت في محرر SQL في Supabase بصلاحيات المسؤول

-- 1. تمكين RLS على جدول blog_posts إذا لم يكن ممكنًا بالفعل
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- 2. حذف جميع السياسات الموجودة لجدول blog_posts
DROP POLICY IF EXISTS blog_posts_select_policy ON blog_posts;
DROP POLICY IF EXISTS blog_posts_insert_policy ON blog_posts;
DROP POLICY IF EXISTS blog_posts_update_policy ON blog_posts;
DROP POLICY IF EXISTS blog_posts_delete_policy ON blog_posts;
DROP POLICY IF EXISTS "Allow public read access" ON blog_posts;
DROP POLICY IF EXISTS "Allow authenticated insert" ON blog_posts;
DROP POLICY IF EXISTS "Allow authenticated update own posts" ON blog_posts;
DROP POLICY IF EXISTS "Allow authenticated delete own posts" ON blog_posts;
DROP POLICY IF EXISTS "Allow admin full access" ON blog_posts;
DROP POLICY IF EXISTS "Allow sample posts creation" ON blog_posts;

-- 3. إنشاء سياسة للسماح للجميع بقراءة جميع المنشورات (للاختبار فقط)
CREATE POLICY blog_posts_select_policy ON blog_posts
  FOR SELECT USING (true);

-- 4. إنشاء سياسة للسماح للجميع بإنشاء منشورات جديدة (للاختبار فقط)
CREATE POLICY blog_posts_insert_policy ON blog_posts
  FOR INSERT WITH CHECK (true);

-- 5. إنشاء سياسة للسماح للجميع بتحديث المنشورات (للاختبار فقط)
CREATE POLICY blog_posts_update_policy ON blog_posts
  FOR UPDATE USING (true);

-- 6. إنشاء سياسة للسماح للجميع بحذف المنشورات (للاختبار فقط)
CREATE POLICY blog_posts_delete_policy ON blog_posts
  FOR DELETE USING (true);

-- 7. تمكين RLS على جدول blog_comments
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- 8. حذف السياسات الموجودة لجدول blog_comments
DROP POLICY IF EXISTS blog_comments_select_policy ON blog_comments;
DROP POLICY IF EXISTS blog_comments_insert_policy ON blog_comments;
DROP POLICY IF EXISTS blog_comments_update_policy ON blog_comments;
DROP POLICY IF EXISTS blog_comments_delete_policy ON blog_comments;

-- 9. إنشاء سياسة للسماح للجميع بقراءة التعليقات (للاختبار فقط)
CREATE POLICY blog_comments_select_policy ON blog_comments
  FOR SELECT USING (true);

-- 10. إنشاء سياسة للسماح للجميع بإضافة تعليقات (للاختبار فقط)
CREATE POLICY blog_comments_insert_policy ON blog_comments
  FOR INSERT WITH CHECK (true);

-- 11. إنشاء سياسة للسماح للجميع بتحديث التعليقات (للاختبار فقط)
CREATE POLICY blog_comments_update_policy ON blog_comments
  FOR UPDATE USING (true);

-- 12. إنشاء سياسة للسماح للجميع بحذف التعليقات (للاختبار فقط)
CREATE POLICY blog_comments_delete_policy ON blog_comments
  FOR DELETE USING (true);
