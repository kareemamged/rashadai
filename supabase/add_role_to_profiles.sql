-- إضافة عمود role إلى جدول profiles

-- التحقق من وجود عمود role في جدول profiles وإضافته إذا لم يكن موجودًا
DO $$
BEGIN
  -- التحقق من وجود جدول profiles
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'profiles'
  ) THEN
    -- التحقق من وجود عمود role
    IF NOT EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'role'
    ) THEN
      -- إضافة عمود role إذا لم يكن موجودًا
      ALTER TABLE profiles
      ADD COLUMN role TEXT DEFAULT 'user';
      
      RAISE NOTICE 'تمت إضافة عمود role إلى جدول profiles';
      
      -- تحديث قيم عمود role للمستخدمين الحاليين
      UPDATE profiles
      SET role = CASE 
        WHEN email IN ('kemoamego@gmail.com', 'kemoamego@icloud.com') THEN 'admin'
        ELSE 'user'
      END;
      
      RAISE NOTICE 'تم تحديث قيم عمود role للمستخدمين الحاليين';
    ELSE
      RAISE NOTICE 'عمود role موجود بالفعل في جدول profiles';
    END IF;
  ELSE
    RAISE NOTICE 'جدول profiles غير موجود';
  END IF;
END
$$;
