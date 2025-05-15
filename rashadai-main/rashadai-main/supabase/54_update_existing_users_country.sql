-- تحديث الدولة الافتراضية لجميع المستخدمين الحاليين من SA إلى EG

-- 1. تحديث جميع المستخدمين في جدول profiles الذين لديهم country_code = 'SA'
UPDATE profiles
SET
  country_code = 'EG', -- مصر كدولة افتراضية
  updated_at = NOW()
WHERE
  country_code = 'SA';

-- 2. تحديث جميع المستخدمين في جدول auth.users الذين لديهم country_code = 'SA' في raw_user_meta_data
UPDATE auth.users
SET
  raw_user_meta_data = jsonb_set(
    raw_user_meta_data,
    '{country_code}',
    '"EG"'
  )
WHERE
  raw_user_meta_data->>'country_code' = 'SA';

-- 3. التحقق من التحديثات
SELECT id, email, country_code, updated_at
FROM profiles
WHERE country_code = 'EG';

SELECT id, email, raw_user_meta_data->>'country_code' as country_code
FROM auth.users
WHERE raw_user_meta_data->>'country_code' = 'EG';
