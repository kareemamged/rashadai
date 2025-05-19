// هذا الملف يقوم بتنفيذ ملف SQL لإصلاح مشاكل جدول profiles وتسجيل الدخول

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

// الحصول على المسار الحالي
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// استيراد بيانات الاتصال بـ Supabase
const supabaseUrl = 'https://voiwxfqryobznmxgpamq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvaXd4ZnFyeW9iem5teGdwYW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU0MzA0NzcsImV4cCI6MjAzMTAwNjQ3N30.Wd0jBgJXVWQQJ_Tn3-UxQI-FZHw0T8Kh_cXHBKJGYQE';

// إنشاء عميل Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixProfilesAndAuth() {
  try {
    console.log('بدء إصلاح مشاكل جدول profiles وتسجيل الدخول...');

    // قراءة ملف SQL
    const sqlFilePath = path.join(__dirname, 'supabase', '40_fix_profiles_and_auth.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // تنفيذ ملف SQL باستخدام دالة exec_sql
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    });

    if (error) {
      console.error('حدث خطأ أثناء تنفيذ ملف SQL:', error);

      // محاولة تنفيذ الملف بطريقة أخرى
      console.log('محاولة تنفيذ الملف بطريقة أخرى...');

      // تقسيم الملف إلى أجزاء
      const sqlParts = sqlContent.split(';');

      // تنفيذ كل جزء على حدة
      for (let i = 0; i < sqlParts.length; i++) {
        const part = sqlParts[i].trim();
        if (part) {
          try {
            const { data, error } = await supabase.rpc('exec_sql', {
              sql: part + ';'
            });

            if (error) {
              console.error(`حدث خطأ أثناء تنفيذ الجزء ${i + 1}:`, error);
            } else {
              console.log(`تم تنفيذ الجزء ${i + 1} بنجاح`);
            }
          } catch (partError) {
            console.error(`حدث خطأ أثناء تنفيذ الجزء ${i + 1}:`, partError);
          }
        }
      }
    } else {
      console.log('تم إصلاح مشاكل جدول profiles وتسجيل الدخول بنجاح');
    }

    // التحقق من وجود جدول profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (profilesError) {
      console.error('حدث خطأ أثناء التحقق من وجود جدول profiles:', profilesError);
    } else {
      console.log('تم التحقق من وجود جدول profiles بنجاح');
    }

    // التحقق من وجود سجلات في جدول profiles
    const { data: profilesCount, error: countError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' });

    if (countError) {
      console.error('حدث خطأ أثناء التحقق من وجود سجلات في جدول profiles:', countError);
    } else {
      console.log(`عدد السجلات في جدول profiles: ${profilesCount.length}`);
    }

    console.log('تم الانتهاء من إصلاح مشاكل جدول profiles وتسجيل الدخول');
  } catch (error) {
    console.error('حدث خطأ غير متوقع:', error);
  }
}

// تنفيذ الدالة
fixProfilesAndAuth();
