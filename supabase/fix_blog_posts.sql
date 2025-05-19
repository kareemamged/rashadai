-- إصلاح جدول blog_posts

-- إضافة الأعمدة المفقودة إذا لم تكن موجودة
DO $$
BEGIN
    -- إضافة عمود content_ar إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'content_ar'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN content_ar TEXT;
    END IF;

    -- إضافة عمود title_ar إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'title_ar'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN title_ar TEXT;
    END IF;

    -- إضافة عمود summary_ar إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'summary_ar'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN summary_ar TEXT;
    END IF;

    -- إضافة عمود content_en إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'content_en'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN content_en TEXT;
    END IF;

    -- إضافة عمود title_en إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'title_en'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN title_en TEXT;
    END IF;

    -- إضافة عمود summary_en إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'summary_en'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN summary_en TEXT;
    END IF;

    RAISE NOTICE 'تم تحديث جدول blog_posts بنجاح';
END
$$;
