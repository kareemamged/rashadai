-- فحص هيكل جدول blog_posts الحالي وإصلاحه

-- عرض هيكل جدول blog_posts الحالي
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'blog_posts'
ORDER BY ordinal_position;

-- إضافة الأعمدة المفقودة إذا لم تكن موجودة
DO $$
BEGIN
    -- إضافة عمود title_en إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'title_en'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN title_en TEXT;
    END IF;

    -- إضافة عمود title_ar إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'title_ar'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN title_ar TEXT;
    END IF;

    -- إضافة عمود content_en إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'content_en'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN content_en TEXT;
    END IF;

    -- إضافة عمود content_ar إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'content_ar'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN content_ar TEXT;
    END IF;

    -- إضافة عمود summary_en إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'summary_en'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN summary_en TEXT;
    END IF;

    -- إضافة عمود summary_ar إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'summary_ar'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN summary_ar TEXT;
    END IF;

    -- إضافة عمود category إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'category'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN category TEXT DEFAULT 'tips';
    END IF;

    -- إضافة عمود status إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'status'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN status TEXT DEFAULT 'draft';
        
        -- تحديث قيم status بناءً على قيمة published
        UPDATE blog_posts
        SET status = CASE WHEN published = true THEN 'published' ELSE 'draft' END
        WHERE status IS NULL;
    END IF;

    -- إضافة عمود scheduled_at إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'scheduled_at'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN scheduled_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- إضافة عمود published إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'published'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN published BOOLEAN DEFAULT false;
    END IF;

    -- إضافة عمود author_id إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'author_id'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN author_id UUID;
    END IF;

    -- إضافة عمود created_at إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;

    -- إضافة عمود updated_at إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;

    -- إضافة عمود image_url إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN image_url TEXT;
    END IF;

    -- إضافة عمود likes_count إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'likes_count'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN likes_count INTEGER DEFAULT 0;
    END IF;

    -- إضافة عمود dislikes_count إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'dislikes_count'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN dislikes_count INTEGER DEFAULT 0;
    END IF;

    -- إضافة عمود views إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'views'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN views INTEGER DEFAULT 0;
    END IF;

    RAISE NOTICE 'تم تحديث جدول blog_posts بنجاح';
END
$$;

-- عرض هيكل جدول blog_posts بعد التحديث
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'blog_posts'
ORDER BY ordinal_position;

-- تحديث سياسات الأمان لجدول blog_posts
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
            status = 'published' OR
            EXISTS (
                SELECT 1 FROM admin_users
                WHERE admin_users.id = auth.uid()
            )
        );

    -- إنشاء سياسة للسماح للمشرفين بإضافة منشورات
    CREATE POLICY blog_posts_insert_policy ON blog_posts
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM admin_users
                WHERE admin_users.id = auth.uid()
            )
        );

    -- إنشاء سياسة للسماح للمشرفين بتحديث المنشورات
    CREATE POLICY blog_posts_update_policy ON blog_posts
        FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM admin_users
                WHERE admin_users.id = auth.uid()
            )
        );

    -- إنشاء سياسة للسماح للمشرفين بحذف المنشورات
    CREATE POLICY blog_posts_delete_policy ON blog_posts
        FOR DELETE USING (
            EXISTS (
                SELECT 1 FROM admin_users
                WHERE admin_users.id = auth.uid()
            )
        );
END
$$;
