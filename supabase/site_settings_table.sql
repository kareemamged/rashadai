-- Create site_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  site_name TEXT NOT NULL DEFAULT 'RashadAI',
  site_description TEXT NOT NULL DEFAULT 'AI-Powered Medical Consultation',
  contact_email TEXT NOT NULL DEFAULT 'support@rashadai.com',
  contact_phone TEXT NOT NULL DEFAULT '+201286904277',
  theme_settings JSONB DEFAULT '{
    "timezone": "UTC",
    "dateFormat": "MM/DD/YYYY",
    "timeFormat": "12h",
    "security": {
      "enableTwoFactor": false,
      "sessionTimeout": 30,
      "passwordPolicy": {
        "minLength": 8,
        "requireSpecialChars": true,
        "requireNumbers": true,
        "requireUppercase": true
      },
      "maxLoginAttempts": 5
    },
    "maintenance": {
      "enabled": false,
      "message": "We are currently performing maintenance. Please check back later."
    }
  }'::JSONB,
  seo_settings JSONB DEFAULT '{
    "metaTitle": "RashadAI - AI-Powered Medical Consultation",
    "metaDescription": "Get instant medical guidance from our advanced AI system trained on millions of medical records. Available 24/7, secure, and affordable.",
    "metaKeywords": "AI healthcare, medical consultation, online doctor, symptom checker, health AI, medical advice",
    "ogTitle": "RashadAI - AI-Powered Medical Consultation",
    "ogDescription": "Get instant medical guidance from our advanced AI system trained on millions of medical records.",
    "ogImage": "",
    "twitterCard": "summary_large_image",
    "twitterTitle": "RashadAI - AI-Powered Medical Consultation",
    "twitterDescription": "Get instant medical guidance from our advanced AI system.",
    "twitterImage": "",
    "googleVerification": "",
    "bingVerification": "",
    "analyticsId": ""
  }'::JSONB,
  social_media JSONB DEFAULT '{
    "facebook": "https://facebook.com/rashadai",
    "twitter": "https://twitter.com/rashadai",
    "instagram": "https://instagram.com/rashadai",
    "linkedin": "https://linkedin.com/company/rashadai",
    "youtube": ""
  }'::JSONB,
  contact_info JSONB DEFAULT '{
    "email": "support@rashadai.com",
    "phone": "+201286904277",
    "address": "Cairo, Egypt",
    "supportHours": "24/7 Chat Support"
  }'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to select site settings
CREATE POLICY site_settings_admin_select_policy ON site_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Create policy for admins to update site settings
CREATE POLICY site_settings_admin_update_policy ON site_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Create policy for admins to insert site settings
CREATE POLICY site_settings_admin_insert_policy ON site_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Create policy for all authenticated users to select site settings
CREATE POLICY site_settings_auth_select_policy ON site_settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy for anonymous users to select site settings
CREATE POLICY site_settings_anon_select_policy ON site_settings
  FOR SELECT USING (auth.role() = 'anon');

-- Insert default settings if not exists
INSERT INTO site_settings (id, site_name, site_description)
VALUES (1, 'RashadAI', 'AI-Powered Medical Consultation')
ON CONFLICT (id) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON site_settings
FOR EACH ROW
EXECUTE FUNCTION update_site_settings_updated_at();
