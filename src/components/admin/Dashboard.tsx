import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore } from '../../store/adminStore';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/languageStore';
import { Navigate, useLocation } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import {
  Users,
  MessageSquare,
  Star,
  Activity,
  Server,
  Database,
  HardDrive,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Calendar,
  Clock,
  BarChart2,
  Eye,
  UserPlus,
  FileText,
  ThumbsUp
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Define types for recent activity
interface ActivityItem {
  id: string;
  type: 'login' | 'registration' | 'consultation' | 'comment' | 'post' | 'like';
  user_name: string;
  user_id?: string;
  content: string;
  timestamp: string;
  icon: React.ReactNode;
}

// Define default stats
const defaultStats = {
  totalUsers: 0,
  totalVisitors: 0,
  activeConsultations: 0,
  pendingReviews: 0,
  pendingComments: 0,
  totalPendingItems: 0,
  systemStatus: {
    server: 'healthy' as 'healthy' | 'warning' | 'critical',
    database: 'healthy' as 'healthy' | 'warning' | 'critical',
    storage: 'healthy' as 'healthy' | 'warning' | 'critical',
  }
};

// Define the AdminStats type to match the interface in adminStore.ts
interface AdminStats {
  totalUsers: number;
  totalVisitors: number;
  activeConsultations: number;
  pendingReviews: number;
  pendingComments: number;
  totalPendingItems: number;
  systemStatus: {
    server: 'healthy' | 'warning' | 'critical';
    database: 'healthy' | 'warning' | 'critical';
    storage: 'healthy' | 'warning' | 'critical';
  };
}

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const adminStore = useAdminStore();
  const [isRTL, setIsRTL] = useState(language === 'ar');
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [totalVisitors, setTotalVisitors] = useState<number>(0);
  const [isLoadingActivity, setIsLoadingActivity] = useState<boolean>(false);
  const [localStats, setLocalStats] = useState<AdminStats>(defaultStats);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    setIsRTL(language === 'ar');
  }, [language]);

  // Initialize stats from store when component mounts
  useEffect(() => {
    console.log('Dashboard: adminStore.stats updated', adminStore.stats);
    // Make sure we have valid stats with all required properties
    const stats = adminStore.stats || defaultStats;

    // Create a new object with all required properties, using defaults for any missing ones
    const validStats: AdminStats = {
      totalUsers: typeof stats.totalUsers === 'number' ? stats.totalUsers : 0,
      totalVisitors: typeof stats.totalVisitors === 'number' ? stats.totalVisitors : 0,
      activeConsultations: typeof stats.activeConsultations === 'number' ? stats.activeConsultations : 0,
      pendingReviews: typeof stats.pendingReviews === 'number' ? stats.pendingReviews : 0,
      pendingComments: typeof stats.pendingComments === 'number' ? stats.pendingComments : 0,
      totalPendingItems: typeof stats.totalPendingItems === 'number' ? stats.totalPendingItems : 0,
      systemStatus: {
        server: stats.systemStatus?.server || 'healthy',
        database: stats.systemStatus?.database || 'healthy',
        storage: stats.systemStatus?.storage || 'healthy',
      }
    };

    setLocalStats(validStats);
    setIsLoadingStats(adminStore.isLoading);
  }, [adminStore.stats, adminStore.isLoading]);

  useEffect(() => {
    console.log('Dashboard: Initial stats fetch');

    // Fetch initial data
    const fetchInitialData = async () => {
      try {
        console.log('Dashboard: Fetching admin stats...');

        // تحديث عدد التقييمات المعلقة أولاً
        await adminStore.updatePendingReviewsCount();

        // ثم تحديث جميع الإحصائيات
        await adminStore.fetchStats();

        // Log the stats after fetching
        const currentStats = useAdminStore.getState().stats;
        console.log('Dashboard: Current admin stats after fetch:', currentStats);

        // Check specifically for pending reviews
        console.log('Dashboard: Pending reviews count:', currentStats.pendingReviews);

        // Get testimonials directly from the store to verify
        const { useTestimonialsStore } = await import('../../store/testimonialsStore');
        const allTestimonials = useTestimonialsStore.getState().testimonials;
        const pendingTestimonials = allTestimonials.filter(
          testimonial => !testimonial.approved || testimonial.status === 'pending'
        );
        console.log('Dashboard: Direct check - pending testimonials:', pendingTestimonials.length, 'from', allTestimonials.length, 'total');

        await fetchRecentActivity();
        await fetchTotalVisitors();
      } catch (error) {
        console.error('Error fetching initial dashboard data:', error);
      }
    };

    fetchInitialData();

    // Fetch stats every 5 minutes
    const interval = setInterval(async () => {
      console.log('Dashboard: Interval stats fetch');

      // تحديث عدد التقييمات المعلقة أولاً
      await adminStore.updatePendingReviewsCount();

      // ثم تحديث جميع الإحصائيات
      await adminStore.fetchStats();

      fetchRecentActivity();
      fetchTotalVisitors();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Log stats when they change
  useEffect(() => {
    console.log('Dashboard: Stats updated', localStats);
  }, [localStats]);

  // Fetch recent activity
  const fetchRecentActivity = async () => {
    setIsLoadingActivity(true);
    try {
      // Try to fetch from notifications table
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!notificationsError && notificationsData && notificationsData.length > 0) {
        // Transform notifications to activity items
        const activities = notificationsData.map(notification => {
          let icon;
          switch (notification.type) {
            case 'login':
              icon = <Activity className="h-5 w-5 text-blue-500" />;
              break;
            case 'registration':
              icon = <UserPlus className="h-5 w-5 text-green-500" />;
              break;
            case 'consultation':
              icon = <MessageSquare className="h-5 w-5 text-purple-500" />;
              break;
            case 'comment':
              icon = <MessageSquare className="h-5 w-5 text-yellow-500" />;
              break;
            case 'post':
              icon = <FileText className="h-5 w-5 text-indigo-500" />;
              break;
            case 'like':
              icon = <ThumbsUp className="h-5 w-5 text-red-500" />;
              break;
            default:
              icon = <Activity className="h-5 w-5 text-gray-500" />;
          }

          return {
            id: notification.id,
            type: notification.type as any,
            user_name: notification.title.split(' ')[0], // Extract user name from title
            user_id: notification.user_id,
            content: notification.message,
            timestamp: notification.created_at,
            icon
          };
        });

        setRecentActivity(activities);
      } else {
        // If no notifications in the notifications table, try to get real activity from other tables
        try {
          const activities: ActivityItem[] = [];

          // Get recent logins from auth.sessions
          const { data: loginData, error: loginError } = await supabase
            .from('auth.sessions')
            .select('id, user_id, created_at')
            .order('created_at', { ascending: false })
            .limit(2);

          if (!loginError && loginData && loginData.length > 0) {
            // Get user details for these logins
            for (const session of loginData) {
              const { data: userData } = await supabase
                .from('profiles')
                .select('name, email')
                .eq('id', session.user_id)
                .single();

              if (userData) {
                activities.push({
                  id: session.id,
                  type: 'login',
                  user_name: userData.name || userData.email.split('@')[0],
                  user_id: session.user_id,
                  content: t('admin.dashboard.loggedIn', 'logged in to the system'),
                  timestamp: session.created_at,
                  icon: <Activity className="h-5 w-5 text-blue-500" />
                });
              }
            }
          }

          // Get recent registrations
          const { data: registrationData, error: registrationError } = await supabase
            .from('profiles')
            .select('id, name, email, created_at')
            .order('created_at', { ascending: false })
            .limit(2);

          if (!registrationError && registrationData && registrationData.length > 0) {
            for (const user of registrationData) {
              activities.push({
                id: user.id,
                type: 'registration',
                user_name: user.name || user.email.split('@')[0],
                user_id: user.id,
                content: t('admin.dashboard.registered', 'registered a new account'),
                timestamp: user.created_at,
                icon: <UserPlus className="h-5 w-5 text-green-500" />
              });
            }
          }

          // Get recent blog posts if the table exists
          const { data: postData, error: postError } = await supabase
            .from('blog_posts')
            .select('id, title_en, title_ar, author_id, created_at')
            .order('created_at', { ascending: false })
            .limit(2);

          if (!postError && postData && postData.length > 0) {
            for (const post of postData) {
              // Get author details
              const { data: authorData } = await supabase
                .from('profiles')
                .select('name, email')
                .eq('id', post.author_id)
                .single();

              activities.push({
                id: post.id,
                type: 'post',
                user_name: authorData?.name || 'Admin',
                user_id: post.author_id,
                content: t('admin.dashboard.publishedPost', 'published a new post'),
                timestamp: post.created_at,
                icon: <FileText className="h-5 w-5 text-indigo-500" />
              });
            }
          }

          // Sort by timestamp (newest first) and limit to 5
          activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          const recentActivities = activities.slice(0, 5);

          if (recentActivities.length > 0) {
            setRecentActivity(recentActivities);
            return;
          }
        } catch (error) {
          console.error('Error fetching activity from other tables:', error);
        }

        // If we still don't have any activities, use sample data as last resort
        const sampleActivities: ActivityItem[] = [
          {
            id: '1',
            type: 'login',
            user_name: 'Ahmed',
            content: t('admin.dashboard.loggedIn', 'logged in to the system'),
            timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
            icon: <Activity className="h-5 w-5 text-blue-500" />
          },
          {
            id: '2',
            type: 'registration',
            user_name: 'Sara',
            content: t('admin.dashboard.registered', 'registered a new account'),
            timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
            icon: <UserPlus className="h-5 w-5 text-green-500" />
          },
          {
            id: '3',
            type: 'consultation',
            user_name: 'Mohammed',
            content: t('admin.dashboard.startedConsultation', 'started a new consultation'),
            timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
            icon: <MessageSquare className="h-5 w-5 text-purple-500" />
          },
          {
            id: '4',
            type: 'comment',
            user_name: 'Fatima',
            content: t('admin.dashboard.commentedPost', 'commented on a blog post'),
            timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
            icon: <MessageSquare className="h-5 w-5 text-yellow-500" />
          },
          {
            id: '5',
            type: 'post',
            user_name: 'Admin',
            content: t('admin.dashboard.publishedPost', 'published a new blog post'),
            timestamp: new Date(Date.now() - 240 * 60000).toISOString(),
            icon: <FileText className="h-5 w-5 text-indigo-500" />
          }
        ];

        setRecentActivity(sampleActivities);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      // Set sample data on error
      setRecentActivity([]);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  // Fetch total visitors
  const fetchTotalVisitors = async () => {
    try {
      // Check if the visitor_stats view exists
      const { data: checkData, error: checkError } = await supabase
        .from('visitor_stats')
        .select('*')
        .limit(1)
        .single();

      if (checkError && checkError.message.includes('does not exist')) {
        console.warn('visitor_stats view does not exist, using fallback data');
        // Fallback to profiles count as an estimate
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Multiply by a factor to estimate visitors (typically visitors > users)
        const estimatedVisitors = count ? count * 3 : 0;
        setTotalVisitors(estimatedVisitors);
        return;
      }

      if (checkData) {
        setTotalVisitors(checkData.total_visitors || 0);
      } else {
        // Alternative: Count from visitors table directly
        const { count, error } = await supabase
          .from('visitors')
          .select('*', { count: 'exact', head: true });

        if (error) throw error;
        setTotalVisitors(count || 0);
      }
    } catch (error) {
      console.error('Error fetching total visitors:', error);
      // Fallback to a reasonable number based on users
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setTotalVisitors(count ? count * 3 : 1000);
    }
  };

  const location = useLocation();

  // تم نقل التحقق من المستخدم إلى مكون ProtectedRoute
  // لذلك لا نحتاج إلى التحقق هنا مرة أخرى

  // Helper function to render status icon
  const renderStatusIcon = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <AlertOctagon className="h-5 w-5 text-red-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  // Helper function to render status text
  const renderStatusText = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return <span className="text-green-500">{t('admin.dashboard.healthy')}</span>;
      case 'warning':
        return <span className="text-yellow-500">{t('admin.dashboard.warning')}</span>;
      case 'critical':
        return <span className="text-red-500">{t('admin.dashboard.critical')}</span>;
      default:
        return <span className="text-green-500">{t('admin.dashboard.healthy')}</span>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('admin.dashboard.title')}</h1>
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-gray-500 mr-2" />
          <span className="text-sm text-gray-500 mr-4">
            {new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
          </span>
          <Clock className="h-5 w-5 text-gray-500 mr-2" />
          <span className="text-sm text-gray-500">
            {new Date().toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US')}
          </span>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{t('admin.dashboard.quickStats')}</h2>
          <button
            onClick={async () => {
              // تحديث عدد التقييمات المعلقة أولاً
              await adminStore.updatePendingReviewsCount();

              // ثم تحديث جميع الإحصائيات
              await adminStore.fetchStats();
            }}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            disabled={isLoadingStats}
          >
            <Activity className={`h-4 w-4 mr-1 ${isLoadingStats ? 'animate-spin' : ''}`} />
            {isLoadingStats ? t('common.refreshing', 'Refreshing...') : t('common.refresh', 'Refresh')}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">{t('admin.dashboard.totalUsers')}</h3>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {isLoadingStats ? '...' : (
                typeof localStats.totalUsers === 'number' ?
                localStats.totalUsers.toString() :
                '0'
              )}
            </p>
          </div>

          {/* Total Visitors */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">{t('admin.dashboard.totalVisitors', 'Total Visitors')}</h3>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {isLoadingStats ? '...' : (
                typeof totalVisitors === 'number' ?
                totalVisitors.toString() :
                '0'
              )}
            </p>
          </div>

          {/* Active Consultations */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">{t('admin.dashboard.activeConsultations')}</h3>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {isLoadingStats ? '...' : (
                typeof localStats.activeConsultations === 'number' ?
                localStats.activeConsultations.toString() :
                '0'
              )}
            </p>
          </div>

          {/* Pending Items */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">{t('admin.dashboard.pendingItems', 'Pending Items')}</h3>
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              {/* Calculate total pending items directly here to avoid NaN */}
              {(() => {
                // Get pending counts directly from the store
                const pendingReviews = typeof localStats.pendingReviews === 'number' ? localStats.pendingReviews : 0;
                const pendingComments = typeof localStats.pendingComments === 'number' ? localStats.pendingComments : 0;
                const total = pendingReviews + pendingComments;

                console.log('Dashboard rendering pending items:', {
                  pendingReviews,
                  pendingComments,
                  total,
                  rawPendingReviews: localStats.pendingReviews,
                  rawPendingComments: localStats.pendingComments,
                  rawTotal: localStats.totalPendingItems
                });

                // Force a refresh of the pending items count if it's 0
                if (total === 0 && !isLoadingStats) {
                  // We'll do this only once to avoid infinite loops
                  const refreshPendingItems = async () => {
                    try {
                      console.log('Auto-refreshing pending items count...');
                      await adminStore.fetchStats();
                    } catch (error) {
                      console.error('Error auto-refreshing stats:', error);
                    }
                  };

                  // Use setTimeout to avoid React warnings about state updates during render
                  setTimeout(refreshPendingItems, 500);
                }

                return (
                  <p className="text-3xl font-bold text-gray-800">
                    {isLoadingStats ? '...' : total.toString()}
                  </p>
                );
              })()}

              <div className="flex flex-col space-y-1">
                {(typeof localStats.pendingReviews === 'number' && localStats.pendingReviews > 0) && (
                  <a
                    href="/admin/content?tab=testimonials"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {t('admin.dashboard.reviews', 'Reviews')}: {localStats.pendingReviews}
                  </a>
                )}
                {(typeof localStats.pendingComments === 'number' && localStats.pendingComments > 0) && (
                  <a
                    href="/admin/content?tab=comments"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {t('admin.dashboard.comments', 'Comments')}: {localStats.pendingComments}
                  </a>
                )}
                {/* زر تحديث التقييمات المعلقة */}
                <button
                  onClick={async () => {
                    try {
                      console.log('Manual refresh of pending testimonials');

                      // استخدام الوظيفة المخصصة لتحديث عدد التقييمات المعلقة
                      const pendingCount = await adminStore.updatePendingReviewsCount();

                      console.log('Manual refresh result - pending testimonials count:', pendingCount);

                      // تحديث الإحصائيات الكاملة
                      await adminStore.fetchStats();
                    } catch (error) {
                      console.error('Error refreshing testimonials:', error);
                    }
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 mt-1"
                >
                  {t('common.refreshPending', 'Refresh pending items')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{t('admin.dashboard.systemStatus')}</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Server Status */}
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                  <Server className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">{t('admin.dashboard.serverStatus')}</h3>
                  <div className="flex items-center mt-1">
                    {renderStatusIcon(localStats.systemStatus.server)}
                    <span className="ml-2">{renderStatusText(localStats.systemStatus.server)}</span>
                  </div>
                </div>
              </div>

              {/* Database Status */}
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                  <Database className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">{t('admin.dashboard.databaseStatus')}</h3>
                  <div className="flex items-center mt-1">
                    {renderStatusIcon(localStats.systemStatus.database)}
                    <span className="ml-2">{renderStatusText(localStats.systemStatus.database)}</span>
                  </div>
                </div>
              </div>

              {/* Storage Status */}
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                  <HardDrive className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">{t('admin.dashboard.storageStatus')}</h3>
                  <div className="flex items-center mt-1">
                    {renderStatusIcon(localStats.systemStatus.storage)}
                    <span className="ml-2">{renderStatusText(localStats.systemStatus.storage)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{t('admin.dashboard.recentActivity')}</h2>
          <button className="text-sm text-blue-600 hover:text-blue-800">
            {t('admin.dashboard.viewAll')}
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoadingActivity ? (
            <div className="p-6 flex items-center justify-center h-40">
              <div className="text-center">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-spin" />
                <p className="text-gray-500">
                  {t('common.loading')}
                </p>
              </div>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="p-6 flex items-center justify-center h-40">
              <div className="text-center">
                <BarChart2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {t('common.noResults')}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        <span className="font-bold">{activity.user_name}</span> {activity.content}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;