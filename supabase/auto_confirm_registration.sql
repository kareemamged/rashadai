-- وظيفة لتسجيل المستخدمين مع تأكيد البريد الإلكتروني تلقائيًا
-- هذه وظيفة مؤقتة حتى يتم حل مشكلة SMTP

-- وظيفة لتسجيل مستخدم جديد مع تأكيد البريد الإلكتروني تلقائيًا
CREATE OR REPLACE FUNCTION register_with_auto_confirm(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT DEFAULT NULL,
  p_country_code TEXT DEFAULT 'EG',
  p_language TEXT DEFAULT 'ar'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_name TEXT;
  v_avatar TEXT;
  v_now TIMESTAMPTZ := NOW();
  v_result JSON;
BEGIN
  -- تحديد الاسم إذا لم يتم توفيره
  IF p_name IS NULL OR p_name = '' THEN
    v_name := SPLIT_PART(p_email, '@', 1);
  ELSE
    v_name := p_name;
  END IF;
  
  -- إنشاء رابط الصورة الرمزية
  v_avatar := 'https://ui-avatars.com/api/?name=' || REPLACE(v_name, ' ', '+') || '&background=random';
  
  -- التحقق من وجود المستخدم
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  -- إذا كان المستخدم موجودًا بالفعل
  IF v_user_id IS NOT NULL THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'Email already registered'
    );
  END IF;
  
  -- إنشاء المستخدم في جدول auth.users
  INSERT INTO auth.users (
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token
  )
  VALUES (
    (SELECT id FROM auth.instances LIMIT 1),
    p_email,
    crypt(p_password, gen_salt('bf')),
    v_now,  -- تعيين تاريخ تأكيد البريد الإلكتروني تلقائيًا
    v_now,
    v_now,
    '{"provider":"email","providers":["email"]}',
    json_build_object(
      'name', v_name,
      'avatar', v_avatar,
      'country_code', p_country_code,
      'language', p_language
    ),
    FALSE,
    NULL
  )
  RETURNING id INTO v_user_id;
  
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
    v_user_id,
    p_email,
    v_name,
    v_avatar,
    p_country_code,
    p_language,
    TRUE,  -- تعيين حالة تأكيد البريد الإلكتروني إلى TRUE
    v_now,
    v_now
  );
  
  -- إرجاع النتيجة
  RETURN json_build_object(
    'success', TRUE,
    'message', 'User registered and email auto-confirmed',
    'user_id', v_user_id,
    'email', p_email,
    'name', v_name,
    'avatar', v_avatar,
    'country_code', p_country_code,
    'language', p_language,
    'email_confirmed', TRUE,
    'created_at', v_now
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'Error registering user: ' || SQLERRM
    );
END;
$$;

-- وظيفة للتحقق من حالة تأكيد البريد الإلكتروني وتأكيده تلقائيًا إذا لم يكن مؤكدًا
CREATE OR REPLACE FUNCTION auto_confirm_email(p_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_confirmed BOOLEAN;
  v_result JSON;
BEGIN
  -- البحث عن المستخدم في جدول auth.users
  SELECT id, email_confirmed_at IS NOT NULL INTO v_user_id, v_confirmed
  FROM auth.users
  WHERE email = p_email;
  
  -- التحقق من وجود المستخدم
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'User not found'
    );
  END IF;
  
  -- إذا كان البريد الإلكتروني مؤكدًا بالفعل
  IF v_confirmed THEN
    RETURN json_build_object(
      'success', TRUE,
      'message', 'Email already confirmed',
      'user_id', v_user_id,
      'email', p_email,
      'confirmed', TRUE
    );
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
  
  -- إرجاع النتيجة
  RETURN json_build_object(
    'success', TRUE,
    'message', 'Email auto-confirmed successfully',
    'user_id', v_user_id,
    'email', p_email,
    'confirmed', TRUE
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'Error confirming email: ' || SQLERRM
    );
END;
$$;
