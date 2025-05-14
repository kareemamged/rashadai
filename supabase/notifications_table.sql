-- Create notifications table to track user activities
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('login', 'registration', 'consultation', 'comment', 'post', 'like')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to select all notifications
CREATE POLICY notifications_admin_select_policy ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create policy for users to select their own notifications
CREATE POLICY notifications_user_select_policy ON notifications
  FOR SELECT USING (
    auth.uid() = user_id
  );

-- Create policy for anyone to insert notifications
CREATE POLICY notifications_insert_policy ON notifications
  FOR INSERT WITH CHECK (true);

-- Create a function to add a notification
CREATE OR REPLACE FUNCTION add_notification(
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_user_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (type, title, message, user_id)
  VALUES (p_type, p_title, p_message, p_user_id)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to add a notification when a user registers
CREATE OR REPLACE FUNCTION on_auth_user_created()
RETURNS trigger AS $$
BEGIN
  PERFORM add_notification(
    'registration',
    NEW.email || ' registered',
    'A new user has registered with email ' || NEW.email,
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE on_auth_user_created();

-- Create a trigger to add a notification when a user logs in
CREATE OR REPLACE FUNCTION on_auth_user_login()
RETURNS trigger AS $$
BEGIN
  PERFORM add_notification(
    'login',
    (SELECT email FROM auth.users WHERE id = NEW.user_id) || ' logged in',
    'User logged in at ' || to_char(NEW.created_at, 'YYYY-MM-DD HH24:MI:SS'),
    NEW.user_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_login
  AFTER INSERT ON auth.sessions
  FOR EACH ROW EXECUTE PROCEDURE on_auth_user_login();
