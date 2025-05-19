-- التحقق من وجود المستخدم في جدول auth.users
SELECT id, email, created_at
FROM auth.users
WHERE id = 'e5d13419-833a-43a5-a226-618f8bf6a699';

-- التحقق من وجود أي مستخدمين في جدول auth.users
SELECT id, email, created_at
FROM auth.users
LIMIT 10;

-- التحقق من وجود المستخدم في جدول profiles
SELECT id, name, email, country_code, language, created_at, updated_at
FROM profiles
WHERE id = 'e5d13419-833a-43a5-a226-618f8bf6a699';

-- التحقق من وجود أي مستخدمين في جدول profiles
SELECT id, name, email, country_code, language, created_at, updated_at
FROM profiles
LIMIT 10;
