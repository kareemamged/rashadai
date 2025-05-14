-- إضافة عمود avatar إلى جدول admin_users إذا لم يكن موجودًا

-- التحقق من وجود عمود avatar في جدول admin_users
DO $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  -- التحقق من وجود العمود
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' AND column_name = 'avatar'
  ) INTO column_exists;
  
  -- إذا لم يكن العمود موجودًا، قم بإضافته
  IF NOT column_exists THEN
    EXECUTE 'ALTER TABLE admin_users ADD COLUMN avatar TEXT';
    RAISE NOTICE 'تمت إضافة عمود avatar إلى جدول admin_users';
    
    -- تحديث قيم العمود الجديد لجميع المستخدمين الحاليين
    UPDATE admin_users
    SET avatar = 'https://ui-avatars.com/api/?name=' || COALESCE(name, email) || '&background=random'
    WHERE avatar IS NULL;
    
    RAISE NOTICE 'تم تحديث قيم العمود avatar لجميع المستخدمين الحاليين';
  ELSE
    RAISE NOTICE 'عمود avatar موجود بالفعل في جدول admin_users';
  END IF;
END
$$;
