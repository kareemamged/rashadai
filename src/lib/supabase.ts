import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://voiwxfqryobznmxgpamq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvaXd4ZnFyeW9iem5teGdwYW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzc3MzksImV4cCI6MjA2MTgxMzczOX0.K0szF8vOTyjQcBDS74qVA2yHJJgNXVym2L4b5giqqPU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// We don't use Supabase Storage anymore due to RLS issues
// Instead, we use data URLs for profile images

// Helper functions for auth
export const signUpWithEmail = async (email: string, password: string, userData?: any) => {
  try {
    // First, try to sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      }
    });

    if (error) throw error;

    // If signup is successful and we have a user, try to create a profile
    if (data.user) {
      try {
        // Check if the profiles table exists
        const { error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);

        // If the table exists (no error), try to create a profile
        if (!checkError) {
          // Try to insert a new profile
          await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              name: userData?.name || email.split('@')[0],
              avatar: userData?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || email.split('@')[0])}&background=random`,
              country_code: userData?.country_code,
              language: userData?.language || 'ar',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select();
        }
      } catch (profileError) {
        // Log the error but don't fail the signup
        console.warn('Could not create profile, but user was created:', profileError);
      }
    }

    return data;
  } catch (error) {
    console.error('Error in signUpWithEmail:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
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
    // بما أن هناك مشاكل مع سياسات الأمان في Supabase، سنستخدم حلاً بديلاً
    // سنقوم بتحويل الصورة إلى Data URL واستخدامها مباشرة

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // التحقق من أن النتيجة هي سلسلة نصية
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          // إذا فشلت القراءة، نستخدم صورة افتراضية
          resolve(`https://ui-avatars.com/api/?name=${encodeURIComponent(userId)}&background=random`);
        }
      };
      reader.onerror = () => {
        console.error('Error reading file');
        resolve(`https://ui-avatars.com/api/?name=${encodeURIComponent(userId)}&background=random`);
      };
      reader.readAsDataURL(file);
    });

    // لا يمكننا استخدام Supabase Storage بسبب مشاكل سياسات الأمان (RLS)
    // بدلاً من ذلك، نستخدم Data URLs للصور الشخصية

    // الكود التالي معطل:
    // 1. إنشاء اسم فريد للملف
    // 2. تحميل الملف إلى Supabase Storage
    // 3. الحصول على رابط URL العام
    // 4. إرجاع الرابط
  } catch (error) {
    console.error('Error in uploadAvatar:', error);

    // Fallback to a default avatar if upload fails
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userId)}&background=random`;
  }
};

// Get user profile data from profiles table
export const getUserProfile = async (userId: string): Promise<any> => {
  // If no userId is provided, return an empty object
  if (!userId) {
    console.warn('No userId provided to getUserProfile');
    return {};
  }

  try {
    // Check if the profiles table exists
    const { error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    // If there's an error and it's because the table doesn't exist
    if (checkError && checkError.message.includes('does not exist')) {
      // Don't try to create the table here, just return empty object
      // This avoids multiple simultaneous attempts to create the table
      return {};
    }

    // Try to get the user's profile data
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // If the error is because no rows were found, return an empty object
      if (error.message.includes('No rows found')) {
        return {};
      }

      // For other errors, log and return an empty object
      console.warn('Error fetching profile:', error);
      return {};
    }

    // Return the profile data
    return data;
  } catch (error) {
    console.warn('Exception in getUserProfile:', error);
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
    // First, update the user metadata in auth
    // This ensures the data is always saved somewhere, even if the profiles table doesn't exist
    try {
      // Make a copy of profileData to avoid modifying the original object
      const userMetadata = { ...profileData };

      // Remove fields that should not be stored in auth metadata
      delete userMetadata.id;
      delete userMetadata.email;
      delete userMetadata.created_at;

      // Update user metadata in auth
      await updateUserProfile(userMetadata);

      // Log success for debugging
      console.log('Auth metadata updated successfully');
    } catch (authError) {
      // Log error but continue
      console.warn('Failed to update auth metadata:', authError);
    }

    // Check if the profiles table exists
    const { error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    // If there's an error, it means the table doesn't exist or there's an issue accessing it
    if (checkError) {
      console.warn('Profiles table does not exist or cannot be accessed:', checkError.message);

      // Return the data that was passed in since we've already updated the auth metadata
      return { id: userId, ...profileData, updated_at: new Date().toISOString() };
    }

    // If the table exists, try to update the data
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.warn('Error updating profile:', error.message);

        // If this is the first time for this user, try to insert a new record
        if (error.message.includes('violates row-level security policy') ||
            error.message.includes('No rows found')) {
          try {
            const { data: insertData, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                ...profileData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single();

            if (insertError) {
              console.warn('Error inserting new profile:', insertError.message);
              return { id: userId, ...profileData, updated_at: new Date().toISOString() };
            }

            console.log('New profile created successfully');
            return insertData;
          } catch (insertCatchError) {
            console.warn('Exception during profile insert:', insertCatchError);
            return { id: userId, ...profileData, updated_at: new Date().toISOString() };
          }
        }

        // Return the data that was passed in
        return { id: userId, ...profileData, updated_at: new Date().toISOString() };
      }

      console.log('Profile updated successfully');
      return data;
    } catch (upsertError) {
      console.warn('Exception during profile upsert:', upsertError);
      return { id: userId, ...profileData, updated_at: new Date().toISOString() };
    }
  } catch (error) {
    console.error('Unhandled error in updateProfile:', error);
    return { id: userId, ...profileData, updated_at: new Date().toISOString() };
  }
};

// Setup auth state change listener
export const setupAuthListener = (callback: (user: any) => void) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
};