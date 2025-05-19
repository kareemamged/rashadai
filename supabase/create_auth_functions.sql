-- إنشاء وظائف RPC المطلوبة للمصادقة
-- يمكن تنفيذ هذا الملف في SQL Editor في Supabase Dashboard

-- وظيفة للتحقق من تأكيد البريد الإلكتروني
CREATE OR REPLACE FUNCTION public.check_email_confirmed_alt(p_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_confirmed TIMESTAMP WITH TIME ZONE;
  v_result JSON;
BEGIN
  -- البحث عن المستخدم في جدول auth.users
  SELECT id, email_confirmed_at INTO v_user_id, v_confirmed
  FROM auth.users
  WHERE email = p_email;
  
  -- إنشاء النتيجة
  v_result := json_build_object(
    'user_id', v_user_id,
    'email', p_email,
    'confirmed', v_confirmed IS NOT NULL,
    'confirmed_at', v_confirmed
  );
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', SQLERRM
    );
END;
$$;

-- وظيفة للتحقق من صحة كلمة المرور وحالة تأكيد البريد الإلكتروني
CREATE OR REPLACE FUNCTION public.simple_auth_check(p_email TEXT, p_password TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_confirmed TIMESTAMP WITH TIME ZONE;
  v_password TEXT;
  v_result JSON;
BEGIN
  -- البحث عن المستخدم في جدول auth.users
  SELECT id, email_confirmed_at, encrypted_password INTO v_user_id, v_confirmed, v_password
  FROM auth.users
  WHERE email = p_email;
  
  -- التحقق من وجود المستخدم
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'User not found'
    );
  END IF;
  
  -- التحقق من تأكيد البريد الإلكتروني
  IF v_confirmed IS NULL THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'Email not confirmed',
      'code', 'email_not_confirmed'
    );
  END IF;
  
  -- التحقق من صحة كلمة المرور
  IF NOT (v_password = crypt(p_password, v_password)) THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'Invalid login credentials'
    );
  END IF;
  
  -- إنشاء النتيجة
  v_result := json_build_object(
    'success', TRUE,
    'user_id', v_user_id,
    'email', p_email
  );
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', SQLERRM
    );
END;
$$;

-- وظيفة لتسجيل مستخدم جديد
CREATE OR REPLACE FUNCTION public.direct_register_user(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT,
  p_country_code TEXT DEFAULT 'EG',
  p_language TEXT DEFAULT 'ar'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_existing_user UUID;
  v_user_metadata JSONB;
BEGIN
  -- التحقق من وجود المستخدم
  SELECT id INTO v_existing_user FROM auth.users WHERE email = p_email;
  
  IF v_existing_user IS NOT NULL THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'User with this email already exists'
    );
  END IF;
  
  -- إنشاء بيانات المستخدم
  v_user_metadata := jsonb_build_object(
    'name', p_name,
    'avatar', 'https://ui-avatars.com/api/?name=' || p_name || '&background=random',
    'country_code', p_country_code,
    'language', p_language
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
    p_email,
    crypt(p_password, gen_salt('bf')),
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
    updated_at
  )
  VALUES (
    v_user_id,
    p_email,
    p_name,
    'https://ui-avatars.com/api/?name=' || p_name || '&background=random',
    p_country_code,
    p_language,
    NOW(),
    NOW()
  );
  
  RETURN json_build_object(
    'success', TRUE,
    'user_id', v_user_id,
    'email', p_email
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', SQLERRM
    );
END;
$$;
