const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://voiwxfqryobznmxgpamq.supabase.co';
// IMPORTANT: This must be a service_role key, not anon key
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_ROLE_KEY_HERE';

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAdminUser() {
  try {
    console.log('Setting up admin user...');
    
    // First, check if the admin_users table exists
    const { error: tableCheckError } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1);
    
    if (tableCheckError && tableCheckError.message.includes('does not exist')) {
      console.log('admin_users table does not exist. Creating it first...');
      
      // Read and execute the admin_users_table.sql file
      const adminUsersTableSQL = fs.readFileSync(
        path.join(__dirname, 'supabase', 'admin_users_table.sql'),
        'utf8'
      );
      
      const { error: createTableError } = await supabase.rpc('exec_sql', {
        sql: adminUsersTableSQL
      });
      
      if (createTableError) {
        console.error('Error creating admin_users table:', createTableError);
        return;
      }
      
      console.log('admin_users table created successfully');
    }
    
    // Check if the profiles table exists
    const { error: profilesCheckError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (profilesCheckError && profilesCheckError.message.includes('does not exist')) {
      console.log('profiles table does not exist. Creating it first...');
      
      // Read and execute the profiles_table.sql file
      const profilesTableSQL = fs.readFileSync(
        path.join(__dirname, 'supabase', 'profiles_table.sql'),
        'utf8'
      );
      
      const { error: createProfilesError } = await supabase.rpc('exec_sql', {
        sql: profilesTableSQL
      });
      
      if (createProfilesError) {
        console.error('Error creating profiles table:', createProfilesError);
        return;
      }
      
      console.log('profiles table created successfully');
    }
    
    // Now create or update the admin user
    const adminUserSQL = fs.readFileSync(
      path.join(__dirname, 'supabase', 'create_admin_user.sql'),
      'utf8'
    );
    
    const { error: createAdminError } = await supabase.rpc('exec_sql', {
      sql: adminUserSQL
    });
    
    if (createAdminError) {
      console.error('Error creating admin user:', createAdminError);
      return;
    }
    
    console.log('Admin user setup completed successfully');
    
    // Verify the admin user was created
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
    console.error('Error setting up admin user:', error.message);
  }
}

// Run the setup function
setupAdminUser();
