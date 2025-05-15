-- إصلاح سياسات أمان الصفوف (RLS) لجدول blog_posts
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

-- 3. إنشاء سياسة للسماح للجميع بقراءة المنشورات المنشورة
CREATE POLICY blog_posts_select_policy ON blog_posts
  FOR SELECT USING (published = true OR (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  ));

-- 4. إنشاء سياسة للسماح للمسؤولين بإنشاء منشورات جديدة
CREATE POLICY blog_posts_insert_policy ON blog_posts
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

-- 5. إنشاء سياسة للسماح للمسؤولين بتحديث المنشورات
CREATE POLICY blog_posts_update_policy ON blog_posts
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

-- 6. إنشاء سياسة للسماح للمسؤولين بحذف المنشورات
CREATE POLICY blog_posts_delete_policy ON blog_posts
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

-- 7. تمكين RLS على جدول blog_comments
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- 8. حذف السياسات الموجودة لجدول blog_comments
DROP POLICY IF EXISTS blog_comments_select_policy ON blog_comments;
DROP POLICY IF EXISTS blog_comments_insert_policy ON blog_comments;
DROP POLICY IF EXISTS blog_comments_update_policy ON blog_comments;
DROP POLICY IF EXISTS blog_comments_delete_policy ON blog_comments;

-- 9. إنشاء سياسة للسماح للجميع بقراءة التعليقات على المنشورات المنشورة
CREATE POLICY blog_comments_select_policy ON blog_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM blog_posts
      WHERE blog_posts.id = blog_comments.post_id
      AND blog_posts.published = true
    ) OR (
      auth.uid() IS NOT NULL AND EXISTS (
        SELECT 1 FROM admin_users WHERE user_id = auth.uid()
      )
    )
  );

-- 10. إنشاء سياسة للسماح للمستخدمين المصادق عليهم بإضافة تعليقات
CREATE POLICY blog_comments_insert_policy ON blog_comments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM blog_posts
      WHERE blog_posts.id = blog_comments.post_id
      AND blog_posts.published = true
    )
  );

-- 11. إنشاء سياسة للسماح للمستخدمين بتحديث تعليقاتهم الخاصة
CREATE POLICY blog_comments_update_policy ON blog_comments
  FOR UPDATE USING (
    auth.uid() = user_id OR (
      auth.uid() IS NOT NULL AND EXISTS (
        SELECT 1 FROM admin_users WHERE user_id = auth.uid()
      )
    )
  );

-- 12. إنشاء سياسة للسماح للمستخدمين بحذف تعليقاتهم الخاصة
CREATE POLICY blog_comments_delete_policy ON blog_comments
  FOR DELETE USING (
    auth.uid() = user_id OR (
      auth.uid() IS NOT NULL AND EXISTS (
        SELECT 1 FROM admin_users WHERE user_id = auth.uid()
      )
    )
  );
