-- منح صلاحيات المشرف للمستخدمين بشكل مباشر
-- هذا الاستعلام يقوم بمنح صلاحيات المشرف للمستخدمين المحددين

-- منح صلاحيات المشرف للمستخدم kemoamego@gmail.com
SELECT grant_admin_access('kemoamego@gmail.com', 'super_admin');

-- منح صلاحيات المشرف للمستخدم kemoamego@icloud.com
SELECT grant_admin_access('kemoamego@icloud.com', 'super_admin');
