import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getDefaultCountry } from '../data/countries';
import {
  signUpWithEmail,
  signInWithEmail,
  signOut as supabaseSignOut,
  getCurrentUser,
  updateUserProfile,
  updateUserPassword,
  setupAuthListener,
  uploadAvatar,
  getUserProfile,
  updateProfile as updateSupabaseProfile,
  updateProfileDirectSQL,
  supabase
} from '../lib/supabase';
import { getDefaultAvatar } from '../lib/imageUtils';
import { useLocalDataStore } from './localDataStore';

export interface User {
  id: string;
  email: string;
  created_at: string;
  name?: string;
  avatar?: string;
  country_code?: string;
  phone?: string;
  bio?: string;
  language?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string, countryCode?: string, name?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  reloadUserProfile: () => Promise<User | null>;
  updateProfile: (userData: Partial<User>) => Promise<User | undefined>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<string>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      setUser: (user) => {
        set({ user });
      },

      signUp: async (email: string, password: string, countryCode?: string, name?: string) => {
        set({ isLoading: true });
        try {
          // Prepare user metadata
          const userData = {
            country_code: countryCode || 'EG', // تغيير القيمة الافتراضية من SA إلى EG
            name: name || email.split('@')[0],
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email.split('@')[0])}&background=random`,
            language: 'ar'
          };

          // Sign up with Supabase
          const { user } = await signUpWithEmail(email, password, userData);

          if (user) {
            const newUser: User = {
              id: user.id,
              email: user.email || email,
              created_at: user.created_at,
              ...userData
            };

            set({ user: newUser });
          }
        } catch (error) {
          console.error('Signup error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      signIn: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          console.log('Attempting to sign in with email:', email);

          // تم نقل كود مسح البيانات المحلية إلى دالة signInWithEmail

          // استخدام المخزن المحلي الجديد
          const localDataStore = useLocalDataStore.getState();

          try {
            // Use signInWithEmail function instead of direct supabase call
            // This will throw an error if the user is blocked
            const { user } = await signInWithEmail(email, password);

            // إذا وصلنا إلى هنا، فهذا يعني أن المستخدم غير محظور
            if (user) {
              console.log('Sign in successful, user ID:', user.id);

              // Get user metadata
              const userData = user.user_metadata || {};
              console.log('User metadata:', userData);

              // تخزين البريد الإلكتروني في المخزن المحلي
              localDataStore.setLastLoggedInEmail(email);

              // محاولة الحصول على البيانات المحلية أولاً
              let localProfileData = localDataStore.getProfile(user.id);

              if (!localProfileData) {
                // محاولة الحصول من localStorage التقليدي كنسخة احتياطية
                try {
                  const storedProfile = localStorage.getItem(`profile_${user.id}`);
                  if (storedProfile) {
                    console.log('Found existing profile data in traditional localStorage');
                    localProfileData = JSON.parse(storedProfile);

                    // حفظ في المخزن الجديد
                    localDataStore.saveProfile(localProfileData);
                  }
                } catch (parseError) {
                  console.warn('Error parsing stored profile:', parseError);
                }
              } else {
                console.log('Found existing profile data in local store:', localProfileData);
              }

              // الحصول على بيانات الملف الشخصي من Supabase
              let profileData = await getUserProfile(user.id);
              console.log('Profile data from Supabase:', profileData);

              // إذا كان لدينا بيانات محلية، نقارنها مع بيانات Supabase
              if (localProfileData) {
                // مقارنة البيانات الفعلية بين المحلية وقاعدة البيانات
                const hasLocalChanges = JSON.stringify({
                  name: localProfileData.name,
                  country_code: localProfileData.country_code,
                  language: localProfileData.language,
                  phone: localProfileData.phone,
                  bio: localProfileData.bio,
                  website: localProfileData.website,
                  gender: localProfileData.gender,
                  birth_date: localProfileData.birth_date,
                  profession: localProfileData.profession
                }) !== JSON.stringify({
                  name: profileData?.name,
                  country_code: profileData?.country_code,
                  language: profileData?.language,
                  phone: profileData?.phone,
                  bio: profileData?.bio,
                  website: profileData?.website,
                  gender: profileData?.gender,
                  birth_date: profileData?.birth_date,
                  profession: profileData?.profession
                });

                // إذا كانت البيانات المحلية مختلفة، نستخدمها ونحاول تحديث قاعدة البيانات
                if (hasLocalChanges) {
                  console.log('Local data has changes, using local data and updating Supabase');
                  profileData = localProfileData;

                  // محاولة تحديث قاعدة البيانات بالبيانات المحلية
                  try {
                    await updateSupabaseProfile(user.id, localProfileData);
                    console.log('Updated Supabase with local profile data');
                  } catch (updateError) {
                    console.warn('Failed to update Supabase with local data:', updateError);
                  }
                }
              }

              // إذا لم يتم العثور على ملف شخصي، نستخدم البيانات الافتراضية
              if (!profileData || Object.keys(profileData).length === 0) {
                console.log('No profile found in Supabase, using default values');
                profileData = {
                  id: user.id,
                  email: user.email || email,
                  name: userData?.name || email.split('@')[0],
                  avatar: userData?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random`,
                  country_code: userData?.country_code || 'EG', // مصر كدولة افتراضية
                  language: userData?.language || 'ar',
                  created_at: user.created_at || new Date().toISOString(),
                  updated_at: new Date().toISOString()
                };

                // محاولة إنشاء ملف شخصي في قاعدة البيانات
                try {
                  await updateSupabaseProfile(user.id, profileData);
                  console.log('Created new profile in Supabase');
                } catch (createError) {
                  console.warn('Failed to create profile in Supabase:', createError);
                }
              }

              // Create a complete user object with all fields
              const loggedInUser: User = {
                id: user.id,
                email: user.email || email,
                created_at: user.created_at || profileData.created_at || new Date().toISOString(),
                name: profileData.name || userData?.name || email.split('@')[0],
                avatar: profileData.avatar || userData?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random`,
                country_code: profileData.country_code || userData?.country_code || 'EG',
                phone: profileData.phone || userData?.phone || '',
                bio: profileData.bio || userData?.bio || '',
                language: profileData.language || userData?.language || 'ar',
                website: profileData.website || userData?.website,
                gender: profileData.gender || userData?.gender,
                birth_date: profileData.birth_date || userData?.birth_date,
                profession: profileData.profession || userData?.profession,
                updated_at: profileData.updated_at || new Date().toISOString()
              };

              // حفظ البيانات في المخزن المحلي الجديد
              localDataStore.saveProfile(loggedInUser);
              console.log('Saved user profile to local store');

              // Set the user in the store
              set({ user: loggedInUser });
              console.log('User set in store:', loggedInUser);

              // تسجيل نشاط تسجيل الدخول في جدول user_activities
              try {
                await supabase
                  .from('user_activities')
                  .insert([{
                    user_id: user.id,
                    type: 'login',
                    description: 'Logged in from web browser',
                    created_at: new Date().toISOString(),
                    ip_address: '192.168.1.1', // يمكن استبدالها بالعنوان الفعلي إذا كان متاحًا
                    device_info: navigator.userAgent || 'Unknown device'
                  }]);
                console.log('Recorded login activity in user_activities table');
              } catch (activityError) {
                console.error('Error recording login activity:', activityError);
                // لا نريد أن نفشل عملية تسجيل الدخول إذا فشل تسجيل النشاط
              }
            }
          } catch (signInError) {
            console.error('Error during sign in:', signInError);

            // إذا فشل تسجيل الدخول، نحاول استرجاع البيانات المحلية
            console.log('Trying to get local profile data for:', email);

            // محاولة الحصول على معرف المستخدم من المخزن المحلي
            let userId = localDataStore.getUserIdByEmail(email);

            if (!userId) {
              // إنشاء معرف جديد إذا لم يكن موجود
              userId = 'fallback-' + Math.random().toString(36).substring(2, 15);
              console.log('Created new fallback user ID:', userId);
            } else {
              console.log('Found existing user ID in local store:', userId);
            }

            // محاولة الحصول على الملف الشخصي من المخزن المحلي
            let fallbackUser = localDataStore.getProfile(userId);

            if (!fallbackUser) {
              // إنشاء ملف شخصي جديد إذا لم يكن موجود
              fallbackUser = {
                id: userId,
                email: email,
                created_at: new Date().toISOString(),
                name: email.split('@')[0],
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random`,
                country_code: 'EG',
                phone: '',
                bio: '',
                language: 'ar',
                updated_at: new Date().toISOString()
              };
              console.log('Created new fallback user profile');
            } else {
              console.log('Found existing fallback user profile in local store');
            }

            // في حالة الحظر، لا نقوم بتعيين المستخدم في المخزن
            if (signInError.message && (
                signInError.message.includes('blocked') ||
                signInError.message.includes('permanently blocked') ||
                signInError.message.includes('temporarily blocked')
              )) {
              console.log('User is blocked, not setting fallback user');
              // Re-throw the error to be caught by the outer try-catch
              throw signInError;
            }

            // فقط في حالة الأخطاء الأخرى (مثل مشاكل الاتصال) نستخدم المستخدم الاحتياطي
            console.log('Using fallback user due to non-blocking error');

            // حفظ البيانات في المخزن المحلي
            localDataStore.saveProfile(fallbackUser);

            // تعيين المستخدم في المخزن
            set({ user: fallbackUser });
            console.log('Fallback user set in store:', fallbackUser);

            // Re-throw the error to be caught by the outer try-catch
            throw signInError;
          }
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        try {
          // الحصول على المستخدم الحالي قبل تسجيل الخروج
          const currentUser = get().user;

          // تأكد من حفظ البيانات في المخزن المحلي قبل تسجيل الخروج
          if (currentUser) {
            try {
              const localDataStore = useLocalDataStore.getState();
              localDataStore.saveProfile(currentUser);
              console.log('Saved current user profile to local store before logout');
            } catch (saveError) {
              console.warn('Error saving profile to local store before logout:', saveError);
            }
          }

          await supabaseSignOut();
          // If we get here, signout was successful
          set({ user: null });

          // لا نقوم بحذف البيانات من localStorage للحفاظ عليها للاستخدام في المستقبل
          // فقط نقوم بحذف Zustand store
          if (typeof window !== 'undefined') {
            try {
              // Clear auth-storage only (not local-data-storage)
              localStorage.removeItem('auth-storage');
              console.log('Cleared auth-storage, but kept local profile data');
            } catch (localStorageError) {
              console.error('Error clearing auth-storage:', localStorageError);
            }
          }
        } catch (error) {
          console.error('Signout error:', error);

          // Even if there's an error with Supabase signout (like CORS),
          // we still want to clear the local user state
          set({ user: null });

          // Clear Zustand store only
          if (typeof window !== 'undefined') {
            try {
              // Clear auth-storage only (not local-data-storage)
              localStorage.removeItem('auth-storage');
              console.log('Cleared auth-storage after error, but kept local profile data');
            } catch (localStorageError) {
              console.error('Error clearing auth-storage:', localStorageError);
            }
          }
        } finally {
          set({ isLoading: false });
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          // محاولة استرجاع المستخدم الحالي من Supabase
          const user = await getCurrentUser();

          if (user) {
            console.log('Found authenticated user in Supabase:', user.id);

            // Get user metadata from auth
            const userData = user.user_metadata || {};
            console.log('User metadata from auth:', userData);

            // Create a basic user object from auth data
            const basicUser: User = {
              id: user.id,
              email: user.email || '',
              created_at: user.created_at,
              name: userData?.name,
              avatar: userData?.avatar,
              country_code: userData?.country_code,
              phone: userData?.phone,
              bio: userData?.bio,
              language: userData?.language,
              website: userData?.website,
              gender: userData?.gender,
              birth_date: userData?.birth_date,
              profession: userData?.profession
            };

            // Set the user immediately to avoid delays
            set({ user: basicUser, isLoading: false });

            // تخزين البريد الإلكتروني للمستخدم في localStorage كنسخة احتياطية
            if (typeof window !== 'undefined' && user.email) {
              localStorage.setItem('last_logged_in_email', user.email);
              localStorage.setItem(`user_id_${user.email}`, user.id);
            }

            // Fetch profile data immediately instead of in the background
            try {
              // محاولة الحصول على البيانات المحلية أولاً
              let localProfileData = null;
              try {
                const storedProfile = localStorage.getItem(`profile_${user.id}`);
                if (storedProfile) {
                  console.log('Found existing profile data in localStorage');
                  localProfileData = JSON.parse(storedProfile);
                }
              } catch (parseError) {
                console.warn('Error parsing stored profile:', parseError);
              }

              // Try to get additional profile data from profiles table
              const profileData = await getUserProfile(user.id);
              console.log('Profile data from Supabase:', profileData);

              // إذا كان لدينا بيانات محلية، نقارنها مع بيانات Supabase
              if (localProfileData && profileData && Object.keys(profileData).length > 0) {
                // مقارنة البيانات الفعلية بين المحلية وقاعدة البيانات
                const hasLocalChanges = JSON.stringify({
                  name: localProfileData.name,
                  country_code: localProfileData.country_code,
                  language: localProfileData.language,
                  phone: localProfileData.phone,
                  bio: localProfileData.bio,
                  website: localProfileData.website,
                  gender: localProfileData.gender,
                  birth_date: localProfileData.birth_date,
                  profession: localProfileData.profession
                }) !== JSON.stringify({
                  name: profileData.name,
                  country_code: profileData.country_code,
                  language: profileData.language,
                  phone: profileData.phone,
                  bio: profileData.bio,
                  website: profileData.website,
                  gender: profileData.gender,
                  birth_date: profileData.birth_date,
                  profession: profileData.profession
                });

                // إذا كانت البيانات المحلية مختلفة، نستخدمها ونحاول تحديث قاعدة البيانات
                if (hasLocalChanges) {
                  console.log('Local data has changes, using local data and updating Supabase');

                  const updatedUser: User = {
                    ...basicUser,
                    // Override with local profile data
                    name: localProfileData.name || basicUser.name,
                    avatar: localProfileData.avatar || basicUser.avatar,
                    country_code: localProfileData.country_code || basicUser.country_code || 'EG',
                    phone: localProfileData.phone || basicUser.phone || '',
                    bio: localProfileData.bio || basicUser.bio || '',
                    language: localProfileData.language || basicUser.language || 'ar',
                    updated_at: localProfileData.updated_at,
                    website: localProfileData.website || basicUser.website || '',
                    gender: localProfileData.gender || basicUser.gender || '',
                    birth_date: localProfileData.birth_date || basicUser.birth_date || '',
                    profession: localProfileData.profession || basicUser.profession || ''
                  };

                  console.log('Updated user with local profile data:', updatedUser);

                  // Update the user state
                  set({ user: updatedUser });

                  // محاولة تحديث قاعدة البيانات بالبيانات المحلية
                  try {
                    await updateSupabaseProfile(user.id, localProfileData);
                    console.log('Updated Supabase with local profile data');
                  } catch (updateError) {
                    console.warn('Failed to update Supabase with local data:', updateError);
                  }

                  return;
                }
              }

              // If we got profile data from Supabase and no local changes, update the user object
              if (profileData && Object.keys(profileData).length > 0) {
                console.log('Using profile data from Supabase');

                const updatedUser: User = {
                  ...basicUser,
                  // Override with profile data
                  name: profileData.name || basicUser.name,
                  avatar: profileData.avatar || basicUser.avatar,
                  country_code: profileData.country_code || basicUser.country_code || 'EG',
                  phone: profileData.phone || basicUser.phone || '',
                  bio: profileData.bio || basicUser.bio || '',
                  language: profileData.language || basicUser.language || 'ar',
                  updated_at: profileData.updated_at,
                  website: profileData.website || basicUser.website || '',
                  gender: profileData.gender || basicUser.gender || '',
                  birth_date: profileData.birth_date || basicUser.birth_date || '',
                  profession: profileData.profession || basicUser.profession || ''
                };

                console.log('Updated user with profile data:', updatedUser);

                // Update the user state
                set({ user: updatedUser });

                // تخزين البيانات المحدثة في localStorage كنسخة احتياطية
                if (typeof window !== 'undefined') {
                  localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedUser));
                  console.log('Stored updated user in localStorage');
                }
              }
              // If we got data from auth but not from profiles table, try to create a profile
              else if (Object.keys(userData).length > 0) {
                console.log('No profile found in Supabase, creating one from auth metadata');

                try {
                  // محاولة إنشاء ملف شخصي جديد
                  const newProfile = await createUserProfile(user.id, user.email || '', userData?.name);

                  if (newProfile) {
                    console.log('Created new profile in Supabase:', newProfile);

                    const updatedUser: User = {
                      ...basicUser,
                      // Override with profile data
                      name: newProfile.name || basicUser.name,
                      avatar: newProfile.avatar || basicUser.avatar,
                      country_code: newProfile.country_code || basicUser.country_code || 'EG',
                      phone: newProfile.phone || basicUser.phone || '',
                      bio: newProfile.bio || basicUser.bio || '',
                      language: newProfile.language || basicUser.language || 'ar',
                      updated_at: newProfile.updated_at,
                      website: newProfile.website || basicUser.website || '',
                      gender: newProfile.gender || basicUser.gender || '',
                      birth_date: newProfile.birth_date || basicUser.birth_date || '',
                      profession: newProfile.profession || basicUser.profession || ''
                    };

                    console.log('Updated user with new profile data:', updatedUser);

                    // Update the user state
                    set({ user: updatedUser });

                    // تخزين البيانات المحدثة في localStorage كنسخة احتياطية
                    if (typeof window !== 'undefined') {
                      localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedUser));
                      console.log('Stored updated user in localStorage');
                    }
                  } else {
                    console.warn('Failed to create profile in Supabase, using auth metadata');

                    // Create a default profile with auth metadata
                    const defaultProfile = {
                      id: user.id,
                      email: user.email,
                      name: userData.name || user.email?.split('@')[0] || 'User',
                      avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || user.email?.split('@')[0] || 'User')}&background=random`,
                      country_code: userData.country_code || 'EG',
                      language: userData.language || 'ar',
                      phone: userData.phone || '',
                      bio: userData.bio || '',
                      website: userData.website || '',
                      gender: userData.gender || '',
                      birth_date: userData.birth_date || '',
                      profession: userData.profession || '',
                      created_at: user.created_at,
                      updated_at: new Date().toISOString()
                    };

                    try {
                      // Try to update the profile in Supabase
                      await updateSupabaseProfile(user.id, defaultProfile);
                      console.log('Created default profile in Supabase');

                      // Update the user state
                      set({ user: defaultProfile });

                      // تخزين البيانات المحدثة في localStorage كنسخة احتياطية
                      if (typeof window !== 'undefined') {
                        localStorage.setItem(`profile_${user.id}`, JSON.stringify(defaultProfile));
                        console.log('Stored default profile in localStorage');
                      }
                    } catch (createError) {
                      console.error('Failed to create profile from auth metadata:', createError);

                      // Still update the user state with default profile
                      set({ user: defaultProfile });

                      // تخزين البيانات المحدثة في localStorage كنسخة احتياطية
                      if (typeof window !== 'undefined') {
                        localStorage.setItem(`profile_${user.id}`, JSON.stringify(defaultProfile));
                        console.log('Stored default profile in localStorage only');
                      }
                    }
                  }
                } catch (profileError) {
                  console.warn('Error creating profile in Supabase:', profileError);

                  // Create a default profile with auth metadata
                  const defaultProfile = {
                    id: user.id,
                    email: user.email,
                    name: userData.name || user.email?.split('@')[0] || 'User',
                    avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || user.email?.split('@')[0] || 'User')}&background=random`,
                    country_code: userData.country_code || 'EG',
                    language: userData.language || 'ar',
                    phone: userData.phone || '',
                    bio: userData.bio || '',
                    website: userData.website || '',
                    gender: userData.gender || '',
                    birth_date: userData.birth_date || '',
                    profession: userData.profession || '',
                    created_at: user.created_at,
                    updated_at: new Date().toISOString()
                  };

                  try {
                    // Try to update the profile in Supabase
                    await updateSupabaseProfile(user.id, defaultProfile);
                    console.log('Created default profile in Supabase after error');

                    // Update the user state
                    set({ user: defaultProfile });

                    // تخزين البيانات المحدثة في localStorage كنسخة احتياطية
                    if (typeof window !== 'undefined') {
                      localStorage.setItem(`profile_${user.id}`, JSON.stringify(defaultProfile));
                      console.log('Stored default profile in localStorage after error');
                    }
                  } catch (createError) {
                    console.error('Failed to create profile from auth metadata after error:', createError);

                    // Still update the user state with default profile
                    set({ user: defaultProfile });

                    // تخزين البيانات المحدثة في localStorage كنسخة احتياطية
                    if (typeof window !== 'undefined') {
                      localStorage.setItem(`profile_${user.id}`, JSON.stringify(defaultProfile));
                      console.log('Stored default profile in localStorage only after error');
                    }
                  }
                }
              }
            } catch (profileError) {
              console.error('Error fetching profile data:', profileError);
              // We already set the basic user above, so no need to do anything here
            }

            return;
          }

          // إذا لم نجد المستخدم في Supabase، نحاول استرجاعه من localStorage
          if (typeof window !== 'undefined') {
            // البحث عن آخر معرف مستخدم تم تسجيل الدخول به
            const lastLoggedInEmail = localStorage.getItem('last_logged_in_email');
            if (lastLoggedInEmail) {
              const storedUserId = localStorage.getItem(`user_id_${lastLoggedInEmail}`);

              if (storedUserId) {
                console.log('Found stored user ID for last logged in email:', storedUserId);

                // محاولة استرجاع بيانات الملف الشخصي
                const storedProfile = localStorage.getItem(`profile_${storedUserId}`);
                const storedAvatar = localStorage.getItem(`avatar_${storedUserId}`);

                if (storedProfile) {
                  try {
                    const profileData = JSON.parse(storedProfile);
                    console.log('Found stored profile data for last logged in user');

                    // تأكد من وجود جميع الحقول
                    const completeProfile = {
                      id: storedUserId,
                      email: lastLoggedInEmail,
                      created_at: profileData.created_at || new Date().toISOString(),
                      name: profileData.name || lastLoggedInEmail.split('@')[0],
                      avatar: storedAvatar || profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(lastLoggedInEmail.split('@')[0])}&background=random`,
                      country_code: profileData.country_code || 'EG', // مصر كدولة افتراضية
                      language: profileData.language || 'ar',
                      phone: profileData.phone || '',
                      bio: profileData.bio || '',
                      website: profileData.website,
                      gender: profileData.gender,
                      birth_date: profileData.birth_date,
                      profession: profileData.profession,
                      updated_at: profileData.updated_at || new Date().toISOString()
                    };

                    // تحديث البيانات في localStorage إذا تم تغيير الصورة
                    if (storedAvatar && (!profileData.avatar || profileData.avatar.startsWith('https://ui-avatars.com'))) {
                      try {
                        localStorage.setItem(`profile_${storedUserId}`, JSON.stringify({
                          ...profileData,
                          avatar: storedAvatar,
                          updated_at: new Date().toISOString()
                        }));
                        console.log('Updated profile with stored avatar');
                      } catch (updateError) {
                        console.warn('Error updating profile with stored avatar:', updateError);
                      }
                    }

                    // إنشاء كائن مستخدم من البيانات المخزنة
                    const storedUser: User = completeProfile;

                    // تعيين المستخدم في المخزن
                    set({ user: storedUser, isLoading: false });
                    console.log('Restored user from localStorage:', storedUser.id);
                    return;
                  } catch (parseError) {
                    console.warn('Error parsing stored profile:', parseError);
                  }
                }
              }
            }
          }

          // إذا لم نجد المستخدم في Supabase أو localStorage، نعيد المستخدم كـ null
          set({ user: null });
        } catch (error) {
          console.error('Check auth error:', error);

          // محاولة استرجاع المستخدم من localStorage في حالة حدوث خطأ
          if (typeof window !== 'undefined') {
            // البحث عن آخر معرف مستخدم تم تسجيل الدخول به
            const lastLoggedInEmail = localStorage.getItem('last_logged_in_email');
            if (lastLoggedInEmail) {
              const storedUserId = localStorage.getItem(`user_id_${lastLoggedInEmail}`);

              if (storedUserId) {
                console.log('Found stored user ID for last logged in email:', storedUserId);

                // محاولة استرجاع بيانات الملف الشخصي
                const storedProfile = localStorage.getItem(`profile_${storedUserId}`);

                if (storedProfile) {
                  try {
                    const profileData = JSON.parse(storedProfile);
                    console.log('Found stored profile data for last logged in user');

                    // إنشاء كائن مستخدم من البيانات المخزنة
                    const storedUser: User = {
                      id: storedUserId,
                      email: lastLoggedInEmail,
                      created_at: profileData.created_at || new Date().toISOString(),
                      name: profileData.name || lastLoggedInEmail.split('@')[0],
                      avatar: profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(lastLoggedInEmail.split('@')[0])}&background=random`,
                      country_code: profileData.country_code || 'EG', // مصر كدولة افتراضية
                      language: profileData.language || 'ar',
                      phone: profileData.phone || '',
                      bio: profileData.bio || '',
                      website: profileData.website,
                      gender: profileData.gender,
                      birth_date: profileData.birth_date,
                      profession: profileData.profession,
                      updated_at: profileData.updated_at || new Date().toISOString()
                    };

                    // تعيين المستخدم في المخزن
                    set({ user: storedUser, isLoading: false });
                    console.log('Restored user from localStorage after error:', storedUser.id);
                    return;
                  } catch (parseError) {
                    console.warn('Error parsing stored profile:', parseError);
                  }
                }
              }
            }
          }

          // Don't set user to null if there's an error, as it might be a temporary issue
          // Only set to null if we're sure the user is not authenticated
        } finally {
          set({ isLoading: false });
        }
      },

      reloadUserProfile: async () => {
        const currentUser = get().user;
        if (!currentUser) return null;

        set({ isLoading: true });
        try {
          console.log('Reloading profile for user:', currentUser.id);

          // التحقق من حالة حذف الحساب
          const { data: deletionInfo, error: deletionError } = await supabase
            .rpc('check_account_deletion', { user_id: currentUser.id });

          if (deletionError) {
            console.error('Error checking account deletion status:', deletionError);
          } else if (deletionInfo) {
            console.log('Account deletion status:', deletionInfo);

            // إضافة معلومات الحذف إلى كائن المستخدم إذا كان الحساب مجدولًا للحذف
            if (deletionInfo.scheduled_for_deletion) {
              currentUser.deletion_info = {
                scheduled: deletionInfo.scheduled_for_deletion,
                days_remaining: deletionInfo.days_remaining,
                deletion_date: new Date(deletionInfo.deletion_scheduled_at)
              };
            } else {
              // إزالة معلومات الحذف إذا تم إلغاء الحذف
              delete currentUser.deletion_info;
            }

            // تحديث حالة المستخدم
            set({ user: { ...currentUser } });
          }

          // في ظل مشاكل قاعدة البيانات، نفضل استخدام البيانات المخزنة محليًا
          console.log('Prioritizing locally stored profile data due to database issues');

          // محاولة الحصول على البيانات من localStorage
          let localProfile = null;
          if (typeof window !== 'undefined') {
            try {
              const storedProfile = localStorage.getItem(`profile_${currentUser.id}`);
              if (storedProfile) {
                localProfile = JSON.parse(storedProfile);
                console.log('Found profile data in localStorage:', localProfile);

                // تحديث الحالة المحلية بالبيانات المخزنة
                const updatedUser = {
                  ...currentUser,
                  ...localProfile,
                  // الحفاظ على بعض البيانات الأساسية
                  id: currentUser.id,
                  email: currentUser.email,
                  created_at: currentUser.created_at
                };

                // تحديث الحالة
                set({ user: updatedUser, isLoading: false });

                return updatedUser;
              }
            } catch (parseError) {
              console.warn('Error parsing stored profile:', parseError);
            }
          }

          // إذا لم نجد بيانات محلية، نحاول الحصول عليها من Supabase
          // لكن هذا قد يفشل بسبب مشاكل قاعدة البيانات
          console.log('No local profile found, trying Supabase as fallback');

          // محاولة استرجاع المستخدم الحالي من Supabase
          const user = await getCurrentUser();

          if (!user) {
            console.log('No authenticated user found in Supabase, using current user');
            set({ isLoading: false });
            return currentUser; // Return current user as fallback
          }

          // Get user metadata from auth
          const userData = user.user_metadata || {};
          console.log('User metadata from auth:', userData);

          // Try to get additional profile data from profiles table using safe RPC function
          console.log('Trying to get profile data using get_profile_safe RPC function');
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('get_profile_safe', { user_id: user.id });

          let profileData = null;
          if (!rpcError && rpcData && rpcData.length > 0) {
            console.log('Got profile data from safe RPC function:', rpcData[0]);
            profileData = rpcData[0];
          } else {
            console.log('Safe RPC function failed or returned no data:', rpcError);
            console.log('Trying getUserProfile as fallback');
            profileData = await getUserProfile(user.id);
          }

          console.log('Profile data from Supabase:', profileData);

          // If we got profile data, update the user object
          if (profileData && Object.keys(profileData).length > 0) {
            console.log('Using profile data from Supabase');
            console.log('Profile data fields:', Object.keys(profileData));
            console.log('Profile data values:', {
              name: profileData.name,
              country_code: profileData.country_code,
              phone: profileData.phone,
              bio: profileData.bio,
              language: profileData.language,
              website: profileData.website,
              gender: profileData.gender,
              birth_date: profileData.birth_date,
              profession: profileData.profession
            });

            const updatedUser: User = {
              ...currentUser,
              // Override with profile data
              name: profileData.name || currentUser.name,
              avatar: profileData.avatar || currentUser.avatar,
              country_code: profileData.country_code || currentUser.country_code || 'EG',
              phone: profileData.phone || currentUser.phone || '',
              bio: profileData.bio || currentUser.bio || '',
              language: profileData.language || currentUser.language || 'ar',
              updated_at: profileData.updated_at,
              website: profileData.website || currentUser.website || '',
              gender: profileData.gender || currentUser.gender || '',
              birth_date: profileData.birth_date || currentUser.birth_date || '',
              profession: profileData.profession || currentUser.profession || ''
            };

            console.log('Updated user with profile data:', updatedUser);

            // Update the user state
            set({ user: updatedUser, isLoading: false });

            // تخزين البيانات المحدثة في localStorage كنسخة احتياطية
            if (typeof window !== 'undefined') {
              localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedUser));
              console.log('Stored updated user in localStorage');
            }

            return updatedUser;
          }
          // If we didn't get profile data from Supabase but have user metadata, use that
          else if (userData && Object.keys(userData).length > 0) {
            console.log('Using user metadata from auth');

            const updatedUser: User = {
              ...currentUser,
              // Override with user metadata
              name: userData.name || currentUser.name,
              avatar: userData.avatar || currentUser.avatar,
              country_code: userData.country_code || currentUser.country_code || 'EG',
              phone: userData.phone || currentUser.phone || '',
              bio: userData.bio || currentUser.bio || '',
              language: userData.language || currentUser.language || 'ar',
              website: userData.website || currentUser.website || '',
              gender: userData.gender || currentUser.gender || '',
              birth_date: userData.birth_date || currentUser.birth_date || '',
              profession: userData.profession || currentUser.profession || '',
              updated_at: new Date().toISOString()
            };

            console.log('Updated user with auth metadata:', updatedUser);

            // Update the user state
            set({ user: updatedUser, isLoading: false });

            // تخزين البيانات المحدثة في localStorage كنسخة احتياطية
            if (typeof window !== 'undefined') {
              localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedUser));
              console.log('Stored updated user in localStorage');
            }

            // Try to update the profile in Supabase with this data
            try {
              await updateSupabaseProfile(user.id, updatedUser);
              console.log('Updated profile in Supabase with auth metadata');
            } catch (profileError) {
              console.warn('Could not update profile in Supabase:', profileError);
            }

            return updatedUser;
          }
          else {
            console.log('No profile data or user metadata found, using current user');
            set({ isLoading: false });
            return currentUser; // Return current user as fallback
          }
        } catch (error) {
          console.error('Error in reloadUserProfile:', error);
          set({ isLoading: false });
          return currentUser; // Return current user as fallback
        }
      },

      updateProfile: async (userData: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({ isLoading: true });
        try {
          console.log('Updating profile for user:', currentUser.id, 'with data:', userData);

          // استخدام المخزن المحلي الجديد
          const localDataStore = useLocalDataStore.getState();

          // Create a complete profile data object with all fields
          const completeProfileData = {
            id: currentUser.id,
            email: currentUser.email,
            name: userData.name || currentUser.name,
            avatar: userData.avatar || currentUser.avatar,
            country_code: userData.country_code || currentUser.country_code,
            phone: userData.phone || currentUser.phone,
            bio: userData.bio || currentUser.bio,
            language: userData.language || currentUser.language,
            website: userData.website || currentUser.website,
            gender: userData.gender || currentUser.gender,
            birth_date: userData.birth_date || currentUser.birth_date,
            profession: userData.profession || currentUser.profession,
            created_at: currentUser.created_at,
            updated_at: new Date().toISOString()
          };

          // Update local state with the new data immediately
          const updatedUser = {
            ...currentUser,
            ...completeProfileData,
            updated_at: new Date().toISOString()
          };

          console.log('Updating local state with:', updatedUser);

          // حفظ البيانات في المخزن المحلي الجديد
          localDataStore.saveProfile(updatedUser);
          console.log('Profile data stored in local store');

          // Update the user in the store immediately
          set({ user: updatedUser });
          console.log('User state updated successfully');

          // Check if the user ID starts with 'temp-' or 'fallback-'
          // This indicates it's a mock user created to bypass auth issues
          const isMockUser = currentUser.id.startsWith('temp-') || currentUser.id.startsWith('fallback-');

          if (!isMockUser) {
            // Only try to update Supabase if this is a real user
            // We do this after updating local state to ensure UI is responsive
            try {
              // تحديث البروفايل في قاعدة البيانات مباشرة باستخدام وظيفة SQL
              console.log('Calling direct SQL function to update profile');

              // استدعاء وظيفة SQL المباشرة بلغة SQL
              const { data: sqlResult, error: sqlError } = await supabase.rpc('direct_update_profile', {
                p_user_id: currentUser.id,
                p_name: completeProfileData.name,
                p_gender: completeProfileData.gender,
                p_birth_date: completeProfileData.birth_date,
                p_country_code: completeProfileData.country_code,
                p_phone: completeProfileData.phone,
                p_bio: completeProfileData.bio,
                p_website: completeProfileData.website,
                p_profession: completeProfileData.profession,
                p_language: completeProfileData.language
              });

              if (sqlError) {
                console.error('Error updating profile with direct SQL function:', sqlError);
              } else {
                console.log('Profile updated successfully with direct SQL function:', sqlResult);

                // تحديث حالة المستخدم بالبيانات المحدثة
                if (sqlResult) {
                  set({
                    user: {
                      ...get().user,
                      ...sqlResult
                    }
                  });
                  console.log('Updated user state with server data');

                  // تحديث التخزين المحلي
                  try {
                    localStorage.setItem(`profile_${currentUser.id}`, JSON.stringify({
                      ...get().user,
                      ...sqlResult
                    }));
                    console.log('Updated localStorage with server data');
                  } catch (storageError) {
                    console.warn('Could not update localStorage:', storageError);
                  }

                  // إرجاع البيانات المحدثة
                  set({ isLoading: false });
                  return sqlResult;
                }
              }

              // محاولة تحديث بيانات المصادقة
              console.log('Updating auth metadata');
              try {
                await updateUserProfile({
                  name: completeProfileData.name,
                  avatar: completeProfileData.avatar,
                  country_code: completeProfileData.country_code,
                  phone: completeProfileData.phone,
                  bio: completeProfileData.bio,
                  language: completeProfileData.language,
                  website: completeProfileData.website,
                  gender: completeProfileData.gender,
                  birth_date: completeProfileData.birth_date,
                  profession: completeProfileData.profession,
                  updated_at: completeProfileData.updated_at
                });
                console.log('Auth metadata updated successfully');
              } catch (authError) {
                console.warn('Could not update auth metadata:', authError);
              }

              // محاولة تحديث البروفايل باستخدام الطريقة التقليدية
              try {
                console.log('Trying traditional profile update method');
                const updatedProfile = await updateProfileDirectSQL(currentUser.id, completeProfileData);

                if (updatedProfile) {
                  console.log('Profile updated successfully with traditional method:', updatedProfile);

                  // تحديث التخزين المحلي
                  try {
                    const storedProfile = localStorage.getItem(`profile_${currentUser.id}`);
                    if (storedProfile) {
                      const parsedProfile = JSON.parse(storedProfile);
                      parsedProfile.updated_at = updatedProfile.updated_at;

                      // تحديث أي حقول أخرى تم تعديلها بواسطة الخادم
                      Object.keys(updatedProfile).forEach(key => {
                        if (updatedProfile[key] !== undefined && updatedProfile[key] !== null) {
                          parsedProfile[key] = updatedProfile[key];
                        }
                      });

                      localStorage.setItem(`profile_${currentUser.id}`, JSON.stringify(parsedProfile));
                      console.log('Updated profile in localStorage to match server');

                      // تحديث حالة المستخدم بالبيانات من الخادم
                      set({
                        user: {
                          ...get().user,
                          ...updatedProfile
                        }
                      });
                      console.log('Updated user state with server data');
                    }
                  } catch (storageError) {
                    console.warn('Could not update localStorage:', storageError);
                  }
                } else {
                  console.warn('Traditional profile update method failed');
                }
              } catch (profileError) {
                console.warn('Could not update profile in database, but auth metadata and local state are updated:', profileError);
              } finally {
                // تأكد من إيقاف حالة التحميل في جميع الحالات
                set({ isLoading: false });
              }



              // تم تحديث البيانات بنجاح، لا حاجة لمزيد من المحاولات
            } catch (supabaseError) {
              console.warn('Could not update Supabase, but local state is already updated:', supabaseError);
              // No need to update local state again as we've already done it
            }
          } else {
            console.log('Mock user detected, skipping Supabase update');
          }

          return updatedUser;
        } catch (error) {
          console.error('Update profile error:', error);

          // Instead of throwing the error, try to update local state only
          try {
            console.log('Attempting to update local state only');

            // Create a basic updated user object
            const updatedUser = {
              ...currentUser,
              ...userData,
              updated_at: new Date().toISOString()
            };

            // Update local state
            set({ user: updatedUser });
            console.log('Local state updated successfully');

            // Store in localStorage
            try {
              localStorage.setItem(`profile_${currentUser.id}`, JSON.stringify(updatedUser));
              console.log('Profile data stored in localStorage after error');
            } catch (storageError) {
              console.warn('Could not store profile in localStorage:', storageError);
            }

            return updatedUser;
          } catch (localUpdateError) {
            console.error('Failed to update local state:', localUpdateError);
            throw error; // Throw the original error if local update fails
          }
        } finally {
          set({ isLoading: false });
        }
      },

      updatePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true });
        try {
          // In a real implementation, we would first verify the current password
          // But Supabase doesn't provide a direct way to do this
          // So we'll just update the password
          await updateUserPassword(newPassword);
        } catch (error) {
          console.error('Update password error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      uploadProfileImage: async (file: File) => {
        const currentUser = get().user;
        if (!currentUser) throw new Error('User not authenticated');

        set({ isLoading: true });
        try {
          // Import image compression function
          const { compressImage } = await import('../lib/imageUtils');

          // Compress image before upload
          const compressedFile = await compressImage(file);

          // Upload image to Supabase storage (or get data URL if storage fails)
          const imageUrl = await uploadAvatar(compressedFile, currentUser.id);

          // Check if the user ID starts with 'temp-' or 'fallback-'
          // This indicates it's a mock user created to bypass auth issues
          const isMockUser = currentUser.id.startsWith('temp-') || currentUser.id.startsWith('fallback-');

          if (!isMockUser) {
            // Only try to update Supabase if this is a real user
            try {
              // Create a complete profile data object with all fields
              const completeProfileData = {
                id: currentUser.id,
                email: currentUser.email,
                name: currentUser.name,
                avatar: imageUrl,
                country_code: currentUser.country_code,
                phone: currentUser.phone,
                bio: currentUser.bio,
                language: currentUser.language,
                website: currentUser.website,
                gender: currentUser.gender,
                birth_date: currentUser.birth_date,
                profession: currentUser.profession,
                created_at: currentUser.created_at,
                updated_at: new Date().toISOString()
              };

              // First, update the auth metadata directly to ensure it's saved
              await updateUserProfile({
                avatar: imageUrl,
                name: currentUser.name,
                country_code: currentUser.country_code,
                phone: currentUser.phone,
                bio: currentUser.bio,
                language: currentUser.language,
                website: currentUser.website,
                gender: currentUser.gender,
                birth_date: currentUser.birth_date,
                profession: currentUser.profession,
                updated_at: new Date().toISOString()
              });

              // Then try to update the profiles table
              try {
                await updateSupabaseProfile(currentUser.id, completeProfileData);
              } catch (profileError) {
                console.warn('Could not update profile table, but auth metadata was updated');
              }
            } catch (supabaseError) {
              console.warn('Could not update Supabase, but will update local state');
            }
          }

          // Update local state with the new avatar
          const updatedUser = {
            ...currentUser,
            avatar: imageUrl,
            updated_at: new Date().toISOString()
          };

          set({ user: updatedUser });

          // حفظ البيانات في المخزن المحلي الجديد
          try {
            const localDataStore = useLocalDataStore.getState();
            localDataStore.saveProfile(updatedUser);
            console.log('Avatar and profile data stored in local store');

            // حفظ في localStorage التقليدي أيضًا للتوافق
            localStorage.setItem(`avatar_${currentUser.id}`, imageUrl);
            localStorage.setItem(`profile_${currentUser.id}`, JSON.stringify(updatedUser));
          } catch (storageError) {
            console.warn('Could not store avatar in local store:', storageError);
          }

          return imageUrl;
        } catch (error) {
          console.error('Upload profile image error');

          // Try to get the avatar from localStorage as a fallback
          try {
            const storedAvatar = localStorage.getItem(`avatar_${currentUser.id}`);
            if (storedAvatar) {
              // Update local state with the stored avatar
              set({
                user: {
                  ...currentUser,
                  avatar: storedAvatar,
                  updated_at: new Date().toISOString()
                }
              });

              return storedAvatar;
            }
          } catch (storageError) {
            console.warn('Could not retrieve avatar from localStorage');
          }

          // Don't throw the error, just return the current avatar or a default one
          return currentUser.avatar || getDefaultAvatar(currentUser.name || currentUser.email);
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Setup auth listener when the app loads
if (typeof window !== 'undefined') {
  // Keep track of whether we're currently processing an auth change
  let isProcessingAuthChange = false;

  // Keep track of the last user ID to avoid unnecessary profile fetches
  let lastUserId: string | null = null;

  setupAuthListener((user) => {
    // Avoid processing multiple auth changes simultaneously
    if (isProcessingAuthChange) {
      // Silent skip to avoid console spam
      return;
    }

    isProcessingAuthChange = true;

    if (user) {
      // Get user metadata from auth
      const userData = user.user_metadata || {};

      // Create a basic user object from auth data
      const basicUser: User = {
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        name: userData?.name,
        avatar: userData?.avatar,
        country_code: userData?.country_code,
        phone: userData?.phone,
        bio: userData?.bio,
        language: userData?.language,
        // Explicitly include these fields that were having issues
        website: userData?.website,
        gender: userData?.gender,
        birth_date: userData?.birth_date,
        profession: userData?.profession
      };

      // Set the user immediately to avoid delays
      useAuthStore.getState().setUser(basicUser);

      // Only fetch profile data if this is a new user or we don't have a last user ID
      if (lastUserId !== user.id) {
        lastUserId = user.id;

        // Fetch profile data in the background
        setTimeout(async () => {
          try {
            // Try to get additional profile data from profiles table
            const profileData = await getUserProfile(user.id);

            // If we got profile data, update the user object
            if (profileData && Object.keys(profileData).length > 0) {
              const updatedUser: User = {
                ...basicUser,
                // Override with profile data
                name: profileData.name || basicUser.name,
                avatar: profileData.avatar || basicUser.avatar,
                country_code: profileData.country_code || basicUser.country_code,
                phone: profileData.phone || basicUser.phone,
                bio: profileData.bio || basicUser.bio,
                language: profileData.language || basicUser.language,
                updated_at: profileData.updated_at,
                website: profileData.website || basicUser.website,
                gender: profileData.gender || basicUser.gender,
                birth_date: profileData.birth_date || basicUser.birth_date,
                profession: profileData.profession || basicUser.profession
              };

              // Update the user state
              useAuthStore.getState().setUser(updatedUser);
            }
          } catch (error) {
            console.error('Error fetching profile data:', error);
            // We already set the basic user above, so no need to do anything here
          } finally {
            isProcessingAuthChange = false;
          }
        }, 500); // Delay profile fetch to avoid overwhelming the server
      } else {
        isProcessingAuthChange = false;
      }
    } else {
      // User is logged out
      lastUserId = null;
      useAuthStore.getState().setUser(null);
      isProcessingAuthChange = false;
    }
  });
}