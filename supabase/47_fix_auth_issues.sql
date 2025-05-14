-- إصلاح مشاكل المصادقة في Supabase

-- 1. إصلاح مشكلة "Database error granting user"
-- هذه المشكلة تحدث عادة بسبب مشاكل في سياسات الأمان (RLS) أو المحفزات (triggers)

-- التأكد من أن جدول auth.users يمكن الوصول إليه من قبل الخدمة
GRANT ALL ON TABLE auth.users TO postgres, service_role;

-- التأكد من أن جدول auth.users يمكن الوصول إليه من قبل المستخدمين المصادق عليهم
GRANT SELECT ON TABLE auth.users TO authenticated;

-- التأكد من أن جدول auth.users يمكن الوصول إليه من قبل المستخدمين غير المصادق عليهم
GRANT SELECT ON TABLE auth.users TO anon;

-- 2. إصلاح مشكلة الوصول إلى جدول profiles
-- التأكد من أن جدول profiles يمكن الوصول إليه من قبل الخدمة
GRANT ALL ON TABLE profiles TO postgres, service_role;

-- التأكد من أن جدول profiles يمكن الوصول إليه من قبل المستخدمين المصادق عليهم
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE profiles TO authenticated;

-- التأكد من أن جدول profiles يمكن الوصول إليه من قبل المستخدمين غير المصادق عليهم
GRANT SELECT ON TABLE profiles TO anon;

-- 3. إصلاح مشكلة الوصول إلى جدول auth.identities
GRANT ALL ON TABLE auth.identities TO postgres, service_role;
GRANT SELECT ON TABLE auth.identities TO authenticated;
GRANT SELECT ON TABLE auth.identities TO anon;

-- 4. إصلاح مشكلة الوصول إلى جدول auth.sessions
GRANT ALL ON TABLE auth.sessions TO postgres, service_role;
GRANT SELECT ON TABLE auth.sessions TO authenticated;

-- 5. إصلاح مشكلة الوصول إلى جدول auth.refresh_tokens
GRANT ALL ON TABLE auth.refresh_tokens TO postgres, service_role;
GRANT SELECT ON TABLE auth.refresh_tokens TO authenticated;

-- 6. إصلاح مشكلة الوصول إلى جدول auth.audit_log_entries
GRANT ALL ON TABLE auth.audit_log_entries TO postgres, service_role;

-- 7. إصلاح مشكلة الوصول إلى جدول auth.instances
GRANT ALL ON TABLE auth.instances TO postgres, service_role;

-- 8. إصلاح مشكلة الوصول إلى جدول auth.schema_migrations
GRANT ALL ON TABLE auth.schema_migrations TO postgres, service_role;

-- 9. إصلاح مشكلة الوصول إلى جدول storage.buckets
GRANT ALL ON TABLE storage.buckets TO postgres, service_role;
GRANT SELECT ON TABLE storage.buckets TO authenticated;
GRANT SELECT ON TABLE storage.buckets TO anon;

-- 10. إصلاح مشكلة الوصول إلى جدول storage.objects
GRANT ALL ON TABLE storage.objects TO postgres, service_role;
GRANT SELECT ON TABLE storage.objects TO authenticated;
GRANT SELECT ON TABLE storage.objects TO anon;

-- 11. إصلاح مشكلة الوصول إلى جدول storage.migrations
GRANT ALL ON TABLE storage.migrations TO postgres, service_role;

-- 12. إصلاح مشكلة الوصول إلى المخططات
GRANT USAGE ON SCHEMA auth TO postgres, service_role, authenticated, anon;
GRANT USAGE ON SCHEMA storage TO postgres, service_role, authenticated, anon;
GRANT USAGE ON SCHEMA public TO postgres, service_role, authenticated, anon;

-- 13. إصلاح مشكلة الوصول إلى التسلسلات
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA auth TO postgres, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA storage TO postgres, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role, authenticated, anon;

-- 14. إصلاح مشكلة الوصول إلى الدوال
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO postgres, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA storage TO postgres, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role, authenticated, anon;

-- 15. إصلاح مشكلة الوصول إلى الأنواع
GRANT USAGE ON TYPE auth.aal_level TO postgres, service_role, authenticated, anon;
GRANT USAGE ON TYPE auth.code_challenge_method TO postgres, service_role, authenticated, anon;
GRANT USAGE ON TYPE auth.factor_status TO postgres, service_role, authenticated, anon;
GRANT USAGE ON TYPE auth.factor_type TO postgres, service_role, authenticated, anon;
