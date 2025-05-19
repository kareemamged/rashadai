-- تحديث الدولة الافتراضية لجميع المستخدمين الحاليين من SA إلى EG بشكل إجباري

-- 1. تحديث جميع المستخدمين في جدول profiles
UPDATE profiles
SET
  country_code = 'EG', -- مصر كدولة افتراضية
  updated_at = NOW();

-- 2. تحديث جميع المستخدمين في جدول auth.users
UPDATE auth.users
SET
  raw_user_meta_data = 
    CASE 
      WHEN raw_user_meta_data IS NULL THEN 
        jsonb_build_object('country_code', 'EG')
      WHEN raw_user_meta_data ? 'country_code' THEN 
        jsonb_set(raw_user_meta_data, '{country_code}', '"EG"')
      ELSE 
        raw_user_meta_data || jsonb_build_object('country_code', 'EG')
    END;

-- 3. التحقق من التحديثات
SELECT id, email, country_code, updated_at
FROM profiles
LIMIT 10;

SELECT id, email, raw_user_meta_data->>'country_code' as country_code
FROM auth.users
LIMIT 10;
