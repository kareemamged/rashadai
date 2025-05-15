-- إنشاء سياسات الوصول لمخزن الصور في Supabase

-- ملاحظة: يجب إنشاء مخزن images يدويًا من خلال واجهة Supabase
-- 1. انتقل إلى قسم "Storage" في لوحة تحكم Supabase
-- 2. انقر على "New Bucket"
-- 3. أدخل "images" كاسم للمخزن
-- 4. اختر "Public" كنوع المخزن
-- 5. انقر على "Create bucket"

-- 2. إنشاء سياسة للقراءة العامة (SELECT) للجميع
-- هذه السياسة تسمح لأي شخص بعرض الصور
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

-- 3. إنشاء سياسة للكتابة (INSERT) للمستخدمين المسجلين فقط
-- هذه السياسة تسمح فقط للمستخدمين المسجلين برفع صور جديدة
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

-- 4. إنشاء سياسة للتحديث (UPDATE) للمستخدمين المسجلين فقط
-- هذه السياسة تسمح فقط للمستخدمين المسجلين بتحديث الصور الموجودة
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

-- 5. إنشاء سياسة للحذف (DELETE) للمستخدمين المسجلين فقط
-- هذه السياسة تسمح فقط للمستخدمين المسجلين بحذف الصور
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

-- طريقة بديلة لإنشاء سياسات الوصول باستخدام الأوامر المباشرة
-- إذا كانت الطريقة السابقة لا تعمل، يمكنك تجربة هذه الطريقة

-- سياسة القراءة العامة
BEGIN;
DROP POLICY IF EXISTS "Public Read Access for images" ON storage.objects;
CREATE POLICY "Public Read Access for images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'images');
COMMIT;

-- سياسة الكتابة للمستخدمين المسجلين
BEGIN;
DROP POLICY IF EXISTS "Auth Users can upload to images" ON storage.objects;
CREATE POLICY "Auth Users can upload to images" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
COMMIT;

-- سياسة التحديث للمستخدمين المسجلين
BEGIN;
DROP POLICY IF EXISTS "Auth Users can update images" ON storage.objects;
CREATE POLICY "Auth Users can update images" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'images' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
COMMIT;

-- سياسة الحذف للمستخدمين المسجلين
BEGIN;
DROP POLICY IF EXISTS "Auth Users can delete from images" ON storage.objects;
CREATE POLICY "Auth Users can delete from images" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'images' AND auth.role() = 'authenticated');
COMMIT;
