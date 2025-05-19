import React, { useState, useEffect } from 'react';
import { X, Activity, Clock, Calendar, Search, Filter, User, MessageSquare, Star, Eye, ThumbsUp, UserCog } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/dateUtils';
import { useUserManagementStore } from '../../store/userManagementStore';

interface UserActivity {
  id: string;
  type: string;
  description: string;
  detail?: string;
  created_at: string;
  ip_address?: string;
  device_info?: string;
  user_agent?: string;
  page_visited?: string;
  content?: string;
  rating?: number;
  post_id?: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
}

interface UserActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name?: string;
    email: string;
  } | null;
}

const UserActivityModal: React.FC<UserActivityModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language || 'en';
  const isRTL = language === 'ar';

  // استخدام نصوص ثابتة إذا كانت مفاتيح الترجمة غير موجودة
  const userActivityTitle = t('admin.users.userActivity') === 'admin.users.userActivity' ?
    (language === 'ar' ? 'نشاط المستخدم' : 'User Activity') :
    t('admin.users.userActivity');

  const activityForTitle = t('admin.users.activityFor') === 'admin.users.activityFor' ?
    (language === 'ar' ? 'نشاط المستخدم: {name}' : 'Activity for {name}') :
    t('admin.users.activityFor');

  const noActivitiesTitle = t('admin.users.noActivities') === 'admin.users.noActivities' ?
    (language === 'ar' ? 'لا توجد أنشطة' : 'No Activities') :
    t('admin.users.noActivities');

  const searchTitle = t('common.search') === 'common.search' ?
    (language === 'ar' ? 'بحث' : 'Search') :
    t('common.search');

  const allTitle = t('common.all') === 'common.all' ?
    (language === 'ar' ? 'الكل' : 'All') :
    t('common.all');

  const loadingTitle = t('common.loading') === 'common.loading' ?
    (language === 'ar' ? 'جاري التحميل...' : 'Loading...') :
    t('common.loading');

  const deviceTitle = t('admin.users.device') === 'admin.users.device' ?
    (language === 'ar' ? 'الجهاز' : 'Device') :
    t('admin.users.device');

  const closeTitle = t('common.close') === 'common.close' ?
    (language === 'ar' ? 'إغلاق' : 'Close') :
    t('common.close');

  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      fetchUserActivities();
    }
  }, [isOpen, user]);

  const fetchUserActivities = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Use the store function to fetch all user activities
      const { fetchUserActivities } = useUserManagementStore.getState();
      const activities = await fetchUserActivities(user.id);

      setActivities(activities);
    } catch (error) {
      console.error('Error fetching user activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter activities based on type and search term
  const filteredActivities = activities.filter(activity => {
    const matchesType = activityTypeFilter === 'all' || activity.type === activityTypeFilter;
    const matchesSearch = activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Get unique activity types for filter
  const activityTypes = ['all', ...new Set(activities.map(activity => activity.type))];

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Activity className="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <h3 className={`text-lg leading-6 font-medium text-gray-900 ${isRTL ? 'mr-3' : 'ml-3'}`}>
                  {userActivityTitle}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-4">
                {activityForTitle.replace('{name}', user.name || user.email || 'User')}
              </p>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={searchTitle}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>

                <div className="relative">
                  <select
                    className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={activityTypeFilter}
                    onChange={(e) => setActivityTypeFilter(e.target.value)}
                  >
                    {activityTypes.map((type) => (
                      <option key={type} value={type}>
                        {type === 'all'
                          ? allTitle
                          : t(`admin.users.activityType_${type}`, type)}
                      </option>
                    ))}
                  </select>
                  <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Activity List */}
              <div className="mt-4 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-4">
                    <Activity className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
                    <p className="mt-2 text-sm text-gray-500">{loadingTitle}</p>
                  </div>
                ) : filteredActivities.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">{noActivitiesTitle}</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {filteredActivities.map((activity) => (
                      <li key={activity.id} className="py-4">
                        <div className="flex items-start">
                          <div className={`flex-shrink-0 ${isRTL ? 'ml-3' : 'mr-3'}`}>
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              {activity.type === 'login' ? (
                                <Clock className="h-4 w-4 text-blue-600" />
                              ) : activity.type === 'profile_update' ? (
                                <UserCog className="h-4 w-4 text-orange-600" />
                              ) : activity.type === 'comment' ? (
                                <MessageSquare className="h-4 w-4 text-indigo-600" />
                              ) : activity.type === 'testimonial' ? (
                                <Star className="h-4 w-4 text-yellow-600" />
                              ) : activity.type === 'post_views' ? (
                                <Eye className="h-4 w-4 text-purple-600" />
                              ) : activity.type === 'post_likes' ? (
                                <ThumbsUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <Activity className="h-4 w-4 text-gray-600" />
                              )}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.description}
                            </p>
                            {activity.detail && (
                              <p className="text-sm text-gray-700">
                                {activity.detail}
                              </p>
                            )}
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <Calendar className="flex-shrink-0 h-4 w-4 text-gray-400" />
                              <span className={`${isRTL ? 'mr-1.5' : 'ml-1.5'}`}>
                                {formatDate(activity.created_at, language)}
                              </span>
                            </div>
                            {activity.content && (
                              <p className="mt-1 text-xs text-gray-600 italic">
                                "{activity.content}"
                              </p>
                            )}
                            {activity.ip_address && (
                              <p className="mt-1 text-xs text-gray-500">
                                IP: {activity.ip_address}
                              </p>
                            )}
                            {activity.device_info && (
                              <p className="mt-1 text-xs text-gray-500">
                                {deviceTitle}: {activity.device_info.substring(0, 50)}{activity.device_info.length > 50 ? '...' : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              {closeTitle}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserActivityModal;
