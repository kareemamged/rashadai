-- وظيفة للتحقق من صحة كلمة المرور
-- يمكن تنفيذ هذا الملف في SQL Editor في Supabase Dashboard

-- إنشاء وظيفة للتحقق من صحة كلمة المرور
CREATE OR REPLACE FUNCTION public.verify_password(
  p_email TEXT,
  p_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_password TEXT;
  v_confirmed TIMESTAMP WITH TIME ZONE;
  v_result JSON;
BEGIN
  -- البحث عن المستخدم في جدول auth.users
  SELECT id, encrypted_password, email_confirmed_at INTO v_user_id, v_password, v_confirmed
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
