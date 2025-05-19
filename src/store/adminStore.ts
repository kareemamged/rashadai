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

// Define types for website settings
export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportPhone: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterCard: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
    googleVerification: string;
    bingVerification: string;
    analyticsId: string;
  };
  socialMedia: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    address: string;
    supportHours: string;
  };
  emailSettings: {
    smtp: {
      host: string;
      port: string;
      encryption: string;
      username: string;
      password: string;
    };
    contactForm: {
      fromEmail: string;
      toEmail: string;
      subjectPrefix: string;
      replyTo?: string;
      maxRequestsPerDay?: number;
    };
    reportIssue: {
      fromEmail: string;
      toEmail: string;
      subjectPrefix: string;
      replyTo?: string;
      maxRequestsPerDay?: number;
    };
    confirmationEmail: {
      fromEmail: string;
      subjectPrefix: string;
      replyTo?: string;
      maxRequestsPerDay?: number;
      tokenExpiryHours?: number;
      useEmailJS?: boolean;
      cooldownMinutes?: number;
    };
    resetPassword: {
      fromEmail: string;
      subjectPrefix: string;
      replyTo?: string;
      maxRequestsPerDay?: number;
      tokenExpiryHours?: number;
      useEmailJS?: boolean;
    };
  };
  security: {
    enableTwoFactor: boolean;
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
  siteName: string;
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
        seo: {
          metaTitle: 'RashadAI - AI-Powered Medical Consultation',
          metaDescription: 'Get instant medical guidance from our advanced AI system trained on millions of medical records. Available 24/7, secure, and affordable.',
          metaKeywords: 'AI healthcare, medical consultation, online doctor, symptom checker, health AI, medical advice',
          ogTitle: 'RashadAI - AI-Powered Medical Consultation',
          ogDescription: 'Get instant medical guidance from our advanced AI system trained on millions of medical records.',
          ogImage: '',
          twitterCard: 'summary_large_image',
          twitterTitle: 'RashadAI - AI-Powered Medical Consultation',
          twitterDescription: 'Get instant medical guidance from our advanced AI system.',
          twitterImage: '',
          googleVerification: '',
          bingVerification: '',
          analyticsId: '',
        },
        socialMedia: {
          facebook: 'https://facebook.com/rashadai',
          twitter: 'https://twitter.com/rashadai',
          instagram: 'https://instagram.com/rashadai',
          linkedin: 'https://linkedin.com/company/rashadai',
          youtube: '',
        },
        contactInfo: {
          email: 'support@rashadai.com',
          phone: '+201286904277',
          address: 'Cairo, Egypt',
          supportHours: '24/7 Chat Support',
        },
        emailSettings: {
          smtp: {
            host: 'smtp.hostinger.com',
            port: '465',
            encryption: 'SSL',
            username: 'no-reply@kareemamged.com',
            password: 'Kk010193#',
          },
          contactForm: {
            fromEmail: 'no-reply@kareemamged.com',
            toEmail: 'work@kareemamged.com',
            subjectPrefix: '[Contact Form]',
            replyTo: 'support@rashadai.com',
            maxRequestsPerDay: 10,
          },
          reportIssue: {
            fromEmail: 'no-reply@kareemamged.com',
            toEmail: 'work@kareemamged.com',
            subjectPrefix: '[Issue Report]',
            replyTo: 'support@rashadai.com',
            maxRequestsPerDay: 5,
          },
          confirmationEmail: {
            fromEmail: 'no-reply@kareemamged.com',
            subjectPrefix: '[Email Confirmation]',
            replyTo: 'support@rashadai.com',
            maxRequestsPerDay: 5,
            tokenExpiryHours: 24,
            cooldownMinutes: 3,
          },
          resetPassword: {
            fromEmail: 'no-reply@kareemamged.com',
            subjectPrefix: '[Password Reset]',
            replyTo: 'support@rashadai.com',
            maxRequestsPerDay: 3,
            tokenExpiryHours: 24,
          },
        },
        security: {
          enableTwoFactor: false,
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
        siteName: 'RashadAI',
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
        set({ isLoading: true });
        try {
          // Fetch settings from site_settings table
          const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .eq('id', 1)
            .single();

          if (error) {
            console.warn('Error fetching system settings:', error);
            return;
          }

          if (data) {
            // Map database fields to store fields
            const settings: Partial<SystemSettings> = {
              siteName: data.site_name || get().systemSettings.siteName,
              siteDescription: data.site_description || get().systemSettings.siteDescription,
              contactEmail: data.contact_email || get().systemSettings.contactEmail,
              supportPhone: data.contact_phone || get().systemSettings.supportPhone,
              // Extract timezone, dateFormat, timeFormat from theme_settings
              timezone: data.theme_settings?.timezone || get().systemSettings.timezone,
              dateFormat: data.theme_settings?.dateFormat || get().systemSettings.dateFormat,
              timeFormat: data.theme_settings?.timeFormat || get().systemSettings.timeFormat,
              // Extract security and maintenance from theme_settings
              security: data.theme_settings?.security || get().systemSettings.security,
              maintenance: data.theme_settings?.maintenance || get().systemSettings.maintenance,
              // Use the new fields
              seo: data.seo_settings || get().systemSettings.seo,
              socialMedia: data.social_media || get().systemSettings.socialMedia,
              contactInfo: data.contact_info || get().systemSettings.contactInfo,
              emailSettings: data.email_settings || get().systemSettings.emailSettings,
            };

            // Update local state
            set({
              systemSettings: {
                ...get().systemSettings,
                ...settings
              }
            });

            // Update global variables if they exist
            if (typeof window !== 'undefined') {
              if (settings.siteName) window.siteName = settings.siteName;
              if (settings.siteDescription) window.siteDescription = settings.siteDescription;

              // Create a safe copy of settings for the global variable
              if (window.systemSettings) {
                window.systemSettings = {
                  ...window.systemSettings,
                  ...settings
                };
              }
            }
          }
        } catch (error: any) {
          console.error('Error fetching system settings:', error);
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
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
          if (usersError || consultationsError) {
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
              server: 'healthy' as 'healthy' | 'warning' | 'critical',
              database: 'warning' as 'healthy' | 'warning' | 'critical',
              storage: 'healthy' as 'healthy' | 'warning' | 'critical',
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
        try {
          set({ isLoading: true, error: null });

          // Update local state
          set({
            systemSettings: {
              ...get().systemSettings,
              ...settings
            }
          });

          // Try to update in database
          try {
            // Get current user session
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id || '00000000-0000-0000-0000-000000000000';

            // Prepare data for database
            const dbData = {
              id: 1, // Use a fixed ID for the single settings record
              site_name: settings.siteName || get().systemSettings.siteName,
              site_description: settings.siteDescription || get().systemSettings.siteDescription,
              contact_email: settings.contactEmail || get().systemSettings.contactEmail,
              contact_phone: settings.supportPhone || get().systemSettings.supportPhone,
              theme_settings: {
                timezone: settings.timezone || get().systemSettings.timezone,
                dateFormat: settings.dateFormat || get().systemSettings.dateFormat,
                timeFormat: settings.timeFormat || get().systemSettings.timeFormat,
                security: settings.security || get().systemSettings.security,
                maintenance: settings.maintenance || get().systemSettings.maintenance,
              },
              seo_settings: settings.seo || get().systemSettings.seo,
              social_media: settings.socialMedia || get().systemSettings.socialMedia,
              contact_info: settings.contactInfo || get().systemSettings.contactInfo,
              email_settings: settings.emailSettings || get().systemSettings.emailSettings,
              updated_at: new Date().toISOString(),
              updated_by: userId,
            };

            // Try RPC function first
            try {
              const { error: rpcError } = await supabase.rpc('update_site_settings', {
                p_user_id: userId,
                p_site_name: dbData.site_name,
                p_site_description: dbData.site_description,
                p_contact_email: dbData.contact_email,
                p_contact_phone: dbData.contact_phone,
                p_theme_settings: dbData.theme_settings,
                p_seo_settings: dbData.seo_settings,
                p_social_media: dbData.social_media,
                p_contact_info: dbData.contact_info,
                p_email_settings: dbData.email_settings
              });

              if (rpcError) {
                console.warn('RPC function failed, falling back to direct update:', rpcError);
                throw rpcError; // Fall back to direct update
              }
            } catch (rpcError) {
              // Fall back to direct update
              const { error } = await supabase
                .from('site_settings')
                .upsert(dbData);

              if (error) {
                console.error('Error saving settings to database:', error);
              }
            }
          } catch (dbError) {
            console.warn('Could not save settings to database:', dbError);
            // Continue with local update even if database update fails
          }

          // Update global variables if they exist
          if (typeof window !== 'undefined') {
            if (settings.siteName) window.siteName = settings.siteName;
            if (settings.siteDescription) window.siteDescription = settings.siteDescription;

            // Create a safe copy of settings for the global variable
            const safeSettings = { ...settings };
            if (window.systemSettings) {
              window.systemSettings = {
                ...window.systemSettings,
                ...safeSettings
              };
            }

            // Update SEO tags if the function exists
            if (typeof window.updateSEOTags === 'function') {
              window.updateSEOTags(settings);
            }
          }

          set({ isLoading: false });
        } catch (error) {
          console.error('Error updating Website settings:', error);
          set({ isLoading: false, error: 'Failed to update Website settings' });
        }
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
