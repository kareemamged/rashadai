-- إصلاح سياسات الوصول لمخزن الصور في Supabase بطريقة مباشرة

-- 1. إنشاء سياسة للقراءة العامة (SELECT)
BEGIN;
DROP POLICY IF EXISTS "Public Read Access for images" ON storage.objects;
CREATE POLICY "Public Read Access for images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'images');
COMMIT;

-- 2. إنشاء سياسة للكتابة (INSERT) للجميع (مؤقتًا للاختبار)
BEGIN;
DROP POLICY IF EXISTS "Public Upload Access for images" ON storage.objects;
CREATE POLICY "Public Upload Access for images" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'images');
COMMIT;

-- 3. إنشاء سياسة للتحديث (UPDATE) للجميع (مؤقتًا للاختبار)
BEGIN;
DROP POLICY IF EXISTS "Public Update Access for images" ON storage.objects;
CREATE POLICY "Public Update Access for images" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'images')
  WITH CHECK (bucket_id = 'images');
COMMIT;

-- 4. إنشاء سياسة للحذف (DELETE) للجميع (مؤقتًا للاختبار)
BEGIN;
DROP POLICY IF EXISTS "Public Delete Access for images" ON storage.objects;
CREATE POLICY "Public Delete Access for images" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'images');
COMMIT;

-- ملاحظة: هذه السياسات تسمح للجميع بالوصول الكامل لمخزن الصور
-- وهي مناسبة للاختبار فقط. في بيئة الإنتاج، يجب تقييد الوصول للكتابة والتحديث والحذف
-- للمستخدمين المسجلين فقط باستخدام auth.role() = 'authenticated'
