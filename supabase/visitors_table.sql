-- Create visitors table to track website visitors
CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address TEXT,
  user_agent TEXT,
  page_visited TEXT,
  referrer TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to select visitors
CREATE POLICY visitors_select_policy ON visitors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create policy for anyone to insert visitors
CREATE POLICY visitors_insert_policy ON visitors
  FOR INSERT WITH CHECK (true);

-- Create a view for visitor statistics
CREATE OR REPLACE VIEW visitor_stats AS
SELECT
  COUNT(DISTINCT id) AS total_visitors,
  COUNT(DISTINCT ip_address) AS unique_visitors,
  COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) AS registered_visitors,
  COUNT(DISTINCT CASE WHEN created_at > NOW() - INTERVAL '1 day' THEN id END) AS visitors_today,
  COUNT(DISTINCT CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN id END) AS visitors_this_week,
  COUNT(DISTINCT CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN id END) AS visitors_this_month
FROM visitors;

-- Create a function to track a visitor
CREATE OR REPLACE FUNCTION track_visitor(
  p_ip_address TEXT,
  p_user_agent TEXT,
  p_page_visited TEXT,
  p_referrer TEXT,
  p_user_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_visitor_id UUID;
BEGIN
  INSERT INTO visitors (ip_address, user_agent, page_visited, referrer, user_id)
  VALUES (p_ip_address, p_user_agent, p_page_visited, p_referrer, p_user_id)
  RETURNING id INTO v_visitor_id;
  
  RETURN v_visitor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
