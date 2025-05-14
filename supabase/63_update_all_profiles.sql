-- الجزء الثالث: تحديث جميع ملفات المستخدمين

-- 1. إنشاء وظيفة لتحديث جميع المستخدمين الحاليين
-- حذف الوظيفة أولاً إذا كانت موجودة
DROP FUNCTION IF EXISTS update_all_user_profiles();

-- إعادة إنشاء الوظيفة
CREATE FUNCTION update_all_user_profiles()
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record auth.users;
  profile_record profiles;
BEGIN
  -- مرور على جميع المستخدمين في auth.users
  FOR user_record IN SELECT * FROM auth.users
  LOOP
    -- التحقق مما إذا كان المستخدم لديه ملف شخصي
    SELECT * INTO profile_record FROM profiles WHERE id = user_record.id;
    
    IF profile_record.id IS NULL THEN
      -- إنشاء ملف شخصي جديد
      INSERT INTO profiles (
        id, 
        email, 
        name, 
        avatar, 
        country_code, 
        language, 
        created_at, 
        updated_at
      ) VALUES (
        user_record.id, 
        user_record.email, 
        COALESCE(user_record.raw_user_meta_data->>'name', split_part(user_record.email, '@', 1)), 
        COALESCE(user_record.raw_user_meta_data->>'avatar', 'https://ui-avatars.com/api/?name=' || COALESCE(user_record.raw_user_meta_data->>'name', split_part(user_record.email, '@', 1)) || '&background=random'), 
        COALESCE(user_record.raw_user_meta_data->>'country_code', 'EG'), 
        COALESCE(user_record.raw_user_meta_data->>'language', 'ar'), 
        user_record.created_at, 
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        avatar = EXCLUDED.avatar,
        country_code = EXCLUDED.country_code,
        language = EXCLUDED.language,
        updated_at = NOW()
      RETURNING * INTO profile_record;
    ELSE
      -- تحديث الملف الشخصي الموجود
      UPDATE profiles SET
        name = COALESCE(user_record.raw_user_meta_data->>'name', profiles.name, split_part(user_record.email, '@', 1)),
        country_code = COALESCE(user_record.raw_user_meta_data->>'country_code', profiles.country_code, 'EG'),
        language = COALESCE(user_record.raw_user_meta_data->>'language', profiles.language, 'ar'),
        updated_at = NOW()
      WHERE id = user_record.id
      RETURNING * INTO profile_record;
    END IF;
    
    -- تحديث البيانات الوصفية للمستخدم
    UPDATE auth.users SET
      raw_user_meta_data = jsonb_build_object(
        'name', profile_record.name,
        'avatar', profile_record.avatar,
        'country_code', profile_record.country_code,
        'language', profile_record.language,
        'phone', profile_record.phone,
        'bio', profile_record.bio,
        'website', profile_record.website,
        'gender', profile_record.gender,
        'birth_date', profile_record.birth_date,
        'profession', profile_record.profession
      )
    WHERE id = user_record.id;
    
    RETURN NEXT profile_record;
  END LOOP;
  
  RETURN;
END;
$$;

-- 2. تنفيذ وظيفة تحديث جميع المستخدمين
SELECT * FROM update_all_user_profiles();

-- 3. التحقق من النتائج
SELECT id, email, name, country_code, language, updated_at FROM profiles LIMIT 10;
