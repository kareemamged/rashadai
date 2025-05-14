// مخزن البيانات المحلية - يستخدم للتخزين المحلي والمزامنة
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// تعريف نوع البيانات للملف الشخصي
export interface LocalProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  country_code?: string;
  phone?: string;
  bio?: string;
  language?: string;
  website?: string;
  gender?: string;
  birth_date?: string;
  profession?: string;
  created_at: string;
  updated_at: string;
  last_sync?: string; // وقت آخر مزامنة مع الخادم
}

// تعريف حالة المخزن
interface LocalDataState {
  profiles: Record<string, LocalProfile>; // سجل من معرفات المستخدمين إلى بياناتهم
  lastLoggedInEmail: string | null; // آخر بريد إلكتروني تم تسجيل الدخول به
  
  // وظائف لإدارة البيانات
  saveProfile: (profile: LocalProfile) => void;
  getProfile: (userId: string) => LocalProfile | null;
  getProfileByEmail: (email: string) => LocalProfile | null;
  setLastLoggedInEmail: (email: string) => void;
  getUserIdByEmail: (email: string) => string | null;
  clearAllData: () => void;
}

// إنشاء المخزن باستخدام zustand مع الحفظ المستمر
export const useLocalDataStore = create<LocalDataState>()(
  persist(
    (set, get) => ({
      profiles: {},
      lastLoggedInEmail: null,
      
      // حفظ ملف شخصي
      saveProfile: (profile: LocalProfile) => {
        console.log('Saving profile to local store:', profile.id);
        set((state) => ({
          profiles: {
            ...state.profiles,
            [profile.id]: {
              ...profile,
              updated_at: new Date().toISOString()
            }
          }
        }));
        
        // تحديث localStorage التقليدي أيضًا للتوافق مع الكود القديم
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(`profile_${profile.id}`, JSON.stringify(profile));
            console.log('Also saved to traditional localStorage for compatibility');
          }
        } catch (error) {
          console.warn('Error saving to traditional localStorage:', error);
        }
      },
      
      // الحصول على ملف شخصي بواسطة معرف المستخدم
      getProfile: (userId: string) => {
        const profile = get().profiles[userId] || null;
        
        // محاولة الحصول من localStorage التقليدي إذا لم يكن موجودًا في المخزن
        if (!profile && typeof window !== 'undefined') {
          try {
            const storedProfile = localStorage.getItem(`profile_${userId}`);
            if (storedProfile) {
              const parsedProfile = JSON.parse(storedProfile);
              // حفظ في المخزن للاستخدام المستقبلي
              get().saveProfile(parsedProfile);
              return parsedProfile;
            }
          } catch (error) {
            console.warn('Error reading from traditional localStorage:', error);
          }
        }
        
        return profile;
      },
      
      // الحصول على ملف شخصي بواسطة البريد الإلكتروني
      getProfileByEmail: (email: string) => {
        const userId = get().getUserIdByEmail(email);
        if (userId) {
          return get().getProfile(userId);
        }
        return null;
      },
      
      // تعيين آخر بريد إلكتروني تم تسجيل الدخول به
      setLastLoggedInEmail: (email: string) => {
        console.log('Setting last logged in email:', email);
        set({ lastLoggedInEmail: email });
        
        // تحديث localStorage التقليدي أيضًا
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('last_logged_in_email', email);
          }
        } catch (error) {
          console.warn('Error saving last logged in email to localStorage:', error);
        }
      },
      
      // الحصول على معرف المستخدم بواسطة البريد الإلكتروني
      getUserIdByEmail: (email: string) => {
        // البحث في المخزن
        const profiles = Object.values(get().profiles);
        const profile = profiles.find(p => p.email === email);
        if (profile) {
          return profile.id;
        }
        
        // محاولة الحصول من localStorage التقليدي
        if (typeof window !== 'undefined') {
          try {
            const userId = localStorage.getItem(`user_id_${email}`);
            if (userId) {
              return userId;
            }
          } catch (error) {
            console.warn('Error reading user ID from localStorage:', error);
          }
        }
        
        return null;
      },
      
      // مسح جميع البيانات
      clearAllData: () => {
        console.log('Clearing all local data');
        set({ profiles: {}, lastLoggedInEmail: null });
        
        // مسح localStorage التقليدي أيضًا
        if (typeof window !== 'undefined') {
          try {
            // الحصول على جميع المفاتيح المتعلقة بالملفات الشخصية
            const keys = Object.keys(localStorage);
            const profileKeys = keys.filter(key => 
              key.startsWith('profile_') || 
              key.startsWith('user_id_') || 
              key.startsWith('avatar_') ||
              key === 'last_logged_in_email'
            );
            
            // مسح كل مفتاح
            profileKeys.forEach(key => {
              localStorage.removeItem(key);
            });
            
            console.log('Cleared traditional localStorage items');
          } catch (error) {
            console.warn('Error clearing localStorage:', error);
          }
        }
      }
    }),
    {
      name: 'local-data-storage',
    }
  )
);
