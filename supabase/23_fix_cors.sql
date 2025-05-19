-- هذا الملف يصحح مشكلة CORS في Supabase

-- إضافة جميع الأصول المسموح بها في إعدادات CORS
DO $$
BEGIN
  -- تحديث إعدادات CORS في Supabase
  INSERT INTO auth.config (key, value)
  VALUES ('GOTRUE_EXTERNAL_EMAIL_ENABLED', 'true')
  ON CONFLICT (key) DO UPDATE SET value = 'true';
  
  INSERT INTO auth.config (key, value)
  VALUES ('GOTRUE_EXTERNAL_PHONE_ENABLED', 'true')
  ON CONFLICT (key) DO UPDATE SET value = 'true';
  
  INSERT INTO auth.config (key, value)
  VALUES ('GOTRUE_SMS_AUTOCONFIRM', 'true')
  ON CONFLICT (key) DO UPDATE SET value = 'true';
  
  INSERT INTO auth.config (key, value)
  VALUES ('GOTRUE_MAILER_AUTOCONFIRM', 'true')
  ON CONFLICT (key) DO UPDATE SET value = 'true';
  
  INSERT INTO auth.config (key, value)
  VALUES ('GOTRUE_DISABLE_SIGNUP', 'false')
  ON CONFLICT (key) DO UPDATE SET value = 'false';
  
  -- إضافة جميع الأصول المسموح بها في إعدادات CORS
  INSERT INTO auth.config (key, value)
  VALUES ('GOTRUE_SITE_URL', 'http://localhost:5173,http://localhost:5174,http://localhost:3000,https://voiwxfqryobznmxgpamq.supabase.co')
  ON CONFLICT (key) DO UPDATE SET value = 'http://localhost:5173,http://localhost:5174,http://localhost:3000,https://voiwxfqryobznmxgpamq.supabase.co';
  
  INSERT INTO auth.config (key, value)
  VALUES ('GOTRUE_URI_ALLOW_LIST', 'http://localhost:5173,http://localhost:5174,http://localhost:3000,https://voiwxfqryobznmxgpamq.supabase.co')
  ON CONFLICT (key) DO UPDATE SET value = 'http://localhost:5173,http://localhost:5174,http://localhost:3000,https://voiwxfqryobznmxgpamq.supabase.co';
  
  INSERT INTO auth.config (key, value)
  VALUES ('GOTRUE_ADDITIONAL_REDIRECT_URLS', 'http://localhost:5173,http://localhost:5174,http://localhost:3000,https://voiwxfqryobznmxgpamq.supabase.co')
  ON CONFLICT (key) DO UPDATE SET value = 'http://localhost:5173,http://localhost:5174,http://localhost:3000,https://voiwxfqryobznmxgpamq.supabase.co';
  
  RAISE NOTICE 'تم تحديث إعدادات CORS في Supabase';
END
$$;
