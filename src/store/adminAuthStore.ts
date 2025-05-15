import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

// تعريف نوع بيانات المشرف
export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: 'super_admin' | 'content_admin' | 'moderator' | 'admin';
  created_at: string;
  last_login?: string;
  avatar?: string;
  gender?: string;
  age?: number;
  primary_phone?: string;
  secondary_phone?: string;
}

// تعريف حالة مخزن المشرف
interface AdminAuthState {
  adminUser: AdminUser | null;
  isLoading: boolean;
  error: string | null;
  signInAdmin: (email: string, password: string) => Promise<void>;
  signOutAdmin: () => Promise<void>;
  changeAdminPassword: (oldPassword: string, newPassword: string) => Promise<void>;
  setAdminUser: (user: AdminUser | null) => void;
  updateAdminProfile: (profileData: Partial<AdminUser>) => Promise<AdminUser | null>;
  getAdminProfile: () => Promise<AdminUser | null>;
}

// إنشاء مخزن المشرف
export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      adminUser: null,
      isLoading: false,
      error: null,

      // تعيين مستخدم المشرف
      setAdminUser: (user) => {
        set({ adminUser: user });
      },

      // تسجيل دخول المشرف
      signInAdmin: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Attempting to sign in admin with email:', email);

          // تخزين بيانات تسجيل الدخول في localStorage للاستخدام في تجديد الجلسة
          localStorage.setItem('auth_email', email);
          localStorage.setItem('auth_password', password);

          // استخدام الوظيفة الجديدة للتحقق من صحة بيانات المشرف
          const { data, error } = await supabase.rpc('verify_admin_login', {
            admin_email: email,
            admin_password: password
          });

          if (error) {
            console.error('Admin login error:', error);
            // إذا كان الخطأ متعلق بحقل avatar، نستخدم صورة افتراضية
            if (error.message.includes('avatar')) {
              // محاولة تسجيل الدخول مرة أخرى بعد إصلاح وظيفة SQL
              console.log('Retrying admin login after SQL function fix...');
              set({ error: 'جاري إعادة المحاولة...' });

              // إعادة تحميل الصفحة لتطبيق التغييرات الجديدة
              window.location.reload();
              return;
            } else {
              set({ error: error.message });
              throw new Error(error.message);
            }
          }

          if (!data || !data.success) {
            const message = data ? data.message : 'فشل تسجيل الدخول';
            console.error('Admin login failed:', message);
            set({ error: message });

            // مسح بيانات تسجيل الدخول من localStorage في حالة الفشل
            localStorage.removeItem('auth_email');
            localStorage.removeItem('auth_password');

            throw new Error(message);
          }

          // التأكد من وجود بيانات المشرف
          if (!data.admin) {
            console.error('Admin login successful but no admin data returned');
            set({ error: 'تم تسجيل الدخول بنجاح ولكن لم يتم إرجاع بيانات المشرف' });

            // مسح بيانات تسجيل الدخول من localStorage في حالة الفشل
            localStorage.removeItem('auth_email');
            localStorage.removeItem('auth_password');

            throw new Error('تم تسجيل الدخول بنجاح ولكن لم يتم إرجاع بيانات المشرف');
          }

          // إضافة صورة افتراضية إذا لم تكن موجودة
          const adminData = {
            ...data.admin,
            avatar: data.admin.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.admin.name || data.admin.email)}&background=random`
          };

          console.log('Admin login successful:', adminData);

          // تأخير قصير لضمان تحديث الواجهة بشكل صحيح
          await new Promise(resolve => setTimeout(resolve, 300));

          // تسجيل الدخول إلى Supabase أيضًا
          const { error: authError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
          });

          if (authError) {
            console.warn('Supabase auth login failed, but admin login succeeded:', authError);
            // لا نريد إيقاف العملية هنا، فقط نسجل التحذير
          }

          set({ adminUser: adminData });
        } catch (error: any) {
          console.error('Error in signInAdmin:', error);
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // تسجيل خروج المشرف
      signOutAdmin: async () => {
        set({ isLoading: true, error: null });
        try {
          // تسجيل الخروج من Supabase
          await supabase.auth.signOut();

          // مسح بيانات تسجيل الدخول من localStorage
          localStorage.removeItem('auth_email');
          localStorage.removeItem('auth_password');

          // مسح بيانات المشرف من المخزن
          set({ adminUser: null });

          // تأخير قصير لضمان تحديث الواجهة بشكل صحيح
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error: any) {
          console.error('Error in signOutAdmin:', error);
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // تغيير كلمة مرور المشرف
      changeAdminPassword: async (oldPassword: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          const adminUser = get().adminUser;
          if (!adminUser) {
            throw new Error('No admin user logged in');
          }

          // استخدام الوظيفة الجديدة لتغيير كلمة مرور المشرف
          const { data, error } = await supabase.rpc('change_admin_password', {
            admin_email: adminUser.email,
            old_password: oldPassword,
            new_password: newPassword
          });

          if (error) {
            console.error('Change admin password error:', error);
            set({ error: error.message });
            throw new Error(error.message);
          }

          if (!data.success) {
            console.error('Change admin password failed:', data.message);
            set({ error: data.message });
            throw new Error(data.message);
          }

          console.log('Admin password changed successfully');
        } catch (error: any) {
          console.error('Error in changeAdminPassword:', error);
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // تحديث بيانات المشرف
      updateAdminProfile: async (profileData: Partial<AdminUser>) => {
        set({ isLoading: true, error: null });
        try {
          const adminUser = get().adminUser;
          if (!adminUser) {
            throw new Error('No admin user logged in');
          }

          // استخدام الوظيفة المخصصة لتحديث بيانات المشرف
          const { data, error } = await supabase.rpc('update_admin_profile', {
            p_admin_id: adminUser.id,
            p_name: profileData.name,
            p_gender: profileData.gender,
            p_age: profileData.age,
            p_primary_phone: profileData.primary_phone,
            p_secondary_phone: profileData.secondary_phone,
            p_avatar: profileData.avatar
          });

          if (error) {
            console.error('Update admin profile error:', error);
            set({ error: error.message });
            throw new Error(error.message);
          }

          if (!data.success) {
            console.error('Update admin profile failed:', data.message);
            set({ error: data.message });
            throw new Error(data.message);
          }

          // تحديث بيانات المشرف في المخزن
          const updatedAdmin: AdminUser = {
            ...adminUser,
            ...data.data
          };

          set({ adminUser: updatedAdmin });
          console.log('Admin profile updated successfully');

          return updatedAdmin;
        } catch (error: any) {
          console.error('Error in updateAdminProfile:', error);
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // الحصول على بيانات المشرف
      getAdminProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const adminUser = get().adminUser;
          if (!adminUser) {
            console.warn('No admin user logged in');
            return null;
          }

          // استخدام الوظيفة المخصصة للحصول على بيانات المشرف
          const { data, error } = await supabase.rpc('get_admin_profile', {
            p_admin_id: adminUser.id
          });

          if (error) {
            console.error('Get admin profile error:', error);
            set({ error: error.message });
            throw new Error(error.message);
          }

          if (!data.success) {
            console.error('Get admin profile failed:', data.message);
            set({ error: data.message });
            throw new Error(data.message);
          }

          // تحديث بيانات المشرف في المخزن
          const updatedAdmin: AdminUser = {
            ...adminUser,
            ...data.data
          };

          set({ adminUser: updatedAdmin });
          console.log('Admin profile fetched successfully');

          return updatedAdmin;
        } catch (error: any) {
          console.error('Error in getAdminProfile:', error);
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'admin-auth-storage', // اسم مخزن المشرف في localStorage
      partialize: (state) => ({
        adminUser: state.adminUser
      })
    }
  )
);
