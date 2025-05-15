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

async function applyRLSPolicies() {
  try {
    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'supabase', 'admin_roles_policy.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Execute SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });

    if (error) {
      console.error('Error applying RLS policies:', error);
      return;
    }

    console.log('RLS policies applied successfully');
    console.log(data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

applyRLSPolicies();
