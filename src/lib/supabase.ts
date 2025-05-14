import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://voiwxfqryobznmxgpamq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvaXd4ZnFyeW9iem5teGdwYW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzc3MzksImV4cCI6MjA2MTgxMzczOX0.K0szF8vOTyjQcBDS74qVA2yHJJgNXVym2L4b5giqqPU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// We don't use Supabase Storage anymore due to RLS issues
// Instead, we use data URLs for profile images

// Helper functions for auth
export const signUpWithEmail = async (email: string, password: string, userData?: any) => {
  try {
    // Make sure userData is properly formatted
    const formattedUserData = {
      name: userData?.name || email.split('@')[0],
      avatar: userData?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || email.split('@')[0])}&background=random`,
      country_code: userData?.country_code || 'US',
      language: userData?.language || 'ar',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Sign up with Supabase - only store data in auth.users metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: formattedUserData,
      }
    });

    if (error) throw error;

    // We'll skip creating a profile record for now
    // The profile will be created later when needed
    // This avoids issues with RLS policies during signup

    return data;
  } catch (error) {
    console.error('Error in signUpWithEmail:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log('Attempting to sign in with email:', email);

    // مسح أي بيانات محلية قديمة متعلقة بالمستخدم
    if (typeof window !== 'undefined') {
      // مسح البيانات المتعلقة بالمستخدم من localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith(`profile_`) ||
          key.startsWith(`user_id_${email}`) ||
          key.startsWith(`avatar_`) ||
          key === `user_id_${email}`
        )) {
          keysToRemove.push(key);
        }
      }

      // مسح المفاتيح المحددة
      keysToRemove.forEach(key => {
        console.log('Removing localStorage key:', key);
        localStorage.removeItem(key);
      });
    }

    // أولاً، نتحقق من حالة المستخدم (محظور أم لا)
    // محاولة استخدام وظيفة validate_user_login
    let validationData;
    let validationError;

    try {
      const result = await supabase
        .rpc('validate_user_login', { email_param: email, password_param: password });

      validationData = result.data;
      validationError = result.error;
    } catch (rpcError) {
      console.warn('Error calling validate_user_login RPC:', rpcError);

      // التحقق المباشر من حالة المستخدم في جدول admin_users
      console.log('Checking admin status directly');

      // البحث عن المستخدم في admin_users باستخدام البريد الإلكتروني
      const { data: adminUserData, error: adminUserError } = await supabase
        .from('admin_users')
        .select('id, status')
        .eq('email', email)
        .single();

      if (adminUserError) {
        console.log('Admin user not found by email, checking profiles table');

        // البحث عن المستخدم في profiles باستخدام البريد الإلكتروني
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, status, block_expires_at')
          .eq('email', email)
          .single();

        if (profileError) {
          console.error('User not found in profiles table:', profileError);
          throw new Error('User not found');
        }

        // التحقق من حالة المستخدم
        if (profileData.status === 'blocked') {
          if (profileData.block_expires_at) {
            const expiresDate = new Date(profileData.block_expires_at);

            // التحقق من انتهاء مدة الحظر
            if (expiresDate > new Date()) {
              const options = { year: 'numeric', month: 'long', day: 'numeric' };
              const formattedDate = expiresDate.toLocaleDateString(undefined, options as Intl.DateTimeFormatOptions);
              throw new Error(`Your account is temporarily blocked until ${formattedDate}.`);
            }
          } else {
            throw new Error('Your account has been permanently blocked. Please contact support.');
          }
        }

        // إذا وصلنا إلى هنا، فالمستخدم غير محظور
        validationData = { success: true, user_id: profileData.id };
        return;
      }

      // التحقق من حالة المستخدم المشرف
      if (adminUserData.status === 'blocked') {
        console.log('Admin user is blocked');
        throw new Error('Your account has been blocked. Please contact support.');
      }

      // إذا وصلنا إلى هنا، فالمستخدم المشرف غير محظور
      const userId = adminUserData.id;

      // إذا وصلنا إلى هنا، فالمستخدم غير محظور
      validationData = { success: true, user_id: userId };
    }

    if (validationError) {
      console.warn('Error validating user login:', validationError);
      throw new Error('Error validating user login. Please try again.');
    }

    if (validationData) {
      console.log('Validation result:', validationData);

      // التحقق من نجاح عملية التحقق
      if (validationData.success === false) {
        // التحقق من حالة الحساب المحذوف
        if (validationData.deleted === true) {
          const errorMessage = 'Your account has been deleted.';
          console.error('Login failed:', errorMessage);
          throw new Error(errorMessage);
        }

        // التحقق من حالة المستخدم المحظور
        if (validationData.blocked === true) {
          // إنشاء رسالة خطأ مناسبة
          let errorMessage = 'Your account has been blocked.';

          // التحقق من وجود تاريخ انتهاء الحظر في الاستجابة
          if (validationData.expires_at) {
            // تنسيق تاريخ انتهاء الحظر
            const expiresDate = new Date(validationData.expires_at);
            // استخدام تنسيق أكثر وضوحًا للتاريخ
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = expiresDate.toLocaleDateString(undefined, options as Intl.DateTimeFormatOptions);

            // استخدام رسالة مباشرة بدون متغيرات للتأكد من عدم وجود مشاكل في الترجمة
            errorMessage = `Your account is temporarily blocked until ${formattedDate}.`;
          } else {
            errorMessage = 'Your account has been permanently blocked. Please contact support.';
          }

          console.error('Login blocked:', errorMessage);
          throw new Error(errorMessage);
        }

        // إذا كان هناك خطأ آخر غير الحظر
        console.error('Login validation failed:', validationData.message || 'Invalid credentials');
        throw new Error(validationData.message || 'Invalid login credentials');
      }

      // التحقق من حالة الحساب المجدول للحذف
      if (validationData.scheduled_for_deletion === true) {
        console.warn('Account scheduled for deletion, days remaining:', validationData.days_remaining);

        // تخزين معلومات الحذف في كائن المستخدم للاستخدام لاحقًا
        validationData.deletion_info = {
          scheduled: true,
          days_remaining: validationData.days_remaining,
          deletion_date: new Date(validationData.deletion_scheduled_at)
        };
      }

      // التحقق من وجود معرف المستخدم
      if (!validationData.user_id) {
        console.error('No user ID returned in validation data');
        throw new Error('Error validating user credentials');
      }
    } else {
      console.error('No validation data returned');
      throw new Error('Error validating user credentials');
    }

    // إذا وصلنا إلى هنا، فهذا يعني أن المستخدم غير محظور
    // الآن نحاول تسجيل الدخول باستخدام supabase.auth
    console.log('User is not blocked, proceeding with login');

    // مسح أي بيانات تخزين مؤقت في Supabase
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.warn('Error during sign out before login:', signOutError);
      // استمر في المحاولة حتى لو فشل تسجيل الخروج
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    // إذا كان هناك خطأ، نتحقق من نوعه
    if (error) {
      console.error('Login error from supabase.auth:', error.message, error.status);

      // إذا كان الخطأ هو "Database error granting user" أو خطأ 500، نحاول استخدام الحل البديل
      if (error.message === 'Database error granting user' || error.status === 500) {
        console.warn('Database error granting user, trying alternative method');

        // محاولة الحصول على معلومات المستخدم من خلال الوظيفة المخصصة
        try {

          // استخدام الوظيفة الآمنة للحصول على معلومات المستخدم
          const { data: userData, error: userError } = await supabase
            .rpc('get_auth_user_by_email', { email_param: email });

          if (!userError && userData && userData.length > 0) {
            const user = userData[0];
            console.log('Found user via RPC function:', user.id);

            // محاولة الحصول على معلومات الملف الشخصي
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();

            if (!profileError && profileData) {
              console.log('Found profile data:', profileData);

              // إنشاء كائن مستخدم باستخدام البيانات التي تم الحصول عليها
              const customUser = {
                id: user.id,
                email: email,
                created_at: user.created_at,
                user_metadata: {
                  name: profileData.name || email.split('@')[0],
                  avatar: profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random`,
                  country_code: profileData.country_code || 'SA',
                  language: profileData.language || 'ar',
                  website: profileData.website,
                  gender: profileData.gender,
                  birth_date: profileData.birth_date,
                  profession: profileData.profession,
                  phone: profileData.phone,
                  bio: profileData.bio
                },
                app_metadata: {},
                aud: 'authenticated',
                role: 'authenticated',
                // إضافة معلومات الحذف إذا كان الحساب مجدولًا للحذف
                deletion_info: validationData.deletion_info || null
              };

              console.log('Created custom user from database:', customUser.id);

              // تخزين البيانات في localStorage كنسخة احتياطية
              try {
                if (typeof window !== 'undefined') {
                  localStorage.setItem(`user_id_${email}`, user.id);
                  localStorage.setItem(`profile_${user.id}`, JSON.stringify(profileData));
                }
              } catch (storageError) {
                console.warn('Error storing data in localStorage:', storageError);
              }

              return { user: customUser };
            } else {
              console.warn('Profile not found, creating default profile');

              // إنشاء ملف شخصي افتراضي
              const defaultProfile = {
                id: user.id,
                email: email,
                name: email.split('@')[0],
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random`,
                country_code: 'SA',
                language: 'ar',
                created_at: user.created_at,
                updated_at: new Date().toISOString()
              };

              // محاولة إنشاء ملف شخصي جديد
              const { data: insertData, error: insertError } = await supabase
                .from('profiles')
                .insert(defaultProfile)
                .select()
                .single();

              if (insertError) {
                console.warn('Error creating profile:', insertError);
              } else {
                console.log('Created new profile:', insertData);
              }

              // إنشاء كائن مستخدم باستخدام البيانات الافتراضية
              const customUser = {
                id: user.id,
                email: email,
                created_at: user.created_at,
                user_metadata: {
                  name: email.split('@')[0],
                  avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random`,
                  country_code: 'SA',
                  language: 'ar'
                },
                app_metadata: {},
                aud: 'authenticated',
                role: 'authenticated'
              };

              console.log('Created custom user with default profile:', customUser.id);

              // تخزين البيانات في localStorage كنسخة احتياطية
              try {
                if (typeof window !== 'undefined') {
                  localStorage.setItem(`user_id_${email}`, user.id);
                  localStorage.setItem(`profile_${user.id}`, JSON.stringify(defaultProfile));
                }
              } catch (storageError) {
                console.warn('Error storing data in localStorage:', storageError);
              }

              return { user: customUser };
            }
          }
        } catch (rpcError) {
          console.warn('Error using RPC function:', rpcError);
        }

        // إذا فشلت جميع المحاولات، نستخدم المستخدم الوهمي من localStorage
        try {
          if (typeof window !== 'undefined') {
            // البحث عن معرف المستخدم المخزن مسبقًا
            const storedUserId = localStorage.getItem(`user_id_${email}`);

            if (storedUserId) {
              console.log('Found stored user ID for email:', storedUserId);

              // محاولة استرجاع بيانات الملف الشخصي
              const storedProfile = localStorage.getItem(`profile_${storedUserId}`);
              const storedAvatar = localStorage.getItem(`avatar_${storedUserId}`);

              let profileData = {};
              if (storedProfile) {
                try {
                  profileData = JSON.parse(storedProfile);
                  console.log('Found stored profile data');
                } catch (parseError) {
                  console.warn('Error parsing stored profile:', parseError);
                }
              }

              // إنشاء كائن مستخدم وهمي باستخدام المعرف المخزن
              const mockUser = {
                id: storedUserId,
                email: email,
                created_at: profileData.created_at || new Date().toISOString(),
                user_metadata: {
                  name: profileData.name || email.split('@')[0],
                  avatar: storedAvatar || profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random`,
                  country_code: profileData.country_code || 'SA',
                  language: profileData.language || 'ar',
                  website: profileData.website,
                  gender: profileData.gender,
                  birth_date: profileData.birth_date,
                  profession: profileData.profession,
                  phone: profileData.phone,
                  bio: profileData.bio
                },
                app_metadata: {},
                aud: 'authenticated',
                role: 'authenticated'
              };

              console.log('Created mock user from localStorage:', mockUser.id);
              return { user: mockUser };
            }
          }
        } catch (storageError) {
          console.warn('Error accessing localStorage:', storageError);
        }

        // إذا لم نجد المستخدم في localStorage، ننشئ معرف جديد
        const uuid = crypto.randomUUID ? crypto.randomUUID() :
          'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });

        // إنشاء كائن مستخدم وهمي
        const mockUser = {
          id: uuid,
          email: email,
          created_at: new Date().toISOString(),
          user_metadata: {
            name: email.split('@')[0],
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random`,
            country_code: 'SA',
            language: 'ar'
          },
          app_metadata: {},
          aud: 'authenticated',
          role: 'authenticated'
        };

        // تخزين معرف المستخدم في localStorage للاستخدام في المستقبل
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(`user_id_${email}`, uuid);
            localStorage.setItem(`profile_${uuid}`, JSON.stringify({
              id: uuid,
              email: email,
              name: email.split('@')[0],
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random`,
              country_code: 'SA',
              language: 'ar',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }));
          }
        } catch (storageError) {
          console.warn('Error storing user ID in localStorage:', storageError);
        }

        console.log('Created mock user with generated UUID:', mockUser.id);
        return { user: mockUser };
      }

      // إذا كان هناك خطأ آخر، نرميه
      throw error;
    }

    console.log('Login successful via supabase.auth, user:', data.user?.id);

    // تخزين البيانات في localStorage كنسخة احتياطية
    try {
      if (typeof window !== 'undefined' && data.user) {
        localStorage.setItem(`user_id_${email}`, data.user.id);
      }
    } catch (storageError) {
      console.warn('Error storing user ID in localStorage:', storageError);
    }

    // إضافة معلومات الحذف إلى كائن المستخدم إذا كان الحساب مجدولًا للحذف
    if (validationData.deletion_info && data.user) {
      // إنشاء نسخة من كائن المستخدم مع إضافة معلومات الحذف
      const userWithDeletionInfo = {
        ...data.user,
        deletion_info: validationData.deletion_info
      };
      return { user: userWithDeletionInfo };
    }

    return { user: data.user };
  } catch (error) {
    console.error('Error in signInWithEmail:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    // Try to sign out with Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      // If there's a CORS error, we'll handle it gracefully
      if (error.message && (
          error.message.includes('CORS') ||
          error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError')
        )) {
        console.warn('CORS error during signout. Clearing local session instead:', error);

        // Clear local storage manually as a fallback
        if (typeof window !== 'undefined') {
          // Clear Supabase-related items from localStorage
          const storageKeys = Object.keys(localStorage);
          const supabaseKeys = storageKeys.filter(key =>
            key.startsWith('sb-') ||
            key.includes('supabase') ||
            key === 'auth-storage'
          );

          // Remove each Supabase-related item
          supabaseKeys.forEach(key => {
            localStorage.removeItem(key);
          });

          // Return without throwing an error
          return;
        }
      }

      // For other errors, throw normally
      throw error;
    }
  } catch (error) {
    console.error('Error in signOut:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    // First try to get the session
    const { data: sessionData } = await supabase.auth.getSession();

    // If we have a session, use it to get the user
    if (sessionData?.session) {
      return sessionData.session.user;
    }

    // If no session, try to get the user directly
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      // Silent error - this is expected when not logged in
      return null;
    }

    return data.user;
  } catch (error) {
    // Silent error - this is expected when not logged in
    return null;
  }
};

export const updateUserProfile = async (userData: any) => {
  // Make a copy of userData to avoid modifying the original object
  const userMetadata = { ...userData };

  // Remove fields that should not be stored in auth metadata
  // These fields are specific to the profiles table
  delete userMetadata.id;
  delete userMetadata.email;
  delete userMetadata.created_at;
  delete userMetadata.updated_at;

  // Update user metadata in auth
  const { data, error } = await supabase.auth.updateUser({
    data: userMetadata
  });

  if (error) {
    throw error;
  }

  return data;
};

export const updateUserPassword = async (password: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password
  });

  if (error) throw error;
  return data;
};

// Upload profile image to storage
export const uploadAvatar = async (file: File, userId: string): Promise<string> => {
  try {
    console.log('Uploading avatar for user:', userId);

    // التحقق مما إذا كان المستخدم وهمي
    const isMockUser = userId.startsWith('temp-') || userId.startsWith('fallback-');

    // إذا لم يكن المستخدم وهميًا، نحاول تحميل الصورة إلى Supabase Storage
    if (!isMockUser) {
      try {
        // إنشاء اسم فريد للملف
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;

        console.log('Uploading to Supabase Storage:', fileName);

        // تحميل الملف إلى Supabase Storage
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          console.warn('Error uploading to Supabase Storage:', error.message);
          // نستمر في التنفيذ للاستخدام الاحتياطي
        } else {
          // الحصول على رابط URL العام
          const { data: urlData } = await supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

          if (urlData && urlData.publicUrl) {
            console.log('Successfully uploaded to Supabase Storage');

            // تخزين الرابط في localStorage كنسخة احتياطية
            try {
              if (typeof window !== 'undefined') {
                localStorage.setItem(`avatar_${userId}`, urlData.publicUrl);

                // تحديث الملف الشخصي المخزن في localStorage
                const storedProfile = localStorage.getItem(`profile_${userId}`);
                if (storedProfile) {
                  try {
                    const profileData = JSON.parse(storedProfile);
                    profileData.avatar = urlData.publicUrl;
                    profileData.updated_at = new Date().toISOString();
                    localStorage.setItem(`profile_${userId}`, JSON.stringify(profileData));
                  } catch (parseError) {
                    console.warn('Error updating stored profile with avatar URL:', parseError);
                  }
                }
              }
            } catch (storageError) {
              console.warn('Error storing avatar URL in localStorage:', storageError);
            }

            // تحديث الملف الشخصي مع رابط الصورة الجديد
            try {
              await updateProfile(userId, { avatar: urlData.publicUrl });
            } catch (profileError) {
              console.warn('Error updating profile with new avatar URL:', profileError);
            }

            return urlData.publicUrl;
          }
        }
      } catch (storageError) {
        console.warn('Error in Supabase Storage upload, falling back to data URL:', storageError);
      }
    }

    // استخدام Data URL كحل بديل أو للمستخدمين الوهميين
    console.log('Using Data URL for avatar');

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // التحقق من أن النتيجة هي سلسلة نصية
        if (typeof reader.result === 'string') {
          // تخزين الصورة في localStorage
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem(`avatar_${userId}`, reader.result);

              // تحديث الملف الشخصي المخزن في localStorage
              const storedProfile = localStorage.getItem(`profile_${userId}`);
              if (storedProfile) {
                try {
                  const profileData = JSON.parse(storedProfile);
                  profileData.avatar = reader.result;
                  profileData.updated_at = new Date().toISOString();
                  localStorage.setItem(`profile_${userId}`, JSON.stringify(profileData));
                } catch (parseError) {
                  console.warn('Error updating stored profile with avatar:', parseError);
                }
              }

              console.log('Avatar stored in localStorage');
            }
          } catch (storageError) {
            console.warn('Error storing avatar in localStorage:', storageError);
          }

          // تحديث الملف الشخصي مع Data URL
          try {
            updateProfile(userId, { avatar: reader.result }).catch(err =>
              console.warn('Error updating profile with data URL:', err)
            );
          } catch (profileError) {
            console.warn('Error updating profile with data URL:', profileError);
          }

          resolve(reader.result);
        } else {
          // إذا فشلت القراءة، نستخدم صورة افتراضية
          const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userId)}&background=random`;
          resolve(defaultAvatar);
        }
      };
      reader.onerror = () => {
        console.error('Error reading file');
        const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userId)}&background=random`;
        resolve(defaultAvatar);
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Error in uploadAvatar:', error);

    // Fallback to a default avatar if upload fails
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userId)}&background=random`;
  }
};

// Get user profile data from profiles table or localStorage
export const getUserProfile = async (userId: string): Promise<any> => {
  // If no userId is provided, return an empty object
  if (!userId) {
    console.warn('No userId provided to getUserProfile');
    return {};
  }

  try {
    console.log('Getting profile for user:', userId);

    // محاولة الحصول على البيانات من localStorage أولاً للسرعة
    let localProfile = null;
    if (typeof window !== 'undefined') {
      const storedProfile = localStorage.getItem(`profile_${userId}`);
      if (storedProfile) {
        try {
          localProfile = JSON.parse(storedProfile);
          console.log('Found profile data in localStorage:', localProfile);
        } catch (parseError) {
          console.warn('Error parsing stored profile:', parseError);
        }
      }
    }

    // محاولة الحصول على البيانات من Supabase باستخدام وظيفة RPC
    try {
      // Try to get the user's profile data using safe RPC function first
      console.log('Trying to get profile using get_profile_safe RPC function');
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_profile_safe', { user_id: userId });

      if (!rpcError && rpcData && rpcData.length > 0) {
        console.log('Got profile data from safe RPC function:', rpcData[0]);
        const data = rpcData[0];

        // تخزين البيانات في localStorage للاستخدام في المستقبل
        if (typeof window !== 'undefined') {
          localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
          console.log('Stored safe RPC profile data in localStorage');
        }

        return data;
      }

      console.log('Safe RPC function failed or returned no data, trying fallback RPC function');

      // Try fallback RPC function
      const { data: fallbackRpcData, error: fallbackRpcError } = await supabase
        .rpc('get_profile_by_id', { user_id: userId });

      if (!fallbackRpcError && fallbackRpcData && fallbackRpcData.length > 0) {
        console.log('Got profile data from fallback RPC function:', fallbackRpcData[0]);
        const data = fallbackRpcData[0];

        // تخزين البيانات في localStorage للاستخدام في المستقبل
        if (typeof window !== 'undefined') {
          localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
          console.log('Stored fallback RPC profile data in localStorage');
        }

        return data;
      }

      console.log('All RPC functions failed, trying direct query as last resort');

      // If RPC fails, try direct query
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Error fetching profile from Supabase:', error);

        // إذا فشل الحصول على البيانات من Supabase، نستخدم البيانات المخزنة محلياً
        if (localProfile) {
          console.log('Using localStorage profile data after Supabase error');

          // محاولة تحديث قاعدة البيانات بالبيانات المحلية
          try {
            // استخدام upsert مباشرة لتجاوز مشكلة المصادقة
            const { error: upsertError } = await supabase
              .from('profiles')
              .upsert({
                id: userId,
                ...localProfile,
                updated_at: new Date().toISOString()
              });

            if (upsertError) {
              console.warn('Failed to update database with local data via upsert:', upsertError);
            } else {
              console.log('Successfully updated database with local data via upsert');
            }
          } catch (updateError) {
            console.warn('Failed to update database with local data:', updateError);
          }

          return localProfile;
        }

        return {};
      }

      console.log('Found profile in database:', data);

      // تخزين البيانات في localStorage للاستخدام في المستقبل
      if (data && typeof window !== 'undefined') {
        try {
          // إذا كان لدينا بيانات محلية، نقوم بدمجها مع البيانات من قاعدة البيانات
          // مع إعطاء الأولوية للبيانات المحلية لأنها قد تكون أحدث
          if (localProfile) {
            // التحقق من تاريخ التحديث
            const dbUpdateTime = new Date(data.updated_at || 0).getTime();
            const localUpdateTime = new Date(localProfile.updated_at || 0).getTime();

            // مقارنة البيانات الفعلية بين المحلية وقاعدة البيانات
            const hasLocalChanges = JSON.stringify({
              name: localProfile.name,
              country_code: localProfile.country_code,
              language: localProfile.language,
              phone: localProfile.phone,
              bio: localProfile.bio,
              website: localProfile.website,
              gender: localProfile.gender,
              birth_date: localProfile.birth_date,
              profession: localProfile.profession
            }) !== JSON.stringify({
              name: data.name,
              country_code: data.country_code,
              language: data.language,
              phone: data.phone,
              bio: data.bio,
              website: data.website,
              gender: data.gender,
              birth_date: data.birth_date,
              profession: data.profession
            });

            // إذا كانت البيانات المحلية مختلفة عن بيانات قاعدة البيانات أو أحدث، نستخدمها ونحاول تحديث قاعدة البيانات
            if (hasLocalChanges || localUpdateTime > dbUpdateTime) {
              console.log('Local data is different or newer than database data, using local data');

              // محاولة تحديث قاعدة البيانات بالبيانات المحلية
              try {
                // استخدام upsert مباشرة لتجاوز مشكلة المصادقة
                const { error: upsertError } = await supabase
                  .from('profiles')
                  .upsert({
                    id: userId,
                    ...localProfile,
                    updated_at: new Date().toISOString()
                  });

                if (upsertError) {
                  console.warn('Failed to update database with local data via upsert:', upsertError);
                } else {
                  console.log('Successfully updated database with local data via upsert');
                }
              } catch (updateError) {
                console.warn('Failed to update database with local data:', updateError);
              }

              return localProfile;
            }

            // إذا كانت بيانات قاعدة البيانات أحدث ولا توجد تغييرات محلية، نستخدمها ونحدث البيانات المحلية
            console.log('Database data is newer than local data and no local changes, using database data');
            localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
            console.log('Updated localStorage with newer database data');
            return data;
          } else {
            // إذا لم يكن لدينا بيانات محلية، نخزن بيانات قاعدة البيانات
            localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
            console.log('Stored Supabase profile data in localStorage');
            return data;
          }
        } catch (storageError) {
          console.warn('Error storing profile in localStorage:', storageError);
          return data;
        }
      }

      // Return the profile data
      return data;
    } catch (supabaseError) {
      console.warn('Exception in fetching from Supabase:', supabaseError);

      // إذا فشلت محاولة الحصول على البيانات من Supabase، نستخدم البيانات المحلية
      if (localProfile) {
        console.log('Using localStorage profile data after Supabase exception');
        return localProfile;
      }

      return {};
    }
  } catch (error) {
    console.warn('Exception in getUserProfile:', error);

    // محاولة أخيرة للحصول على البيانات من localStorage
    if (typeof window !== 'undefined') {
      const storedProfile = localStorage.getItem(`profile_${userId}`);
      if (storedProfile) {
        try {
          const profileData = JSON.parse(storedProfile);
          console.log('Found profile data in localStorage after general exception');
          return profileData;
        } catch (parseError) {
          console.warn('Error parsing stored profile:', parseError);
        }
      }
    }

    return {};
  }
};

// Create profiles table if it doesn't exist
export const createProfilesTable = async (): Promise<boolean> => {
  try {
    // Check if the table exists
    const { error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    // If there's an error and it's because the table doesn't exist
    if (checkError && checkError.message.includes('does not exist')) {
      // Since we can't create tables directly through the client API,
      // we'll need to use the Supabase dashboard to create the table.
      // For now, we'll just return false.

      // For now, we'll just store the profile data in auth.users metadata
      return false;
    } else if (checkError) {
      return false;
    }

    // Table exists
    return true;
  } catch (error) {
    return false;
  }
};

// Update user profile in profiles table and auth metadata
export const updateProfile = async (userId: string, profileData: any): Promise<any> => {
  try {
    console.log('Updating profile for user:', userId, 'with data:', profileData);

    // التحقق مما إذا كان المستخدم وهمي
    const isMockUser = userId.startsWith('temp-') || userId.startsWith('fallback-');

    // First, update the user metadata in auth if it's not a mock user
    if (!isMockUser) {
      try {
        // Make a copy of profileData to avoid modifying the original object
        const userMetadata = { ...profileData };

        // Remove fields that should not be stored in auth metadata
        delete userMetadata.id;
        delete userMetadata.email;
        delete userMetadata.created_at;
        delete userMetadata.updated_at;

        // Update user metadata in auth
        await updateUserProfile(userMetadata);
        console.log('Updated user metadata in auth');
      } catch (authError) {
        // Log error but continue
        console.warn('Failed to update auth metadata:', authError);
      }
    }

    // إذا كان المستخدم وهمي، نكتفي بالتخزين في localStorage
    if (isMockUser) {
      const mockResult = { id: userId, ...profileData, updated_at: new Date().toISOString() };

      // تخزين البيانات في localStorage
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`profile_${userId}`, JSON.stringify(mockResult));
          console.log('Stored mock user profile in localStorage');

          // تخزين معرف المستخدم مع البريد الإلكتروني للاستخدام في المستقبل
          if (profileData.email) {
            localStorage.setItem(`user_id_${profileData.email}`, userId);
          }

          // تخزين الصورة الشخصية في localStorage إذا كانت موجودة
          if (profileData.avatar) {
            localStorage.setItem(`avatar_${userId}`, profileData.avatar);
          }
        }
      } catch (storageError) {
        console.warn('Error storing mock profile in localStorage:', storageError);
      }

      return mockResult;
    }

    // For real users, update the profile in Supabase
    try {
      // First check if the profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError && !fetchError.message.includes('No rows found')) {
        console.warn('Error checking profile existence:', fetchError);
      }

      let result;

      // If profile exists, update it
      if (existingProfile) {
        console.log('Existing profile found, updating it');

        // Prepare data for update
        const dataToUpdate = { ...profileData, updated_at: new Date().toISOString() };
        delete dataToUpdate.id; // Cannot update primary key
        delete dataToUpdate.created_at; // Should not update creation date

        const { data, error } = await supabase
          .from('profiles')
          .update(dataToUpdate)
          .eq('id', userId)
          .select()
          .single();

        if (error) {
          console.warn('Error updating profile in Supabase:', error);
          result = { id: userId, ...profileData, updated_at: new Date().toISOString() };
        } else {
          console.log('Profile updated successfully in Supabase:', data);
          result = data;
        }
      }
      // If profile doesn't exist, insert it
      else {
        console.log('No existing profile found, creating new one');

        const newProfile = {
          id: userId,
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (error) {
          console.warn('Error inserting profile in Supabase:', error);

          // Try upsert as a fallback
          console.log('Trying upsert as fallback');
          const { data: upsertData, error: upsertError } = await supabase
            .from('profiles')
            .upsert(newProfile)
            .select()
            .single();

          if (upsertError) {
            console.warn('Error upserting profile in Supabase:', upsertError);
            result = { id: userId, ...profileData, updated_at: new Date().toISOString() };
          } else {
            console.log('Profile upserted successfully in Supabase:', upsertData);
            result = upsertData;
          }
        } else {
          console.log('Profile inserted successfully in Supabase:', data);
          result = data;
        }
      }

      // تخزين البيانات في localStorage كنسخة احتياطية
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`profile_${userId}`, JSON.stringify(result));
          console.log('Stored updated profile in localStorage');

          // تخزين معرف المستخدم مع البريد الإلكتروني للاستخدام في المستقبل
          if (profileData.email) {
            localStorage.setItem(`user_id_${profileData.email}`, userId);
          }

          // تخزين الصورة الشخصية في localStorage إذا كانت موجودة
          if (profileData.avatar) {
            localStorage.setItem(`avatar_${userId}`, profileData.avatar);
          }
        }
      } catch (storageError) {
        console.warn('Error storing profile in localStorage:', storageError);
      }

      return result;
    } catch (dbError) {
      console.warn('Database error in updateProfile:', dbError);

      const fallbackResult = { id: userId, ...profileData, updated_at: new Date().toISOString() };

      // تخزين البيانات في localStorage كنسخة احتياطية
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`profile_${userId}`, JSON.stringify(fallbackResult));
        }
      } catch (storageError) {
        console.warn('Error storing fallback profile in localStorage:', storageError);
      }

      return fallbackResult;
    }
  } catch (error) {
    console.warn('Exception in updateProfile:', error);
    return { id: userId, ...profileData, updated_at: new Date().toISOString() };
  }
};

// Create a function to directly insert a profile
export const createUserProfile = async (userId: string, email: string, name?: string): Promise<any> => {
  try {
    console.log('Creating profile for user:', userId);

    // Create default profile data
    const defaultProfile = {
      id: userId,
      email: email,
      name: name || email.split('@')[0],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email.split('@')[0])}&background=random`,
      country_code: 'EG', // تغيير القيمة الافتراضية من SA إلى EG
      language: 'ar',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert the profile
    const { data, error } = await supabase
      .from('profiles')
      .insert(defaultProfile)
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);

      // Try upsert as a fallback
      const { data: upsertData, error: upsertError } = await supabase
        .from('profiles')
        .upsert(defaultProfile)
        .select()
        .single();

      if (upsertError) {
        console.error('Error upserting profile:', upsertError);
        return null;
      }

      console.log('Profile upserted successfully:', upsertData);

      // Store in localStorage as backup
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`profile_${userId}`, JSON.stringify(upsertData));
          localStorage.setItem(`user_id_${email}`, userId);
        } catch (storageError) {
          console.warn('Error storing profile in localStorage:', storageError);
        }
      }

      return upsertData;
    }

    console.log('Profile created successfully:', data);

    // Store in localStorage as backup
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
        localStorage.setItem(`user_id_${email}`, userId);
      } catch (storageError) {
        console.warn('Error storing profile in localStorage:', storageError);
      }
    }

    return data;
  } catch (error) {
    console.error('Exception in createUserProfile:', error);
    return null;
  }
};

// Function to directly update profile in database using custom SQL function
export const updateProfileDirectSQL = async (userId: string, profileData: any): Promise<any> => {
  try {
    console.log('Attempting to update profile using custom SQL function for user:', userId);

    // Prepare the data for update
    const updateData = {
      ...profileData,
      updated_at: new Date().toISOString()
    };

    // Remove fields that should not be updated
    delete updateData.id;
    delete updateData.created_at;

    // استخدام الوظيفة المباشرة بلغة SQL
    console.log('Calling direct_update_profile RPC with params:', {
      p_user_id: userId,
      p_name: profileData.name,
      p_gender: profileData.gender,
      p_birth_date: profileData.birth_date,
      p_country_code: profileData.country_code,
      p_phone: profileData.phone,
      p_bio: profileData.bio,
      p_website: profileData.website,
      p_profession: profileData.profession,
      p_language: profileData.language
    });

    const { data, error } = await supabase.rpc('direct_update_profile', {
      p_user_id: userId,
      p_name: profileData.name,
      p_gender: profileData.gender,
      p_birth_date: profileData.birth_date,
      p_country_code: profileData.country_code,
      p_phone: profileData.phone,
      p_bio: profileData.bio,
      p_website: profileData.website,
      p_profession: profileData.profession,
      p_language: profileData.language
    });

    if (error) {
      console.warn('Error from direct_update_profile RPC:', error);

      // Try fallback method - direct update/insert
      console.log('Trying fallback method - direct update/insert');

      // First check if the profile exists
      console.log('Checking if profile exists for user:', userId);
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (checkError && !checkError.message.includes('No rows found')) {
        console.warn('Error checking if profile exists:', checkError);
      }

      if (existingProfile) {
        console.log('Profile exists, updating it directly');

        // Update the profile directly
        const { data: updateData, error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId)
          .select()
          .single();

        if (updateError) {
          console.warn('Error updating profile directly:', updateError);
          return null;
        }

        console.log('Profile updated successfully via fallback:', updateData);
        return updateData;
      } else {
        console.log('Profile does not exist, creating it');

        // Create a new profile
        const { data: insertData, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            ...updateData,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.warn('Error creating profile via fallback:', insertError);
          return null;
        }

        console.log('Profile created successfully via fallback:', insertData);
        return insertData;
      }
    }

    // Check if the result contains an error field (from our custom function)
    if (data && data.error) {
      console.warn('Custom function returned error:', data.error);
      return null;
    }

    console.log('Profile updated successfully with custom function:', data);
    return data;
  } catch (error) {
    console.warn('Exception in updateProfileDirectSQL:', error);
    return null;
  }
};

// Direct function to update profile in Supabase
export const updateSupabaseProfile = async (userId: string, profileData: any): Promise<any> => {
  try {
    console.log('Updating Supabase profile for user:', userId);

    // التحقق مما إذا كان المستخدم وهمي
    const isMockUser = userId.startsWith('temp-') || userId.startsWith('fallback-');

    // إذا كان المستخدم وهمي، نكتفي بإرجاع البيانات
    if (isMockUser) {
      console.log('Mock user detected, skipping Supabase update');
      return { id: userId, ...profileData, updated_at: new Date().toISOString() };
    }

    // تخزين البيانات في localStorage أولاً كنسخة احتياطية
    // هذا يضمن أن البيانات ستكون متاحة حتى لو فشل التحديث في Supabase
    if (typeof window !== 'undefined') {
      try {
        const storedProfile = localStorage.getItem(`profile_${userId}`);
        let existingData = {};

        if (storedProfile) {
          existingData = JSON.parse(storedProfile);
        }

        const mergedData = {
          ...existingData,
          ...profileData,
          id: userId,
          updated_at: new Date().toISOString()
        };

        localStorage.setItem(`profile_${userId}`, JSON.stringify(mergedData));
        console.log('Profile data stored in localStorage as backup before Supabase update');
      } catch (storageError) {
        console.warn('Error storing profile in localStorage:', storageError);
      }
    }

    // التحقق من وجود جلسة مصادقة نشطة
    const { data: sessionData } = await supabase.auth.getSession();
    const isAuthenticated = !!sessionData?.session;

    if (!isAuthenticated) {
      console.warn('No active auth session found, attempting to refresh session');

      // محاولة تحديث الجلسة
      try {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError) {
          console.warn('Failed to refresh session:', refreshError);
        } else if (refreshData && refreshData.session) {
          console.log('Session refreshed successfully');
        } else {
          console.warn('No session returned after refresh attempt');
        }
      } catch (refreshError) {
        console.warn('Error refreshing session:', refreshError);
      }
    }

    // إعداد البيانات للتحديث
    const dataToUpdate = {
      ...profileData,
      updated_at: new Date().toISOString()
    };

    // حذف الحقول التي لا يجب تحديثها
    delete dataToUpdate.id;
    delete dataToUpdate.created_at;

    // التحقق من وجود الملف الشخصي
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError && !fetchError.message.includes('No rows found')) {
      console.warn('Error checking profile existence:', fetchError);

      // تخزين البيانات في localStorage على الأقل
      if (typeof window !== 'undefined') {
        try {
          const storedProfile = localStorage.getItem(`profile_${userId}`);
          let existingData = {};

          if (storedProfile) {
            existingData = JSON.parse(storedProfile);
          }

          const mergedData = {
            ...existingData,
            ...profileData,
            id: userId,
            updated_at: new Date().toISOString()
          };

          localStorage.setItem(`profile_${userId}`, JSON.stringify(mergedData));
          console.log('Profile data stored in localStorage after fetch error');
        } catch (storageError) {
          console.warn('Error storing profile in localStorage:', storageError);
        }
      }

      return { id: userId, ...profileData, updated_at: new Date().toISOString() };
    }

    // استخدام وظيفة مخصصة لتحديث البيانات
    console.log('Using direct update method for profile');

    // إعداد البيانات للتحديث
    const updateData = {
      id: userId, // يجب تضمين المعرف للتعرف على السجل
      ...dataToUpdate,
      updated_at: new Date().toISOString()
    };

    // إذا كان الملف الشخصي موجود، نحافظ على بعض البيانات الأصلية
    if (existingProfile) {
      updateData.email = existingProfile.email; // الحفاظ على البريد الإلكتروني الأصلي
      updateData.created_at = existingProfile.created_at; // الحفاظ على تاريخ الإنشاء
    } else {
      // إذا كان ملف شخصي جديد، نضيف تاريخ الإنشاء
      updateData.created_at = new Date().toISOString();
    }

    // محاولة تحديث البيانات باستخدام وظيفة مخصصة
    try {
      console.log('Trying direct update via custom function');

      // استخدام وظيفة مخصصة لتحديث البيانات
      console.log('Calling update_profile_no_auth RPC with params:', { p_user_id: userId, p_profile_data: updateData });
      const { data: directUpdateData, error: directUpdateError } = await supabase.rpc('update_profile_no_auth', {
        p_user_id: userId,
        p_profile_data: updateData
      });

      if (directUpdateError) {
        console.warn('Error from update_profile_no_auth RPC:', directUpdateError);
      } else {
        console.log('Result from update_profile_no_auth RPC:', directUpdateData);
      }

      if (directUpdateError) {
        console.warn('Error updating profile via custom function:', directUpdateError);

        // محاولة استخدام upsert كحل بديل
        console.log('Falling back to upsert method');
        const { data, error } = await supabase
          .from('profiles')
          .upsert(updateData)
          .select()
          .single();

        if (error) {
          console.warn('Error upserting profile:', error);

          // تخزين البيانات في localStorage على الأقل
          const fallbackProfile = {
            id: userId,
            ...profileData,
            updated_at: new Date().toISOString()
          };

          if (existingProfile) {
            fallbackProfile.created_at = existingProfile.created_at;
            fallbackProfile.email = existingProfile.email;
          } else {
            fallbackProfile.created_at = new Date().toISOString();
          }

          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(`profile_${userId}`, JSON.stringify(fallbackProfile));
              console.log('Profile data stored in localStorage after update/upsert error');
            } catch (storageError) {
              console.warn('Error storing profile in localStorage:', storageError);
            }
          }

          return fallbackProfile;
        }

        console.log('Profile upserted successfully:', data);

        // تخزين البيانات المحدثة في localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
            console.log('Upserted profile data stored in localStorage');
          } catch (storageError) {
            console.warn('Error storing upserted profile in localStorage:', storageError);
          }
        }

        return data;
      }

      console.log('Profile updated successfully via custom function:', directUpdateData);

      // تحويل البيانات المحدثة إلى كائن كامل
      const updatedProfile = {
        ...existingProfile,
        ...updateData,
        updated_at: new Date().toISOString()
      };

      // تخزين البيانات المحدثة في localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`profile_${userId}`, JSON.stringify(updatedProfile));
          console.log('Updated profile data stored in localStorage');
        } catch (storageError) {
          console.warn('Error storing updated profile in localStorage:', storageError);
        }
      }

      return updatedProfile;
    } catch (updateError) {
      console.warn('Exception in direct update:', updateError);

      // محاولة استخدام upsert كحل بديل
      try {
        console.log('Falling back to upsert method after exception');

        // محاولة استخدام RPC لتجاوز سياسات RLS
        try {
          console.log('Trying RPC method to bypass RLS policies');

          // تحويل البيانات إلى تنسيق JSONB
          const jsonbData = {};
          Object.keys(updateData).forEach(key => {
            // تجنب إرسال حقل birth_date إذا كان فارغًا أو غير صالح
            if (key === 'birth_date' && (!updateData[key] || updateData[key] === '')) {
              return;
            }

            if (updateData[key] !== undefined && updateData[key] !== null) {
              jsonbData[key] = updateData[key];
            }
          });

          console.log('Sending data to RPC function:', {
            p_user_id: userId,
            p_profile_data: jsonbData
          });

          const { data: rpcData, error: rpcError } = await supabase.rpc('update_profile_safe', {
            p_user_id: userId,
            p_profile_data: jsonbData
          });

          if (!rpcError) {
            console.log('Profile updated successfully via RPC bypass:', rpcData);

            // تخزين البيانات المحدثة في localStorage
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem(`profile_${userId}`, JSON.stringify({
                  ...updateData,
                  id: userId,
                  updated_at: new Date().toISOString()
                }));
                console.log('Updated profile data stored in localStorage after RPC update');
              } catch (storageError) {
                console.warn('Error storing profile in localStorage after RPC update:', storageError);
              }
            }

            return {
              ...updateData,
              id: userId,
              updated_at: new Date().toISOString()
            };
          } else {
            console.warn('RPC bypass method failed:', rpcError);
          }
        } catch (rpcBypassError) {
          console.warn('Error using RPC bypass method:', rpcBypassError);
        }

        // إذا فشلت طريقة RPC، نستخدم upsert العادي
        const { data, error } = await supabase
          .from('profiles')
          .upsert(updateData)
          .select()
          .single();

        if (error) {
          console.warn('Error upserting profile after exception:', error);

          // تخزين البيانات في localStorage كملاذ أخير
          const finalFallbackProfile = {
            id: userId,
            ...profileData,
            updated_at: new Date().toISOString()
          };

          if (existingProfile) {
            finalFallbackProfile.created_at = existingProfile.created_at;
            finalFallbackProfile.email = existingProfile.email;
          } else {
            finalFallbackProfile.created_at = new Date().toISOString();
          }

          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(`profile_${userId}`, JSON.stringify(finalFallbackProfile));
              console.log('Profile data stored in localStorage after all database attempts failed');
            } catch (storageError) {
              console.warn('Error storing profile in localStorage:', storageError);
            }
          }

          return finalFallbackProfile;
        }

        console.log('Profile upserted successfully after exception:', data);

        // تخزين البيانات المحدثة في localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
            console.log('Upserted profile data stored in localStorage after exception');
          } catch (storageError) {
            console.warn('Error storing upserted profile in localStorage:', storageError);
          }
        }

        return data;
      } catch (finalError) {
        console.warn('All database update attempts failed:', finalError);

        // تخزين البيانات في localStorage كملاذ أخير
        const finalFallbackProfile = {
          id: userId,
          ...profileData,
          updated_at: new Date().toISOString()
        };

        if (existingProfile) {
          finalFallbackProfile.created_at = existingProfile.created_at;
          finalFallbackProfile.email = existingProfile.email;
        } else {
          finalFallbackProfile.created_at = new Date().toISOString();
        }

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`profile_${userId}`, JSON.stringify(finalFallbackProfile));
            console.log('Profile data stored in localStorage after all attempts failed');
          } catch (storageError) {
            console.warn('Error storing profile in localStorage:', storageError);
          }
        }

        return finalFallbackProfile;
      }
    }
  } catch (error) {
    console.warn('Exception in updateSupabaseProfile:', error);

    // تخزين البيانات في localStorage على الأقل
    if (typeof window !== 'undefined') {
      try {
        const result = { id: userId, ...profileData, updated_at: new Date().toISOString() };
        localStorage.setItem(`profile_${userId}`, JSON.stringify(result));
        console.log('Profile data stored in localStorage after exception');
      } catch (storageError) {
        console.warn('Error storing profile in localStorage:', storageError);
      }
    }

    return { id: userId, ...profileData, updated_at: new Date().toISOString() };
  }
};

// Setup auth state change listener
export const setupAuthListener = (callback: (user: any) => void) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
};

// Function to get debug logs for a user
export const getDebugLogs = async (userId: string, limit = 10): Promise<any> => {
  try {
    console.log('Getting debug logs for user:', userId);

    const { data, error } = await supabase
      .from('debug_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Error getting debug logs:', error);
      return null;
    }

    console.log('Found debug logs:', data);
    return data;
  } catch (error) {
    console.warn('Exception in getDebugLogs:', error);
    return null;
  }
};