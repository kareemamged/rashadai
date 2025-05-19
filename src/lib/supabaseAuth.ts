import { supabase } from './supabase';
import { alternativeSignIn } from './alternativeAuth';

/**
 * تسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور
 * نسخة تستخدم نظام المصادقة البديل
 */
export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log('Attempting to sign in with email:', email);

    // محاولة تسجيل الدخول باستخدام نظام المصادقة البديل
    console.log('Using alternative authentication system');
    try {
      const result = await alternativeSignIn(email, password);
      console.log('Login successful with alternative auth');
      return result;
    } catch (altError: any) {
      console.error('Alternative auth error:', altError);

      // تم تعطيل التحقق من تأكيد البريد الإلكتروني مؤقتًا
      // إذا كان الخطأ هو عدم تأكيد البريد الإلكتروني، نتجاهله ونستمر
      if (altError.code === 'email_not_confirmed') {
        console.log('Email not confirmed error detected, but bypassing this check temporarily');
        // لا نرمي الخطأ، بل نستمر في محاولة تسجيل الدخول
      }

      // إذا فشل نظام المصادقة البديل، نحاول استخدام Supabase Auth
      console.log('Falling back to Supabase Auth');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Supabase auth error:', error);
        throw error;
      }

      if (!data || !data.user) {
        console.error('No user data returned from Supabase');
        throw new Error('Invalid login credentials');
      }

      console.log('Login successful with Supabase Auth, user:', data.user.id);
      return { user: data.user };
    }
  } catch (error) {
    console.error('Error in signInWithEmail:', error);
    throw error;
  }
};

/**
 * تسجيل الخروج
 */
export const signOut = async () => {
  try {
    // محاولة تسجيل الخروج من Supabase
    const { error } = await supabase.auth.signOut();

    // مسح جميع بيانات الجلسة من localStorage بغض النظر عن نتيجة تسجيل الخروج
    if (typeof window !== 'undefined') {
      try {
        // مسح جميع مفاتيح Supabase
        const storageKeys = Object.keys(localStorage);

        // تحديد المفاتيح المتعلقة بالمصادقة والجلسة
        const authKeys = storageKeys.filter(key =>
          key.startsWith('sb-') ||
          key.includes('supabase') ||
          key === 'auth-storage' ||
          key === 'last_logged_in_email' ||
          key.startsWith('user_id_') ||
          key.startsWith('profile_') ||
          key.startsWith('avatar_')
        );

        // مسح كل مفتاح متعلق بالمصادقة
        authKeys.forEach(key => {
          localStorage.removeItem(key);
        });

        console.log('Cleared all auth-related data from localStorage');
      } catch (storageError) {
        console.error('Error clearing localStorage:', storageError);
      }
    }

    // التعامل مع أخطاء تسجيل الخروج من Supabase
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error in signOut:', error);
    throw error;
  }
};

/**
 * الحصول على المستخدم الحالي
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    return data.user;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
};
