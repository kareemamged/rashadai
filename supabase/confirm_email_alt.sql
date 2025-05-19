-- إنشاء وظيفة RPC لتأكيد البريد الإلكتروني للمستخدم (نسخة بديلة)
CREATE OR REPLACE FUNCTION confirm_email_alt(p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_confirmed BOOLEAN;
  v_profile_exists BOOLEAN;
BEGIN
  -- التحقق من وجود المستخدم في جدول auth.users
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
  
  -- تحديث حالة تأكيد البريد الإلكتروني في جدول auth.users
  UPDATE auth.users
  SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
  WHERE id = v_user_id;
  
  -- التحقق من وجود سجل في جدول profiles
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = v_user_id
  ) INTO v_profile_exists;
  
  -- تحديث حالة المستخدم في جدول profiles إذا كان موجودًا
  IF v_profile_exists THEN
    UPDATE public.profiles
    SET 
      email_confirmed = true,
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;
  
  -- حذف المستخدم من جدول unconfirmed_users إذا كان موجودًا
  DELETE FROM public.unconfirmed_users
  WHERE user_id = v_user_id;
  
  -- إرجاع نتيجة نجاح
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Email confirmed successfully',
    'user_id', v_user_id
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Error confirming email: ' || SQLERRM
    );
END;
$$;

-- إنشاء وظيفة RPC للتحقق من حالة تأكيد البريد الإلكتروني (نسخة بديلة)
CREATE OR REPLACE FUNCTION sync_email_confirmation(p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_confirmed BOOLEAN;
  v_profile_exists BOOLEAN;
BEGIN
  -- التحقق من وجود المستخدم في جدول auth.users
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
    -- التحقق من وجود سجل في جدول profiles
    SELECT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = v_user_id
    ) INTO v_profile_exists;
    
    -- تحديث حالة المستخدم في جدول profiles إذا كان موجودًا
    IF v_profile_exists THEN
      UPDATE public.profiles
      SET 
        email_confirmed = true,
        updated_at = NOW()
      WHERE id = v_user_id;
    END IF;
    
    -- حذف المستخدم من جدول unconfirmed_users إذا كان موجودًا
    DELETE FROM public.unconfirmed_users
    WHERE user_id = v_user_id;
    
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Email already confirmed',
      'confirmed', true
    );
  END IF;
  
  -- إرجاع نتيجة عدم التأكيد
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Email not confirmed',
    'confirmed', false
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Error syncing email confirmation: ' || SQLERRM
    );
END;
$$;
