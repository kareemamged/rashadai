-- التحقق من وجود المستخدم في جدول auth.users
SELECT id, email, created_at
FROM auth.users
WHERE id = 'e5d13419-833a-43a5-a226-618f8bf6a699';

-- التحقق من وجود المستخدم في جدول profiles
SELECT id, name, email, country_code, language, created_at, updated_at
FROM profiles
WHERE id = 'e5d13419-833a-43a5-a226-618f8bf6a699';

-- إذا لم يكن المستخدم موجودًا في جدول profiles، قم بإدراجه
INSERT INTO profiles (id, email, name, avatar, country_code, language, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE('test', split_part(email, '@', 1)),
  COALESCE('https://ui-avatars.com/api/?name=test&background=random', 'https://ui-avatars.com/api/?name=' || split_part(email, '@', 1) || '&background=random'),
  'EG',
  'ar',
  created_at,
  NOW()
FROM 
  auth.users
WHERE 
  id = 'e5d13419-833a-43a5-a226-618f8bf6a699'
ON CONFLICT (id) DO NOTHING;

-- التحقق مرة أخرى من وجود المستخدم في جدول profiles
SELECT id, name, email, country_code, language, created_at, updated_at
FROM profiles
WHERE id = 'e5d13419-833a-43a5-a226-618f8bf6a699';

-- تحديث بيانات المستخدم في جدول profiles
UPDATE profiles
SET
  name = 'test',
  country_code = 'EG',
  language = 'ar',
  updated_at = NOW()
WHERE
  id = 'e5d13419-833a-43a5-a226-618f8bf6a699';

-- تحديث بيانات المستخدم في جدول auth.users
UPDATE auth.users
SET
  raw_user_meta_data = jsonb_build_object(
    'name', 'test',
    'country_code', 'EG',
    'language', 'ar'
  )
WHERE
  id = 'e5d13419-833a-43a5-a226-618f8bf6a699';
