# Supabase SQL Scripts

This directory contains SQL scripts for managing the Supabase database.

## Website Settings Management

### Create Site Settings Table
To create the `site_settings` table:
```sql
-- site_settings_table.sql
-- Creates the site_settings table with all required columns and policies
```

### Add Admin Permission Functions
To add functions for checking admin permissions:
```sql
-- functions/check_admin_permissions.sql
-- Creates functions for checking admin permissions and updating site settings
```

### Fix "You must be logged in" Error
If you encounter the "You must be logged in to perform this action" error:

1. Make sure the user is logged in as an admin
2. Check that RLS policies allow admins to access the site_settings table
3. Run the RPC functions in `functions/check_admin_permissions.sql`
4. Verify the user exists in the admin_users table

### Fix "Your session has expired" Error
If you encounter the "Your session has expired. Please log in again." error:

1. Run the SQL script in `fix_session_issue.sql` to create the necessary functions and policies
2. Use the "Refresh Session" button in the UI to refresh your session
3. If the issue persists, log out and log back in
4. Make sure your browser allows cookies from the Supabase domain

#### Verify Admin Session
To check if the current user has an active session:
```sql
-- In SQL Editor
SELECT auth.uid(), auth.role();
```

#### Check Admin User Existence
To check if the current user exists in the admin_users table:
```sql
-- In SQL Editor
SELECT * FROM admin_users WHERE id = auth.uid();
```

#### Verify RLS Policies
To check if the site_settings table has the correct RLS policies:
```sql
-- In SQL Editor
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'site_settings';
```

#### Test Admin Permissions Function
To test if the admin permissions function works correctly:
```sql
-- In SQL Editor
SELECT check_admin_permissions(auth.uid());
```

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

### Running SQL Scripts in Supabase

1. Log in to your Supabase dashboard
2. Go to the "SQL Editor" section
3. Click on "New Query"
4. Copy and paste the SQL script content
5. Click "Run" to execute the query

### Admin User Setup

1. First, check if the admin_users table exists and its structure:
   - Run `check_admin_table.sql`

2. If the table doesn't exist:
   - Run `create_admin_table.sql`

3. If the table exists but is missing columns:
   - Run `fix_admin_table_simple.sql`

4. To create admin users:
   - Run `create_admin_user_auth.sql` (if users don't exist in auth.users)
   - Run `grant_admin_access_simple.sql` (to grant admin access to existing users)

### Website Settings Setup

1. Create the site_settings table:
   - Run `site_settings_table.sql`

2. Add admin permission functions:
   - Run `functions/check_admin_permissions.sql`

3. If you encounter the "You must be logged in" error:
   - Follow the troubleshooting steps in the "Fix 'You must be logged in' Error" section

## Admin Login Credentials

Admin users:
- Email: kemoamego@gmail.com
- Password: Kk1704048
- Role: super_admin

- Email: kemoamego@icloud.com
- Password: Kk1704048
- Role: super_admin

## تحديث الصورة الشخصية

### إصلاح مشكلة تحديث الصورة الشخصية

لإصلاح مشكلة تحديث الصورة الشخصية، قم بتنفيذ الوظائف التالية:

1. قم بتنفيذ ملف `update_profile_avatar.sql` الذي يحتوي على وظائف مخصصة لتحديث الصورة الشخصية

### وظائف تحديث الصورة الشخصية

#### update_profile_avatar

هذه الوظيفة تقوم بتحديث صورة الملف الشخصي مباشرة في قاعدة البيانات، وتتجاوز سياسات RLS.

```sql
update_profile_avatar(p_user_id UUID, p_avatar_url TEXT)
```

#### update_profile_safe

هذه الوظيفة تقوم بتحديث جميع بيانات الملف الشخصي بطريقة آمنة، وتتجاوز سياسات RLS.

```sql
update_profile_safe(p_user_id UUID, p_profile_data JSONB)
```

### ملاحظات هامة

- يجب تنفيذ هذه الوظائف مرة واحدة فقط
- إذا قمت بتغيير هيكل جدول `profiles`، قد تحتاج إلى تعديل هذه الوظائف
- هذه الوظائف تستخدم `SECURITY DEFINER` مما يعني أنها ستعمل بصلاحيات المالك (owner) للوظيفة، وليس المستخدم الذي يقوم بتنفيذها
