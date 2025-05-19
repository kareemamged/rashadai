import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from './supabase';

// عدد الساعات التي يبقى فيها رابط إعادة تعيين كلمة المرور صالحًا
const TOKEN_EXPIRY_HOURS = 24;

// الحد الأقصى لعدد طلبات إعادة تعيين كلمة المرور في فترة زمنية محددة
const MAX_RESET_REQUESTS = 3;

// فترة الحد (بالساعات) لطلبات إعادة تعيين كلمة المرور
const RATE_LIMIT_HOURS = 24;

/**
 * إنشاء توكن جديد لإعادة تعيين كلمة المرور
 * @param userId معرف المستخدم
 * @param ipAddress عنوان IP للمستخدم (اختياري)
 * @param userAgent معلومات متصفح المستخدم (اختياري)
 * @returns توكن إعادة تعيين كلمة المرور
 */
export const createPasswordResetToken = async (
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> => {
  try {
    // إنشاء توكن فريد
    const token = uuidv4() + '-' + Date.now() + '-' + Math.random().toString(36).substring(2, 15);
    
    // حساب وقت انتهاء الصلاحية
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);
    
    // تخزين التوكن في قاعدة البيانات
    const { data, error } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString(),
        ip_address: ipAddress || null,
        user_agent: userAgent || null
      });
    
    if (error) {
      console.error('Error creating password reset token:', error);
      throw error;
    }
    
    return token;
  } catch (error) {
    console.error('Error in createPasswordResetToken:', error);
    throw error;
  }
};

/**
 * التحقق من صلاحية توكن إعادة تعيين كلمة المرور
 * @param token توكن إعادة تعيين كلمة المرور
 * @returns معرف المستخدم إذا كان التوكن صالحًا، وإلا يرجع null
 */
export const verifyPasswordResetToken = async (token: string): Promise<string | null> => {
  try {
    // البحث عن التوكن في قاعدة البيانات
    const { data, error } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();
    
    if (error || !data) {
      console.error('Error verifying password reset token:', error);
      return null;
    }
    
    // التحقق من انتهاء صلاحية التوكن
    const expiresAt = new Date(data.expires_at);
    const now = new Date();
    
    if (now > expiresAt) {
      console.log('Token has expired');
      return null;
    }
    
    return data.user_id;
  } catch (error) {
    console.error('Error in verifyPasswordResetToken:', error);
    return null;
  }
};

/**
 * تعليم توكن إعادة تعيين كلمة المرور كمستخدم
 * @param token توكن إعادة تعيين كلمة المرور
 * @returns نجاح أو فشل العملية
 */
export const markTokenAsUsed = async (token: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('token', token);
    
    if (error) {
      console.error('Error marking token as used:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in markTokenAsUsed:', error);
    return false;
  }
};

/**
 * التحقق من عدد طلبات إعادة تعيين كلمة المرور للمستخدم في الفترة الزمنية المحددة
 * @param userId معرف المستخدم
 * @returns عدد الطلبات المتبقية، أو -1 إذا تجاوز المستخدم الحد
 */
export const checkResetRequestLimit = async (userId: string): Promise<number> => {
  try {
    // حساب الوقت قبل فترة الحد
    const limitTime = new Date();
    limitTime.setHours(limitTime.getHours() - RATE_LIMIT_HOURS);
    
    // البحث عن عدد الطلبات في الفترة الزمنية المحددة
    const { data, error, count } = await supabase
      .from('password_reset_tokens')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', limitTime.toISOString());
    
    if (error) {
      console.error('Error checking reset request limit:', error);
      return 0; // في حالة الخطأ، نفترض أن المستخدم وصل إلى الحد
    }
    
    const requestCount = count || 0;
    const remainingRequests = MAX_RESET_REQUESTS - requestCount;
    
    return remainingRequests > 0 ? remainingRequests : 0;
  } catch (error) {
    console.error('Error in checkResetRequestLimit:', error);
    return 0;
  }
};

/**
 * الحصول على معرف المستخدم من البريد الإلكتروني
 * @param email البريد الإلكتروني للمستخدم
 * @returns معرف المستخدم إذا وجد، وإلا يرجع null
 */
export const getUserIdByEmail = async (email: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (error || !data) {
      // محاولة البحث في جدول المستخدمين مباشرة
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers({
        filter: {
          email: email
        }
      });
      
      if (userError || !userData || !userData.users || userData.users.length === 0) {
        return null;
      }
      
      return userData.users[0].id;
    }
    
    return data.id;
  } catch (error) {
    console.error('Error in getUserIdByEmail:', error);
    return null;
  }
};

/**
 * إنشاء رابط إعادة تعيين كلمة المرور
 * @param token توكن إعادة تعيين كلمة المرور
 * @returns رابط إعادة تعيين كلمة المرور
 */
export const createResetPasswordLink = (token: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/reset-password/update?token=${token}`;
};
