-- إنشاء وظيفة للتحقق من صحة بيانات الأدمن بشكل مباشر
-- هذه الوظيفة تتجاوز نظام المصادقة في Supabase وتتحقق مباشرة من جدول admin_users

-- إنشاء جدول admin_credentials إذا لم يكن موجودًا
-- هذا الجدول سيحتوي على بيانات الدخول للمشرفين بشكل منفصل عن نظام المصادقة الرئيسي
CREATE TABLE IF NOT EXISTS admin_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
    -- إرجاع رسالة خطأ
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid password',
      'admin', NULL
    );
  END IF;
END;
$$;

-- إنشاء وظيفة لتغيير كلمة مرور المشرف
CREATE OR REPLACE FUNCTION change_admin_password(admin_email TEXT, old_password TEXT, new_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record RECORD;
  result JSONB;
BEGIN
  -- البحث عن بيانات الدخول في جدول admin_credentials
  SELECT * INTO admin_record FROM admin_credentials WHERE email = admin_email;
  
  -- إذا لم يتم العثور على بيانات الدخول
  IF admin_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Admin credentials not found'
    );
  END IF;
  
  -- التحقق من كلمة المرور القديمة
  IF admin_record.password_hash = crypt(old_password, admin_record.password_hash) THEN
    -- تحديث كلمة المرور
    UPDATE admin_credentials
    SET password_hash = crypt(new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE email = admin_email;
    
    -- إرجاع رسالة نجاح
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Password changed successfully'
    );
  ELSE
    -- إرجاع رسالة خطأ
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid old password'
    );
  END IF;
END;
$$;

-- إنشاء سجل في جدول admin_credentials للمستخدم kemoamego@icloud.com
DO $$
DECLARE
  admin_record RECORD;
BEGIN
  -- البحث عن المستخدم في جدول admin_users
  SELECT * INTO admin_record FROM admin_users WHERE email = 'kemoamego@icloud.com';
  
  -- إذا تم العثور على المستخدم
  IF admin_record IS NOT NULL THEN
    -- إنشاء سجل في جدول admin_credentials إذا لم يكن موجودًا
    INSERT INTO admin_credentials (email, password_hash, admin_id)
    VALUES (
      'kemoamego@icloud.com',
      crypt('admin123', gen_salt('bf')),
      admin_record.id
    )
    ON CONFLICT (email) DO UPDATE
    SET password_hash = crypt('admin123', gen_salt('bf')),
        updated_at = NOW();
    
    RAISE NOTICE 'Created admin credentials for kemoamego@icloud.com';
  ELSE
    RAISE NOTICE 'Admin user kemoamego@icloud.com not found in admin_users table';
  END IF;
END
$$;
