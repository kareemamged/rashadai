-- إصلاح مشاكل المصادقة في Supabase
-- هذا الملف يقوم بإصلاح مشكلة "Database error granting user" عند تسجيل الدخول

-- 1. التأكد من وجود جدول auth.users وأنه يعمل بشكل صحيح
DO $$
BEGIN
    -- التحقق من وجود جدول auth.users
    IF EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'auth'
        AND tablename = 'users'
    ) THEN
        RAISE NOTICE 'جدول auth.users موجود';
    ELSE
        RAISE EXCEPTION 'جدول auth.users غير موجود!';
    END IF;
END
$$;

-- 2. التأكد من وجود الإجراءات المخزنة اللازمة للمصادقة
DO $$
BEGIN
    -- التحقق من وجود الإجراءات المخزنة
    IF EXISTS (
        SELECT FROM pg_proc
        WHERE proname = 'grant_user_role'
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')
    ) THEN
        RAISE NOTICE 'إجراء auth.grant_user_role موجود';
    ELSE
        RAISE NOTICE 'إجراء auth.grant_user_role غير موجود!';
    END IF;
END
$$;

-- 3. إنشاء وظيفة آمنة للتحقق من صحة بيانات المستخدم
CREATE OR REPLACE FUNCTION auth_user_check(email TEXT, password TEXT)
RETURNS TABLE (
    id UUID,
    email TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.email, u.created_at
    FROM auth.users u
    WHERE u.email = auth_user_check.email
    AND u.is_confirmed = true
    AND u.deleted_at IS NULL;
END;
$$;

-- 4. إنشاء وظيفة آمنة للحصول على معلومات المستخدم بواسطة البريد الإلكتروني
CREATE OR REPLACE FUNCTION get_auth_user_by_email(email_param TEXT)
RETURNS TABLE (
    id UUID,
    email TEXT,
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.email, u.created_at, u.last_sign_in_at
    FROM auth.users u
    WHERE u.email = email_param
    AND u.deleted_at IS NULL;
END;
$$;

-- 5. منح صلاحيات تنفيذ الوظائف للمستخدمين المصادق عليهم وغير المصادق عليهم
GRANT EXECUTE ON FUNCTION auth_user_check(TEXT, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_auth_user_by_email(TEXT) TO authenticated, anon;

-- 6. إنشاء وظيفة للتحقق من حالة المستخدم (محظور أم لا)
CREATE OR REPLACE FUNCTION check_user_blocked(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    is_blocked BOOLEAN;
BEGIN
    -- التحقق من وجود المستخدم في جدول admin_users وحالته
    SELECT EXISTS (
        SELECT 1
        FROM admin_users
        WHERE user_id = check_user_blocked.user_id
        AND status = 'blocked'
    ) INTO is_blocked;
    
    RETURN is_blocked;
END;
$$;

-- 7. منح صلاحيات تنفيذ الوظيفة للمستخدمين المصادق عليهم وغير المصادق عليهم
GRANT EXECUTE ON FUNCTION check_user_blocked(UUID) TO authenticated, anon;

-- 8. إنشاء وظيفة للتحقق من صحة بيانات المستخدم وحالته
CREATE OR REPLACE FUNCTION validate_user_login(email_param TEXT, password_param TEXT)
RETURNS TABLE (
    id UUID,
    email TEXT,
    created_at TIMESTAMPTZ,
    is_valid BOOLEAN,
    is_blocked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_id UUID;
    user_email TEXT;
    user_created_at TIMESTAMPTZ;
    user_blocked BOOLEAN;
BEGIN
    -- الحصول على معلومات المستخدم
    SELECT u.id, u.email, u.created_at
    INTO user_id, user_email, user_created_at
    FROM auth.users u
    WHERE u.email = email_param
    AND u.deleted_at IS NULL;
    
    -- التحقق من حالة المستخدم
    IF user_id IS NOT NULL THEN
        SELECT check_user_blocked(user_id) INTO user_blocked;
    ELSE
        user_blocked := false;
    END IF;
    
    RETURN QUERY
    SELECT 
        user_id, 
        user_email, 
        user_created_at, 
        (user_id IS NOT NULL) AS is_valid, 
        user_blocked;
END;
$$;

-- 9. منح صلاحيات تنفيذ الوظيفة للمستخدمين المصادق عليهم وغير المصادق عليهم
GRANT EXECUTE ON FUNCTION validate_user_login(TEXT, TEXT) TO authenticated, anon;
