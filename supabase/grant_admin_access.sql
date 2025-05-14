-- Create a function to grant admin access to a user
CREATE OR REPLACE FUNCTION grant_admin_access(user_email TEXT, admin_role TEXT DEFAULT 'super_admin')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with the privileges of the function creator
AS $$
DECLARE
  user_id UUID;
  result TEXT;
BEGIN
  -- Get the user ID
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RETURN 'User not found with email: ' || user_email;
  END IF;
  
  -- Update the user's profile to have admin role
  UPDATE profiles
  SET role = 'admin',
      updated_at = NOW()
  WHERE id = user_id;
  
  -- Insert or update the user in admin_users table
  INSERT INTO admin_users (id, name, email, role)
  VALUES (
    user_id,
    (SELECT name FROM profiles WHERE id = user_id),
    user_email,
    admin_role
  )
  ON CONFLICT (id) DO UPDATE
  SET role = admin_role,
      updated_at = NOW();
  
  RETURN 'Admin access granted to user: ' || user_email;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error granting admin access: ' || SQLERRM;
END;
$$;

-- Create a function to revoke admin access from a user
CREATE OR REPLACE FUNCTION revoke_admin_access(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with the privileges of the function creator
AS $$
DECLARE
  user_id UUID;
  result TEXT;
BEGIN
  -- Get the user ID
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RETURN 'User not found with email: ' || user_email;
  END IF;
  
  -- Update the user's profile to remove admin role
  UPDATE profiles
  SET role = 'user',
      updated_at = NOW()
  WHERE id = user_id;
  
  -- Delete the user from admin_users table
  DELETE FROM admin_users
  WHERE id = user_id;
  
  RETURN 'Admin access revoked from user: ' || user_email;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error revoking admin access: ' || SQLERRM;
END;
$$;
