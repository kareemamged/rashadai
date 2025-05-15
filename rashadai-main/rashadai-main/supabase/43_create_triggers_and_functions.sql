-- إنشاء الدوال والمحفزات

-- 1. إنشاء دالة لتحديث حقل updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_profiles_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء محفز لتحديث حقل updated_at تلقائياً
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_profiles_updated_at_column();

-- 2. إنشاء دالة لإنشاء سجل في جدول profiles عند إنشاء مستخدم جديد
CREATE OR REPLACE FUNCTION handle_new_user()
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
      INSERT INTO public.profiles (id, name, avatar, country_code, language, created_at, updated_at)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar', 'https://ui-avatars.com/api/?name=' || split_part(NEW.email, '@', 1) || '&background=random'),
        COALESCE(NEW.raw_user_meta_data->>'country_code', 'SA'),
        COALESCE(NEW.raw_user_meta_data->>'language', 'ar'),
        NOW(),
        NOW()
      );
    EXCEPTION WHEN OTHERS THEN
      -- تجاهل أي أخطاء قد تحدث أثناء الإدراج
      NULL;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء محفز لإنشاء سجل في جدول profiles عند إنشاء مستخدم جديد
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
