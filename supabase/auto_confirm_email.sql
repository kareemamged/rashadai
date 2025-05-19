-- وظيفة لتأكيد البريد الإلكتروني تلقائيًا
-- هذه وظيفة مؤقتة حتى يتم حل مشكلة SMTP

-- وظيفة لتأكيد البريد الإلكتروني تلقائيًا
CREATE OR REPLACE FUNCTION auto_confirm_email_direct(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- البحث عن المستخدم في جدول auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  -- التحقق من وجود المستخدم
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- تأكيد البريد الإلكتروني تلقائيًا
  UPDATE auth.users
  SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
  WHERE id = v_user_id;
  
  -- تحديث حالة المستخدم في جدول profiles
  UPDATE public.profiles
  SET 
    email_confirmed = TRUE,
    updated_at = NOW()
  WHERE id = v_user_id;
  
  -- حذف المستخدم من جدول unconfirmed_users إذا كان موجودًا
  DELETE FROM public.unconfirmed_users
  WHERE user_id = v_user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- وظيفة للتحقق من وجود المستخدم في جدول profiles وإنشائه إذا لم يكن موجودًا
CREATE OR REPLACE FUNCTION ensure_profile_exists(p_user_id UUID, p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_exists BOOLEAN;
  v_name TEXT;
  v_avatar TEXT;
BEGIN
  -- التحقق من وجود المستخدم في جدول profiles
  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE id = p_user_id
  ) INTO v_profile_exists;
  
  -- إذا كان المستخدم غير موجود، قم بإنشائه
  IF NOT v_profile_exists THEN
    -- الحصول على بيانات المستخدم من جدول auth.users
    SELECT 
      COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
      COALESCE(raw_user_meta_data->>'avatar', 'https://ui-avatars.com/api/?name=' || split_part(email, '@', 1) || '&background=random')
    INTO v_name, v_avatar
    FROM auth.users
    WHERE id = p_user_id;
    
    -- إنشاء ملف تعريف المستخدم في جدول profiles
    INSERT INTO public.profiles (
      id,
      email,
      name,
      avatar,
      country_code,
      language,
      email_confirmed,
      created_at,
      updated_at
    )
    VALUES (
      p_user_id,
      p_email,
      v_name,
      v_avatar,
      'EG',
      'ar',
      TRUE,
      NOW(),
      NOW()
    );
    
    RETURN TRUE;
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- وظيفة للتحقق من صحة كلمة المرور وتأكيد البريد الإلكتروني تلقائيًا
CREATE OR REPLACE FUNCTION verify_password_and_confirm_email(p_email TEXT, p_password TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_password TEXT;
  v_profile_exists BOOLEAN;
BEGIN
  -- البحث عن المستخدم في جدول auth.users
  SELECT id, encrypted_password INTO v_user_id, v_password
  FROM auth.users
  WHERE email = p_email;
  
  -- التحقق من وجود المستخدم
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'User not found'
    );
  END IF;
  
  -- التحقق من صحة كلمة المرور
  IF crypt(p_password, v_password) = v_password THEN
    -- تأكيد البريد الإلكتروني تلقائيًا
    UPDATE auth.users
    SET 
      email_confirmed_at = NOW(),
      updated_at = NOW()
    WHERE id = v_user_id;
    
    -- التحقق من وجود المستخدم في جدول profiles وإنشائه إذا لم يكن موجودًا
    SELECT ensure_profile_exists(v_user_id, p_email) INTO v_profile_exists;
    
    -- تحديث حالة المستخدم في جدول profiles
    UPDATE public.profiles
    SET 
      email_confirmed = TRUE,
      updated_at = NOW()
    WHERE id = v_user_id;
    
    RETURN json_build_object(
      'success', TRUE,
      'message', 'Password verified and email confirmed',
      'user_id', v_user_id
    );
  ELSE
    RETURN json_build_object(
      'success', FALSE,
      'message', 'Invalid password'
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', SQLERRM
    );
END;
$$;
