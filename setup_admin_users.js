const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://voiwxfqryobznmxgpamq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvaXd4ZnFyeW9iem5teGdwYW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU0MzA0NzcsImV4cCI6MjAzMTAwNjQ3N30.Yd_QJfFdCnFZkGKlUNt2rUTWcv4uXJrUMyXwqJUFwQs';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAdminUsers() {
  try {
    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'supabase', 'admin_users_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Creating admin_users table and related objects...');

    // Execute SQL using Supabase's rpc function
    // Note: This requires the 'exec_sql' function to be created in your Supabase project
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    });

    if (error) {
      console.error('Error creating admin_users table:', error);
      return;
    }

    console.log('Admin users table created successfully');
    
    // Check if admin users were created
    const { data: adminUsers, error: fetchError } = await supabase
      .from('admin_users')
      .select('*');
    
    if (fetchError) {
      console.error('Error fetching admin users:', fetchError);
      return;
    }
    
    console.log(`Found ${adminUsers.length} admin users:`);
    adminUsers.forEach(user => {
      console.log(`- ${user.email} (${user.role})`);
    });
    
  } catch (error) {
    console.error('Error setting up admin users:', error.message);
  }
}

// Run the setup function
setupAdminUsers();
