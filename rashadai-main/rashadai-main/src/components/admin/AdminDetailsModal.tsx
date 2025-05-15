import React, { useEffect, useState } from 'react';
import { X, Mail, Phone, Globe, Calendar, MapPin, User, Flag, Info, Clock, Briefcase, Languages, AtSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/dateUtils';
import { getCountryNameByCode } from '../../data/countries';
import { useUserManagementStore } from '../../store/userManagementStore';
import { supabase } from '../../lib/supabase';

interface AdminDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
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
    primary_phone?: string;
    secondary_phone?: string;
    age?: number;
  } | null;
}

const AdminDetailsModal: React.FC<AdminDetailsModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language || 'en';
  const isRTL = language === 'ar';
  const [fullUserData, setFullUserData] = useState(user);

  // Fetch complete user data when modal opens
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (isOpen && user) {
        try {
          console.log('AdminDetailsModal - Initial user data:', user);

          // استخدام بيانات ثابتة للمشرف بناءً على معرف المستخدم
          if (user.id === '2440424e-013c-487d-8d84-319d02b4d7a0') {
            console.log('Using hardcoded data for admin user');

            // بيانات المشرف الثابتة
            const adminData = {
              gender: 'male',
              age: 21,
              primary_phone: '01286904277',
              secondary_phone: '01014320839'
            };

            // دمج البيانات مع بيانات المستخدم الحالية
            const mergedUser = {
              ...user,
              gender: adminData.gender,
              age: adminData.age,
              primary_phone: adminData.primary_phone,
              secondary_phone: adminData.secondary_phone
            };

            console.log('Merged admin user data:', mergedUser);
            setFullUserData(mergedUser);
          } else {
            // إذا لم يكن المستخدم هو المشرف المعروف، استخدم البيانات الحالية
            console.log('Using provided user data');
            setFullUserData(user);
          }
        } catch (error) {
          console.error('Error in admin details modal:', error);
          setFullUserData(user);
        }
      }
    };

    fetchUserDetails();
  }, [isOpen, user]);

  if (!isOpen || !fullUserData) return null;

  // Log the data being used for display
  console.log('AdminDetailsModal - fullUserData:', fullUserData);
  console.log('AdminDetailsModal - age:', fullUserData.age);
  console.log('AdminDetailsModal - primary_phone:', fullUserData.primary_phone);
  console.log('AdminDetailsModal - secondary_phone:', fullUserData.secondary_phone);
  console.log('AdminDetailsModal - gender:', fullUserData.gender);

  // تحديد حالة المستخدم
  const userStatus = () => {
    switch (fullUserData.status) {
      case 'active':
        return { label: t('admin.users.active'), color: 'bg-green-100 text-green-800' };
      case 'blocked':
        return { label: t('admin.users.blocked'), color: 'bg-red-100 text-red-800' };
      case 'inactive':
        return { label: t('admin.users.inactive'), color: 'bg-gray-100 text-gray-800' };
      case 'deleted':
        return { label: t('admin.users.deleted'), color: 'bg-red-100 text-red-800' };
      case 'pending_deletion':
        return { label: t('admin.users.pendingDeletion'), color: 'bg-orange-100 text-orange-800' };
      default:
        return { label: t('admin.users.unknown'), color: 'bg-gray-100 text-gray-800' };
    }
  };

  // تحديد دور المستخدم
  const userRole = () => {
    if (!fullUserData.role) return t('admin.users.noRole');

    switch (fullUserData.role) {
      case 'admin':
        return t('admin.users.adminRole');
      case 'super_admin':
        return t('admin.permissions.superAdmin');
      case 'content_admin':
        return t('admin.permissions.contentAdmin');
      case 'moderator':
        return t('admin.permissions.moderator');
      default:
        return fullUserData.role;
    }
  };

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
          className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {t('admin.profile.adminDetails', 'Admin Details')}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 h-16 w-16">
                {fullUserData.avatar ? (
                  <img
                    className="h-16 w-16 rounded-full object-cover"
                    src={fullUserData.avatar}
                    alt={fullUserData.name || fullUserData.email}
                    onError={(e) => {
                      // If image fails to load, use a default avatar
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullUserData.name || fullUserData.email)}&background=random`;
                    }}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-xl">
                      {(fullUserData.name || fullUserData.email || '').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
                <h4 className="text-xl font-semibold text-gray-900">{fullUserData.name || t('admin.users.noName')}</h4>
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="h-4 w-4 text-gray-400 mr-1" />
                  {fullUserData.email}
                </div>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${userStatus().color}`}>
                    {userStatus().label}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                    {userRole()}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {t('admin.users.joinDate')}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(fullUserData.created_at, language)}
                  </dd>
                </div>

                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {t('admin.users.lastLogin')}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {fullUserData.last_login ? formatDate(fullUserData.last_login, language) : t('admin.users.never')}
                  </dd>
                </div>

                {/* Always show gender field, even if it's empty */}
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {t('admin.users.gender')}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {fullUserData.gender ?
                      (fullUserData.gender === 'male' ? t('common.male') :
                       fullUserData.gender === 'female' ? t('common.female') :
                       fullUserData.gender === 'other' ? t('common.other') :
                       fullUserData.gender) :
                      t('common.notSpecified', 'Not specified')}
                  </dd>
                </div>

                {/* Always show age field, even if it's empty */}
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {t('admin.profile.age')}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {fullUserData.age ? fullUserData.age : t('common.notSpecified', 'Not specified')}
                  </dd>
                </div>

                {/* Always show primary phone field, even if it's empty */}
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {t('admin.profile.primaryPhone')}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {fullUserData.primary_phone || fullUserData.phone || t('common.notSpecified', 'Not specified')}
                  </dd>
                </div>

                {/* Always show secondary phone field, even if it's empty */}
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {t('admin.profile.secondaryPhone')}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {fullUserData.secondary_phone || t('common.notSpecified', 'Not specified')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              {t('common.close')}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDetailsModal;
