-- تعطيل RLS على جميع الجداول

-- تعطيل RLS على جدول profiles
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;

-- تعطيل RLS على جدول admin_users
ALTER TABLE IF EXISTS admin_users DISABLE ROW LEVEL SECURITY;

-- تعطيل RLS على جدول blog_posts
ALTER TABLE IF EXISTS blog_posts DISABLE ROW LEVEL SECURITY;

-- تعطيل RLS على جدول blog_categories
ALTER TABLE IF EXISTS blog_categories DISABLE ROW LEVEL SECURITY;

-- تعطيل RLS على جدول blog_comments
ALTER TABLE IF EXISTS blog_comments DISABLE ROW LEVEL SECURITY;

-- تعطيل RLS على جدول consultations
ALTER TABLE IF EXISTS consultations DISABLE ROW LEVEL SECURITY;

-- تعطيل RLS على جدول doctors
ALTER TABLE IF EXISTS doctors DISABLE ROW LEVEL SECURITY;

-- تعطيل RLS على جدول testimonials
ALTER TABLE IF EXISTS testimonials DISABLE ROW LEVEL SECURITY;

-- تعطيل RLS على جدول user_reports
ALTER TABLE IF EXISTS user_reports DISABLE ROW LEVEL SECURITY;

-- تعطيل RLS على جدول site_settings
ALTER TABLE IF EXISTS site_settings DISABLE ROW LEVEL SECURITY;

-- تعطيل RLS على جدول chat_messages
ALTER TABLE IF EXISTS chat_messages DISABLE ROW LEVEL SECURITY;

-- تعطيل RLS على جدول saved_messages
ALTER TABLE IF EXISTS saved_messages DISABLE ROW LEVEL SECURITY;

-- تعطيل RLS على جدول user_settings
ALTER TABLE IF EXISTS user_settings DISABLE ROW LEVEL SECURITY;

-- تعطيل RLS على جدول notifications
ALTER TABLE IF EXISTS notifications DISABLE ROW LEVEL SECURITY;

-- تعطيل RLS على جدول blocked_users
ALTER TABLE IF EXISTS blocked_users DISABLE ROW LEVEL SECURITY;

-- تعطيل RLS على جدول user_activity
ALTER TABLE IF EXISTS user_activity DISABLE ROW LEVEL SECURITY;

-- تعطيل RLS على جدول site_visitors
ALTER TABLE IF EXISTS site_visitors DISABLE ROW LEVEL SECURITY;

-- تعطيل RLS على جدول services
ALTER TABLE IF EXISTS services DISABLE ROW LEVEL SECURITY;

-- تعطيل RLS على جدول faq
ALTER TABLE IF EXISTS faq DISABLE ROW LEVEL SECURITY;

-- تعطيل RLS على جدول contact_messages
ALTER TABLE IF EXISTS contact_messages DISABLE ROW LEVEL SECURITY;

-- تعطيل RLS على جدول legal_pages
ALTER TABLE IF EXISTS legal_pages DISABLE ROW LEVEL SECURITY;

-- منح صلاحيات للمستخدمين المصادق عليهم وغير المصادق عليهم
DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('GRANT SELECT ON TABLE %I TO authenticated, anon', table_name);
    EXECUTE format('GRANT INSERT, UPDATE, DELETE ON TABLE %I TO authenticated', table_name);
  END LOOP;
END
$$;
