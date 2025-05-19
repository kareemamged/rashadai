-- Create admin_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_roles table
-- Policy for admins to select any role
CREATE POLICY admin_roles_select_policy ON admin_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy for admins to insert roles
CREATE POLICY admin_roles_insert_policy ON admin_roles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy for admins to update roles
CREATE POLICY admin_roles_update_policy ON admin_roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy for admins to delete roles
CREATE POLICY admin_roles_delete_policy ON admin_roles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create a default admin role if none exists
INSERT INTO admin_roles (name, description, permissions)
SELECT 'Super Admin', 'Full access to all system features', '{
  "view": true,
  "create": true,
  "edit": true,
  "delete": true,
  "approve": true,
  "settings": true,
  "users": true,
  "content": true,
  "design": true,
  "permissions": true
}'
WHERE NOT EXISTS (SELECT 1 FROM admin_roles WHERE name = 'Super Admin');
