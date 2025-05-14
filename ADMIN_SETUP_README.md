# Admin Setup Guide

This guide explains how to set up the admin user and required database tables for the RashadAI admin dashboard.

## Prerequisites

1. Node.js installed
2. Supabase project set up with the URL: `https://voiwxfqryobznmxgpamq.supabase.co`
3. Supabase service role key (not anon key)

## Setup Steps

### 1. Set the Supabase Service Role Key

Replace `YOUR_SERVICE_ROLE_KEY_HERE` in the following files with your actual service role key:

- `setup_admin_user.js`
- `setup_profiles.js`
- `grant_admin_access.js`

You can also set it as an environment variable:

```bash
# Windows
set SUPABASE_SERVICE_KEY=your_service_role_key_here

# Linux/Mac
export SUPABASE_SERVICE_KEY=your_service_role_key_here
```

### 2. Create the Required Tables

Run the following scripts in order:

```bash
# 1. Create the exec_sql function (if it doesn't exist)
node setup_exec_sql.js

# 2. Create the profiles table
node setup_profiles.js

# 3. Create the admin_users table
node setup_admin_users.js

# 4. Create the admin user
node setup_admin_user.js

# 5. Grant admin access
node grant_admin_access.js
```

## Admin Login Credentials

After running the setup scripts, you can log in to the admin dashboard with the following credentials:

- Email: `kemoamego@gmail.com` or `kemoamego@icloud.com`
- Password: `Kk1704048`

## Troubleshooting

### Database Error Granting User

If you see "Database error granting user" when trying to log in, check the following:

1. Make sure all the required tables exist:
   - `profiles`
   - `admin_users`

2. Check that the user exists in `auth.users` and has a corresponding entry in both `profiles` and `admin_users` tables.

3. Verify that the RLS (Row Level Security) policies are correctly set up.

4. Check the browser console for more specific error messages.

### Missing Tables

If any tables are missing, you can create them by running the appropriate setup script:

- For `profiles` table: `node setup_profiles.js`
- For `admin_users` table: `node setup_admin_users.js`

### Reset Admin Password

If you need to reset the admin password, you can run:

```bash
node setup_admin_user.js
```

This will update the password for both `kemoamego@gmail.com` and `kemoamego@icloud.com` to `Kk1704048`.

## Manual SQL Execution

If you prefer to run the SQL directly in the Supabase SQL Editor, you can find the SQL files in the `supabase` directory:

- `profiles_table.sql` - Creates the profiles table
- `admin_users_table.sql` - Creates the admin_users table
- `create_admin_user.sql` - Creates/updates the admin user
- `grant_admin_access.sql` - Creates functions to grant/revoke admin access
