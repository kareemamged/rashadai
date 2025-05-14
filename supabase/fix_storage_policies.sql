-- إصلاح سياسات الوصول لمخزن الصور

/*
ملاحظة: هذا الملف يحتوي على تعليمات لإصلاح سياسات الوصول لمخزن الصور في Supabase.
يجب تنفيذ هذه الخطوات من خلال واجهة Supabase أو API.
*/

-- 1. التحقق من وجود مخزن images
-- افتح لوحة تحكم Supabase
-- انتقل إلى قسم "Storage"
-- تحقق من وجود مخزن "images"
-- إذا لم يكن موجودًا، قم بإنشائه

-- 2. إنشاء سياسات الوصول لمخزن images
-- انقر على مخزن "images"
-- انتقل إلى تبويب "Policies"

-- 3. إنشاء سياسة للقراءة العامة
-- انقر على "New Policy"
-- اختر "Get objects by prefix (public)"
-- اختر "For full bucket access"
-- انقر على "Create Policy"

-- 4. إنشاء سياسة للكتابة للمستخدمين المسجلين
-- انقر على "New Policy"
-- اختر "Upload, update, and delete objects"
-- اختر "For authenticated users only"
-- انقر على "Create Policy"

-- 5. التحقق من سياسات الوصول
-- تأكد من وجود السياسات التالية:
-- - سياسة للقراءة العامة (SELECT) مع تعريف "true"
-- - سياسة للكتابة (INSERT, UPDATE, DELETE) مع تعريف "auth.role() = 'authenticated'"

-- 6. إنشاء مجلد blog في مخزن images
-- انقر على مخزن "images"
-- انقر على "Create Folder"
-- أدخل "blog" كاسم للمجلد
-- انقر على "Create"

-- 7. رفع صورة افتراضية لمجلد blog
-- انقر على مجلد "blog"
-- انقر على "Upload File"
-- اختر صورة افتراضية (default.webp)
-- انقر على "Upload"
