-- إصلاح مشكلة العلاقة بين جدول blog_posts وجدول profiles

-- 1. إضافة عمود author_name إذا لم يكن موجودًا
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'author_name'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN author_name TEXT DEFAULT 'Admin';
    END IF;
END
$$;

-- 2. تحديث قيم author_name بناءً على author_id
UPDATE blog_posts
SET author_name = (
    SELECT email FROM auth.users WHERE id = blog_posts.author_id
)
WHERE author_name IS NULL AND author_id IS NOT NULL;

-- 3. إضافة عمود title_en إذا لم يكن موجودًا
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'title_en'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN title_en TEXT;
        
        -- نسخ قيم title إلى title_en
        UPDATE blog_posts SET title_en = title WHERE title_en IS NULL AND title IS NOT NULL;
    END IF;
END
$$;

-- 4. إضافة عمود title_ar إذا لم يكن موجودًا
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'title_ar'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN title_ar TEXT;
    END IF;
END
$$;

-- 5. إضافة عمود content_en إذا لم يكن موجودًا
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'content_en'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN content_en TEXT;
        
        -- نسخ قيم content إلى content_en
        UPDATE blog_posts SET content_en = content WHERE content_en IS NULL AND content IS NOT NULL;
    END IF;
END
$$;

-- 6. إضافة عمود content_ar إذا لم يكن موجودًا
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'content_ar'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN content_ar TEXT;
    END IF;
END
$$;

-- 7. إضافة عمود summary_en إذا لم يكن موجودًا
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'summary_en'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN summary_en TEXT;
        
        -- إنشاء ملخص من المحتوى
        UPDATE blog_posts 
        SET summary_en = SUBSTRING(content_en, 1, 150) || '...' 
        WHERE summary_en IS NULL AND content_en IS NOT NULL;
    END IF;
END
$$;

-- 8. إضافة عمود summary_ar إذا لم يكن موجودًا
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'summary_ar'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN summary_ar TEXT;
        
        -- إنشاء ملخص من المحتوى
        UPDATE blog_posts 
        SET summary_ar = SUBSTRING(content_ar, 1, 150) || '...' 
        WHERE summary_ar IS NULL AND content_ar IS NOT NULL;
    END IF;
END
$$;
