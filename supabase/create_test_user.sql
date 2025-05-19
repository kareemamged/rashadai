-- إنشاء مستخدم اختبار في قاعدة البيانات
-- يمكن تنفيذ هذا الملف في SQL Editor في Supabase Dashboard

-- إنشاء مستخدم في جدول auth.users
DO $$
DECLARE
  new_user_id UUID;
  test_email TEXT := 'test@example.com';
  test_password TEXT := 'password123';
  test_name TEXT := 'Test User';
BEGIN
  -- التحقق من وجود المستخدم
  SELECT id INTO new_user_id FROM auth.users WHERE email = test_email;
  
  IF new_user_id IS NULL THEN
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
      test_email,
      crypt(test_password, gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      format('{"name": "%s", "avatar": "https://ui-avatars.com/api/?name=%s&background=random", "country_code": "EG", "language": "ar"}', test_name, test_name)::jsonb,
      FALSE,
      (SELECT id FROM auth.roles WHERE name = 'authenticated')
    )
    RETURNING id INTO new_user_id;
    
    -- إنشاء ملف شخصي في جدول profiles
    INSERT INTO public.profiles (
      id,
      email,
      name,
      avatar,
      country_code,
      language,
      created_at,
      updated_at
    )
    VALUES (
      new_user_id,
      test_email,
      test_name,
      'https://ui-avatars.com/api/?name=' || test_name || '&background=random',
      'EG',
      'ar',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'تم إنشاء مستخدم اختبار بنجاح: %', new_user_id;
  ELSE
    RAISE NOTICE 'المستخدم موجود بالفعل: %', new_user_id;
  END IF;
END
$$;

-- إنشاء مستخدم آخر للاختبار
DO $$
DECLARE
  new_user_id UUID;
  test_email TEXT := 'test2@example.com';
  test_password TEXT := 'password123';
  test_name TEXT := 'Test User 2';
BEGIN
  -- التحقق من وجود المستخدم
  SELECT id INTO new_user_id FROM auth.users WHERE email = test_email;
  
  IF new_user_id IS NULL THEN
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
      test_email,
      crypt(test_password, gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      format('{"name": "%s", "avatar": "https://ui-avatars.com/api/?name=%s&background=random", "country_code": "EG", "language": "ar"}', test_name, test_name)::jsonb,
      FALSE,
      (SELECT id FROM auth.roles WHERE name = 'authenticated')
    )
    RETURNING id INTO new_user_id;
    
    -- إنشاء ملف شخصي في جدول profiles
    INSERT INTO public.profiles (
      id,
      email,
      name,
      avatar,
      country_code,
      language,
      created_at,
      updated_at
    )
    VALUES (
      new_user_id,
      test_email,
      test_name,
      'https://ui-avatars.com/api/?name=' || test_name || '&background=random',
      'EG',
      'ar',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'تم إنشاء مستخدم اختبار بنجاح: %', new_user_id;
  ELSE
    RAISE NOTICE 'المستخدم موجود بالفعل: %', new_user_id;
  END IF;
END
$$;
