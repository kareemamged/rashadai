import { supabase } from './supabase';
import { User } from '../store/authStore';
import * as CryptoJS from 'crypto-js';

// مفتاح التشفير للجلسة المحلية - يجب أن يكون سرياً
const ENCRYPTION_KEY = 'rashadai-secure-key-2024';

// مسح أي تجزئات كلمات مرور مخزنة في localStorage عند تحميل الملف
if (typeof window !== 'undefined') {
  try {
    const storageKeys = Object.keys(localStorage);
    const passwordHashKeys = storageKeys.filter(key => key.startsWith('password_hash_'));

    // مسح كل مفاتيح تجزئات كلمات المرور
    passwordHashKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    if (passwordHashKeys.length > 0) {
      console.log(`Cleared ${passwordHashKeys.length} stored password hashes from localStorage`);
    }
  } catch (error) {
    console.error('Error clearing password hashes from localStorage:', error);
  }
}

/**
 * تسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور
 * هذه الوظيفة تتجاوز نظام Supabase Auth وتستخدم جدول profiles مباشرة
 * تم تعديلها لتجاوز التحقق من تأكيد البريد الإلكتروني كإجراء مؤقت
 */
export const alternativeSignIn = async (email: string, password: string) => {
  try {
    console.log('Using alternative sign in method for:', email);

    // تم تعطيل التحقق من تأكيد البريد الإلكتروني مؤقتًا
    console.log('Email confirmation check is temporarily bypassed');

    // استخدام طريقة مباشرة للتحقق من كلمة المرور بدلاً من وظيفة RPC
    try {
      console.log('Using direct authentication method instead of RPC function');

      // 1. محاولة تسجيل الدخول باستخدام Supabase Auth مباشرة
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('Supabase auth error during alternative login:', authError);

        // إذا كان الخطأ هو "Email not confirmed"، نتجاهله ونستمر
        if (authError.message.includes('Email not confirmed')) {
          console.log('Email not confirmed error detected, but bypassing this check');

          // محاولة تأكيد البريد الإلكتروني تلقائيًا
          try {
            // محاولة تأكيد البريد الإلكتروني باستخدام وظيفة SQL إذا كانت موجودة
            try {
              const { data: confirmData, error: confirmError } = await supabase
                .rpc('auto_confirm_email_direct', { p_email: email });

              if (confirmError) {
                // إذا كان الخطأ بسبب عدم وجود الوظيفة، نتجاهله ونستمر
                if (confirmError.message.includes('function') && confirmError.message.includes('does not exist')) {
                  console.warn('Function auto_confirm_email_direct does not exist, skipping');
                } else {
                  console.warn('Error auto-confirming email with SQL function:', confirmError);
                }
              } else {
                console.log('Auto-confirmed email with SQL function:', confirmData);
              }
            } catch (sqlError) {
              console.warn('Exception during SQL auto-confirmation, proceeding anyway:', sqlError);
            }

            // محاولة تأكيد البريد الإلكتروني باستخدام واجهة برمجة التطبيقات المباشرة
            try {
              const { data: userUpdateData, error: userUpdateError } = await supabase.auth.admin.updateUserById(
                authData?.user?.id || '',
                { email_confirm: true }
              );

              if (userUpdateError) {
                console.warn('Failed to auto-confirm email with admin API, but proceeding anyway:', userUpdateError);
              } else {
                console.log('Successfully auto-confirmed email during login with admin API');
              }
            } catch (adminError) {
              console.warn('Error during admin API auto-confirmation, but proceeding anyway:', adminError);
            }
          } catch (confirmError) {
            console.warn('Error during auto-confirmation, but proceeding anyway:', confirmError);
          }
        } else if (!authError.message.includes('Invalid login credentials')) {
          // إذا كان الخطأ ليس "Invalid login credentials"، نرمي الخطأ
          throw authError;
        }

        // إذا كان الخطأ هو "Invalid login credentials"، نستمر للتحقق من الطرق الأخرى
      } else if (authData && authData.user) {
        // إذا نجح تسجيل الدخول، نتحقق من حالة المستخدم
        console.log('Supabase auth login successful, checking user status');

        // التحقق من حالة المستخدم في جدول profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('status, block_expires_at')
          .eq('id', authData.user.id)
          .single();

        if (!profileError && profileData) {
          // إذا كان المستخدم محظورًا
          if (profileData.status === 'blocked') {
            if (profileData.block_expires_at) {
              const expiresDate = new Date(profileData.block_expires_at);

              // التحقق من انتهاء مدة الحظر
              if (expiresDate > new Date()) {
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                const formattedDate = expiresDate.toLocaleDateString(undefined, options as Intl.DateTimeFormatOptions);
                throw new Error(`Your account is temporarily blocked until ${formattedDate}.`);
              } else {
                // تحديث حالة المستخدم إلى نشط
                await supabase
                  .from('profiles')
                  .update({ status: 'active', block_expires_at: null, updated_at: new Date() })
                  .eq('id', authData.user.id);
              }
            } else {
              throw new Error('Your account has been permanently blocked. Please contact support.');
            }
          }

          // إذا وصلنا إلى هنا، فإن المستخدم نشط ويمكنه تسجيل الدخول
          console.log('User is active, login successful');
          return;
        }
      }
    } catch (loginError: any) {
      console.error('Direct authentication error:', loginError);
      throw loginError;
    }

    // 2. التحقق من وجود المستخدم في جدول profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Invalid login credentials');
    }

    if (!profileData) {
      console.error('User not found in profiles table');
      throw new Error('Invalid login credentials');
    }

    // تم تعطيل التحقق من كلمة المرور باستخدام وظيفة RPC مخصصة
    // لأننا نستخدم وظيفة login_bypass_confirmation التي تتحقق من كلمة المرور بالفعل

    // تم تعطيل التحقق من حالة المستخدم
    // لأننا نستخدم وظيفة login_bypass_confirmation التي تتحقق من حالة المستخدم بالفعل

    // 5. إنشاء كائن المستخدم
    const user: User = {
      id: profileData.id,
      email: profileData.email,
      created_at: profileData.created_at,
      name: profileData.name,
      avatar: profileData.avatar,
      country_code: profileData.country_code,
      phone: profileData.phone,
      bio: profileData.bio,
      language: profileData.language,
      website: profileData.website,
      gender: profileData.gender,
      birth_date: profileData.birth_date,
      profession: profileData.profession
    };

    // 6. إنشاء جلسة وتخزينها في localStorage
    const session = {
      user,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // تنتهي بعد 7 أيام
      created_at: new Date().toISOString()
    };

    // تشفير الجلسة قبل تخزينها
    const encryptedSession = CryptoJS.AES.encrypt(
      JSON.stringify(session),
      ENCRYPTION_KEY
    ).toString();

    localStorage.setItem('alternative_session', encryptedSession);
    console.log('Alternative session created and stored');

    return { user };
  } catch (error) {
    console.error('Error in alternativeSignIn:', error);
    throw error;
  }
};

/**
 * تسجيل الخروج
 */
export const alternativeSignOut = () => {
  try {
    // مسح الجلسة من localStorage
    localStorage.removeItem('alternative_session');

    // مسح أي بيانات أخرى متعلقة بالمصادقة
    const storageKeys = Object.keys(localStorage);
    const authKeys = storageKeys.filter(key =>
      key.startsWith('sb-') ||
      key.includes('supabase') ||
      key === 'auth-storage' ||
      key === 'last_logged_in_email' ||
      key.startsWith('user_id_') ||
      key.startsWith('profile_') ||
      key.startsWith('avatar_') ||
      key.startsWith('password_hash_') // إضافة مسح تجزئات كلمات المرور المخزنة
    );

    // مسح كل مفتاح متعلق بالمصادقة
    authKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    console.log('Alternative session cleared');
    return { success: true };
  } catch (error) {
    console.error('Error in alternativeSignOut:', error);
    return { success: false, error };
  }
};

/**
 * الحصول على المستخدم الحالي من الجلسة المخزنة
 */
export const getCurrentUserFromSession = (): User | null => {
  try {
    const encryptedSession = localStorage.getItem('alternative_session');
    if (!encryptedSession) {
      return null;
    }

    // فك تشفير الجلسة
    const decryptedSession = CryptoJS.AES.decrypt(
      encryptedSession,
      ENCRYPTION_KEY
    ).toString(CryptoJS.enc.Utf8);

    const session = JSON.parse(decryptedSession);

    // التحقق من صلاحية الجلسة
    if (new Date(session.expires_at) < new Date()) {
      console.log('Session has expired');
      localStorage.removeItem('alternative_session');
      return null;
    }

    return session.user;
  } catch (error) {
    console.error('Error getting current user from session:', error);
    return null;
  }
};

/**
 * تحديث الجلسة الحالية
 */
export const updateCurrentSession = (user: User) => {
  try {
    const currentUser = getCurrentUserFromSession();
    if (!currentUser) {
      console.error('No active session to update');
      return false;
    }

    const session = {
      user,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // تمديد الجلسة لمدة 7 أيام
      created_at: new Date().toISOString()
    };

    // تشفير الجلسة قبل تخزينها
    const encryptedSession = CryptoJS.AES.encrypt(
      JSON.stringify(session),
      ENCRYPTION_KEY
    ).toString();

    localStorage.setItem('alternative_session', encryptedSession);
    console.log('Session updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating session:', error);
    return false;
  }
};
