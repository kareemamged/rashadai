import React, { useEffect, useState } from 'react';
import { X, Mail, Phone, Globe, Calendar, MapPin, User, Flag, Info, Clock, Briefcase, Languages, AtSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/dateUtils';
import { getCountryNameByCode } from '../../data/countries';
import { useUserManagementStore } from '../../store/userManagementStore';

interface UserDetailsModalProps {
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
    // Admin specific fields
    primary_phone?: string;
    secondary_phone?: string;
    age?: number;
  } | null;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language || 'en';
  const isRTL = language === 'ar';
  const [fullUserData, setFullUserData] = useState(user);

  // استخدام نصوص ثابتة إذا كانت مفاتيح الترجمة غير موجودة
  const userDetailsTitle = t('admin.users.userDetails') === 'admin.users.userDetails' ?
    (language === 'ar' ? 'تفاصيل المستخدم' : 'User Details') :
    t('admin.users.userDetails');

  const noNameTitle = t('admin.users.noName') === 'admin.users.noName' ?
    (language === 'ar' ? 'بدون اسم' : 'No Name') :
    t('admin.users.noName');

  const activeStatus = t('admin.users.active') === 'admin.users.active' ?
    (language === 'ar' ? 'نشط' : 'Active') :
    t('admin.users.active');

  const blockedStatus = t('admin.users.blocked') === 'admin.users.blocked' ?
    (language === 'ar' ? 'محظور' : 'Blocked') :
    t('admin.users.blocked');

  const inactiveStatus = t('admin.users.inactive') === 'admin.users.inactive' ?
    (language === 'ar' ? 'غير نشط' : 'Inactive') :
    t('admin.users.inactive');

  const deletedStatus = t('admin.users.deleted') === 'admin.users.deleted' ?
    (language === 'ar' ? 'محذوف' : 'Deleted') :
    t('admin.users.deleted');

  const pendingDeletionStatus = t('admin.users.pendingDeletion') === 'admin.users.pendingDeletion' ?
    (language === 'ar' ? 'قيد الحذف' : 'Pending Deletion') :
    t('admin.users.pendingDeletion');

  const unknownStatus = t('admin.users.unknown') === 'admin.users.unknown' ?
    (language === 'ar' ? 'غير معروف' : 'Unknown') :
    t('admin.users.unknown');

  const noRoleTitle = t('admin.users.noRole') === 'admin.users.noRole' ?
    (language === 'ar' ? 'بدون دور' : 'No Role') :
    t('admin.users.noRole');

  const adminRoleTitle = t('admin.users.adminRole') === 'admin.users.adminRole' ?
    (language === 'ar' ? 'مشرف' : 'Admin') :
    t('admin.users.adminRole');

  const doctorRoleTitle = t('admin.users.doctorRole') === 'admin.users.doctorRole' ?
    (language === 'ar' ? 'طبيب' : 'Doctor') :
    t('admin.users.doctorRole');

  const patientRoleTitle = t('admin.users.patientRole') === 'admin.users.patientRole' ?
    (language === 'ar' ? 'مريض' : 'Patient') :
    t('admin.users.patientRole');

  const userRoleTitle = t('admin.users.userRole') === 'admin.users.userRole' ?
    (language === 'ar' ? 'مستخدم' : 'User') :
    t('admin.users.userRole');

  const joinDateTitle = t('admin.users.joinDate') === 'admin.users.joinDate' ?
    (language === 'ar' ? 'تاريخ الانضمام' : 'Join Date') :
    t('admin.users.joinDate');

  const lastLoginTitle = t('admin.users.lastLogin') === 'admin.users.lastLogin' ?
    (language === 'ar' ? 'آخر تسجيل دخول' : 'Last Login') :
    t('admin.users.lastLogin');

  const neverTitle = t('admin.users.never') === 'admin.users.never' ?
    (language === 'ar' ? 'أبداً' : 'Never') :
    t('admin.users.never');

  const countryTitle = t('admin.users.country') === 'admin.users.country' ?
    (language === 'ar' ? 'الدولة' : 'Country') :
    t('admin.users.country');

  const phoneTitle = t('admin.users.phone') === 'admin.users.phone' ?
    (language === 'ar' ? 'الهاتف' : 'Phone') :
    t('admin.users.phone');

  const primaryPhoneTitle = t('admin.profile.primaryPhone') === 'admin.profile.primaryPhone' ?
    (language === 'ar' ? 'الهاتف الرئيسي' : 'Primary Phone') :
    t('admin.profile.primaryPhone');

  const secondaryPhoneTitle = t('admin.profile.secondaryPhone') === 'admin.profile.secondaryPhone' ?
    (language === 'ar' ? 'الهاتف الثانوي' : 'Secondary Phone') :
    t('admin.profile.secondaryPhone');

  const genderTitle = t('admin.users.gender') === 'admin.users.gender' ?
    (language === 'ar' ? 'الجنس' : 'Gender') :
    t('admin.users.gender');

  const maleTitle = t('common.male') === 'common.male' ?
    (language === 'ar' ? 'ذكر' : 'Male') :
    t('common.male');

  const femaleTitle = t('common.female') === 'common.female' ?
    (language === 'ar' ? 'أنثى' : 'Female') :
    t('common.female');

  const otherTitle = t('common.other') === 'common.other' ?
    (language === 'ar' ? 'آخر' : 'Other') :
    t('common.other');

  const ageTitle = t('admin.profile.age') === 'admin.profile.age' ?
    (language === 'ar' ? 'العمر' : 'Age') :
    t('admin.profile.age');

  const websiteTitle = t('admin.users.website') === 'admin.users.website' ?
    (language === 'ar' ? 'الموقع الإلكتروني' : 'Website') :
    t('admin.users.website');

  const blockExpiresTitle = t('admin.users.blockExpires') === 'admin.users.blockExpires' ?
    (language === 'ar' ? 'ينتهي الحظر في' : 'Block Expires') :
    t('admin.users.blockExpires');

  const scheduledDeletionTitle = t('admin.users.scheduledDeletion') === 'admin.users.scheduledDeletion' ?
    (language === 'ar' ? 'الحذف المجدول في' : 'Scheduled Deletion') :
    t('admin.users.scheduledDeletion');

  const bioTitle = t('admin.users.bio') === 'admin.users.bio' ?
    (language === 'ar' ? 'نبذة' : 'Bio') :
    t('admin.users.bio');

  const closeTitle = t('common.close') === 'common.close' ?
    (language === 'ar' ? 'إغلاق' : 'Close') :
    t('common.close');

  // Fetch complete user data when modal opens
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (isOpen && user) {
        try {
          const { fetchUserById } = useUserManagementStore.getState();
          const userDetails = await fetchUserById(user.id);

          if (userDetails) {
            console.log('Fetched complete user details:', userDetails);
            setFullUserData(userDetails);
          } else {
            setFullUserData(user);
          }
        } catch (error) {
          console.error('Error fetching user details in modal:', error);
          setFullUserData(user);
        }
      }
    };

    fetchUserDetails();
  }, [isOpen, user]);

  if (!isOpen || !fullUserData) return null;

  // تحديد حالة المستخدم
  const userStatus = () => {
    switch (fullUserData.status) {
      case 'active':
        return { label: activeStatus, color: 'bg-green-100 text-green-800' };
      case 'blocked':
        return { label: blockedStatus, color: 'bg-red-100 text-red-800' };
      case 'inactive':
        return { label: inactiveStatus, color: 'bg-gray-100 text-gray-800' };
      case 'deleted':
        return { label: deletedStatus, color: 'bg-red-100 text-red-800' };
      case 'pending_deletion':
        return { label: pendingDeletionStatus, color: 'bg-orange-100 text-orange-800' };
      default:
        return { label: unknownStatus, color: 'bg-gray-100 text-gray-800' };
    }
  };

  // تحديد دور المستخدم
  const userRole = () => {
    if (!fullUserData.role) return noRoleTitle;

    switch (fullUserData.role) {
      case 'admin':
        return adminRoleTitle;
      case 'doctor':
        return doctorRoleTitle;
      case 'patient':
        return patientRoleTitle;
      case 'user':
        return userRoleTitle;
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
                {userDetailsTitle}
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
                <h4 className="text-xl font-semibold text-gray-900">{fullUserData.name || noNameTitle}</h4>
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
                    {joinDateTitle}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(fullUserData.created_at, language)}
                  </dd>
                </div>

                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {lastLoginTitle}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {fullUserData.last_login ? formatDate(fullUserData.last_login, language) : neverTitle}
                  </dd>
                </div>

                {fullUserData.country_code && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Flag className="h-4 w-4 mr-1" />
                      {countryTitle}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {getCountryNameByCode(fullUserData.country_code) || fullUserData.country_code}
                    </dd>
                  </div>
                )}

                {/* Phone */}
                {fullUserData.phone && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {phoneTitle}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{fullUserData.phone}</dd>
                  </div>
                )}

                {/* Primary Phone - for admin users */}
                {fullUserData.primary_phone && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {primaryPhoneTitle}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{fullUserData.primary_phone}</dd>
                  </div>
                )}

                {/* Secondary Phone - for admin users */}
                {fullUserData.secondary_phone && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {secondaryPhoneTitle}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{fullUserData.secondary_phone}</dd>
                  </div>
                )}

                {fullUserData.birth_date && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Birth Date
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(fullUserData.birth_date, language, false)}
                    </dd>
                  </div>
                )}

                {fullUserData.gender && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {genderTitle}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {fullUserData.gender === 'male' ? maleTitle :
                       fullUserData.gender === 'female' ? femaleTitle :
                       fullUserData.gender === 'other' ? otherTitle :
                       fullUserData.gender}
                    </dd>
                  </div>
                )}

                {/* Age - for admin users */}
                {fullUserData.age && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {ageTitle}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{fullUserData.age}</dd>
                  </div>
                )}

                {fullUserData.profession && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Briefcase className="h-4 w-4 mr-1" />
                      Profession
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{fullUserData.profession}</dd>
                  </div>
                )}

                {fullUserData.website && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      {websiteTitle}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a
                        href={fullUserData.website.startsWith('http') ? fullUserData.website : `https://${fullUserData.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {fullUserData.website}
                      </a>
                    </dd>
                  </div>
                )}

                {fullUserData.status === 'blocked' && fullUserData.block_expires_at && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {blockExpiresTitle}
                    </dt>
                    <dd className="mt-1 text-sm text-orange-600">
                      {formatDate(fullUserData.block_expires_at, language)}
                    </dd>
                  </div>
                )}

                {fullUserData.status === 'pending_deletion' && fullUserData.deletion_scheduled_at && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {scheduledDeletionTitle}
                    </dt>
                    <dd className="mt-1 text-sm text-red-600">
                      {formatDate(fullUserData.deletion_scheduled_at, language)}
                    </dd>
                  </div>
                )}

                {fullUserData.bio && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Info className="h-4 w-4 mr-1" />
                      {bioTitle}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{fullUserData.bio}</dd>
                  </div>
                )}
              </dl>
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

export default UserDetailsModal;
