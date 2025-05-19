-- تعطيل سياسات أمان الصفوف (RLS) لجدول blog_posts للاختبار
-- يجب تنفيذ هذا السكريبت في محرر SQL في Supabase بصلاحيات المسؤول

-- 1. تعطيل RLS على جدول blog_posts
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;

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

-- 3. تعطيل RLS على جدول blog_comments
ALTER TABLE blog_comments DISABLE ROW LEVEL SECURITY;

-- 4. حذف السياسات الموجودة لجدول blog_comments
DROP POLICY IF EXISTS blog_comments_select_policy ON blog_comments;
DROP POLICY IF EXISTS blog_comments_insert_policy ON blog_comments;
DROP POLICY IF EXISTS blog_comments_update_policy ON blog_comments;
DROP POLICY IF EXISTS blog_comments_delete_policy ON blog_comments;
