import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/languageStore';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Lock,
  Bell,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  Mail,
  RotateCcw,
  Activity
} from 'lucide-react';
import { useUserManagementStore, User } from '../../store/userManagementStore';
import { formatDate } from '../../utils/dateUtils';
import UserDetailsModal from './UserDetailsModal';
import AdminDetailsModal from './AdminDetailsModal';
import BlockUserModal from './BlockUserModal';
import UserActivityModal from './UserActivityModal';
import ConfirmDeleteUserModal from './ConfirmDeleteUserModal';
import AddUserModal from './AddUserModal';

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<'patients' | 'doctors' | 'admins'>('patients');
  const [isRTL, setIsRTL] = useState(language === 'ar');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // User management store
  const {
    fetchUsers,
    blockUser,
    unblockUser,
    deleteUser,
    restoreUser,
    isLoading: isLoadingUsers
  } = useUserManagementStore();

  // Local state
  const [users, setUsers] = useState<User[]>([]);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAdminDetailsModalOpen, setIsAdminDetailsModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  useEffect(() => {
    setIsRTL(language === 'ar');
  }, [language]);

  // Fetch users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Determine the role filter based on active tab
        let roleFilter = '';
        if (activeTab === 'doctors') {
          roleFilter = 'doctor';
        } else if (activeTab === 'admins') {
          roleFilter = 'admin';
        } else {
          roleFilter = 'patient';
        }

        // Fetch users with the specified role
        const fetchedUsers = await fetchUsers(roleFilter, true);
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    loadUsers();
  }, [activeTab, fetchUsers]);

  // Filter users based on search term and status filter
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && user.status === statusFilter;
  });

  // Handle user actions
  const handleViewUserDetails = async (user: User) => {
    try {
      // Fetch complete user details before showing modal
      const { fetchUserById } = useUserManagementStore.getState();
      const userDetails = await fetchUserById(user.id);

      if (userDetails) {
        console.log('User details fetched in UserManagement:', userDetails);
        console.log('User details - age:', userDetails.age);
        console.log('User details - primary_phone:', userDetails.primary_phone);
        console.log('User details - secondary_phone:', userDetails.secondary_phone);
        console.log('User details - gender:', userDetails.gender);
        setSelectedUser(userDetails);
      } else {
        console.log('No user details returned, using basic user info');
        setSelectedUser(user);
      }

      // Check if the user is an admin
      if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'content_admin' || user.role === 'moderator') {
        console.log('Opening admin details modal for user:', user.id);
        setIsAdminDetailsModalOpen(true);
      } else {
        setIsDetailsModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      // Fallback to using the basic user info we already have
      setSelectedUser(user);

      // Check if the user is an admin
      if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'content_admin' || user.role === 'moderator') {
        setIsAdminDetailsModalOpen(true);
      } else {
        setIsDetailsModalOpen(true);
      }
    }
  };

  const handleViewUserActivity = (user: User) => {
    setSelectedUser(user);
    setIsActivityModalOpen(true);
  };

  const handleBlockUserClick = (user: User) => {
    setSelectedUser(user);
    setIsBlockModalOpen(true);
  };

  const handleBlockUser = async (userId: string, blockType: 'permanent' | 'temporary', duration?: number) => {
    try {
      console.log(`Blocking user ${userId} with type ${blockType} and duration ${duration || 'permanent'}`);
      const success = await blockUser(userId, blockType, duration);
      console.log(`Block user result: ${success}`);

      if (success) {
        // Refresh the user list
        const roleFilter = activeTab === 'doctors' ? 'doctor' : activeTab === 'admins' ? 'admin' : 'patient';
        const updatedUsers = await fetchUsers(roleFilter, true);
        setUsers(updatedUsers);
      }

      return success;
    } catch (error) {
      console.error('Error blocking user:', error);
      return false;
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      console.log(`Unblocking user ${userId}`);
      const success = await unblockUser(userId);
      console.log(`Unblock user result: ${success}`);

      if (success) {
        // Refresh the user list
        const roleFilter = activeTab === 'doctors' ? 'doctor' : activeTab === 'admins' ? 'admin' : 'patient';
        const updatedUsers = await fetchUsers(roleFilter, true);
        setUsers(updatedUsers);
      }

      return success;
    } catch (error) {
      console.error('Error unblocking user:', error);
      return false;
    }
  };

  const handleDeleteUserClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Check if user is already pending deletion
      const user = users.find(u => u.id === userId);
      let success = false;

      console.log(`Delete/restore user ${userId}, current status: ${user?.status}`);

      if (user?.status === 'pending_deletion') {
        // If already pending deletion, restore the user
        console.log(`Restoring user ${userId} from pending deletion`);
        success = await restoreUser(userId);
      } else {
        // Otherwise, schedule deletion
        console.log(`Scheduling deletion for user ${userId}`);
        success = await deleteUser(userId);
      }

      console.log(`Delete/restore user result: ${success}`);

      if (success) {
        // Refresh the user list
        const roleFilter = activeTab === 'doctors' ? 'doctor' : activeTab === 'admins' ? 'admin' : 'patient';
        const updatedUsers = await fetchUsers(roleFilter, true);
        setUsers(updatedUsers);
      }

      return success;
    } catch (error) {
      console.error('Error managing user deletion:', error);
      return false;
    }
  };

  // تحقق من وجود مفاتيح الترجمة في وحدة التخزين المحلية
  console.log('Current translation keys:', t('admin.users.title'), t('admin.users.patients'));

  // استخدام نصوص ثابتة إذا كانت مفاتيح الترجمة غير موجودة
  const usersTitle = t('admin.users.title') === 'admin.users.title' ?
    (language === 'ar' ? 'إدارة المستخدمين' : 'User Management') :
    t('admin.users.title');

  const patientsTabTitle = t('admin.users.patients') === 'admin.users.patients' ?
    (language === 'ar' ? 'المرضى' : 'Patients') :
    t('admin.users.patients');

  const doctorsTabTitle = t('admin.users.doctors') === 'admin.users.doctors' ?
    (language === 'ar' ? 'الأطباء' : 'Doctors') :
    t('admin.users.doctors');

  const adminsTabTitle = t('admin.users.admins') === 'admin.users.admins' ?
    (language === 'ar' ? 'المشرفون' : 'Admins') :
    t('admin.users.admins');

  const addPatientTitle = t('admin.users.addPatient') === 'admin.users.addPatient' ?
    (language === 'ar' ? 'إضافة مريض جديد' : 'Add New Patient') :
    t('admin.users.addPatient');

  const addDoctorTitle = t('admin.users.addDoctor') === 'admin.users.addDoctor' ?
    (language === 'ar' ? 'إضافة طبيب جديد' : 'Add New Doctor') :
    t('admin.users.addDoctor');

  const addAdminTitle = t('admin.users.addAdmin') === 'admin.users.addAdmin' ?
    (language === 'ar' ? 'إضافة مشرف جديد' : 'Add New Admin') :
    t('admin.users.addAdmin');

  const userNameTitle = t('admin.users.userName') === 'admin.users.userName' ?
    (language === 'ar' ? 'اسم المستخدم' : 'User Name') :
    t('admin.users.userName');

  const userEmailTitle = t('admin.users.userEmail') === 'admin.users.userEmail' ?
    (language === 'ar' ? 'البريد الإلكتروني' : 'Email') :
    t('admin.users.userEmail');

  const userStatusTitle = t('admin.users.userStatus') === 'admin.users.userStatus' ?
    (language === 'ar' ? 'الحالة' : 'Status') :
    t('admin.users.userStatus');

  const joinDateTitle = t('admin.users.joinDate') === 'admin.users.joinDate' ?
    (language === 'ar' ? 'تاريخ الانضمام' : 'Join Date') :
    t('admin.users.joinDate');

  const actionsTitle = t('admin.users.actions') === 'admin.users.actions' ?
    (language === 'ar' ? 'الإجراءات' : 'Actions') :
    t('admin.users.actions');

  const activeStatus = t('admin.users.active') === 'admin.users.active' ?
    (language === 'ar' ? 'نشط' : 'Active') :
    t('admin.users.active');

  const blockedStatus = t('admin.users.blocked') === 'admin.users.blocked' ?
    (language === 'ar' ? 'محظور' : 'Blocked') :
    t('admin.users.blocked');

  const inactiveStatus = t('admin.users.inactive') === 'admin.users.inactive' ?
    (language === 'ar' ? 'غير نشط' : 'Inactive') :
    t('admin.users.inactive');

  const pendingDeletionStatus = t('admin.users.pendingDeletion') === 'admin.users.pendingDeletion' ?
    (language === 'ar' ? 'قيد الحذف' : 'Pending Deletion') :
    t('admin.users.pendingDeletion');

  const viewProfileTitle = t('admin.users.viewProfile') === 'admin.users.viewProfile' ?
    (language === 'ar' ? 'عرض الملف الشخصي' : 'View Profile') :
    t('admin.users.viewProfile');

  const userActivityTitle = t('admin.users.userActivity') === 'admin.users.userActivity' ?
    (language === 'ar' ? 'نشاط المستخدم' : 'User Activity') :
    t('admin.users.userActivity');

  const blockUserTitle = t('admin.users.blockUser') === 'admin.users.blockUser' ?
    (language === 'ar' ? 'حظر المستخدم' : 'Block User') :
    t('admin.users.blockUser');

  const unblockUserTitle = t('admin.users.unblockUser') === 'admin.users.unblockUser' ?
    (language === 'ar' ? 'إلغاء حظر المستخدم' : 'Unblock User') :
    t('admin.users.unblockUser');

  const deleteUserTitle = t('admin.users.deleteUser') === 'admin.users.deleteUser' ?
    (language === 'ar' ? 'حذف المستخدم' : 'Delete User') :
    t('admin.users.deleteUser');

  const restoreUserTitle = t('admin.users.restoreUser') === 'admin.users.restoreUser' ?
    (language === 'ar' ? 'استعادة المستخدم' : 'Restore User') :
    t('admin.users.restoreUser');

  const lastLoginTitle = t('admin.users.lastLogin') === 'admin.users.lastLogin' ?
    (language === 'ar' ? 'آخر تسجيل دخول' : 'Last Login') :
    t('admin.users.lastLogin');

  const deletionScheduledTitle = t('admin.users.deletionScheduled') === 'admin.users.deletionScheduled' ?
    (language === 'ar' ? 'مجدول للحذف في' : 'Deletion Scheduled') :
    t('admin.users.deletionScheduled');

  const noNameTitle = t('admin.users.noName') === 'admin.users.noName' ?
    (language === 'ar' ? 'بدون اسم' : 'No Name') :
    t('admin.users.noName');

  const roleTitle = t('admin.users.role') === 'admin.users.role' ?
    (language === 'ar' ? 'الدور' : 'Role') :
    t('admin.users.role');

  // إضافة المزيد من متغيرات الترجمة
  const userDetailsTitle = t('admin.users.userDetails') === 'admin.users.userDetails' ?
    (language === 'ar' ? 'تفاصيل المستخدم' : 'User Details') :
    t('admin.users.userDetails');

  const userRoleTitle = t('admin.users.userRole') === 'admin.users.userRole' ?
    (language === 'ar' ? 'دور المستخدم' : 'User Role') :
    t('admin.users.userRole');

  const countryTitle = t('admin.users.country') === 'admin.users.country' ?
    (language === 'ar' ? 'الدولة' : 'Country') :
    t('admin.users.country');

  const activityForTitle = t('admin.users.activityFor') === 'admin.users.activityFor' ?
    (language === 'ar' ? 'نشاط المستخدم' : 'Activity For') :
    t('admin.users.activityFor');

  const noActivitiesTitle = t('admin.users.noActivities') === 'admin.users.noActivities' ?
    (language === 'ar' ? 'لا توجد أنشطة' : 'No Activities') :
    t('admin.users.noActivities');

  const blockPermanentTitle = t('admin.users.blockPermanent') === 'admin.users.blockPermanent' ?
    (language === 'ar' ? 'حظر دائم' : 'Block Permanently') :
    t('admin.users.blockPermanent');

  const blockTemporaryTitle = t('admin.users.blockTemporary') === 'admin.users.blockTemporary' ?
    (language === 'ar' ? 'حظر مؤقت' : 'Block Temporarily') :
    t('admin.users.blockTemporary');

  const blockDurationTitle = t('admin.users.blockDuration') === 'admin.users.blockDuration' ?
    (language === 'ar' ? 'مدة الحظر' : 'Block Duration') :
    t('admin.users.blockDuration');

  const daysTitle = t('admin.users.days') === 'admin.users.days' ?
    (language === 'ar' ? 'أيام' : 'Days') :
    t('admin.users.days');

  const blockUserConfirmationTitle = t('admin.users.blockUserConfirmation') === 'admin.users.blockUserConfirmation' ?
    (language === 'ar' ? 'تأكيد حظر المستخدم' : 'Block User Confirmation') :
    t('admin.users.blockUserConfirmation');

  const blockWarningTitle = t('admin.users.blockWarning') === 'admin.users.blockWarning' ?
    (language === 'ar' ? 'تحذير: سيتم منع المستخدم من الوصول إلى النظام' : 'Warning: User will be prevented from accessing the system') :
    t('admin.users.blockWarning');

  const deleteUserConfirmationTitle = t('admin.users.deleteUserConfirmation') === 'admin.users.deleteUserConfirmation' ?
    (language === 'ar' ? 'تأكيد حذف المستخدم' : 'Delete User Confirmation') :
    t('admin.users.deleteUserConfirmation');

  const deleteWarningTitle = t('admin.users.deleteWarning') === 'admin.users.deleteWarning' ?
    (language === 'ar' ? 'تحذير: سيتم جدولة حذف المستخدم' : 'Warning: User will be scheduled for deletion') :
    t('admin.users.deleteWarning');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{usersTitle}</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`${
            activeTab === 'patients'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          } flex items-center px-4 py-2 font-medium`}
          onClick={() => setActiveTab('patients')}
        >
          <Users className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {patientsTabTitle}
        </button>
        <button
          className={`${
            activeTab === 'doctors'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          } flex items-center px-4 py-2 font-medium`}
          onClick={() => setActiveTab('doctors')}
        >
          <UserCheck className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {doctorsTabTitle}
        </button>
        <button
          className={`${
            activeTab === 'admins'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          } flex items-center px-4 py-2 font-medium`}
          onClick={() => setActiveTab('admins')}
        >
          <UserPlus className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {adminsTabTitle}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row justify-between mb-6">
        <div className="relative mb-4 md:mb-0 md:w-1/3">
          <input
            type="text"
            placeholder={t('common.search')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <div className="flex">
          <div className="relative mr-4">
            <select
              className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">{t('common.all') === 'common.all' ? (language === 'ar' ? 'الكل' : 'All') : t('common.all')}</option>
              <option value="active">{activeStatus}</option>
              <option value="blocked">{blockedStatus}</option>
              <option value="inactive">{inactiveStatus}</option>
            </select>
            <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <UserPlus className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {activeTab === 'patients'
              ? addPatientTitle
              : activeTab === 'doctors'
                ? addDoctorTitle
                : addAdminTitle
            }
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoadingUsers ? (
          <div className="p-6 text-center">
            <p>{t('common.loading')}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-6 text-center">
            <p>{t('common.noResults')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {userNameTitle}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {userEmailTitle}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {userStatusTitle}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {joinDateTitle}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {actionsTitle}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.avatar}
                              alt={user.name || user.email}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {(user.name || user.email || '').charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || noNameTitle}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.role && (
                          <div className="text-xs text-gray-400 mt-1">
                            {roleTitle}: {user.role}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                        user.status === 'blocked' ? 'bg-red-100 text-red-800' :
                        user.status === 'pending_deletion' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status === 'active' ? activeStatus :
                         user.status === 'blocked' ? blockedStatus :
                         user.status === 'inactive' ? inactiveStatus :
                         user.status === 'pending_deletion' ? pendingDeletionStatus : user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <div className="flex items-center mb-1">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {formatDate(user.created_at, language)}
                        </div>
                        {user.last_login && (
                          <div className="flex items-center text-xs text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {lastLoginTitle}: {formatDate(user.last_login, language)}
                          </div>
                        )}
                        {user.status === 'pending_deletion' && user.deletion_scheduled_at && (
                          <div className="flex items-center text-xs text-red-500 mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {deletionScheduledTitle}: {formatDate(user.deletion_scheduled_at, language)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* View User Details */}
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title={viewProfileTitle}
                        onClick={() => handleViewUserDetails(user)}
                      >
                        <Eye className="h-5 w-5" />
                      </button>

                      {/* View User Activity */}
                      <button
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        title={userActivityTitle}
                        onClick={() => handleViewUserActivity(user)}
                      >
                        <Activity className="h-5 w-5" />
                      </button>

                      {/* Block/Unblock User */}
                      {user.status === 'active' ? (
                        <button
                          className="text-orange-600 hover:text-orange-900 mr-3"
                          title={blockUserTitle}
                          onClick={() => handleBlockUserClick(user)}
                        >
                          <UserX className="h-5 w-5" />
                        </button>
                      ) : user.status === 'blocked' ? (
                        <button
                          className="text-green-600 hover:text-green-900 mr-3"
                          title={unblockUserTitle}
                          onClick={() => handleUnblockUser(user.id)}
                        >
                          <UserCheck className="h-5 w-5" />
                        </button>
                      ) : null}

                      {/* Delete/Restore User */}
                      {user.status === 'pending_deletion' ? (
                        <button
                          className="text-green-600 hover:text-green-900"
                          title={restoreUserTitle}
                          onClick={() => handleDeleteUserClick(user)}
                        >
                          <RotateCcw className="h-5 w-5" />
                        </button>
                      ) : (
                        <button
                          className="text-red-600 hover:text-red-900"
                          title={deleteUserTitle}
                          onClick={() => handleDeleteUserClick(user)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        user={selectedUser}
      />

      {/* Admin Details Modal */}
      <AdminDetailsModal
        isOpen={isAdminDetailsModalOpen}
        onClose={() => {
          console.log('Closing admin details modal');
          setIsAdminDetailsModalOpen(false);
        }}
        user={selectedUser}
      />

      {/* Block User Modal */}
      <BlockUserModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onBlock={handleBlockUser}
        user={selectedUser}
      />

      {/* User Activity Modal */}
      <UserActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        user={selectedUser}
      />

      {/* Delete/Restore User Modal */}
      <ConfirmDeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteUser}
        user={selectedUser}
        isPendingDeletion={selectedUser?.status === 'pending_deletion'}
      />

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        userType={activeTab === 'doctors' ? 'doctor' : activeTab === 'admins' ? 'admin' : 'patient'}
        onSuccess={() => {
          // Refresh user list after successful addition
          const roleFilter = activeTab === 'doctors' ? 'doctor' : activeTab === 'admins' ? 'admin' : 'patient';
          fetchUsers(roleFilter, true).then(setUsers);
        }}
      />
    </div>
  );
};

export default UserManagement;
