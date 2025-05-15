const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://voiwxfqryobznmxgpamq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || ''; // Use service key for admin privileges

if (!supabaseKey) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Define the site images
const siteImages = [
  {
    key: 'team_leader_1',
    title: 'صورة قائد الفريق 1',
    description: 'صورة الدكتورة إيما ريتشاردز',
    section: 'leadership',
    image_url: 'https://voiwxfqryobznmxgpamq.supabase.co/storage/v1/object/public/images/leadership/leader1.jpg'
  },
  {
    key: 'team_leader_2',
    title: 'صورة قائد الفريق 2',
    description: 'صورة الدكتور مايكل تشين',
    section: 'leadership',
    image_url: 'https://voiwxfqryobznmxgpamq.supabase.co/storage/v1/object/public/images/leadership/leader2.jpg'
  },
  {
    key: 'team_leader_3',
    title: 'صورة قائد الفريق 3',
    description: 'صورة سارة جونسون',
    section: 'leadership',
    image_url: 'https://voiwxfqryobznmxgpamq.supabase.co/storage/v1/object/public/images/leadership/leader3.jpg'
  },
  {
    key: 'mission_image',
    title: 'صورة قسم المهمة',
    description: 'صورة توضح مهمتنا في الرعاية الصحية',
    section: 'mission',
    image_url: 'https://voiwxfqryobznmxgpamq.supabase.co/storage/v1/object/public/images/mission/mission.jpg'
  },
  {
    key: 'consultation_image',
    title: 'صورة الاستشارة الطبية',
    description: 'صورة توضح الاستشارة الطبية المدعومة بالذكاء الاصطناعي',
    section: 'consultation',
    image_url: 'https://voiwxfqryobznmxgpamq.supabase.co/storage/v1/object/public/images/consultation/consultation.jpg'
  }
];

async function setupSiteImages() {
  try {
    console.log('Setting up site images...');
    
    // Create the site_images table if it doesn't exist
    const { error: tableError } = await supabase.rpc('create_site_images_table_if_not_exists');
    
    if (tableError) {
      console.error('Error creating site_images table:', tableError);
      
      // Try direct SQL approach if RPC fails
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS site_images (
          id SERIAL PRIMARY KEY,
          key VARCHAR(255) NOT NULL UNIQUE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          section VARCHAR(100) NOT NULL,
          image_url TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        DO $$
        BEGIN
          -- Check if the policy already exists
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'site_images' AND policyname = 'Allow public read access'
          ) THEN
            CREATE POLICY "Allow public read access" ON site_images
              FOR SELECT
              USING (true);
          END IF;
          
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'site_images' AND policyname = 'Allow admin update'
          ) THEN
            CREATE POLICY "Allow admin update" ON site_images
              FOR UPDATE
              USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));
          END IF;
          
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'site_images' AND policyname = 'Allow admin insert'
          ) THEN
            CREATE POLICY "Allow admin insert" ON site_images
              FOR INSERT
              WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));
          END IF;
          
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'site_images' AND policyname = 'Allow admin delete'
          ) THEN
            CREATE POLICY "Allow admin delete" ON site_images
              FOR DELETE
              USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));
          END IF;
        END
        $$;
        
        -- Create trigger for updated_at
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        -- Drop the trigger if it exists
        DROP TRIGGER IF EXISTS update_site_images_updated_at ON site_images;
        
        -- Create the trigger
        CREATE TRIGGER update_site_images_updated_at
        BEFORE UPDATE ON site_images
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `;
      
      const { error: sqlError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (sqlError) {
        console.error('Error creating table with SQL:', sqlError);
        return;
      }
    }
    
    // Insert site images
    for (const image of siteImages) {
      const { data, error } = await supabase
        .from('site_images')
        .upsert(image, { onConflict: 'key' })
        .select();
      
      if (error) {
        console.error(`Error inserting image ${image.key}:`, error);
      } else {
        console.log(`Image ${image.key} inserted/updated successfully`);
      }
    }
    
    console.log('Site images setup completed');
  } catch (error) {
    console.error('Error setting up site images:', error);
  }
}

// Run the setup
setupSiteImages();
