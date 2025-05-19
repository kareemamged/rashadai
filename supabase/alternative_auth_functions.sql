-- وظائف نظام المصادقة البديل
-- يمكن تنفيذ هذا الملف في SQL Editor في Supabase Dashboard

-- إنشاء جدول alternative_auth إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS public.alternative_auth (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء وظيفة للتحقق من صحة كلمة المرور في نظام المصادقة البديل
CREATE OR REPLACE FUNCTION public.alternative_verify_password(
  p_email TEXT,
  p_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_password_hash TEXT;
  v_profile RECORD;
BEGIN
  -- البحث عن المستخدم في جدول alternative_auth
  SELECT id, password_hash INTO v_user_id, v_password_hash
  FROM public.alternative_auth
  WHERE email = p_email;
  
  -- إذا لم يتم العثور على المستخدم في جدول alternative_auth، نبحث في جدول auth.users
  IF v_user_id IS NULL THEN
    SELECT id, encrypted_password INTO v_user_id, v_password_hash
    FROM auth.users
    WHERE email = p_email;
    
    IF v_user_id IS NULL THEN
      RETURN json_build_object(
        'success', FALSE,
        'message', 'User not found'
      );
    END IF;
  END IF;
  
  -- التحقق من صحة كلمة المرور
  IF NOT (v_password_hash = crypt(p_password, v_password_hash)) THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'Invalid login credentials'
    );
  END IF;
  
  -- الحصول على بيانات الملف الشخصي
  SELECT * INTO v_profile FROM public.profiles WHERE id = v_user_id;
  
  -- التحقق من حالة المستخدم
  IF v_profile.status = 'blocked' THEN
    IF v_profile.block_expires_at IS NOT NULL AND v_profile.block_expires_at > NOW() THEN
      RETURN json_build_object(
        'success', FALSE,
        'message', 'Your account is temporarily blocked until ' || v_profile.block_expires_at,
        'code', 'account_blocked'
      );
    ELSIF v_profile.block_expires_at IS NULL THEN
      RETURN json_build_object(
        'success', FALSE,
        'message', 'Your account has been permanently blocked. Please contact support.',
        'code', 'account_blocked'
      );
    END IF;
  END IF;
  
  -- إنشاء النتيجة
  RETURN json_build_object(
    'success', TRUE,
    'user_id', v_user_id,
    'email', p_email,
    'profile', row_to_json(v_profile)
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', SQLERRM
    );
END;
$$;

-- إنشاء وظيفة لتسجيل مستخدم جديد في نظام المصادقة البديل
CREATE OR REPLACE FUNCTION public.alternative_register_user(
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
  SELECT id INTO v_existing_user FROM public.profiles WHERE email = p_email;
  
  IF v_existing_user IS NOT NULL THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'User with this email already exists'
    );
  END IF;
  
  -- إنشاء معرف فريد للمستخدم
  v_user_id := gen_random_uuid();
  
  -- إنشاء بيانات المستخدم
  v_user_metadata := jsonb_build_object(
    'name', p_name,
    'avatar', 'https://ui-avatars.com/api/?name=' || p_name || '&background=random',
    'country_code', p_country_code,
    'language', p_language
  );
  
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
    p_email,
    p_name,
    'https://ui-avatars.com/api/?name=' || p_name || '&background=random',
    p_country_code,
    p_language,
    NOW(),
    NOW(),
    'active'
  );
  
  -- إضافة المستخدم إلى جدول alternative_auth
  INSERT INTO public.alternative_auth (
    id,
    email,
    password_hash,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    p_email,
    crypt(p_password, gen_salt('bf')),
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
