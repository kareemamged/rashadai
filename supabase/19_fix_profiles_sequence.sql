-- هذا الملف يصحح مشكلة التسلسل profiles_id_seq

-- التحقق من وجود التسلسل
DO $$
DECLARE
  seq_exists BOOLEAN;
BEGIN
  -- لا نحتاج إلى إنشاء تسلسل لعمود id في جدول profiles
  -- لأن عمود id هو من نوع UUID وليس SERIAL
  -- لذلك نقوم بإزالة أي إشارات إلى التسلسل profiles_id_seq في الصلاحيات

  -- التحقق من وجود التسلسل أولاً
  SELECT EXISTS (
    SELECT FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'profiles_id_seq'
  ) INTO seq_exists;

  -- إزالة الصلاحيات المتعلقة بالتسلسل profiles_id_seq إذا كان موجوداً
  -- هذا سيمنع ظهور الخطأ: ERROR: 42P01: relation "profiles_id_seq" does not exist
  IF seq_exists THEN
    EXECUTE 'REVOKE ALL ON SEQUENCE profiles_id_seq FROM authenticated';
    EXECUTE 'REVOKE ALL ON SEQUENCE profiles_id_seq FROM anon';
    EXECUTE 'REVOKE ALL ON SEQUENCE profiles_id_seq FROM service_role';
    RAISE NOTICE 'تم إزالة الصلاحيات المتعلقة بالتسلسل profiles_id_seq';
  ELSE
    RAISE NOTICE 'التسلسل profiles_id_seq غير موجود، لا حاجة لإزالة الصلاحيات';
  END IF;
END
$$;
