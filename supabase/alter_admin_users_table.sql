-- إضافة الأعمدة المفقودة إلى جدول admin_users إذا لم تكن موجودة
DO $$
BEGIN
    -- إضافة عمود created_at إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_users' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE admin_users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- إضافة عمود updated_at إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_users' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE admin_users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- إضافة عمود last_login إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_users' AND column_name = 'last_login'
    ) THEN
        ALTER TABLE admin_users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    END IF;

    -- إضافة عمود avatar إذا لم يكن موجودًا
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_users' AND column_name = 'avatar'
    ) THEN
        ALTER TABLE admin_users ADD COLUMN avatar TEXT;
    END IF;
END
$$;

-- إنشاء محفز لتحديث عمود updated_at
DO $$
BEGIN
    -- التحقق من وجود الدالة
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'update_admin_users_updated_at_column'
    ) THEN
        -- إنشاء دالة لتحديث عمود updated_at
        CREATE FUNCTION update_admin_users_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    END IF;

    -- التحقق من وجود المحفز
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_admin_users_updated_at'
    ) THEN
        -- إنشاء محفز لتحديث عمود updated_at
        CREATE TRIGGER update_admin_users_updated_at
        BEFORE UPDATE ON admin_users
        FOR EACH ROW
        EXECUTE PROCEDURE update_admin_users_updated_at_column();
    END IF;
END
$$;
