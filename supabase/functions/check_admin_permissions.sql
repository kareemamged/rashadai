-- Function to check if a user has admin permissions
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

-- Function to get admin user details
CREATE OR REPLACE FUNCTION get_admin_user(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  admin_data JSONB;
BEGIN
  -- Get admin user details
  SELECT jsonb_build_object(
    'id', id,
    'email', email,
    'name', name,
    'role', role,
    'created_at', created_at,
    'last_login', last_login,
    'avatar', avatar,
    'gender', gender,
    'age', age,
    'primary_phone', primary_phone,
    'secondary_phone', secondary_phone
  )
  FROM admin_users
  WHERE id = user_id
  INTO admin_data;
  
  RETURN admin_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update site settings with admin check
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
