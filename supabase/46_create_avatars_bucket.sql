-- إنشاء bucket للصور الشخصية في Supabase Storage

-- لا يمكن إنشاء bucket باستخدام SQL مباشرة
-- لذلك سنستخدم وظيفة plpgsql لإنشاء bucket باستخدام extension

DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  -- التحقق مما إذا كان bucket موجودًا بالفعل
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'avatars'
  ) INTO bucket_exists;

  -- إذا لم يكن bucket موجودًا، قم بإنشائه
  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('avatars', 'avatars', TRUE);
  END IF;

  -- إنشاء سياسات الأمان للقراءة والكتابة
  -- سياسة القراءة: يمكن للجميع قراءة الصور
  DROP POLICY IF EXISTS avatars_read_policy ON storage.objects;
  CREATE POLICY avatars_read_policy ON storage.objects
    FOR SELECT
    USING (bucket_id = 'avatars');

  -- سياسة الكتابة: يمكن للمستخدمين المصادق عليهم فقط تحميل الصور
  DROP POLICY IF EXISTS avatars_insert_policy ON storage.objects;
  CREATE POLICY avatars_insert_policy ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'avatars' AND
      auth.role() = 'authenticated'
    );

  -- سياسة التحديث: يمكن للمستخدمين المصادق عليهم تحديث الصور الخاصة بهم فقط
  DROP POLICY IF EXISTS avatars_update_policy ON storage.objects;
  CREATE POLICY avatars_update_policy ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'avatars' AND
      auth.role() = 'authenticated' AND
      (auth.uid()::text = SPLIT_PART(name, '/', 1) OR auth.uid() IN (SELECT id FROM admin_users))
    );

  -- سياسة الحذف: يمكن للمستخدمين المصادق عليهم حذف الصور الخاصة بهم فقط
  DROP POLICY IF EXISTS avatars_delete_policy ON storage.objects;
  CREATE POLICY avatars_delete_policy ON storage.objects
    FOR DELETE
    USING (
      bucket_id = 'avatars' AND
      auth.role() = 'authenticated' AND
      (auth.uid()::text = SPLIT_PART(name, '/', 1) OR auth.uid() IN (SELECT id FROM admin_users))
    );
END
$$;
