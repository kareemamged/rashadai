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
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      uuid_generate_v4(),
      'authenticated',
      'authenticated',
      'kemoamego@gmail.com',
      crypt('Kk1704048', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "kareem amged", "avatar": "https://ui-avatars.com/api/?name=kareem+amged&background=random", "country_code": "US", "language": "ar"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
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
  INSERT INTO profiles (id, name, email, avatar, role, country_code, language, created_at, updated_at)
  VALUES (
    user_id,
    'kareem amged',
    'kemoamego@gmail.com',
    'https://ui-avatars.com/api/?name=kareem+amged&background=random',
    'admin',
    'US',
    'ar',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin',
      name = 'kareem amged',
      updated_at = NOW();

  -- إنشاء سجل في جدول admin_users إذا لم يكن موجودًا
  BEGIN
    -- التحقق من وجود الأعمدة المطلوبة
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'admin_users' AND column_name = 'updated_at'
    ) THEN
      -- إذا كان عمود updated_at موجودًا
      INSERT INTO admin_users (id, name, email, role, created_at, updated_at)
      VALUES (
        user_id,
        'kareem amged',
        'kemoamego@gmail.com',
        'super_admin',
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE
      SET role = 'super_admin',
          name = 'kareem amged',
          updated_at = NOW();
    ELSE
      -- إذا لم يكن عمود updated_at موجودًا
      INSERT INTO admin_users (id, name, email, role)
      VALUES (
        user_id,
        'kareem amged',
        'kemoamego@gmail.com',
        'super_admin'
      )
      ON CONFLICT (id) DO UPDATE
      SET role = 'super_admin',
          name = 'kareem amged';
    END IF;
  END;
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
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      uuid_generate_v4(),
      'authenticated',
      'authenticated',
      'kemoamego@icloud.com',
      crypt('Kk1704048', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "kareem amged", "avatar": "https://ui-avatars.com/api/?name=kareem+amged&background=random", "country_code": "US", "language": "ar"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
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
  INSERT INTO profiles (id, name, email, avatar, role, country_code, language, created_at, updated_at)
  VALUES (
    user_id,
    'kareem amged',
    'kemoamego@icloud.com',
    'https://ui-avatars.com/api/?name=kareem+amged&background=random',
    'admin',
    'US',
    'ar',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin',
      name = 'kareem amged',
      updated_at = NOW();

  -- إنشاء سجل في جدول admin_users إذا لم يكن موجودًا
  BEGIN
    -- التحقق من وجود الأعمدة المطلوبة
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'admin_users' AND column_name = 'updated_at'
    ) THEN
      -- إذا كان عمود updated_at موجودًا
      INSERT INTO admin_users (id, name, email, role, created_at, updated_at)
      VALUES (
        user_id,
        'kareem amged',
        'kemoamego@icloud.com',
        'super_admin',
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE
      SET role = 'super_admin',
          name = 'kareem amged',
          updated_at = NOW();
    ELSE
      -- إذا لم يكن عمود updated_at موجودًا
      INSERT INTO admin_users (id, name, email, role)
      VALUES (
        user_id,
        'kareem amged',
        'kemoamego@icloud.com',
        'super_admin'
      )
      ON CONFLICT (id) DO UPDATE
      SET role = 'super_admin',
          name = 'kareem amged';
    END IF;
  END;
END
$$;
