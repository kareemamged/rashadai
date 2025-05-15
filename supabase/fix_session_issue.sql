-- This script helps fix session expiration issues in Supabase

-- 1. First, check if the current user is authenticated
SELECT auth.uid() AS current_user_id, auth.role() AS current_user_role;

-- 2. Check if the current user exists in admin_users table
SELECT * FROM admin_users WHERE id = auth.uid();

-- 3. Create a function to check admin permissions
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

-- 4. Create a function to update site settings with admin check
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

-- 5. Create a function to get site settings
CREATE OR REPLACE FUNCTION get_site_settings()
RETURNS JSONB AS $$
DECLARE
  settings JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', id,
    'site_name', site_name,
    'site_description', site_description,
    'contact_email', contact_email,
    'contact_phone', contact_phone,
    'theme_settings', theme_settings,
    'seo_settings', seo_settings,
    'social_media', social_media,
    'contact_info', contact_info,
    'updated_at', updated_at,
    'updated_by', updated_by
  ) INTO settings
  FROM site_settings
  WHERE id = 1;
  
  RETURN settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Update RLS policies for site_settings table
-- First, drop existing policies
DROP POLICY IF EXISTS site_settings_admin_select_policy ON site_settings;
DROP POLICY IF EXISTS site_settings_admin_update_policy ON site_settings;
DROP POLICY IF EXISTS site_settings_admin_insert_policy ON site_settings;
DROP POLICY IF EXISTS site_settings_auth_select_policy ON site_settings;
DROP POLICY IF EXISTS site_settings_anon_select_policy ON site_settings;

-- Create new policies
-- Policy for admins to select site settings
CREATE POLICY site_settings_admin_select_policy ON site_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Policy for admins to update site settings
CREATE POLICY site_settings_admin_update_policy ON site_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Policy for admins to insert site settings
CREATE POLICY site_settings_admin_insert_policy ON site_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Policy for all authenticated users to select site settings
CREATE POLICY site_settings_auth_select_policy ON site_settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for anonymous users to select site settings
CREATE POLICY site_settings_anon_select_policy ON site_settings
  FOR SELECT USING (auth.role() = 'anon');
