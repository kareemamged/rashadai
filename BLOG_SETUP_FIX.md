# إصلاح مشكلات نظام المدونة

هذا الملف يشرح كيفية إصلاح المشكلات المتعلقة بنظام المدونة في المنصة.

## المشكلات الشائعة

### 1. مشكلة العلاقة بين جداول المدونة والمستخدمين

كانت هناك مشكلة في العلاقة بين جدول `blog_posts` وجدول `auth.users`، حيث كان هناك خطأ عند محاولة استعلام البيانات باستخدام العلاقة المباشرة.

### 2. مشكلة "policy already exists" عند إعداد جداول المدونة

عند محاولة تنفيذ ملفات SQL لإعداد جداول المدونة، قد تظهر أخطاء "policy already exists" إذا كانت السياسات موجودة بالفعل.

### 3. مشكلة إنشاء الترجر (Trigger) لتحديث حقل updated_at

كانت هناك مشكلة في إنشاء الترجر الخاص بتحديث حقل `updated_at` في جداول المدونة.

## الحلول

### 1. تعديل طريقة استعلام البيانات

تم تعديل ملف `ContentManagement.tsx` لتجنب استخدام العلاقة المباشرة بين جدول `blog_posts` وجدول `profiles`. بدلاً من ذلك، نقوم بجلب البيانات من كل جدول على حدة ثم ربطها في الكود:

```javascript
// بدلاً من هذا الاستعلام
const { data, error } = await supabase
  .from('blog_posts')
  .select(`
    *,
    author:profiles(id, name, email)
  `)
  .order('created_at', { ascending: false });

// نستخدم هذا الاستعلام
const { data, error } = await supabase
  .from('blog_posts')
  .select('*')
  .order('created_at', { ascending: false });

// ثم نجلب بيانات المؤلفين بشكل منفصل
if (!error && data && data.length > 0) {
  // Get unique author IDs
  const authorIds = [...new Set(data.map(post => post.author_id))].filter(Boolean);

  if (authorIds.length > 0) {
    // Fetch author profiles
    const { data: authorData } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', authorIds);

    // Create a map of author data
    const authorMap = {};
    if (authorData) {
      authorData.forEach(author => {
        authorMap[author.id] = author;
      });
    }

    // Add author information to posts
    data.forEach(post => {
      if (post.author_id && authorMap[post.author_id]) {
        post.author_name = authorMap[post.author_id].name || 
                          authorMap[post.author_id].email?.split('@')[0] || 
                          'Unknown';
      }
    });
  }
}
```

### 2. تعديل ملف SQL لإضافة العلاقة بين الجداول

تم تعديل ملف `add_blog_posts_foreign_key.sql` لإضافة العلاقة بين جدول `blog_posts` وجدول `auth.users` بطريقة آمنة:

```sql
-- Add foreign key relationship between blog_posts and profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'blog_posts_author_id_fkey'
  ) THEN
    ALTER TABLE blog_posts
    ADD CONSTRAINT blog_posts_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES auth.users(id)
    ON DELETE SET NULL;
  END IF;
END
$$;
```

### 3. تعديل طريقة إنشاء السياسات (Policies)

تم تعديل طريقة إنشاء السياسات لتجنب أخطاء "policy already exists":

```sql
-- Update RLS policies to allow proper access
DO $$
BEGIN
  -- Drop existing policies if they exist
  BEGIN
    DROP POLICY IF EXISTS blog_posts_select_policy ON blog_posts;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist, continue
  END;
  
  -- Create new select policy
  CREATE POLICY blog_posts_select_policy ON blog_posts
    FOR SELECT USING (
      published = true OR
      auth.uid() = author_id OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );
EXCEPTION WHEN OTHERS THEN
  -- Handle errors
  RAISE NOTICE 'Error creating select policy: %', SQLERRM;
END
$$;
```

### 4. تعديل طريقة إنشاء الترجر (Trigger)

تم تعديل طريقة إنشاء الترجر لتحديث حقل `updated_at` لتجنب الأخطاء المتعلقة بوجود الترجر بالفعل:

```sql
-- Create a trigger to update the updated_at timestamp (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_blog_posts_updated_at'
  ) THEN
    CREATE TRIGGER update_blog_posts_updated_at
      BEFORE UPDATE ON blog_posts
      FOR EACH ROW
      EXECUTE PROCEDURE update_updated_at_column();
  END IF;
END
$$;
```

## كيفية تطبيق الإصلاحات

### 1. تنفيذ ملف create_exec_sql_function.sql

أولاً، قم بتنفيذ ملف `create_exec_sql_function.sql` لإنشاء وظيفة `exec_sql` في Supabase:

1. قم بتسجيل الدخول إلى لوحة تحكم Supabase
2. انتقل إلى SQL Editor
3. انسخ محتوى ملف `supabase/create_exec_sql_function.sql` والصقه في محرر SQL
4. قم بتنفيذ الاستعلام

### 2. تنفيذ ملف blog_posts_table.sql

بعد ذلك، قم بتنفيذ ملف `blog_posts_table.sql` لإنشاء جداول المدونة:

1. قم بتسجيل الدخول إلى لوحة تحكم Supabase
2. انتقل إلى SQL Editor
3. انسخ محتوى ملف `supabase/blog_posts_table.sql` والصقه في محرر SQL
4. قم بتنفيذ الاستعلام

### 3. تنفيذ ملف add_blog_posts_foreign_key.sql

أخيراً، قم بتنفيذ ملف `add_blog_posts_foreign_key.sql` لإضافة العلاقة بين الجداول:

1. قم بتسجيل الدخول إلى لوحة تحكم Supabase
2. انتقل إلى SQL Editor
3. انسخ محتوى ملف `supabase/add_blog_posts_foreign_key.sql` والصقه في محرر SQL
4. قم بتنفيذ الاستعلام

### 4. تنفيذ ملف setup_blog_tables.js (اختياري)

بدلاً من تنفيذ الملفات SQL يدوياً، يمكنك تنفيذ ملف `setup_blog_tables.js` لإعداد جداول المدونة تلقائياً:

```bash
SUPABASE_SERVICE_KEY=your_service_key node setup_blog_tables.js
```

## التحقق من الإصلاحات

بعد تطبيق الإصلاحات، يمكنك التحقق من أنها تعمل بشكل صحيح من خلال:

1. الانتقال إلى لوحة تحكم المسؤول
2. الانتقال إلى قسم إدارة المحتوى
3. التأكد من أن المنشورات تظهر بشكل صحيح
4. إنشاء منشور جديد والتأكد من أنه يتم حفظه بشكل صحيح
5. تعديل منشور موجود والتأكد من أنه يتم تحديثه بشكل صحيح
6. نشر/تعليق منشور والتأكد من أنه يتم تحديث حالته بشكل صحيح
7. حذف منشور والتأكد من أنه يتم حذفه بشكل صحيح
