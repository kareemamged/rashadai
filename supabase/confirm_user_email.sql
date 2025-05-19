-- إنشاء وظيفة RPC لتأكيد البريد الإلكتروني للمستخدم
CREATE OR REPLACE FUNCTION confirm_user_email(p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_confirmed BOOLEAN;
BEGIN
  -- التحقق من وجود المستخدم
  SELECT id, email_confirmed_at IS NOT NULL
  INTO v_user_id, v_confirmed
  FROM auth.users
  WHERE email = p_email;
  
  -- إذا لم يتم العثور على المستخدم
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User not found'
    );
  END IF;
  
  -- إذا كان البريد الإلكتروني مؤكدًا بالفعل
  IF v_confirmed THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Email already confirmed'
    );
  END IF;
  
  -- تحديث حالة تأكيد البريد الإلكتروني
  UPDATE auth.users
  SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
  WHERE id = v_user_id;
  
  -- تحديث حالة المستخدم في جدول profiles
  UPDATE public.profiles
  SET 
    email_confirmed = true,
    updated_at = NOW()
  WHERE id = v_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Email confirmed successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Error confirming email: ' || SQLERRM
    );
END;
$$;

-- إنشاء وظيفة RPC للتحقق من حالة تأكيد البريد الإلكتروني
CREATE OR REPLACE FUNCTION check_email_confirmed(p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_confirmed BOOLEAN;
  v_email_send_count INT;
  v_last_email_sent_at TIMESTAMPTZ;
BEGIN
  -- التحقق من وجود المستخدم
  SELECT id, email_confirmed_at IS NOT NULL
  INTO v_user_id, v_confirmed
  FROM auth.users
  WHERE email = p_email;
  
  -- الحصول على عدد مرات إرسال البريد الإلكتروني وآخر وقت إرسال
  SELECT 
    COALESCE(email_send_count, 0),
    COALESCE(last_email_sent_at, '1970-01-01'::TIMESTAMPTZ)
  INTO v_email_send_count, v_last_email_sent_at
  FROM public.profiles
  WHERE id = v_user_id;
  
  -- إذا لم يتم العثور على المستخدم
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'exists', false,
      'confirmed', false,
      'email_send_count', 0,
      'last_email_sent_at', NULL
    );
  END IF;
  
  RETURN jsonb_build_object(
    'exists', true,
    'confirmed', v_confirmed,
    'email_send_count', v_email_send_count,
    'last_email_sent_at', v_last_email_sent_at
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'exists', false,
      'confirmed', false,
      'email_send_count', 0,
      'last_email_sent_at', NULL,
      'error', SQLERRM
    );
END;
$$;

-- إنشاء وظيفة RPC لإعادة إرسال بريد تأكيد البريد الإلكتروني
CREATE OR REPLACE FUNCTION resend_confirmation_email(p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_confirmed BOOLEAN;
  v_email_send_count INT;
  v_last_email_sent_at TIMESTAMPTZ;
  v_max_attempts INT := 5;
  v_cooldown_minutes INT := 5;
  v_next_available_at TIMESTAMPTZ;
BEGIN
  -- التحقق من وجود المستخدم
  SELECT id, email_confirmed_at IS NOT NULL
  INTO v_user_id, v_confirmed
  FROM auth.users
  WHERE email = p_email;
  
  -- إذا لم يتم العثور على المستخدم
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User not found'
    );
  END IF;
  
  -- إذا كان البريد الإلكتروني مؤكدًا بالفعل
  IF v_confirmed THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Email already confirmed'
    );
  END IF;
  
  -- الحصول على عدد مرات إرسال البريد الإلكتروني وآخر وقت إرسال
  SELECT 
    COALESCE(email_send_count, 0),
    COALESCE(last_email_sent_at, '1970-01-01'::TIMESTAMPTZ)
  INTO v_email_send_count, v_last_email_sent_at
  FROM public.profiles
  WHERE id = v_user_id;
  
  -- التحقق من عدد المحاولات
  IF v_email_send_count >= v_max_attempts THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Maximum attempts reached',
      'email_send_count', v_email_send_count,
      'max_attempts', v_max_attempts
    );
  END IF;
  
  -- التحقق من فترة الانتظار
  v_next_available_at := v_last_email_sent_at + (v_cooldown_minutes * INTERVAL '1 minute');
  
  IF NOW() < v_next_available_at THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Please wait before requesting another email',
      'email_send_count', v_email_send_count,
      'next_available_at', v_next_available_at
    );
  END IF;
  
  -- تحديث عدد مرات إرسال البريد الإلكتروني وآخر وقت إرسال
  UPDATE public.profiles
  SET 
    email_send_count = COALESCE(email_send_count, 0) + 1,
    last_email_sent_at = NOW(),
    updated_at = NOW()
  WHERE id = v_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Ready to send confirmation email',
    'email_send_count', COALESCE(v_email_send_count, 0) + 1,
    'next_available_at', NOW() + (v_cooldown_minutes * INTERVAL '1 minute')
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Error processing request: ' || SQLERRM
    );
END;
$$;
