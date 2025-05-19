-- وظيفة لتجاوز التحقق من تأكيد البريد الإلكتروني عند تسجيل الدخول
-- هذه وظيفة مؤقتة حتى يتم حل مشكلة SMTP

-- وظيفة للتحقق من صحة كلمة المرور بدون التحقق من تأكيد البريد الإلكتروني
CREATE OR REPLACE FUNCTION verify_password_bypass_confirmation(email_param TEXT, password_param TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_password TEXT;
  v_result JSON;
BEGIN
  -- البحث عن المستخدم في جدول auth.users
  SELECT id, encrypted_password INTO v_user_id, v_password
  FROM auth.users
  WHERE email = email_param;
  
  -- التحقق من وجود المستخدم
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'User not found'
    );
  END IF;
  
  -- التحقق من صحة كلمة المرور
  IF crypt(password_param, v_password) = v_password THEN
    RETURN json_build_object(
      'success', TRUE,
      'message', 'Password verified',
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

-- وظيفة للتحقق من حالة المستخدم بدون التحقق من تأكيد البريد الإلكتروني
CREATE OR REPLACE FUNCTION check_user_status_bypass_confirmation(p_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_status TEXT;
  v_block_expires_at TIMESTAMPTZ;
  v_result JSON;
BEGIN
  -- البحث عن المستخدم في جدول auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  -- التحقق من وجود المستخدم
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'User not found'
    );
  END IF;
  
  -- الحصول على حالة المستخدم من جدول profiles
  SELECT status, block_expires_at INTO v_status, v_block_expires_at
  FROM public.profiles
  WHERE id = v_user_id;
  
  -- التحقق من حالة المستخدم
  IF v_status = 'blocked' THEN
    IF v_block_expires_at IS NOT NULL AND v_block_expires_at < NOW() THEN
      -- إذا انتهت مدة الحظر، تحديث حالة المستخدم
      UPDATE public.profiles
      SET status = 'active', block_expires_at = NULL, updated_at = NOW()
      WHERE id = v_user_id;
      
      RETURN json_build_object(
        'success', TRUE,
        'message', 'User is active',
        'status', 'active'
      );
    ELSE
      RETURN json_build_object(
        'success', FALSE,
        'message', 'User is blocked',
        'status', 'blocked',
        'block_expires_at', v_block_expires_at
      );
    END IF;
  ELSE
    RETURN json_build_object(
      'success', TRUE,
      'message', 'User is active',
      'status', v_status
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

-- وظيفة للتحقق من المستخدم وتسجيل الدخول بدون التحقق من تأكيد البريد الإلكتروني
CREATE OR REPLACE FUNCTION login_bypass_confirmation(p_email TEXT, p_password TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_password TEXT;
  v_status TEXT;
  v_block_expires_at TIMESTAMPTZ;
  v_result JSON;
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
  IF crypt(p_password, v_password) != v_password THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'Invalid password'
    );
  END IF;
  
  -- الحصول على حالة المستخدم من جدول profiles
  SELECT status, block_expires_at INTO v_status, v_block_expires_at
  FROM public.profiles
  WHERE id = v_user_id;
  
  -- التحقق من حالة المستخدم
  IF v_status = 'blocked' THEN
    IF v_block_expires_at IS NOT NULL AND v_block_expires_at < NOW() THEN
      -- إذا انتهت مدة الحظر، تحديث حالة المستخدم
      UPDATE public.profiles
      SET status = 'active', block_expires_at = NULL, updated_at = NOW()
      WHERE id = v_user_id;
    ELSE
      RETURN json_build_object(
        'success', FALSE,
        'message', 'User is blocked',
        'status', 'blocked',
        'block_expires_at', v_block_expires_at
      );
    END IF;
  END IF;
  
  -- إرجاع معلومات المستخدم
  RETURN json_build_object(
    'success', TRUE,
    'message', 'Login successful',
    'user_id', v_user_id
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', SQLERRM
    );
END;
$$;
