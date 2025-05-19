import { supabase } from './supabase';

// وظيفة للتحقق من صلاحية الجلسة - تم تعديلها لإعادة true دائمًا (إزالة ميزة انتهاء الجلسة)
export const checkSession = async (): Promise<boolean> => {
  try {
    // الحصول على الجلسة الحالية
    const { data: { session } } = await supabase.auth.getSession();

    // التحقق من وجود جلسة نشطة
    if (!session) {
      console.warn('No active session found');
      // محاولة تجديد الجلسة
      await refreshSession();
      // إعادة true بغض النظر عن النتيجة (لإزالة ميزة انتهاء الجلسة)
      return true;
    }

    // إعادة true دائمًا (لإزالة ميزة انتهاء الجلسة)
    return true;
  } catch (error) {
    console.error('Error checking session:', error);
    // إعادة true حتى في حالة حدوث خطأ (لإزالة ميزة انتهاء الجلسة)
    return true;
  }
};

// وظيفة لتجديد الجلسة
export const refreshSession = async (): Promise<boolean> => {
  try {
    console.log('Refreshing Supabase session');

    // محاولة تجديد الجلسة
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      console.error('Error refreshing session:', error);
      return false;
    }

    if (!data.session) {
      console.warn('No session returned after refresh');
      return false;
    }

    console.log('Session refreshed successfully');
    return true;
  } catch (error) {
    console.error('Exception in refreshSession:', error);
    return false;
  }
};

// وظيفة للتحقق من صلاحية الجلسة قبل إرسال البيانات - تم تعديلها لإعادة true دائمًا (إزالة ميزة انتهاء الجلسة)
export const ensureValidSession = async (): Promise<boolean> => {
  try {
    // محاولة تجديد الجلسة إذا كانت موجودة
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      // محاولة تسجيل الدخول مرة أخرى باستخدام البيانات المخزنة
      const storedEmail = localStorage.getItem('auth_email');
      const storedPassword = localStorage.getItem('auth_password');

      if (storedEmail && storedPassword) {
        try {
          console.log('Attempting to sign in again with stored credentials');

          // تسجيل الدخول مرة أخرى
          await supabase.auth.signInWithPassword({
            email: storedEmail,
            password: storedPassword
          });
        } catch (signInError) {
          console.error('Exception signing in again:', signInError);
          // إعادة true بغض النظر عن النتيجة (لإزالة ميزة انتهاء الجلسة)
        }
      }
    }

    // إعادة true دائمًا (لإزالة ميزة انتهاء الجلسة)
    return true;
  } catch (error) {
    console.error('Error in ensureValidSession:', error);
    // إعادة true حتى في حالة حدوث خطأ (لإزالة ميزة انتهاء الجلسة)
    return true;
  }
};

// وظيفة للتحقق من صلاحيات المستخدم المشرف - تم تعديلها لإعادة true دائمًا
export const checkAdminPermissions = async (): Promise<boolean> => {
  try {
    // الحصول على معرف المستخدم الحالي
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn('No user found for admin check');
      // إعادة true بغض النظر عن وجود مستخدم (لإزالة التحقق من صلاحيات المشرف)
      return true;
    }

    // محاولة التحقق من وجود المستخدم في جدول admin_users
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (error) {
        console.warn('Error checking admin permissions:', error);
      }

      // طباعة معلومات تصحيح الأخطاء
      console.log('Admin check for user:', user.id, 'Result:', !!data);
    } catch (checkError) {
      console.error('Exception in admin check:', checkError);
    }

    // إعادة true دائمًا (لإزالة التحقق من صلاحيات المشرف)
    return true;
  } catch (error) {
    console.error('Exception in checkAdminPermissions:', error);
    // إعادة true حتى في حالة حدوث خطأ (لإزالة التحقق من صلاحيات المشرف)
    return true;
  }
};
