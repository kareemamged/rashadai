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

async function setupDashboardTables() {
  try {
    // Read SQL files
    const visitorsTableSQL = fs.readFileSync(
      path.join(__dirname, 'supabase', 'visitors_table.sql'),
      'utf8'
    );
    
    const notificationsTableSQL = fs.readFileSync(
      path.join(__dirname, 'supabase', 'notifications_table.sql'),
      'utf8'
    );

    console.log('Creating visitors table and related objects...');
    const { data: visitorsResult, error: visitorsError } = await supabase.rpc('exec_sql', {
      sql: visitorsTableSQL
    });

    if (visitorsError) {
      console.error('Error creating visitors table:', visitorsError);
    } else {
      console.log('Visitors table created successfully');
    }

    console.log('Creating notifications table and related objects...');
    const { data: notificationsResult, error: notificationsError } = await supabase.rpc('exec_sql', {
      sql: notificationsTableSQL
    });

    if (notificationsError) {
      console.error('Error creating notifications table:', notificationsError);
    } else {
      console.log('Notifications table created successfully');
    }

    // Insert some sample data if tables are empty
    await insertSampleData();

    console.log('Dashboard tables setup completed');
  } catch (error) {
    console.error('Error setting up dashboard tables:', error.message);
  }
}

async function insertSampleData() {
  try {
    // Check if visitors table is empty
    const { count: visitorsCount, error: visitorsCountError } = await supabase
      .from('visitors')
      .select('*', { count: 'exact', head: true });

    if (!visitorsCountError && visitorsCount === 0) {
      console.log('Inserting sample visitor data...');
      
      // Insert 50 sample visitors
      const sampleVisitors = Array.from({ length: 50 }, (_, i) => ({
        ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        page_visited: ['/', '/services', '/about', '/contact', '/blog'][Math.floor(Math.random() * 5)],
        referrer: ['https://google.com', 'https://facebook.com', 'https://twitter.com', null][Math.floor(Math.random() * 4)],
        created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      const { error: insertError } = await supabase
        .from('visitors')
        .insert(sampleVisitors);
      
      if (insertError) {
        console.error('Error inserting sample visitors:', insertError);
      } else {
        console.log('Sample visitor data inserted successfully');
      }
    }

    // Check if notifications table is empty
    const { count: notificationsCount, error: notificationsCountError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true });

    if (!notificationsCountError && notificationsCount === 0) {
      console.log('Inserting sample notification data...');
      
      // Get some user IDs from profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .limit(5);
      
      if (!profilesError && profiles && profiles.length > 0) {
        const sampleNotifications = [];
        
        // Create sample notifications for each user
        for (const profile of profiles) {
          const userName = profile.name || profile.email.split('@')[0];
          
          sampleNotifications.push({
            type: 'login',
            title: `${userName} logged in`,
            message: `${userName} logged in to the system`,
            user_id: profile.id,
            created_at: new Date(Date.now() - Math.floor(Math.random() * 24) * 60 * 60 * 1000).toISOString()
          });
          
          sampleNotifications.push({
            type: 'registration',
            title: `${userName} registered`,
            message: `${userName} created a new account`,
            user_id: profile.id,
            created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
          });
        }
        
        const { error: insertError } = await supabase
          .from('notifications')
          .insert(sampleNotifications);
        
        if (insertError) {
          console.error('Error inserting sample notifications:', insertError);
        } else {
          console.log('Sample notification data inserted successfully');
        }
      }
    }
  } catch (error) {
    console.error('Error inserting sample data:', error.message);
  }
}

setupDashboardTables();
