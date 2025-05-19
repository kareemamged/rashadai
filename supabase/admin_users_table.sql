-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'content_admin', 'moderator')),
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for super_admin to select any admin user
CREATE POLICY admin_users_super_admin_select_policy ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
  );

-- Create policy for admin users to select themselves
CREATE POLICY admin_users_self_select_policy ON admin_users
  FOR SELECT USING (
    auth.uid() = id
  );

-- Create policy for super_admin to insert admin users
CREATE POLICY admin_users_super_admin_insert_policy ON admin_users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
  );

-- Create policy for super_admin to update admin users
CREATE POLICY admin_users_super_admin_update_policy ON admin_users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
  );

-- Create policy for admin users to update themselves
CREATE POLICY admin_users_self_update_policy ON admin_users
  FOR UPDATE USING (
    auth.uid() = id
  );

-- Create policy for super_admin to delete admin users
CREATE POLICY admin_users_super_admin_delete_policy ON admin_users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
  );

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_users_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at timestamp
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE PROCEDURE update_admin_users_updated_at_column();

-- Insert admin users for kemoamego@gmail.com and kemoamego@icloud.com if they exist in auth.users
DO $$
DECLARE
  gmail_user_id UUID;
  icloud_user_id UUID;
BEGIN
  -- Get user IDs from auth.users
  SELECT id INTO gmail_user_id FROM auth.users WHERE email = 'kemoamego@gmail.com';
  SELECT id INTO icloud_user_id FROM auth.users WHERE email = 'kemoamego@icloud.com';
  
  -- Insert admin user for kemoamego@gmail.com if the user exists
  IF gmail_user_id IS NOT NULL THEN
    INSERT INTO admin_users (id, name, email, role)
    VALUES (
      gmail_user_id,
      'kareem amged',
      'kemoamego@gmail.com',
      'super_admin'
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'super_admin',
        name = 'kareem amged',
        updated_at = NOW();
  END IF;
  
  -- Insert admin user for kemoamego@icloud.com if the user exists
  IF icloud_user_id IS NOT NULL THEN
    INSERT INTO admin_users (id, name, email, role)
    VALUES (
      icloud_user_id,
      'kareem amged',
      'kemoamego@icloud.com',
      'super_admin'
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'super_admin',
        name = 'kareem amged',
        updated_at = NOW();
  END IF;
END
$$;
