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
  updateProfile as updateSupabaseProfile
} from '../lib/supabase';
import { getDefaultAvatar } from '../lib/imageUtils';

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
  updated_at?: string;
  website?: string;
  gender?: string;
  birth_date?: string;
  profession?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string, countryCode?: string, name?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
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
            country_code: countryCode || getDefaultCountry().code,
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
          // Sign in with Supabase
          const { user } = await signInWithEmail(email, password);

          if (user) {
            // Get user metadata
            const userData = user.user_metadata;

            const loggedInUser: User = {
              id: user.id,
              email: user.email || email,
              created_at: user.created_at,
              name: userData?.name || email.split('@')[0],
              avatar: userData?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random`,
              country_code: userData?.country_code || getDefaultCountry().code,
              phone: userData?.phone,
              bio: userData?.bio,
              language: userData?.language || 'ar'
            };

            set({ user: loggedInUser });
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
          await supabaseSignOut();
          // If we get here, signout was successful
          set({ user: null });
        } catch (error) {
          console.error('Signout error:', error);

          // Even if there's an error with Supabase signout (like CORS),
          // we still want to clear the local user state
          set({ user: null });

          // Clear local storage manually as a fallback
          if (typeof window !== 'undefined') {
            try {
              // Clear Zustand store
              localStorage.removeItem('auth-storage');

              // Reload the page to ensure all state is cleared
              window.location.href = '/';
            } catch (localStorageError) {
              console.error('Error clearing local storage:', localStorageError);
            }
          }
        } finally {
          set({ isLoading: false });
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          // Try to get the current user from Supabase
          const user = await getCurrentUser();

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
              website: userData?.website,
              gender: userData?.gender,
              birth_date: userData?.birth_date,
              profession: userData?.profession
            };

            // Set the user immediately to avoid delays
            set({ user: basicUser, isLoading: false });

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
                    website: profileData.website,
                    gender: profileData.gender,
                    birth_date: profileData.birth_date,
                    profession: profileData.profession
                  };

                  // Update the user state
                  set({ user: updatedUser });
                }
                // If we got data from auth but not from profiles table, try to create a profile
                else if (Object.keys(userData).length > 0) {
                  try {
                    await updateSupabaseProfile(user.id, {
                      id: user.id,
                      email: user.email,
                      name: userData.name,
                      avatar: userData.avatar,
                      country_code: userData.country_code,
                      phone: userData.phone,
                      bio: userData.bio,
                      language: userData.language,
                      website: userData.website,
                      gender: userData.gender,
                      birth_date: userData.birth_date,
                      profession: userData.profession,
                      created_at: user.created_at,
                      updated_at: new Date().toISOString()
                    });
                  } catch (createError) {
                    console.error('Failed to create profile from auth metadata:', createError);
                  }
                }
              } catch (profileError) {
                console.error('Error fetching profile data:', profileError);
                // We already set the basic user above, so no need to do anything here
              }
            }, 500); // Delay profile fetch to avoid overwhelming the server
          } else {
            set({ user: null });
          }
        } catch (error) {
          console.error('Check auth error:', error);
          // Don't set user to null if there's an error, as it might be a temporary issue
          // Only set to null if we're sure the user is not authenticated
        } finally {
          set({ isLoading: false });
        }
      },

      updateProfile: async (userData: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({ isLoading: true });
        try {
          // If name is updated, update avatar as well (if no custom avatar)
          if (userData.name && !userData.avatar && !currentUser.avatar?.includes('http')) {
            userData.avatar = getDefaultAvatar(userData.name);
          }

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

          // Log the fields that are being updated
          console.log('Updating profile with these fields:', {
            website: completeProfileData.website,
            gender: completeProfileData.gender,
            birth_date: completeProfileData.birth_date,
            profession: completeProfileData.profession
          });

          // First, update the auth metadata directly to ensure it's saved
          // Make sure to explicitly include all fields, especially the problematic ones
          const authUpdateResult = await updateUserProfile({
            name: completeProfileData.name,
            avatar: completeProfileData.avatar,
            country_code: completeProfileData.country_code,
            phone: completeProfileData.phone,
            bio: completeProfileData.bio,
            language: completeProfileData.language,
            // Explicitly include these fields that were having issues
            website: completeProfileData.website,
            gender: completeProfileData.gender,
            birth_date: completeProfileData.birth_date,
            profession: completeProfileData.profession,
            updated_at: completeProfileData.updated_at
          });

          console.log('Auth metadata update result:', authUpdateResult);

          // Then try to update the profiles table (this might fail if the table doesn't exist)
          try {
            await updateSupabaseProfile(currentUser.id, completeProfileData);
          } catch (profileError) {
            console.warn('Could not update profile table, but auth metadata was updated:', profileError);
            // Continue anyway since we updated the auth metadata
          }

          // Log the updated data for debugging
          console.log('Profile updated successfully:', completeProfileData);

          // Update local state with the new data
          const updatedUser = {
            ...currentUser,
            ...completeProfileData,
            updated_at: new Date().toISOString()
          };

          set({ user: updatedUser });
          return updatedUser;
        } catch (error) {
          console.error('Update profile error:', error);
          throw error;
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

          // Log the fields that are being updated
          console.log('Updating profile image with these fields preserved:', {
            website: completeProfileData.website,
            gender: completeProfileData.gender,
            birth_date: completeProfileData.birth_date,
            profession: completeProfileData.profession
          });

          // First, update the auth metadata directly to ensure it's saved
          const authUpdateResult = await updateUserProfile({
            avatar: imageUrl,
            name: currentUser.name,
            country_code: currentUser.country_code,
            phone: currentUser.phone,
            bio: currentUser.bio,
            language: currentUser.language,
            // Explicitly include these fields that were having issues
            website: currentUser.website,
            gender: currentUser.gender,
            birth_date: currentUser.birth_date,
            profession: currentUser.profession,
            updated_at: new Date().toISOString()
          });

          console.log('Auth metadata update result for image upload:', authUpdateResult);

          // Then try to update the profiles table (this might fail if the table doesn't exist)
          try {
            await updateSupabaseProfile(currentUser.id, completeProfileData);
          } catch (profileError) {
            console.warn('Could not update profile table, but auth metadata was updated:', profileError);
            // Continue anyway since we updated the auth metadata
          }

          // Update local state with all fields preserved
          set({
            user: {
              ...currentUser,
              avatar: imageUrl,
              updated_at: new Date().toISOString()
            }
          });

          return imageUrl;
        } catch (error) {
          console.error('Upload profile image error:', error);

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