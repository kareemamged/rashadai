-- إصلاح مشكلة عمود role في جدول profiles

-- 1. التحقق من وجود عمود role في جدول profiles وإضافته إذا لم يكن موجودًا
DO $$
BEGIN
  -- التحقق من وجود جدول profiles
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'profiles'
  ) THEN
    -- التحقق من وجود عمود role
    IF NOT EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'role'
    ) THEN
      -- إضافة عمود role إذا لم يكن موجودًا
      BEGIN
        ALTER TABLE profiles
        ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

        RAISE NOTICE 'تمت إضافة عمود role إلى جدول profiles';

        -- تحديث قيم عمود role للمستخدمين الحاليين
        UPDATE profiles
        SET role = CASE
          WHEN email IN ('kemoamego@gmail.com', 'kemoamego@icloud.com') THEN 'admin'
          ELSE 'user'
        END;

        RAISE NOTICE 'تم تحديث قيم عمود role للمستخدمين الحاليين';
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'خطأ في إضافة عمود role: %', SQLERRM;
      END;
    ELSE
      RAISE NOTICE 'عمود role موجود بالفعل في جدول profiles';
    END IF;
  ELSE
    -- إنشاء جدول profiles إذا لم يكن موجودًا
    BEGIN
      CREATE TABLE profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT,
        email TEXT,
        avatar TEXT,
        role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        country_code TEXT,
        language TEXT DEFAULT 'ar',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      RAISE NOTICE 'تم إنشاء جدول profiles مع عمود role';

      -- إدراج سجلات للمستخدمين الحاليين
      INSERT INTO profiles (id, email, name, role)
      SELECT
        id,
        email,
        COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
        CASE
          WHEN email IN ('kemoamego@gmail.com', 'kemoamego@icloud.com') THEN 'admin'
          ELSE 'user'
        END
      FROM auth.users
      ON CONFLICT (id) DO NOTHING;

      RAISE NOTICE 'تم إدراج سجلات للمستخدمين الحاليين في جدول profiles';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'خطأ في إنشاء جدول profiles: %', SQLERRM;
    END;
  END IF;
END
$$;

-- 2. تعديل سياسات الأمان لجدول blog_posts
DO $$
BEGIN
  -- التحقق من وجود جدول blog_posts
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'blog_posts'
  ) THEN
    -- حذف السياسات الحالية بشكل آمن
    BEGIN
      DROP POLICY IF EXISTS blog_posts_select_policy ON blog_posts;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'لا يمكن حذف سياسة blog_posts_select_policy: %', SQLERRM;
    END;

    BEGIN
      DROP POLICY IF EXISTS blog_posts_insert_policy ON blog_posts;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'لا يمكن حذف سياسة blog_posts_insert_policy: %', SQLERRM;
    END;

    BEGIN
      DROP POLICY IF EXISTS blog_posts_update_policy ON blog_posts;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'لا يمكن حذف سياسة blog_posts_update_policy: %', SQLERRM;
    END;

    BEGIN
      DROP POLICY IF EXISTS blog_posts_delete_policy ON blog_posts;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'لا يمكن حذف سياسة blog_posts_delete_policy: %', SQLERRM;
    END;

    -- إنشاء سياسات جديدة
    -- سياسة للسماح لأي شخص بعرض المنشورات المنشورة
    BEGIN
      CREATE POLICY blog_posts_select_policy ON blog_posts
        FOR SELECT USING (
          published = true OR
          EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
          )
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'لا يمكن إنشاء سياسة blog_posts_select_policy: %', SQLERRM;
    END;

    -- سياسة للسماح للمشرفين بإدراج منشورات
    BEGIN
      CREATE POLICY blog_posts_insert_policy ON blog_posts
        FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
          )
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'لا يمكن إنشاء سياسة blog_posts_insert_policy: %', SQLERRM;
    END;

    -- سياسة للسماح للمشرفين بتحديث المنشورات
    BEGIN
      CREATE POLICY blog_posts_update_policy ON blog_posts
        FOR UPDATE USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
          )
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'لا يمكن إنشاء سياسة blog_posts_update_policy: %', SQLERRM;
    END;

    -- سياسة للسماح للمشرفين بحذف المنشورات
    BEGIN
      CREATE POLICY blog_posts_delete_policy ON blog_posts
        FOR DELETE USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
          )
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'لا يمكن إنشاء سياسة blog_posts_delete_policy: %', SQLERRM;
    END;

    RAISE NOTICE 'تم إعادة إنشاء سياسات الأمان لجدول blog_posts';
  END IF;
END
$$;

-- 3. إضافة عمود status إلى جدول blog_comments وتعديل سياسات الأمان
DO $$
BEGIN
  -- التحقق من وجود جدول blog_comments
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'blog_comments'
  ) THEN
    -- التحقق من وجود عمود status
    IF NOT EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'blog_comments'
      AND column_name = 'status'
    ) THEN
      -- إضافة عمود status إذا لم يكن موجودًا
      BEGIN
        ALTER TABLE blog_comments
        ADD COLUMN status TEXT DEFAULT 'pending';

        RAISE NOTICE 'تمت إضافة عمود status إلى جدول blog_comments';

        -- تحديث قيم عمود status بناءً على عمود approved
        UPDATE blog_comments
        SET status = CASE
          WHEN approved = true THEN 'approved'
          ELSE 'pending'
        END;

        RAISE NOTICE 'تم تحديث قيم عمود status للتعليقات الحالية';
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'خطأ في إضافة عمود status: %', SQLERRM;
      END;
    ELSE
      RAISE NOTICE 'عمود status موجود بالفعل في جدول blog_comments';
    END IF;
    -- حذف السياسات الحالية بشكل آمن
    BEGIN
      DROP POLICY IF EXISTS blog_comments_select_policy ON blog_comments;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'لا يمكن حذف سياسة blog_comments_select_policy: %', SQLERRM;
    END;

    BEGIN
      DROP POLICY IF EXISTS blog_comments_insert_policy ON blog_comments;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'لا يمكن حذف سياسة blog_comments_insert_policy: %', SQLERRM;
    END;

    BEGIN
      DROP POLICY IF EXISTS blog_comments_update_policy ON blog_comments;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'لا يمكن حذف سياسة blog_comments_update_policy: %', SQLERRM;
    END;

    BEGIN
      DROP POLICY IF EXISTS blog_comments_delete_policy ON blog_comments;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'لا يمكن حذف سياسة blog_comments_delete_policy: %', SQLERRM;
    END;

    -- إنشاء سياسات جديدة
    -- سياسة للسماح لأي شخص بعرض التعليقات المعتمدة
    BEGIN
      -- التحقق من وجود عمود status
      IF EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'blog_comments'
        AND column_name = 'status'
      ) THEN
        -- إنشاء سياسة تستخدم عمود status
        CREATE POLICY blog_comments_select_policy ON blog_comments
          FOR SELECT USING (
            approved = true OR status = 'approved' OR
            EXISTS (
              SELECT 1 FROM profiles
              WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
            ) OR
            auth.uid() = user_id
          );
      ELSE
        -- إنشاء سياسة لا تستخدم عمود status
        CREATE POLICY blog_comments_select_policy ON blog_comments
          FOR SELECT USING (
            approved = true OR
            EXISTS (
              SELECT 1 FROM profiles
              WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
            ) OR
            auth.uid() = user_id
          );
      END IF;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'لا يمكن إنشاء سياسة blog_comments_select_policy: %', SQLERRM;
    END;

    -- سياسة للسماح للمستخدمين المسجلين بإضافة تعليقات
    BEGIN
      CREATE POLICY blog_comments_insert_policy ON blog_comments
        FOR INSERT WITH CHECK (
          auth.uid() IS NOT NULL
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'لا يمكن إنشاء سياسة blog_comments_insert_policy: %', SQLERRM;
    END;

    -- سياسة للسماح للمشرفين وأصحاب التعليقات بتحديث التعليقات
    BEGIN
      CREATE POLICY blog_comments_update_policy ON blog_comments
        FOR UPDATE USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
          ) OR
          auth.uid() = user_id
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'لا يمكن إنشاء سياسة blog_comments_update_policy: %', SQLERRM;
    END;

    -- سياسة للسماح للمشرفين وأصحاب التعليقات بحذف التعليقات
    BEGIN
      CREATE POLICY blog_comments_delete_policy ON blog_comments
        FOR DELETE USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
          ) OR
          auth.uid() = user_id
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'لا يمكن إنشاء سياسة blog_comments_delete_policy: %', SQLERRM;
    END;

    RAISE NOTICE 'تم إعادة إنشاء سياسات الأمان لجدول blog_comments';
  END IF;
END
$$;
