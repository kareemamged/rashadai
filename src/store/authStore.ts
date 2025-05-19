import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getDefaultCountry } from '../data/countries';
import {
  signUpWithEmail,
  updateUserProfile,
  updateUserPassword,
  setupAuthListener,
  uploadAvatar,
  getUserProfile,
  updateProfile as updateSupabaseProfile,
  updateProfileDirectSQL,
  supabase
} from '../lib/supabase';
import {
  signInWithEmail,
  signOut as supabaseSignOut,
  getCurrentUser
} from '../lib/supabaseAuth';
import {
  alternativeSignOut,
  getCurrentUserFromSession,
  updateCurrentSession
} from '../lib/alternativeAuth';
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

          // تم تعطيل التحقق من تأكيد البريد الإلكتروني مؤقتًا
          // نقوم بتعيين المستخدم في المخزن مباشرة بعد التسجيل
          if (user) {
            console.log('User registered successfully, setting in store immediately (email confirmation bypassed)');
            // إنشاء كائن المستخدم
            const newUser: User = {
              id: user.id,
              email: user.email || email,
              created_at: user.created_at,
              ...userData
            };

            // تخزين معلومات المستخدم في localStorage
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem(`profile_${user.id}`, JSON.stringify(newUser));
                console.log('Stored user data in localStorage');
              } catch (storageError) {
                console.warn('Error storing user data:', storageError);
              }
            }

            // تعيين المستخدم في المخزن مباشرة
            set({ user: newUser });

            // محاولة تأكيد البريد الإلكتروني تلقائيًا
            try {
              console.log('Attempting to auto-confirm email after signup');
              supabase.rpc('auto_confirm_email', { p_email: email })
                .then(({ data, error }) => {
                  if (!error && data && data.success) {
                    console.log('Successfully auto-confirmed email after signup:', data);
                  } else {
                    console.warn('Auto-confirm email failed after signup:', error || data?.message);
                  }
                })
                .catch(confirmError => {
                  console.error('Error auto-confirming email after signup:', confirmError);
                });
            } catch (confirmError) {
              console.error('Exception during auto-confirm email after signup:', confirmError);
            }
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

          // استخدام المخزن المحلي الجديد
          const localDataStore = useLocalDataStore.getState();

          try {
            // استخدام وظيفة signInWithEmail المبسطة
            console.log('Using simplified signInWithEmail function');
            const result = await signInWithEmail(email, password);
            const user = result?.user;

            // إذا وصلنا إلى هنا، فهذا يعني أن المستخدم غير محظور وتم تأكيد البريد الإلكتروني
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
          } catch (signInError: any) {
            console.error('Error during sign in:', signInError);

            // Check if this is an email not confirmed error
            if (signInError.code === 'email_not_confirmed') {
              console.log('Email not confirmed error:', signInError.details);

              // إذا كان الخطأ يحتوي بالفعل على التفاصيل المطلوبة، نستخدمه مباشرة
              if (signInError.email && signInError.details) {
                console.log('Using existing email confirmation error object');
                throw signInError;
              }

              // Create a special error object with the email confirmation details
              const emailConfirmationError = {
                message: 'Email not confirmed',
                code: 'email_not_confirmed',
                details: signInError.details || {},
                email: email
              };

              console.log('Created email confirmation error object:', emailConfirmationError);

              // Throw the special error to be caught by the outer try-catch
              throw emailConfirmationError;
            }

            // إعادة رمي الخطأ ليتم التقاطه في الـ try-catch الخارجي
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

          // تسجيل الخروج من نظام المصادقة البديل أولاً
          const alternativeResult = alternativeSignOut();
          console.log('Alternative sign out result:', alternativeResult);

          // تسجيل الخروج من Supabase كنسخة احتياطية
          try {
            await supabaseSignOut();
            console.log('Supabase sign out successful');
          } catch (supabaseError) {
            console.warn('Supabase sign out error:', supabaseError);
            // نستمر حتى لو فشل تسجيل الخروج من Supabase
          }

          // تعيين المستخدم كـ null في المخزن
          set({ user: null });

          // مسح جميع بيانات الجلسة من localStorage
          if (typeof window !== 'undefined') {
            try {
              // مسح مخزن Zustand
              localStorage.removeItem('auth-storage');

              // مسح جلسة المصادقة البديلة
              localStorage.removeItem('alternative_session');

              // مسح بيانات المستخدم المخزنة
              if (currentUser) {
                localStorage.removeItem(`profile_${currentUser.id}`);
                localStorage.removeItem(`avatar_${currentUser.id}`);
                localStorage.removeItem(`password_hash_${currentUser.email}`);

                if (currentUser.email) {
                  localStorage.removeItem(`user_id_${currentUser.email}`);
                }
              }

              // مسح البريد الإلكتروني المخزن
              localStorage.removeItem('last_logged_in_email');

              // مسح جميع مفاتيح Supabase
              const storageKeys = Object.keys(localStorage);
              const authKeys = storageKeys.filter(key =>
                key.startsWith('sb-') ||
                key.includes('supabase') ||
                key.includes('password_hash_') ||
                key.includes('alternative_')
              );

              // مسح كل مفتاح متعلق بالمصادقة
              authKeys.forEach(key => {
                localStorage.removeItem(key);
              });

              console.log('Cleared all session data from localStorage');
            } catch (localStorageError) {
              console.error('Error clearing localStorage:', localStorageError);
            }
          }
        } catch (error) {
          console.error('Signout error:', error);

          // حتى في حالة حدوث خطأ في تسجيل الخروج من Supabase،
          // نريد مسح حالة المستخدم المحلية
          set({ user: null });

          // مسح بيانات الجلسة من localStorage
          if (typeof window !== 'undefined') {
            try {
              // مسح مخزن Zustand
              localStorage.removeItem('auth-storage');

              // مسح جميع مفاتيح Supabase
              const storageKeys = Object.keys(localStorage);
              const supabaseKeys = storageKeys.filter(key =>
                key.startsWith('sb-') ||
                key.includes('supabase')
              );

              // مسح كل مفتاح متعلق بـ Supabase
              supabaseKeys.forEach(key => {
                localStorage.removeItem(key);
              });

              console.log('Cleared auth data after error');
            } catch (localStorageError) {
              console.error('Error clearing localStorage:', localStorageError);
            }
          }
        } finally {
          set({ isLoading: false });
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          // محاولة استرجاع المستخدم الحالي من الجلسة البديلة أولاً
          const alternativeUser = getCurrentUserFromSession();

          if (alternativeUser) {
            console.log('Found authenticated user in alternative session:', alternativeUser.id);

            // استخدام المستخدم من الجلسة البديلة مباشرة
            set({ user: alternativeUser, isLoading: false });
            return;
          }

          // إذا لم يتم العثور على مستخدم في الجلسة البديلة، نحاول استرجاعه من Supabase
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

            // محاولة تأكيد البريد الإلكتروني تلقائيًا
            try {
              console.log('Attempting to auto-confirm email during checkAuth');

              // محاولة تأكيد البريد الإلكتروني باستخدام وظيفة SQL إذا كانت موجودة
              try {
                const { data: confirmData, error: confirmError } = await supabase
                  .rpc('auto_confirm_email_direct', { p_email: user.email });

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
            } catch (confirmError) {
              console.warn('Exception during auto-confirmation:', confirmError);
            }

            // Fetch profile data immediately instead of in the background
            try {
              // Try to get additional profile data from profiles table
              const profileData = await getUserProfile(user.id);
              console.log('Profile data from Supabase:', profileData);

              // If we got profile data from Supabase, update the user object
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
              } else {
                // إذا لم نجد ملف تعريف، نقوم بإنشاء واحد
                console.log('No profile found, creating one');

                try {
                  // إنشاء ملف تعريف المستخدم
                  const newProfile = {
                    id: user.id,
                    email: user.email || '',
                    name: userData?.name || (user.email ? user.email.split('@')[0] : 'User'),
                    avatar: userData?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email ? user.email.split('@')[0] : 'User')}&background=random`,
                    country_code: userData?.country_code || 'EG',
                    language: userData?.language || 'ar',
                    email_confirmed: true,
                    created_at: new Date(),
                    updated_at: new Date()
                  };

                  // إنشاء ملف تعريف المستخدم في قاعدة البيانات
                  const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert(newProfile);

                  if (profileError) {
                    console.error('Error creating profile:', profileError);
                  } else {
                    console.log('Successfully created profile for user');

                    // تحديث كائن المستخدم
                    const updatedUser: User = {
                      ...basicUser,
                      ...newProfile
                    };

                    // تحديث حالة المستخدم
                    set({ user: updatedUser });

                    // تخزين البيانات المحدثة في localStorage
                    if (typeof window !== 'undefined') {
                      localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedUser));
                      console.log('Stored new profile in localStorage');
                    }
                  }
                } catch (createError) {
                  console.error('Exception during profile creation:', createError);
                }
              }

              // If we got data from auth but not from profiles table, try to create a profile
              if (Object.keys(userData).length > 0) {
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

          // إذا لم نجد المستخدم في Supabase، نعيد المستخدم كـ null
          // لا نحاول استرجاع المستخدم من localStorage بعد الآن
          set({ user: null });
        } catch (error) {
          console.error('Check auth error:', error);

          // لا نحاول استرجاع المستخدم من localStorage في حالة حدوث خطأ
          // نعيد المستخدم كـ null
          set({ user: null });
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
          // Verificar que el usuario está autenticado
          const currentUser = get().user;
          if (!currentUser) {
            throw new Error('User not authenticated');
          }

          // Intentar cambiar la contraseña usando nuestra función SQL personalizada
          try {
            console.log('Changing password using custom SQL function');
            const { data: changeData, error: changeError } = await supabase.rpc('change_user_password', {
              user_id: currentUser.id,
              old_password: currentPassword,
              new_password: newPassword
            });

            if (changeError) {
              console.error('Error calling change_user_password:', changeError);

              // Intentar el método alternativo
              console.log('Trying alternative method to change password');

              // Primero verificar la contraseña actual
              try {
                console.log('Verifying current password using verify_user_password');
                const { data: verifyData, error: verifyError } = await supabase.rpc('verify_user_password', {
                  user_id: currentUser.id,
                  password_to_check: currentPassword
                });

                if (verifyError) {
                  console.error('Error calling verify_user_password:', verifyError);

                  // Intentar verificar iniciando sesión
                  try {
                    console.log('Trying to verify password by signing in');
                    const { error: signInError } = await supabase.auth.signInWithPassword({
                      email: currentUser.email,
                      password: currentPassword
                    });

                    if (signInError) {
                      console.error('Error verifying current password by signing in:', signInError);
                      throw new Error('Current password is incorrect');
                    }

                    // Si llegamos aquí, la contraseña actual es correcta
                    console.log('Current password verified successfully by signing in');

                    // Actualizar la contraseña
                    await updateUserPassword(newPassword);
                    console.log('Password updated successfully');
                  } catch (signInError) {
                    console.error('Error in sign-in verification:', signInError);
                    throw new Error('Current password is incorrect');
                  }
                } else if (!verifyData.success) {
                  console.error('Password verification failed:', verifyData.message);
                  throw new Error('Current password is incorrect');
                } else {
                  // Si llegamos aquí, la contraseña actual es correcta
                  console.log('Current password verified successfully');

                  // Actualizar la contraseña
                  await updateUserPassword(newPassword);
                  console.log('Password updated successfully');
                }
              } catch (verifyError: any) {
                // Si el error es de autenticación, la contraseña actual es incorrecta
                if (verifyError.message.includes('Invalid login credentials') ||
                    verifyError.message.includes('Current password is incorrect') ||
                    verifyError.message.includes('Password is invalid')) {
                  throw new Error('Current password is incorrect');
                }

                // Para otros errores, intentamos actualizar la contraseña directamente
                console.warn('Error verifying current password, trying to update password directly:', verifyError);
                await updateUserPassword(newPassword);
              }
            } else if (!changeData.success) {
              console.error('Password change failed:', changeData.message);
              throw new Error(changeData.message);
            } else {
              console.log('Password changed successfully using custom SQL function');
            }
          } catch (error: any) {
            // Si el error es de autenticación, la contraseña actual es incorrecta
            if (error.message.includes('Invalid login credentials') ||
                error.message.includes('Current password is incorrect') ||
                error.message.includes('Password is invalid')) {
              throw new Error('Current password is incorrect');
            }

            // Propagar otros errores
            throw error;
          }
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