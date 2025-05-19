-- إنشاء جدول لتسجيل أخطاء المصادقة
CREATE TABLE IF NOT EXISTS auth_errors (
  id SERIAL PRIMARY KEY,
  error_message TEXT,
  error_detail TEXT,
  error_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء دالة لتسجيل أخطاء المصادقة
CREATE OR REPLACE FUNCTION log_auth_error(error_msg TEXT, error_detail TEXT, error_context TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO auth_errors (error_message, error_detail, error_context)
  VALUES (error_msg, error_detail, error_context);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تعديل دالة handle_new_user لتسجيل الأخطاء
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  EXCEPTION
    WHEN OTHERS THEN
      PERFORM log_auth_error('Error in handle_new_user', SQLERRM, 'User ID: ' || NEW.id || ', Email: ' || NEW.email);
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إعادة إنشاء المحفز
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
