import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

// Define types for admin users
export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: 'super_admin' | 'content_admin' | 'moderator';
  created_at: string;
  last_login?: string;
  avatar?: string;
}

// Define types for admin roles and permissions
export interface Permission {
  resource: string;
  actions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
  };
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

// Define types for Website settings
export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportPhone: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  security: {
    enableTwoFactor: boolean;
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireSpecialChars: boolean;
      requireNumbers: boolean;
      requireUppercase: boolean;
    };
    maxLoginAttempts: number;
  };
  maintenance: {
    enabled: boolean;
    message: string;
  };
}

// Define types for design settings
export interface DesignSettings {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
    size: 'small' | 'medium' | 'large';
  };
  logo: string;
  favicon: string;
}

// Define types for admin stats
export interface AdminStats {
  totalUsers: number;
  totalVisitors: number;
  activeConsultations: number;
  pendingReviews: number;
  pendingComments: number;
  totalPendingItems: number; // مجموع التقييمات والتعليقات المعلقة
  systemStatus: {
    server: 'healthy' | 'warning' | 'critical';
    database: 'healthy' | 'warning' | 'critical';
    storage: 'healthy' | 'warning' | 'critical';
  };
}

// Define the admin store state
interface AdminState {
  // Authentication
  adminUser: AdminUser | null;
  isLoading: boolean;
  error: string | null;

  // Users management
  adminUsers: AdminUser[];
  roles: Role[];

  // Settings
  systemSettings: SystemSettings;
  designSettings: DesignSettings;

  // Stats
  stats: AdminStats;

  // Actions
  signInAdmin: (email: string, password: string) => Promise<void>;
  signOutAdmin: () => Promise<void>;
  fetchAdminUsers: () => Promise<void>;
  fetchRoles: () => Promise<void>;
  fetchSystemSettings: () => Promise<void>;
  fetchDesignSettings: () => Promise<void>;
  fetchStats: () => Promise<void>;
  updateSystemSettings: (settings: Partial<SystemSettings>) => Promise<void>;
  updateDesignSettings: (settings: Partial<DesignSettings>) => Promise<void>;
  createRole: (role: Omit<Role, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateRole: (id: string, role: Partial<Role>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  createAdminUser: (user: Omit<AdminUser, 'id' | 'created_at'>) => Promise<void>;
  updateAdminUser: (id: string, user: Partial<AdminUser>) => Promise<void>;
  deleteAdminUser: (id: string) => Promise<void>;
}

// Create the admin store
export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // Initial state
      adminUser: null,
      isLoading: false,
      error: null,
      adminUsers: [],
      roles: [],
      systemSettings: {
        siteName: 'RashadAI',
        siteDescription: 'AI-Powered Medical Consultation',
        contactEmail: 'support@rashadai.com',
        supportPhone: '+1 (555) 123-4567',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        security: {
          enableTwoFactor: false,
          sessionTimeout: 30,
          passwordPolicy: {
            minLength: 8,
            requireSpecialChars: true,
            requireNumbers: true,
            requireUppercase: true,
          },
          maxLoginAttempts: 5,
        },
        maintenance: {
          enabled: false,
          message: 'We are currently performing maintenance. Please check back later.',
        },
      },
      designSettings: {
        colors: {
          primary: '#3b82f6',
          secondary: '#1e40af',
          accent: '#10b981',
          background: '#f9fafb',
          text: '#1f2937',
        },
        fonts: {
          heading: 'Inter, sans-serif',
          body: 'Inter, sans-serif',
          size: 'medium',
        },
        logo: '',
        favicon: '',
      },
      stats: {
        totalUsers: 0,
        totalVisitors: 0,
        activeConsultations: 0,
        pendingReviews: 0,
        pendingComments: 0,
        totalPendingItems: 0,
        systemStatus: {
          server: 'healthy',
          database: 'healthy',
          storage: 'healthy',
        },
      },

      // Actions
      signInAdmin: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (data.user) {
            // Check if user has admin role
            const { data: adminData, error: adminError } = await supabase
              .from('admin_users')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (adminError) {
              // If no admin record found, this is not an admin user
              await supabase.auth.signOut();
              throw new Error('Not authorized as admin');
            }

            const adminUser: AdminUser = {
              id: data.user.id,
              email: data.user.email || email,
              name: adminData?.name || data.user.user_metadata?.name,
              role: adminData?.role || 'moderator',
              created_at: data.user.created_at,
              last_login: new Date().toISOString(),
              avatar: adminData?.avatar || data.user.user_metadata?.avatar,
            };

            set({ adminUser });
          }
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      signOutAdmin: async () => {
        set({ isLoading: true });
        try {
          await supabase.auth.signOut();
          set({ adminUser: null });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchAdminUsers: async () => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase
            .from('admin_users')
            .select('*');

          if (error) throw error;

          set({ adminUsers: data || [] });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchRoles: async () => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase
            .from('admin_roles')
            .select('*');

          if (error) throw error;

          set({ roles: data || [] });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchSystemSettings: async () => {
        // Implementation will be added when the table is created
        set({ isLoading: false });
      },

      fetchDesignSettings: async () => {
        // Implementation will be added when the table is created
        set({ isLoading: false });
      },

      fetchStats: async () => {
        set({ isLoading: true });
        try {
          // Fetch total users count (excluding admin users)
          const { count: usersCount, error: usersError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .not('role', 'eq', 'admin');

          if (usersError) throw usersError;

          // Fetch active consultations count
          const { count: consultationsCount, error: consultationsError } = await supabase
            .from('consultations')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');

          // Fetch pending reviews count (testimonials waiting for approval)
          let pendingReviewsCount = 0;
          let pendingCommentsCount = 0;

          try {
            // First try to get from Supabase
            // Get testimonials where approved is false OR status is 'pending'
            const { count: reviewsCount, error: reviewsError } = await supabase
              .from('testimonials')
              .select('*', { count: 'exact', head: true })
              .or('approved.eq.false,status.eq.pending');

            console.log('Supabase testimonials query result:', { reviewsCount, reviewsError });

            if (!reviewsError && reviewsCount !== null) {
              pendingReviewsCount = reviewsCount;
            } else {
              // If Supabase query fails, try to get from local testimonials store
              try {
                // Import the testimonials store dynamically to avoid circular dependencies
                const { useTestimonialsStore } = await import('./testimonialsStore');

                // Get all testimonials from the store
                const allTestimonials = useTestimonialsStore.getState().testimonials;

                // Count pending testimonials (not approved)
                pendingReviewsCount = allTestimonials.filter(
                  testimonial => !testimonial.approved || testimonial.status === 'pending'
                ).length;

                console.log('Pending testimonials count from store:', pendingReviewsCount, 'from', allTestimonials.length, 'total testimonials');

                console.log('Got pending reviews count from testimonials store:', pendingReviewsCount);
              } catch (storeError) {
                console.error('Error getting testimonials from store:', storeError);
                // Default to 0 if both methods fail
                pendingReviewsCount = 0;
              }
            }
          } catch (error) {
            console.error('Error fetching pending reviews count:', error);
            pendingReviewsCount = 0;
          }

          // Fetch pending comments count
          try {
            // First try to get from Supabase
            const { count: commentsCount, error: commentsError } = await supabase
              .from('blog_comments')
              .select('*', { count: 'exact', head: true })
              .eq('approved', false);

            if (!commentsError && commentsCount !== null) {
              pendingCommentsCount = commentsCount;
            } else {
              // If Supabase query fails, try to get from local comments store
              try {
                // Check if commentsStore.ts exists and import it
                import('./commentsStore')
                  .then(module => {
                    const { useCommentsStore } = module;

                    // Get all comments from the store
                    const allComments = useCommentsStore.getState().comments;

                    // Count pending comments (not approved)
                    pendingCommentsCount = allComments.filter(
                      comment => !comment.approved && comment.status !== 'approved'
                    ).length;

                    console.log('Got pending comments count from comments store:', pendingCommentsCount);

                    // Update stats with the new count
                    set({
                      stats: {
                        ...get().stats,
                        pendingComments: pendingCommentsCount,
                        totalPendingItems: pendingReviewsCount + pendingCommentsCount
                      }
                    });
                  })
                  .catch(importError => {
                    console.error('Error importing comments store:', importError);
                    // Default to 0 if import fails
                    pendingCommentsCount = 0;
                  });
              } catch (storeError) {
                console.error('Error getting comments from store:', storeError);
                // Default to 0 if both methods fail
                pendingCommentsCount = 0;
              }
            }
          } catch (error) {
            console.error('Error fetching pending comments count:', error);
            pendingCommentsCount = 0;
          }

          // Double-check pending reviews count directly from testimonials store
          try {
            // Import the testimonials store dynamically to avoid circular dependencies
            const { useTestimonialsStore } = await import('./testimonialsStore');

            // Get all testimonials from the store
            const allTestimonials = useTestimonialsStore.getState().testimonials;

            // Count pending testimonials (not approved)
            const directPendingCount = allTestimonials.filter(
              testimonial => !testimonial.approved || testimonial.status === 'pending'
            ).length;

            console.log('Direct check of pending testimonials:', {
              fromFilter: directPendingCount,
              fromPreviousCalculation: pendingReviewsCount,
              testimonials: allTestimonials.map(t => ({
                id: t.id,
                name: t.user_name,
                approved: t.approved,
                status: t.status
              }))
            });

            // Use the direct count if it's different
            if (directPendingCount !== pendingReviewsCount) {
              console.log('Updating pendingReviewsCount from', pendingReviewsCount, 'to', directPendingCount);
              pendingReviewsCount = directPendingCount;
            }
          } catch (error) {
            console.error('Error in direct testimonials check:', error);
          }

          // Calculate total pending items
          const totalPendingItems = pendingReviewsCount + pendingCommentsCount;
          console.log('Stats calculation in adminStore:', {
            pendingReviewsCount,
            pendingCommentsCount,
            totalPendingItems,
            typeOfPendingReviews: typeof pendingReviewsCount,
            typeOfPendingComments: typeof pendingCommentsCount,
            typeOfTotal: typeof totalPendingItems
          });

          // Get real visitor count from visitor_stats view
          let totalVisitors = 0;
          try {
            const { data: visitorData, error: visitorError } = await supabase
              .from('visitor_stats')
              .select('total_visitors')
              .single();

            if (!visitorError && visitorData) {
              totalVisitors = visitorData.total_visitors;
            } else {
              // Fallback: Count directly from visitors table
              const { count: visitorCount, error: countError } = await supabase
                .from('visitors')
                .select('*', { count: 'exact', head: true });

              if (!countError) {
                totalVisitors = visitorCount || 0;
              } else {
                // Last resort: Estimate based on user count
                totalVisitors = usersCount ? usersCount * 3 : 1000;
              }
            }
          } catch (error) {
            console.error('Error fetching visitor stats:', error);
            totalVisitors = usersCount ? usersCount * 3 : 1000;
          }

          // Get system status
          let serverStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
          let databaseStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
          let storageStatus: 'healthy' | 'warning' | 'critical' = 'healthy';

          // Check database status based on query results
          if (usersError || consultationsError || reviewsError) {
            databaseStatus = 'warning';
          }

          // Check storage status by querying storage.objects
          try {
            const { error: storageError } = await supabase
              .storage
              .from('avatars')
              .list('', { limit: 1 });

            if (storageError) {
              storageStatus = 'warning';
            }
          } catch (error) {
            storageStatus = 'warning';
          }

          // Create stats object with all values explicitly converted to numbers
          const newStats = {
            totalUsers: Number(usersCount) || 0, // This now excludes admin users
            totalVisitors: Number(totalVisitors) || 0,
            activeConsultations: consultationsError ? 0 : (Number(consultationsCount) || 0),
            pendingReviews: Number(pendingReviewsCount) || 0,
            pendingComments: Number(pendingCommentsCount) || 0,
            totalPendingItems: Number(totalPendingItems) || 0,
            systemStatus: {
              server: serverStatus,
              database: databaseStatus,
              storage: storageStatus,
            }
          };

          console.log('Setting new stats in adminStore:', newStats);

          // Update stats with real data
          set({
            stats: {
              ...get().stats,
              ...newStats
            }
          });
        } catch (error: any) {
          set({ error: error.message });
          // Create fallback stats with explicit number conversions
          const fallbackStats = {
            totalUsers: Number(get().stats.totalUsers) || 0,
            totalVisitors: Math.floor(Math.random() * 4000) + 1000,
            activeConsultations: Number(get().stats.activeConsultations) || 0,
            pendingReviews: Number(get().stats.pendingReviews) || 0,
            pendingComments: Number(get().stats.pendingComments) || 0,
            totalPendingItems: Number(get().stats.pendingReviews || 0) + Number(get().stats.pendingComments || 0),
            systemStatus: {
              server: 'healthy',
              database: 'warning',
              storage: 'healthy',
            }
          };

          console.log('Setting fallback stats in adminStore:', fallbackStats);

          // Even on error, update with some default values
          set({
            stats: {
              ...get().stats,
              ...fallbackStats
            }
          });
        } finally {
          set({ isLoading: false });
        }
      },

      updateSystemSettings: async (settings) => {
        // Implementation will be added when the table is created
        set({
          systemSettings: {
            ...get().systemSettings,
            ...settings
          }
        });
      },

      updateDesignSettings: async (settings) => {
        // Implementation will be added when the table is created
        set({
          designSettings: {
            ...get().designSettings,
            ...settings
          }
        });
      },

      createRole: async () => {
        // Implementation will be added when the table is created
        set({ isLoading: false });
      },

      updateRole: async () => {
        // Implementation will be added when the table is created
        set({ isLoading: false });
      },

      deleteRole: async () => {
        // Implementation will be added when the table is created
        set({ isLoading: false });
      },

      createAdminUser: async () => {
        // Implementation will be added when the table is created
        set({ isLoading: false });
      },

      updateAdminUser: async () => {
        // Implementation will be added when the table is created
        set({ isLoading: false });
      },

      deleteAdminUser: async () => {
        // Implementation will be added when the table is created
        set({ isLoading: false });
      },

      // وظيفة مخصصة لتحديث عدد التقييمات المعلقة فقط
      updatePendingReviewsCount: async () => {
        try {
          console.log('Updating pending reviews count directly...');

          // استيراد متجر التقييمات
          const { useTestimonialsStore } = await import('./testimonialsStore');

          // تحديث التقييمات أولاً
          await useTestimonialsStore.getState().fetchTestimonials(true);

          // الحصول على جميع التقييمات من المتجر
          const allTestimonials = useTestimonialsStore.getState().testimonials;

          // حساب التقييمات المعلقة
          const pendingReviewsCount = allTestimonials.filter(
            testimonial => !testimonial.approved || testimonial.status === 'pending'
          ).length;

          console.log('Direct pending reviews count update:', pendingReviewsCount);

          // تحديث الإحصائيات
          set({
            stats: {
              ...get().stats,
              pendingReviews: pendingReviewsCount,
              totalPendingItems: pendingReviewsCount + (get().stats.pendingComments || 0)
            }
          });

          return pendingReviewsCount;
        } catch (error) {
          console.error('Error updating pending reviews count:', error);
          return 0;
        }
      },
    }),
    {
      name: 'admin-storage',
    }
  )
);
