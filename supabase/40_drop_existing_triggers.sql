-- حذف المحفزات والدوال الموجودة بالفعل

-- حذف المحفزات على جدول auth.users
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS create_profile_after_signup ON auth.users CASCADE;

-- حذف المحفزات على جدول profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles CASCADE;

-- حذف الدوال المرتبطة بالمحفزات
DROP FUNCTION IF EXISTS public.create_profile_for_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_profiles_updated_at_column() CASCADE;
