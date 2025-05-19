-- إصلاح العلاقة بين جدول blog_posts وجدول profiles

-- 1. إضافة مفتاح أجنبي لربط author_id بجدول profiles
DO $$
BEGIN
    -- التحقق من وجود المفتاح الأجنبي
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'blog_posts_author_id_fkey' 
        AND table_name = 'blog_posts'
    ) THEN
        -- إضافة المفتاح الأجنبي
        ALTER TABLE blog_posts
        ADD CONSTRAINT blog_posts_author_id_fkey
        FOREIGN KEY (author_id)
        REFERENCES auth.users(id);
    END IF;
END
$$;

-- 2. إصلاح سياسات الأمان RLS لجدول blog_posts
DO $$
BEGIN
    -- حذف السياسات الموجودة
    DROP POLICY IF EXISTS blog_posts_select_policy ON blog_posts;
    DROP POLICY IF EXISTS blog_posts_insert_policy ON blog_posts;
    DROP POLICY IF EXISTS blog_posts_update_policy ON blog_posts;
    DROP POLICY IF EXISTS blog_posts_delete_policy ON blog_posts;

    -- تفعيل RLS على الجدول إذا لم يكن مفعلاً
    ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

    -- إنشاء سياسة للسماح لأي شخص بعرض المنشورات المنشورة
    CREATE POLICY blog_posts_select_policy ON blog_posts
        FOR SELECT USING (
            published = true OR
            auth.uid() = author_id OR
            EXISTS (
                SELECT 1 FROM admin_users
                WHERE admin_users.id = auth.uid()
            )
        );

    -- إنشاء سياسة للسماح للمستخدمين المسجلين بإضافة منشورات
    CREATE POLICY blog_posts_insert_policy ON blog_posts
        FOR INSERT WITH CHECK (
            auth.uid() = author_id OR
            EXISTS (
                SELECT 1 FROM admin_users
                WHERE admin_users.id = auth.uid()
            )
        );

    -- إنشاء سياسة للسماح للمؤلفين والمشرفين بتحديث المنشورات
    CREATE POLICY blog_posts_update_policy ON blog_posts
        FOR UPDATE USING (
            auth.uid() = author_id OR
            EXISTS (
                SELECT 1 FROM admin_users
                WHERE admin_users.id = auth.uid()
            )
        );

    -- إنشاء سياسة للسماح للمؤلفين والمشرفين بحذف المنشورات
    CREATE POLICY blog_posts_delete_policy ON blog_posts
        FOR DELETE USING (
            auth.uid() = author_id OR
            EXISTS (
                SELECT 1 FROM admin_users
                WHERE admin_users.id = auth.uid()
            )
        );
END
$$;
