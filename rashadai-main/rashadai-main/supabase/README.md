# Supabase SQL Scripts

This directory contains SQL scripts for managing the Supabase database.

## Admin User Management

### Check Admin Table Structure
To check the structure of the `admin_users` table:
```sql
-- check_admin_table.sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'admin_users'
ORDER BY ordinal_position;
```

### Create Admin Table
If the `admin_users` table doesn't exist or needs to be recreated:
```sql
-- create_admin_table.sql
-- Creates the admin_users table with all required columns and triggers
```

### Fix Admin Table
If the `admin_users` table exists but is missing columns:
```sql
-- fix_admin_table_simple.sql
-- Adds missing columns to the admin_users table and updates admin users
```

### Create Admin User in Auth
To create admin users in the auth.users table:
```sql
-- create_admin_user_auth.sql
-- Creates or updates users in auth.users with admin credentials
```

### Grant Admin Access
To grant admin access to existing users:
```sql
-- grant_admin_access_simple.sql
-- Grants admin access to specific users
```

## How to Use

1. First, check if the admin_users table exists and its structure:
   - Run `check_admin_table.sql`

2. If the table doesn't exist:
   - Run `create_admin_table.sql`

3. If the table exists but is missing columns:
   - Run `fix_admin_table_simple.sql`

4. To create admin users:
   - Run `create_admin_user_auth.sql` (if users don't exist in auth.users)
   - Run `grant_admin_access_simple.sql` (to grant admin access to existing users)

## Admin Login Credentials

Admin users:
- Email: kemoamego@gmail.com
- Password: Kk1704048
- Role: super_admin

- Email: kemoamego@icloud.com
- Password: Kk1704048
- Role: super_admin
