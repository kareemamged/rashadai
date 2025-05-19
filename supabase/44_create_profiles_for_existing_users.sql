-- إنشاء سجلات في جدول profiles للمستخدمين الموجودين

DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT u.id, u.email, u.raw_user_meta_data, u.created_at
    FROM auth.users u
    LEFT JOIN profiles p ON u.id = p.id
    WHERE p.id IS NULL
  LOOP
    BEGIN
      INSERT INTO profiles (id, name, avatar, country_code, language, created_at, updated_at)
      VALUES (
        user_record.id,
        COALESCE(user_record.raw_user_meta_data->>'name', split_part(user_record.email, '@', 1)),
        COALESCE(user_record.raw_user_meta_data->>'avatar', 'https://ui-avatars.com/api/?name=' || split_part(user_record.email, '@', 1) || '&background=random'),
        COALESCE(user_record.raw_user_meta_data->>'country_code', 'SA'),
        COALESCE(user_record.raw_user_meta_data->>'language', 'ar'),
        user_record.created_at,
        NOW()
      );
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;
END
$$;
