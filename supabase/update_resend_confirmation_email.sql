-- تحديث وظيفة إعادة إرسال بريد تأكيد البريد الإلكتروني لتتعامل مع المعلمات الجديدة
CREATE OR REPLACE FUNCTION resend_confirmation_email(
  p_email TEXT,
  p_cooldown_minutes INT DEFAULT 3,
  p_max_attempts INT DEFAULT 5
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_confirmed BOOLEAN;
  v_email_send_count INT;
  v_last_email_sent_at TIMESTAMPTZ;
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
  IF v_email_send_count >= p_max_attempts THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Maximum attempts reached',
      'email_send_count', v_email_send_count,
      'max_attempts', p_max_attempts
    );
  END IF;
  
  -- التحقق من فترة الانتظار
  v_next_available_at := v_last_email_sent_at + (p_cooldown_minutes * INTERVAL '1 minute');
  
  IF NOW() < v_next_available_at THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Please wait before requesting another email',
      'email_send_count', v_email_send_count,
      'max_attempts', p_max_attempts,
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
    'max_attempts', p_max_attempts,
    'next_available_at', NOW() + (p_cooldown_minutes * INTERVAL '1 minute')
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Error processing request: ' || SQLERRM
    );
END;
$$;
