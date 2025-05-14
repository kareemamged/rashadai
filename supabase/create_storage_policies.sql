-- إنشاء سياسات الوصول لمخزن الصور في Supabase

-- 1. إنشاء مخزن images إذا لم يكن موجودًا
-- ملاحظة: هذا يجب تنفيذه من خلال واجهة Supabase أو API
-- ولكن يمكن استخدام الوظيفة التالية إذا كانت متاحة
SELECT storage.create_bucket('images', 'Public images bucket');

-- 2. إنشاء سياسة للقراءة العامة (SELECT) للجميع
BEGIN;
INSERT INTO storage.policies (name, bucket_id, operation, definition, check_columns)
VALUES (
  'Public Read Access for images',
  'images',
  'SELECT',
  'true',
  NULL
)
ON CONFLICT (name, bucket_id, operation) DO UPDATE
SET definition = 'true';
COMMIT;

-- 3. إنشاء سياسة للكتابة (INSERT) للمستخدمين المسجلين فقط
BEGIN;
INSERT INTO storage.policies (name, bucket_id, operation, definition, check_columns)
VALUES (
  'Auth Users can upload images',
  'images',
  'INSERT',
  'auth.role() = ''authenticated''',
  NULL
)
ON CONFLICT (name, bucket_id, operation) DO UPDATE
SET definition = 'auth.role() = ''authenticated''';
COMMIT;

-- 4. إنشاء سياسة للتحديث (UPDATE) للمستخدمين المسجلين فقط
BEGIN;
INSERT INTO storage.policies (name, bucket_id, operation, definition, check_columns)
VALUES (
  'Auth Users can update images',
  'images',
  'UPDATE',
  'auth.role() = ''authenticated''',
  NULL
)
ON CONFLICT (name, bucket_id, operation) DO UPDATE
SET definition = 'auth.role() = ''authenticated''';
COMMIT;

-- 5. إنشاء سياسة للحذف (DELETE) للمستخدمين المسجلين فقط
BEGIN;
INSERT INTO storage.policies (name, bucket_id, operation, definition, check_columns)
VALUES (
  'Auth Users can delete images',
  'images',
  'DELETE',
  'auth.role() = ''authenticated''',
  NULL
)
ON CONFLICT (name, bucket_id, operation) DO UPDATE
SET definition = 'auth.role() = ''authenticated''';
COMMIT;

-- 6. طريقة بديلة باستخدام وظائف Supabase المباشرة (إذا كانت متاحة)
-- إنشاء سياسة للقراءة العامة
SELECT storage.create_policy('images', 'Public Read Access', 'SELECT', 'true');

-- إنشاء سياسة للكتابة للمستخدمين المسجلين
SELECT storage.create_policy('images', 'Auth Users can upload', 'INSERT', 'auth.role() = ''authenticated''');

-- إنشاء سياسة للتحديث للمستخدمين المسجلين
SELECT storage.create_policy('images', 'Auth Users can update', 'UPDATE', 'auth.role() = ''authenticated''');

-- إنشاء سياسة للحذف للمستخدمين المسجلين
SELECT storage.create_policy('images', 'Auth Users can delete', 'DELETE', 'auth.role() = ''authenticated''');

-- 7. إنشاء سياسة للقراءة العامة بطريقة أخرى (إذا كانت الطرق السابقة لا تعمل)
-- يمكن تنفيذ هذا من خلال SQL مباشر إذا كان لديك صلاحيات كافية
DO $$
BEGIN
  EXECUTE format('
    CREATE POLICY "Public Read Access for images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = ''images'')
  ');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Policy might already exist or insufficient permissions';
END $$;

-- 8. إنشاء سياسة للكتابة للمستخدمين المسجلين بطريقة أخرى
DO $$
BEGIN
  EXECUTE format('
    CREATE POLICY "Auth Users can upload to images"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = ''images'' AND auth.role() = ''authenticated'')
  ');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Policy might already exist or insufficient permissions';
END $$;

-- 9. إنشاء سياسة للتحديث للمستخدمين المسجلين بطريقة أخرى
DO $$
BEGIN
  EXECUTE format('
    CREATE POLICY "Auth Users can update images"
    ON storage.objects
    FOR UPDATE
    USING (bucket_id = ''images'' AND auth.role() = ''authenticated'')
    WITH CHECK (bucket_id = ''images'' AND auth.role() = ''authenticated'')
  ');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Policy might already exist or insufficient permissions';
END $$;

-- 10. إنشاء سياسة للحذف للمستخدمين المسجلين بطريقة أخرى
DO $$
BEGIN
  EXECUTE format('
    CREATE POLICY "Auth Users can delete from images"
    ON storage.objects
    FOR DELETE
    USING (bucket_id = ''images'' AND auth.role() = ''authenticated'')
  ');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Policy might already exist or insufficient permissions';
END $$;
