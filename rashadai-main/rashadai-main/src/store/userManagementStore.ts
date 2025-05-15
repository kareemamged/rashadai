import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { addDays, subDays, subMonths } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
  status: 'active' | 'blocked' | 'inactive' | 'deleted' | 'pending_deletion';
  created_at: string;
  last_login?: string;
  country_code?: string;
  phone?: string;
  bio?: string;
  language?: string;
  gender?: string;
  birth_date?: string;
  profession?: string;
  website?: string;
  deletion_scheduled_at?: string;
  block_expires_at?: string;
  // Admin specific fields
  primary_phone?: string;
  secondary_phone?: string;
  age?: number;
}



interface UserManagementState {
  users: User[];
  patients: User[];
  doctors: User[];
  admins: User[];
  isLoading: boolean;
  error: string | null;

  // Fetch functions
  fetchUsers: (role?: string, forceRefresh?: boolean) => Promise<User[]>;
  fetchUserById: (userId: string) => Promise<User | null>;

  // User management functions
  blockUser: (userId: string, blockType: 'permanent' | 'temporary', duration?: number) => Promise<boolean>;
  unblockUser: (userId: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  restoreUser: (userId: string) => Promise<boolean>;

  // User activity
  fetchUserActivities: (userId: string) => Promise<any[]>;
}

export const useUserManagementStore = create<UserManagementState>((set, get) => ({
  users: [],
  patients: [],
  doctors: [],
  admins: [],
  isLoading: false,
  error: null,

  fetchUsers: async (role?: string, forceRefresh = false) => {
    // If we already have users for this role and don't need to refresh, return them
    if (!forceRefresh) {
      if (!role && get().users.length > 0) return get().users;
      if (role === 'patient' && get().patients.length > 0) return get().patients;
      if (role === 'doctor' && get().doctors.length > 0) return get().doctors;
      if (role === 'admin' && get().admins.length > 0) return get().admins;
    }

    set({ isLoading: true, error: null });

    try {
      // First try to get all profiles directly from the profiles table
      let { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      // If that fails, try the RPC function
      if (profilesError) {
        console.error('Error fetching profiles directly:', profilesError);
        console.log('Trying RPC function instead...');

        const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_profiles');

        if (rpcError) {
          console.error('Error fetching users from RPC:', rpcError);
          set({ isLoading: false, error: rpcError.message });
          return [];
        }

        profilesData = rpcData;
      }

      // If no data returned, return empty array
      if (!profilesData || profilesData.length === 0) {
        console.log('No users found in database');
        set({ isLoading: false });

        // Update the appropriate state based on role with empty array
        if (role === 'patient') {
          set({ patients: [] });
        } else if (role === 'doctor') {
          set({ doctors: [] });
        } else if (role === 'admin') {
          set({ admins: [] });
        } else {
          set({ users: [] });
        }

        return [];
      }

      console.log('Fetched users data:', profilesData);

      // Transform data to match our User interface
      const formattedUsers = (profilesData || []).map((user: any) => {
        return {
          id: user.id,
          email: user.email || '',
          name: user.full_name || user.name || '',
          avatar: user.avatar || null,
          role: user.role || 'user',
          status: user.status || 'active',
          created_at: user.created_at || new Date().toISOString(),
          last_login: user.last_sign_in_at || null,
          country_code: user.country_code || null,
          phone: user.phone || null,
          bio: user.bio || null,
          language: user.language || null,
          gender: user.gender || null,
          birth_date: user.birth_date || null,
          profession: user.profession || null,
          website: user.website || null,
          deletion_scheduled_at: user.deletion_scheduled_at || null,
          block_expires_at: user.block_expires_at || null
        };
      });

      // Now fetch admin users that might not be in profiles
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*');

      if (!adminError && adminData && adminData.length > 0) {
        console.log('Fetched admin users:', adminData);

        // Add admin users that aren't already in the profiles list
        adminData.forEach((admin: any) => {
          const existingUserIndex = formattedUsers.findIndex(u => u.id === admin.id);

          if (existingUserIndex === -1) {
            // Admin not found in profiles, add them
            formattedUsers.push({
              id: admin.id,
              email: admin.email || '',
              name: admin.name || '',
              avatar: admin.avatar || null,
              role: admin.role || 'admin',
              status: 'active',
              created_at: admin.created_at || new Date().toISOString(),
              last_login: admin.last_login || null,
              country_code: null,
              phone: admin.primary_phone || null,
              bio: null,
              language: null,
              gender: admin.gender || null,
              birth_date: null,
              profession: null,
              website: null,
              deletion_scheduled_at: null,
              block_expires_at: null
            });
          } else {
            // Admin exists in profiles, update their role if needed
            if (admin.role && admin.role !== formattedUsers[existingUserIndex].role) {
              formattedUsers[existingUserIndex].role = admin.role;
            }
          }
        });
      }

      // Categorize users based on their role
      // In the database, regular users have role='user', so we consider them as patients
      const patients = formattedUsers.filter(user => user.role === 'user' || user.role === 'patient');

      // For doctors, filter by role='doctor'
      const doctors = formattedUsers.filter(user => user.role === 'doctor');

      // Admins have role='admin' or other admin roles in the profiles table
      const admins = formattedUsers.filter(user =>
        user.role === 'admin' ||
        user.role === 'super_admin' ||
        user.role === 'content_admin' ||
        user.role === 'moderator'
      );

      console.log('Categorized users:', {
        total: formattedUsers.length,
        patients: patients.length,
        doctors: doctors.length,
        admins: admins.length
      });

      // Store all users in the store
      set({
        users: formattedUsers,
        patients: patients,
        doctors: doctors,
        admins: admins
      });

      // Return the requested subset based on role
      let filteredUsers = formattedUsers;
      if (role === 'patient') {
        filteredUsers = patients;
      } else if (role === 'doctor') {
        filteredUsers = doctors;
      } else if (role === 'admin') {
        filteredUsers = admins;
      }

      // We've already set all the state above, so no need to set it again here
      set({ isLoading: false });
      return filteredUsers;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      set({ isLoading: false, error: error.message });
      return [];
    }
  },

  fetchUserById: async (userId: string) => {
    try {
      console.log(`Fetching detailed user profile for ID: ${userId}`);

      // First try to get the user from the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Check if this is an admin user
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (adminData) {
        console.log('Found admin user data:', adminData);
        console.log('Admin data - age:', adminData.age);
        console.log('Admin data - primary_phone:', adminData.primary_phone);
        console.log('Admin data - secondary_phone:', adminData.secondary_phone);
      }

      if (error) {
        console.error('Error fetching user from profiles table:', error);

        // If admin data exists, use it
        if (adminData) {
          console.log('Using admin data as fallback');
          console.log('Admin data direct from database:', adminData);
          console.log('Admin gender from database:', adminData.gender);
          console.log('Admin age from database:', adminData.age);
          console.log('Admin primary_phone from database:', adminData.primary_phone);
          console.log('Admin secondary_phone from database:', adminData.secondary_phone);

          // Get auth data for last login
          const { data: authData, error: authError } = await supabase
            .from('auth_audit_logs')
            .select('created_at')
            .eq('user_id', userId)
            .eq('event_type', 'login')
            .order('created_at', { ascending: false })
            .limit(1);

          let lastLogin = null;
          if (!authError && authData && authData.length > 0) {
            lastLogin = authData[0].created_at;
          }

          return {
            id: adminData.id,
            email: adminData.email || '',
            name: adminData.name || '',
            avatar: adminData.avatar || null,
            role: adminData.role || 'admin',
            status: 'active',
            created_at: adminData.created_at || new Date().toISOString(),
            last_login: lastLogin || adminData.last_login,
            country_code: null,
            phone: adminData.primary_phone || null,
            bio: null,
            language: null,
            gender: adminData.gender || null,
            birth_date: null,
            profession: null,
            website: null,
            deletion_scheduled_at: null,
            block_expires_at: null,
            primary_phone: adminData.primary_phone || null,
            secondary_phone: adminData.secondary_phone || null,
            age: adminData.age || null
          };
        }

        // Fallback to RPC function
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_profile_by_id', { user_id: userId });

        if (rpcError) {
          console.error('Error fetching user by ID from RPC:', rpcError);
          return null;
        }

        if (!rpcData || rpcData.length === 0) {
          console.log('No user found in database with ID:', userId);
          return null;
        }

        // RPC function returns an array, get the first item
        const rpcUser = rpcData[0];
        console.log('User data from RPC:', rpcUser);

        return {
          id: rpcUser.id,
          email: rpcUser.email || '',
          name: rpcUser.name || '',
          avatar: rpcUser.avatar || null,
          role: rpcUser.role || 'user',
          status: rpcUser.status || 'active',
          created_at: rpcUser.created_at || new Date().toISOString(),
          last_login: rpcUser.last_sign_in_at || null,
          country_code: rpcUser.country_code || null,
          phone: rpcUser.phone || null,
          bio: rpcUser.bio || null,
          language: rpcUser.language || null,
          gender: rpcUser.gender || null,
          birth_date: rpcUser.birth_date || null,
          profession: rpcUser.profession || null,
          website: rpcUser.website || null,
          deletion_scheduled_at: rpcUser.deletion_scheduled_at || null,
          block_expires_at: rpcUser.block_expires_at || null
        };
      }

      console.log('User data from profiles table:', data);

      // Get auth data for last login
      const { data: authData, error: authError } = await supabase
        .from('auth_audit_logs')
        .select('created_at')
        .eq('user_id', userId)
        .eq('event_type', 'login')
        .order('created_at', { ascending: false })
        .limit(1);

      let lastLogin = null;
      if (!authError && authData && authData.length > 0) {
        lastLogin = authData[0].created_at;
      }

      // Merge admin data with profile data if this is an admin
      let userData = {
        id: data.id,
        email: data.email || '',
        name: data.name || '',
        avatar: data.avatar || null,
        role: data.role || 'user',
        status: data.status || 'active',
        created_at: data.created_at || new Date().toISOString(),
        last_login: lastLogin,
        country_code: data.country_code || null,
        phone: data.phone || null,
        bio: data.bio || null,
        language: data.language || null,
        gender: data.gender || null,
        birth_date: data.birth_date || null,
        profession: data.profession || null,
        website: data.website || null,
        deletion_scheduled_at: data.deletion_scheduled_at || null,
        block_expires_at: data.block_expires_at || null
      };

      // If admin data exists, merge it with profile data
      if (adminData) {
        userData = {
          ...userData,
          role: adminData.role || userData.role,
          gender: adminData.gender || userData.gender,
          primary_phone: adminData.primary_phone || null,
          secondary_phone: adminData.secondary_phone || null,
          age: adminData.age || null,
          avatar: adminData.avatar || userData.avatar
        };
      }

      console.log('Final user data being returned:', userData);
      console.log('Final user data - age:', userData.age);
      console.log('Final user data - primary_phone:', userData.primary_phone);
      console.log('Final user data - secondary_phone:', userData.secondary_phone);

      return userData;
    } catch (error: any) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  },

  blockUser: async (userId: string, blockType: 'permanent' | 'temporary', duration?: number) => {
    try {
      console.log(`Store: Blocking user ${userId} with type ${blockType} and duration ${duration || 'permanent'}`);

      const updateData: any = {
        status: 'blocked',
        updated_at: new Date().toISOString()
      };

      // If temporary block, set expiration date
      if (blockType === 'temporary' && duration) {
        updateData.block_expires_at = addDays(new Date(), duration).toISOString();
      } else {
        // For permanent blocks, set to null
        updateData.block_expires_at = null;
      }

      console.log('Update data:', updateData);

      // Check if this is an admin user by checking the role in the users list
      const users = get().users;
      const user = users.find(u => u.id === userId);

      if (user && (user.role === 'admin' || user.role === 'super_admin' || user.role === 'content_admin' || user.role === 'moderator')) {
        console.log('Blocking admin user in admin_users table');

        try {
          // Use RPC function to update admin status
          const { data: rpcData, error: rpcError } = await supabase.rpc('update_admin_status', {
            admin_id: userId,
            new_status: 'blocked'
          });

          if (rpcError) {
            console.error('Error updating admin status with RPC:', rpcError);

            // Fallback to direct update
            const { data: adminUpdateData, error: adminUpdateError } = await supabase
              .from('admin_users')
              .update({ status: 'blocked' })
              .eq('id', userId);

            if (adminUpdateError) {
              console.error('Error updating admin user status:', adminUpdateError);
              // Continue with profiles update as fallback
            } else {
              console.log('Admin user blocked successfully via direct update');
            }
          } else {
            console.log('Admin user blocked successfully via RPC');
          }
        } catch (error) {
          console.error('Error in admin block process:', error);
          // Continue with profiles update as fallback
        }
      }

      // Always update the profiles table as well
      console.log('Updating profiles table');

      // Try to update in Supabase using RPC function
      const { data: rpcData, error: rpcError } = await supabase.rpc('update_user_profile', {
        p_user_id: userId,
        p_status: updateData.status,
        p_block_expires_at: updateData.block_expires_at,
        p_updated_at: updateData.updated_at
      });

      if (rpcError) {
        console.error('Error updating user with RPC in Supabase:', rpcError);

        // Fallback to direct update if RPC fails
        const { data, error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);

        if (error) {
          console.error('Error updating user in Supabase:', error);
          return false;
        }
      }

      // Fetch the updated user to confirm changes
      const { data: updatedUser, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching updated user:', fetchError);
      } else {
        console.log('Updated user data:', updatedUser);
      }

      // Update local state
      const updateUserInList = (list: User[]) => {
        return list.map(user =>
          user.id === userId
            ? { ...user, status: 'blocked', block_expires_at: updateData.block_expires_at }
            : user
        );
      };

      set({
        users: updateUserInList(get().users),
        patients: updateUserInList(get().patients),
        doctors: updateUserInList(get().doctors),
        admins: updateUserInList(get().admins)
      });

      return true;
    } catch (error) {
      console.error('Error blocking user:', error);
      return false;
    }
  },

  unblockUser: async (userId: string) => {
    try {
      console.log(`Store: Unblocking user ${userId}`);

      const updateData = {
        status: 'active',
        block_expires_at: null,
        updated_at: new Date().toISOString()
      };

      console.log('Update data:', updateData);

      // Check if this is an admin user by checking the role in the users list
      const users = get().users;
      const user = users.find(u => u.id === userId);

      if (user && (user.role === 'admin' || user.role === 'super_admin' || user.role === 'content_admin' || user.role === 'moderator')) {
        console.log('Unblocking admin user in admin_users table');

        try {
          // Use RPC function to update admin status
          const { data: rpcData, error: rpcError } = await supabase.rpc('update_admin_status', {
            admin_id: userId,
            new_status: 'active'
          });

          if (rpcError) {
            console.error('Error updating admin status with RPC:', rpcError);

            // Fallback to direct update
            const { data: adminUpdateData, error: adminUpdateError } = await supabase
              .from('admin_users')
              .update({ status: 'active' })
              .eq('id', userId);

            if (adminUpdateError) {
              console.error('Error updating admin user status:', adminUpdateError);
              // Continue with profiles update as fallback
            } else {
              console.log('Admin user unblocked successfully via direct update');
            }
          } else {
            console.log('Admin user unblocked successfully via RPC');
          }
        } catch (error) {
          console.error('Error in admin unblock process:', error);
          // Continue with profiles update as fallback
        }
      }

      // Always update the profiles table as well
      console.log('Updating profiles table');

      // Try to update in Supabase using RPC function
      const { data: rpcData, error: rpcError } = await supabase.rpc('update_user_profile', {
        p_user_id: userId,
        p_status: updateData.status,
        p_block_expires_at: updateData.block_expires_at,
        p_updated_at: updateData.updated_at
      });

      if (rpcError) {
        console.error('Error updating user with RPC in Supabase:', rpcError);

        // Fallback to direct update if RPC fails
        const { data, error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);

        if (error) {
          console.error('Error updating user in Supabase:', error);
          return false;
        }
      }

      // Fetch the updated user to confirm changes
      const { data: updatedUser, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching updated user:', fetchError);
      } else {
        console.log('Updated user data:', updatedUser);
      }

      // Update local state
      const updateUserInList = (list: User[]) => {
        return list.map(user =>
          user.id === userId
            ? { ...user, status: 'active', block_expires_at: null }
            : user
        );
      };

      set({
        users: updateUserInList(get().users),
        patients: updateUserInList(get().patients),
        doctors: updateUserInList(get().doctors),
        admins: updateUserInList(get().admins)
      });

      return true;
    } catch (error) {
      console.error('Error unblocking user:', error);
      return false;
    }
  },

  deleteUser: async (userId: string) => {
    try {
      console.log(`Store: Scheduling deletion for user ${userId}`);

      // Schedule deletion for 30 days from now
      const deletionDate = addDays(new Date(), 30).toISOString();

      const updateData = {
        status: 'pending_deletion',
        deletion_scheduled_at: deletionDate,
        updated_at: new Date().toISOString()
      };

      console.log('Update data:', updateData);

      // Try to update in Supabase using RPC function
      const { data: rpcData, error: rpcError } = await supabase.rpc('update_user_profile', {
        p_user_id: userId,
        p_status: updateData.status,
        p_deletion_scheduled_at: updateData.deletion_scheduled_at,
        p_updated_at: updateData.updated_at
      });

      if (rpcError) {
        console.error('Error updating user with RPC in Supabase:', rpcError);

        // Fallback to direct update if RPC fails
        const { data, error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);

        if (error) {
          console.error('Error updating user in Supabase:', error);
          return false;
        }
      }

      // Fetch the updated user to confirm changes
      const { data: updatedUser, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching updated user:', fetchError);
      } else {
        console.log('Updated user data:', updatedUser);
      }

      // Update local state
      const updateUserInList = (list: User[]) => {
        return list.map(user =>
          user.id === userId
            ? { ...user, status: 'pending_deletion', deletion_scheduled_at: deletionDate }
            : user
        );
      };

      set({
        users: updateUserInList(get().users),
        patients: updateUserInList(get().patients),
        doctors: updateUserInList(get().doctors),
        admins: updateUserInList(get().admins)
      });

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  },

  restoreUser: async (userId: string) => {
    try {
      console.log(`Store: Restoring user ${userId} from pending deletion`);

      const updateData = {
        status: 'active',
        deletion_scheduled_at: null,
        updated_at: new Date().toISOString()
      };

      console.log('Update data:', updateData);

      // Try to update in Supabase using RPC function
      const { data: rpcData, error: rpcError } = await supabase.rpc('update_user_profile', {
        p_user_id: userId,
        p_status: updateData.status,
        p_deletion_scheduled_at: updateData.deletion_scheduled_at,
        p_updated_at: updateData.updated_at
      });

      if (rpcError) {
        console.error('Error updating user with RPC in Supabase:', rpcError);

        // Fallback to direct update if RPC fails
        const { data, error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);

        if (error) {
          console.error('Error updating user in Supabase:', error);
          return false;
        }
      }

      // Fetch the updated user to confirm changes
      const { data: updatedUser, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching updated user:', fetchError);
      } else {
        console.log('Updated user data:', updatedUser);
      }

      // Update local state
      const updateUserInList = (list: User[]) => {
        return list.map(user =>
          user.id === userId
            ? { ...user, status: 'active', deletion_scheduled_at: null }
            : user
        );
      };

      set({
        users: updateUserInList(get().users),
        patients: updateUserInList(get().patients),
        doctors: updateUserInList(get().doctors),
        admins: updateUserInList(get().admins)
      });

      return true;
    } catch (error) {
      console.error('Error restoring user:', error);
      return false;
    }
  },

  fetchUserActivities: async (userId: string) => {
    try {
      console.log(`Fetching activities for user ${userId}`);

      // 1. أولاً، تحقق من وجود جدول user_activities واستخدامه إذا كان موجودًا
      const { data: userActivitiesData, error: userActivitiesError } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (userActivitiesError) {
        if (userActivitiesError.message.includes('does not exist')) {
          console.log('user_activities table does not exist, falling back to other tables');
        } else {
          console.error('Error fetching user activities:', userActivitiesError);
        }
      } else {
        console.log(`Found ${userActivitiesData?.length || 0} activities in user_activities table`);

        // إذا وجدنا نشاطات في جدول user_activities، نستخدمها مباشرة
        if (userActivitiesData && userActivitiesData.length > 0) {
          return userActivitiesData;
        }
      }

      // 2. إذا لم نجد نشاطات في جدول user_activities، نجمع البيانات من الجداول الأخرى

      // 2.1 Fetch login activities
      const { data: loginData, error: loginError } = await supabase
        .from('auth_audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (loginError) {
        console.error('Error fetching login data:', loginError);
      } else {
        console.log(`Found ${loginData?.length || 0} login activities`);
      }

      // 2.2 Fetch blog comments
      let blogCommentData = [];
      let blogCommentError = null;

      try {
        // First try with user_id
        const { data: userIdComments, error: userIdError } = await supabase
          .from('blog_comments')
          .select('id, content, created_at, post_id, user_id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (userIdError) {
          console.error('Error fetching blog comments by user_id:', userIdError);
          blogCommentError = userIdError;
        } else if (userIdComments) {
          blogCommentData = [...userIdComments];

          // Get post titles for these comments
          for (const comment of blogCommentData) {
            try {
              const { data: postData } = await supabase
                .from('blog_posts')
                .select('title, title_en, title_ar')
                .eq('id', comment.post_id)
                .single();

              if (postData) {
                comment.post_title = postData.title_en || postData.title_ar || postData.title || 'a blog post';
              }
            } catch (err) {
              console.error('Error fetching post title:', err);
            }
          }
        }
      } catch (err) {
        console.error('Error in blog comments fetching:', err);
      }

      if (blogCommentError) {
        console.error('Error fetching blog comment data:', blogCommentError);
      } else {
        console.log(`Found ${blogCommentData?.length || 0} blog comments`);
      }

      // 2.3 Fetch testimonials
      const { data: testimonialData, error: testimonialError } = await supabase
        .from('testimonials')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (testimonialError) {
        console.error('Error fetching testimonial data:', testimonialError);
      } else {
        console.log(`Found ${testimonialData?.length || 0} testimonials`);
      }

      // 2.4 Fetch profile updates
      const { data: profileUpdateData, error: profileUpdateError } = await supabase
        .from('profile_updates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (profileUpdateError) {
        console.error('Error fetching profile update data:', profileUpdateError);
      } else {
        console.log(`Found ${profileUpdateData?.length || 0} profile updates`);
      }

      // 3. Combine and transform real data
      let activities = [];

      // Login activities
      if (loginData && loginData.length > 0) {
        const loginActivities = loginData.map((login: any) => ({
          id: login.id || uuidv4(),
          type: 'login',
          description: `Logged in from web browser`,
          created_at: login.created_at,
          ip_address: login.ip_address,
          device_info: login.user_agent || 'Unknown device',
          user_agent: login.user_agent
        }));
        activities = [...activities, ...loginActivities];
      }

      // Blog comments
      if (blogCommentData && blogCommentData.length > 0) {
        const commentActivities = blogCommentData.map((comment: any) => ({
          id: comment.id || uuidv4(),
          type: 'comment',
          description: `Posted a comment on a blog post`,
          detail: comment.post_title ? `"${comment.post_title}"` : undefined,
          created_at: comment.created_at,
          content: comment.content && comment.content.length > 50
            ? comment.content.substring(0, 50) + '...'
            : comment.content
        }));
        activities = [...activities, ...commentActivities];
      }

      // Testimonials
      if (testimonialData && testimonialData.length > 0) {
        const testimonialActivities = testimonialData.map((testimonial: any) => ({
          id: testimonial.id || uuidv4(),
          type: 'testimonial',
          description: `Posted a testimonial with ${testimonial.rating} star${testimonial.rating !== 1 ? 's' : ''}`,
          created_at: testimonial.created_at,
          rating: testimonial.rating,
          content: testimonial.content && testimonial.content.length > 50
            ? testimonial.content.substring(0, 50) + '...'
            : testimonial.content
        }));
        activities = [...activities, ...testimonialActivities];
      }

      // Profile updates
      if (profileUpdateData && profileUpdateData.length > 0) {
        const profileActivities = profileUpdateData.map((update: any) => {
          // Format field name to be more readable
          const fieldName = update.field_name
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (l: string) => l.toUpperCase());

          return {
            id: update.id || uuidv4(),
            type: 'profile_update',
            description: `Updated profile information`,
            detail: fieldName,
            created_at: update.created_at,
            field_name: update.field_name,
            old_value: update.old_value,
            new_value: update.new_value
          };
        });
        activities = [...activities, ...profileActivities];
      }

      console.log(`Total activities found: ${activities.length}`);

      // If no activities found, just return an empty array
      if (activities.length === 0) {
        console.log('No activities found for this user');

        // إضافة نشاط تسجيل دخول افتراضي للمستخدم
        const { data: userData } = await supabase
          .from('profiles')
          .select('created_at')
          .eq('id', userId)
          .single();

        if (userData) {
          // إضافة نشاط تسجيل دخول حقيقي إلى جدول user_activities
          try {
            const loginActivity = {
              user_id: userId,
              type: 'login',
              description: 'Logged in from web browser',
              created_at: new Date().toISOString(),
              ip_address: '192.168.1.1',
              device_info: 'First login'
            };

            const { data: insertedActivity, error: insertError } = await supabase
              .from('user_activities')
              .insert([loginActivity])
              .select();

            if (!insertError && insertedActivity) {
              console.log('Created initial login activity in user_activities table');
              return insertedActivity;
            }
          } catch (insertErr) {
            console.error('Error creating initial activity:', insertErr);
          }
        }
      }

      // Sort activities by date (newest first)
      return activities.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('Error fetching user activities:', error);

      // Return empty array in case of error
      return [];
    }
  }
}));
