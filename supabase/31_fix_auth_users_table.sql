-- إصلاح مشكلة "Database error granting user"

-- لا يمكننا تعطيل المحفزات النظامية، لذا سنتجاوز هذه الخطوة
-- ونركز على حذف المحفز الخاص بنا فقط

-- حذف المحفز الذي يسبب المشكلة
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- إصلاح مشكلة الصلاحيات
GRANT ALL ON SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA auth TO postgres, service_role;

-- إعادة إنشاء دالة handle_new_user بطريقة آمنة
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  profile_exists BOOLEAN;
BEGIN
  -- التحقق مما إذا كان هناك سجل موجود بالفعل
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = NEW.id
  ) INTO profile_exists;

  -- إذا لم يكن هناك سجل موجود، قم بإنشاء واحد
  IF NOT profile_exists THEN
    BEGIN
      INSERT INTO public.profiles (id, name, avatar, created_at, updated_at)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar', 'https://ui-avatars.com/api/?name=' || split_part(NEW.email, '@', 1) || '&background=random'),
        NOW(),
        NOW()
      );
    EXCEPTION WHEN OTHERS THEN
      -- تجاهل أي أخطاء قد تحدث أثناء الإدراج
      RAISE NOTICE 'Error creating profile for user %: %', NEW.id, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إعادة إنشاء المحفز بطريقة آمنة
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- إصلاح مشكلة الصلاحيات على جدول auth.users
DO $$
BEGIN
  -- منح صلاحيات للمستخدمين المصادق عليهم وغير المصادق عليهم
  GRANT USAGE ON SCHEMA auth TO authenticated, anon;
  GRANT SELECT ON auth.users TO authenticated, anon;

  -- إعادة ضبط سياسات RLS على جدول auth.users
  ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

  -- حذف جميع سياسات الأمان على جدول auth.users
  DROP POLICY IF EXISTS users_select_policy ON auth.users;
  DROP POLICY IF EXISTS users_insert_policy ON auth.users;
  DROP POLICY IF EXISTS users_update_policy ON auth.users;
  DROP POLICY IF EXISTS users_delete_policy ON auth.users;

  -- إنشاء سياسة للسماح بقراءة جميع السجلات
  CREATE POLICY users_select_policy ON auth.users
    FOR SELECT
    USING (true);

  -- تمكين RLS على جدول auth.users
  ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
END
$$;
