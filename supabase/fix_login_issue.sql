-- This script helps fix the "You must be logged in" error when updating site settings

-- 1. First, check if the current user is authenticated
SELECT auth.uid() AS current_user_id, auth.role() AS current_user_role;

-- 2. Check if the current user exists in admin_users table
SELECT * FROM admin_users WHERE id = auth.uid();

-- 3. If the user doesn't exist in admin_users, add them
-- Replace 'Your Name' with the actual name
INSERT INTO admin_users (id, email, name, role)
SELECT 
  auth.uid(),
  (SELECT email FROM auth.users WHERE id = auth.uid()),
  'Your Name',
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM admin_users WHERE id = auth.uid()
)
RETURNING *;

-- 4. Check if site_settings table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'site_settings'
) AS site_settings_table_exists;

-- 5. Check RLS policies on site_settings table
SELECT 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies
WHERE tablename = 'site_settings';

-- 6. Create admin permission check function
CREATE OR REPLACE FUNCTION check_admin_permissions(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Check if the user exists in the admin_users table
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE id = user_id
  ) INTO is_admin;
  
  RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Test the admin permission check function
SELECT check_admin_permissions(auth.uid()) AS is_admin;

-- 8. Create function to update site settings
CREATE OR REPLACE FUNCTION update_site_settings(
  p_user_id UUID,
  p_site_name TEXT,
  p_site_description TEXT,
  p_contact_email TEXT,
  p_contact_phone TEXT,
  p_theme_settings JSONB,
  p_seo_settings JSONB,
  p_social_media JSONB,
  p_contact_info JSONB
)
RETURNS JSONB AS $$
DECLARE
  is_admin BOOLEAN;
  result JSONB;
BEGIN
  -- Check if user is an admin
  SELECT check_admin_permissions(p_user_id) INTO is_admin;
  
  IF NOT is_admin THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'message', 'Permission denied. User is not an admin.'
    );
  END IF;
  
  -- Update site settings
  UPDATE site_settings
  SET 
    site_name = p_site_name,
    site_description = p_site_description,
    contact_email = p_contact_email,
    contact_phone = p_contact_phone,
    theme_settings = p_theme_settings,
    seo_settings = p_seo_settings,
    social_media = p_social_media,
    contact_info = p_contact_info,
    updated_at = NOW(),
    updated_by = p_user_id
  WHERE id = 1;
  
  -- If no record exists, insert one
  IF NOT FOUND THEN
    INSERT INTO site_settings (
      id, site_name, site_description, contact_email, contact_phone,
      theme_settings, seo_settings, social_media, contact_info,
      updated_at, updated_by
    ) VALUES (
      1, p_site_name, p_site_description, p_contact_email, p_contact_phone,
      p_theme_settings, p_seo_settings, p_social_media, p_contact_info,
      NOW(), p_user_id
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', TRUE,
    'message', 'Site settings updated successfully.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
