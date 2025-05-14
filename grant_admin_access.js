const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://voiwxfqryobznmxgpamq.supabase.co';
// IMPORTANT: This must be a service_role key, not anon key
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_ROLE_KEY_HERE';

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey);

async function grantAdminAccess() {
  try {
    console.log('Setting up admin access functions...');
    
    // Read and execute the grant_admin_access.sql file
    const grantAdminSQL = fs.readFileSync(
      path.join(__dirname, 'supabase', 'grant_admin_access.sql'),
      'utf8'
    );
    
    const { error: createFunctionError } = await supabase.rpc('exec_sql', {
      sql: grantAdminSQL
    });
    
    if (createFunctionError) {
      console.error('Error creating admin access functions:', createFunctionError);
      return;
    }
    
    console.log('Admin access functions created successfully');
    
    // Grant admin access to kemoamego@gmail.com
    const { data: gmailResult, error: gmailError } = await supabase.rpc('grant_admin_access', {
      user_email: 'kemoamego@gmail.com',
      admin_role: 'super_admin'
    });
    
    if (gmailError) {
      console.error('Error granting admin access to kemoamego@gmail.com:', gmailError);
    } else {
      console.log(gmailResult);
    }
    
    // Grant admin access to kemoamego@icloud.com
    const { data: icloudResult, error: icloudError } = await supabase.rpc('grant_admin_access', {
      user_email: 'kemoamego@icloud.com',
      admin_role: 'super_admin'
    });
    
    if (icloudError) {
      console.error('Error granting admin access to kemoamego@icloud.com:', icloudError);
    } else {
      console.log(icloudResult);
    }
    
    // Verify admin users
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
    console.error('Error granting admin access:', error.message);
  }
}

// Run the function
grantAdminAccess();
