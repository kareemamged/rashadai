-- إنشاء مستخدم مشرف في جدول auth.users
-- ملاحظة: هذا الاستعلام يجب تنفيذه بواسطة مستخدم لديه صلاحيات كافية (مثل service_role)

-- تعيين كلمة المرور للمستخدم kemoamego@gmail.com
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- التحقق من وجود المستخدم
  SELECT id INTO user_id FROM auth.users WHERE email = 'kemoamego@gmail.com';
  
  IF user_id IS NULL THEN
    -- إنشاء المستخدم إذا لم يكن موجودًا
    INSERT INTO auth.users (
      email,
      raw_user_meta_data,
      created_at,
      updated_at,
      email_confirmed_at,
      confirmation_sent_at,
      confirmation_token,
      recovery_sent_at,
      recovery_token,
      encrypted_password,
      is_super_admin
    )
    VALUES (
      'kemoamego@gmail.com',
      '{"name": "kareem amged", "avatar": "https://ui-avatars.com/api/?name=kareem+amged&background=random", "country_code": "US", "language": "ar"}',
      NOW(),
      NOW(),
      NOW(),
      NOW(),
      '',
      NULL,
      '',
      crypt('Kk1704048', gen_salt('bf')),
      FALSE
    )
    RETURNING id INTO user_id;
    
    RAISE NOTICE 'Created new user with ID: %', user_id;
  ELSE
    -- تحديث كلمة المرور للمستخدم الموجود
    UPDATE auth.users
    SET encrypted_password = crypt('Kk1704048', gen_salt('bf')),
        raw_user_meta_data = '{"name": "kareem amged", "avatar": "https://ui-avatars.com/api/?name=kareem+amged&background=random", "country_code": "US", "language": "ar"}'
    WHERE id = user_id;
    
    RAISE NOTICE 'Updated existing user with ID: %', user_id;
  END IF;
  
  -- إنشاء سجل في جدول profiles إذا لم يكن موجودًا
  INSERT INTO profiles (id, name, email, avatar, role, country_code, language)
  VALUES (
    user_id,
    'kareem amged',
    'kemoamego@gmail.com',
    'https://ui-avatars.com/api/?name=kareem+amged&background=random',
    'admin',
    'US',
    'ar'
  )
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin',
      name = 'kareem amged',
      updated_at = NOW();
  
  -- إنشاء سجل في جدول admin_users إذا لم يكن موجودًا
  INSERT INTO admin_users (id, name, email, role)
  VALUES (
    user_id,
    'kareem amged',
    'kemoamego@gmail.com',
    'super_admin'
  )
  ON CONFLICT (id) DO UPDATE
  SET role = 'super_admin',
      name = 'kareem amged',
      updated_at = NOW();
END
$$;

-- تعيين كلمة المرور للمستخدم kemoamego@icloud.com
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- التحقق من وجود المستخدم
  SELECT id INTO user_id FROM auth.users WHERE email = 'kemoamego@icloud.com';
  
  IF user_id IS NULL THEN
    -- إنشاء المستخدم إذا لم يكن موجودًا
    INSERT INTO auth.users (
      email,
      raw_user_meta_data,
      created_at,
      updated_at,
      email_confirmed_at,
      confirmation_sent_at,
      confirmation_token,
      recovery_sent_at,
      recovery_token,
      encrypted_password,
      is_super_admin
    )
    VALUES (
      'kemoamego@icloud.com',
      '{"name": "kareem amged", "avatar": "https://ui-avatars.com/api/?name=kareem+amged&background=random", "country_code": "US", "language": "ar"}',
      NOW(),
      NOW(),
      NOW(),
      NOW(),
      '',
      NULL,
      '',
      crypt('Kk1704048', gen_salt('bf')),
      FALSE
    )
    RETURNING id INTO user_id;
    
    RAISE NOTICE 'Created new user with ID: %', user_id;
  ELSE
    -- تحديث كلمة المرور للمستخدم الموجود
    UPDATE auth.users
    SET encrypted_password = crypt('Kk1704048', gen_salt('bf')),
        raw_user_meta_data = '{"name": "kareem amged", "avatar": "https://ui-avatars.com/api/?name=kareem+amged&background=random", "country_code": "US", "language": "ar"}'
    WHERE id = user_id;
    
    RAISE NOTICE 'Updated existing user with ID: %', user_id;
  END IF;
  
  -- إنشاء سجل في جدول profiles إذا لم يكن موجودًا
  INSERT INTO profiles (id, name, email, avatar, role, country_code, language)
  VALUES (
    user_id,
    'kareem amged',
    'kemoamego@icloud.com',
    'https://ui-avatars.com/api/?name=kareem+amged&background=random',
    'admin',
    'US',
    'ar'
  )
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin',
      name = 'kareem amged',
      updated_at = NOW();
  
  -- إنشاء سجل في جدول admin_users إذا لم يكن موجودًا
  INSERT INTO admin_users (id, name, email, role)
  VALUES (
    user_id,
    'kareem amged',
    'kemoamego@icloud.com',
    'super_admin'
  )
  ON CONFLICT (id) DO UPDATE
  SET role = 'super_admin',
      name = 'kareem amged',
      updated_at = NOW();
END
$$;
