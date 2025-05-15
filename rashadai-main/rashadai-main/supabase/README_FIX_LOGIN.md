# إصلاح مشاكل تسجيل الدخول في Supabase

هذا الدليل يشرح كيفية إصلاح مشاكل تسجيل الدخول في Supabase.

## المشكلة

تظهر رسالة خطأ "Database error granting user" عند محاولة تسجيل الدخول، سواء كمستخدم عادي أو كمشرف.

## الحل

### الخطوة 1: تنفيذ ملف إصلاح شامل

قم بتنفيذ الملف `fix_all_login_issues.sql` في قاعدة بيانات Supabase. هذا الملف يقوم بما يلي:

1. إنشاء جدول `profiles` إذا لم يكن موجودًا
2. إنشاء جدول `admin_users` إذا لم يكن موجودًا
3. تمكين سياسات الأمان (RLS) على الجداول
4. حذف سياسات الأمان الموجودة لتجنب الأخطاء
5. إنشاء سياسات الأمان الجديدة
6. إنشاء محفزات لتحديث عمود `updated_at`
7. إنشاء محفز لإنشاء سجل في جدول `profiles` عند إنشاء مستخدم جديد
8. إنشاء سجلات في جدول `profiles` للمستخدمين الموجودين
9. إنشاء سجلات في جدول `admin_users` للمستخدمين المشرفين

```sql
-- تنفيذ الملف الشامل
-- يمكن تنفيذ هذا الملف من خلال SQL Editor في Supabase
```

### الخطوة 2: إنشاء مستخدمين في جدول auth.users

إذا لم يكن المستخدمون موجودين في جدول `auth.users`، قم بتنفيذ الملف `create_auth_users.sql`:

```sql
-- إنشاء مستخدمين في جدول auth.users
-- يمكن تنفيذ هذا الملف من خلال SQL Editor في Supabase
```

### الخطوة 3: التحقق من نجاح الإصلاح

بعد تنفيذ الخطوات السابقة، يمكنك التحقق من نجاح الإصلاح عن طريق:

1. التحقق من وجود جدول `profiles`:

```sql
SELECT * FROM profiles LIMIT 10;
```

2. التحقق من وجود جدول `admin_users`:

```sql
SELECT * FROM admin_users;
```

3. التحقق من وجود المستخدمين المشرفين:

```sql
SELECT * FROM auth.users WHERE email IN ('kemoamego@gmail.com', 'kemoamego@icloud.com');
```

## بيانات تسجيل الدخول

### المستخدمين المشرفين

- البريد الإلكتروني: kemoamego@gmail.com
- كلمة المرور: Kk1704048
- الدور: super_admin

- البريد الإلكتروني: kemoamego@icloud.com
- كلمة المرور: Kk1704048
- الدور: super_admin

## ملاحظات إضافية

### إذا استمرت المشكلة

إذا استمرت مشكلة تسجيل الدخول بعد تنفيذ الخطوات السابقة، يمكنك تجربة ما يلي:

1. التحقق من سياسات الأمان (RLS) على جدول `auth.users`:

```sql
SELECT * FROM pg_policies WHERE tablename = 'users' AND schemaname = 'auth';
```

2. التحقق من وجود محفز `create_profile_after_signup`:

```sql
SELECT * FROM pg_trigger WHERE tgname = 'create_profile_after_signup';
```

3. التحقق من وجود دالة `create_profile_for_user`:

```sql
SELECT * FROM pg_proc WHERE proname = 'create_profile_for_user';
```

### إعادة تعيين كلمة المرور

إذا كنت تريد إعادة تعيين كلمة المرور لمستخدم موجود:

```sql
UPDATE auth.users
SET encrypted_password = crypt('كلمة_المرور_الجديدة', gen_salt('bf'))
WHERE email = 'البريد_الإلكتروني';
```

### حذف مستخدم

إذا كنت تريد حذف مستخدم:

```sql
DELETE FROM auth.users WHERE email = 'البريد_الإلكتروني';
```

ملاحظة: سيتم حذف جميع البيانات المرتبطة بالمستخدم تلقائيًا بسبب قيود `ON DELETE CASCADE`.
