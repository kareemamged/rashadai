// هذا الملف يستخدم لإنشاء ملف شخصي للمستخدم الجديد

// استيراد المكتبات اللازمة
const { createClient } = require('@supabase/supabase-js');

// إعداد Supabase
const supabaseUrl = 'https://voiwxfqryobznmxgpamq.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvaXd4ZnFyeW9iem5teGdwYW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU0NTI1NzYsImV4cCI6MjAzMTAyODU3Nn0.Nh83ebqzf8AeSj3hYHZGj3gYKFhZvd0WHWBK9VQRiQM';
const supabase = createClient(supabaseUrl, supabaseKey);

// معرف المستخدم والبريد الإلكتروني
const userId = process.argv[2]; // معرف المستخدم من سطر الأوامر
const email = process.argv[3]; // البريد الإلكتروني من سطر الأوامر
const name = process.argv[4] || email.split('@')[0]; // الاسم من سطر الأوامر أو استخراجه من البريد الإلكتروني

if (!userId || !email) {
  console.error('يجب تحديد معرف المستخدم والبريد الإلكتروني');
  console.error('مثال: node create_profile.js e5d13419-833a-43a5-a226-618f8bf6a699 user@example.com "اسم المستخدم"');
  process.exit(1);
}

// دالة لإنشاء ملف شخصي للمستخدم
async function createProfile() {
  try {
    console.log(`إنشاء ملف شخصي للمستخدم: ${userId} (${email})`);

    // التحقق من وجود المستخدم في جدول auth.users
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('id, email, created_at')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('خطأ في التحقق من وجود المستخدم:', userError);
      
      // محاولة استخدام RPC
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_auth_user_by_email', { email_param: email });
        
      if (rpcError || !rpcData || rpcData.length === 0) {
        console.error('خطأ في الحصول على بيانات المستخدم:', rpcError || 'لم يتم العثور على المستخدم');
        process.exit(1);
      }
      
      console.log('تم العثور على المستخدم باستخدام RPC:', rpcData[0]);
    } else {
      console.log('تم العثور على المستخدم:', userData);
    }

    // التحقق من وجود المستخدم في جدول profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError && !profileError.message.includes('No rows found')) {
      console.error('خطأ في التحقق من وجود الملف الشخصي:', profileError);
    } else if (profileData) {
      console.log('الملف الشخصي موجود بالفعل:', profileData);
      
      // تحديث الملف الشخصي
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({
          name: name,
          country_code: 'EG',
          language: 'ar',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
        
      if (updateError) {
        console.error('خطأ في تحديث الملف الشخصي:', updateError);
      } else {
        console.log('تم تحديث الملف الشخصي بنجاح:', updateData);
      }
      
      process.exit(0);
    }

    // إنشاء ملف شخصي جديد
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        name: name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        country_code: 'EG',
        language: 'ar',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('خطأ في إنشاء الملف الشخصي:', insertError);
      
      // محاولة استخدام upsert
      const { data: upsertData, error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: email,
          name: name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          country_code: 'EG',
          language: 'ar',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (upsertError) {
        console.error('خطأ في إنشاء الملف الشخصي باستخدام upsert:', upsertError);
        process.exit(1);
      }
      
      console.log('تم إنشاء الملف الشخصي بنجاح باستخدام upsert:', upsertData);
    } else {
      console.log('تم إنشاء الملف الشخصي بنجاح:', insertData);
    }

    // تحديث بيانات المستخدم في جدول auth.users
    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        name: name,
        country_code: 'EG',
        language: 'ar'
      }
    });

    if (updateAuthError) {
      console.error('خطأ في تحديث بيانات المستخدم في auth.users:', updateAuthError);
    } else {
      console.log('تم تحديث بيانات المستخدم في auth.users بنجاح');
    }
  } catch (error) {
    console.error('خطأ غير متوقع:', error);
    process.exit(1);
  }
}

// تنفيذ الدالة
createProfile();
