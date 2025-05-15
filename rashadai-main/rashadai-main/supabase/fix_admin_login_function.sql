-- إصلاح وظيفة التحقق من صحة بيانات الأدمن
-- هذه الوظيفة تتجاوز نظام المصادقة في Supabase وتتحقق مباشرة من جدول admin_users

-- إنشاء وظيفة للتحقق من صحة بيانات الأدمن
CREATE OR REPLACE FUNCTION verify_admin_login(admin_email TEXT, admin_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record RECORD;
  admin_user_record RECORD;
  result JSONB;
  has_avatar BOOLEAN;
BEGIN
  -- البحث عن المستخدم في جدول admin_users
  SELECT * INTO admin_user_record FROM admin_users WHERE email = admin_email;
  
  -- إذا لم يتم العثور على المستخدم
  IF admin_user_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Admin user not found',
      'admin', NULL
    );
  END IF;
  
  -- التحقق من وجود عمود avatar في جدول admin_users
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' AND column_name = 'avatar'
  ) INTO has_avatar;
  
  -- البحث عن بيانات الدخول في جدول admin_credentials
  SELECT * INTO admin_record FROM admin_credentials WHERE email = admin_email;
  
  -- إذا لم يتم العثور على بيانات الدخول، نقوم بإنشاء سجل جديد باستخدام كلمة المرور الافتراضية 'admin123'
  IF admin_record IS NULL THEN
    INSERT INTO admin_credentials (email, password_hash, admin_id)
    VALUES (
      admin_email,
      crypt('admin123', gen_salt('bf')),
      admin_user_record.id
    )
    RETURNING * INTO admin_record;
  END IF;
  
  -- التحقق من كلمة المرور
  IF admin_record.password_hash = crypt(admin_password, admin_record.password_hash) THEN
    -- تحديث وقت آخر تسجيل دخول
    UPDATE admin_users
    SET last_login = NOW()
    WHERE id = admin_user_record.id;
    
    -- إرجاع بيانات المستخدم
    IF has_avatar THEN
      -- إذا كان عمود avatar موجود
      RETURN jsonb_build_object(
        'success', true,
        'message', 'Login successful',
        'admin', jsonb_build_object(
          'id', admin_user_record.id,
          'email', admin_user_record.email,
          'name', admin_user_record.name,
          'role', admin_user_record.role,
          'avatar', admin_user_record.avatar,
          'created_at', admin_user_record.created_at,
          'last_login', NOW()
        )
      );
    ELSE
      -- إذا كان عمود avatar غير موجود
      RETURN jsonb_build_object(
        'success', true,
        'message', 'Login successful',
        'admin', jsonb_build_object(
          'id', admin_user_record.id,
          'email', admin_user_record.email,
          'name', admin_user_record.name,
          'role', admin_user_record.role,
          'avatar', 'https://ui-avatars.com/api/?name=' || COALESCE(admin_user_record.name, admin_user_record.email) || '&background=random',
          'created_at', admin_user_record.created_at,
          'last_login', NOW()
        )
      );
    END IF;
  ELSE
    -- إرجاع رسالة خطأ
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid password',
      'admin', NULL
    );
  END IF;
END;
$$;
