const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://voiwxfqryobznmxgpamq.supabase.co';
// IMPORTANT: This must be a service_role key, not anon key
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_ROLE_KEY_HERE';

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupExecSqlFunction() {
  try {
    console.log('Setting up exec_sql function...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'supabase', 'create_exec_sql_function.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL directly using the REST API
    // Note: This is a workaround since we can't use the exec_sql function to create itself
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ sql: sqlContent })
    });
    
    if (!response.ok) {
      // If the function doesn't exist yet, we need to create it using a different approach
      console.log('exec_sql function does not exist yet. Creating it using a different approach...');
      
      // Use the Supabase SQL API to create the function
      // This requires the service role key
      const sqlApiResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'params=single-object'
        },
        body: JSON.stringify({
          query: sqlContent
        })
      });
      
      if (!sqlApiResponse.ok) {
        const errorData = await sqlApiResponse.json();
        console.error('Error creating exec_sql function:', errorData);
        console.log('You may need to create this function manually in the Supabase SQL Editor.');
        return;
      }
      
      console.log('exec_sql function created successfully using SQL API');
    } else {
      console.log('exec_sql function already exists or was created successfully');
    }
    
    // Test the function
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: 'SELECT 1 as test'
      });
      
      if (error) {
        console.error('Error testing exec_sql function:', error);
        return;
      }
      
      console.log('exec_sql function is working properly');
    } catch (testError) {
      console.error('Error testing exec_sql function:', testError);
      console.log('You may need to create this function manually in the Supabase SQL Editor.');
    }
    
  } catch (error) {
    console.error('Error setting up exec_sql function:', error.message);
    console.log('You may need to create this function manually in the Supabase SQL Editor.');
  }
}

// Run the setup function
setupExecSqlFunction();
