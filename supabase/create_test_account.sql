-- إنشاء حساب اختبار جديد في قاعدة البيانات
-- يمكن تنفيذ هذا الملف في SQL Editor في Supabase Dashboard

-- إنشاء مستخدم اختبار جديد
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'test@test.com';
  v_password TEXT := 'Kk010193#';
  v_name TEXT := 'Test User';
  v_user_metadata JSONB;
BEGIN
  -- التحقق من وجود المستخدم
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  
  IF v_user_id IS NOT NULL THEN
    RAISE NOTICE 'User with email % already exists with ID %', v_email, v_user_id;
    
    -- حذف المستخدم الحالي
    DELETE FROM auth.users WHERE id = v_user_id;
    DELETE FROM public.profiles WHERE id = v_user_id;
    
    RAISE NOTICE 'Deleted existing user with ID %', v_user_id;
  END IF;
  
  -- إنشاء بيانات المستخدم
  v_user_metadata := jsonb_build_object(
    'name', v_name,
    'avatar', 'https://ui-avatars.com/api/?name=' || v_name || '&background=random',
    'country_code', 'EG',
    'language', 'ar'
  );
  
  -- إنشاء المستخدم في جدول auth.users
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role_id
  )
  VALUES (
    v_email,
    crypt(v_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    v_user_metadata,
    FALSE,
    (SELECT id FROM auth.roles WHERE name = 'authenticated')
  )
  RETURNING id INTO v_user_id;
  
  -- إنشاء ملف شخصي في جدول profiles
  INSERT INTO public.profiles (
    id,
    email,
    name,
    avatar,
    country_code,
    language,
    created_at,
    updated_at,
    status
  )
  VALUES (
    v_user_id,
    v_email,
    v_name,
    'https://ui-avatars.com/api/?name=' || v_name || '&background=random',
    'EG',
    'ar',
    NOW(),
    NOW(),
    'active'
  );
  
  RAISE NOTICE 'Successfully created test user with ID %', v_user_id;
END $$;
