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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('admin.users.title')}</h1>

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
          {t('admin.users.patients')}
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
          {t('admin.users.doctors')}
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
          {t('admin.users.admins')}
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
              <option value="all">{t('common.all')}</option>
              <option value="active">{t('admin.users.active')}</option>
              <option value="blocked">{t('admin.users.blocked')}</option>
              <option value="inactive">{t('admin.users.inactive')}</option>
            </select>
            <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <UserPlus className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {activeTab === 'patients'
              ? t('admin.users.addPatient', 'Add New Patient')
              : activeTab === 'doctors'
                ? t('admin.users.addDoctor', 'Add New Doctor')
                : t('admin.users.addAdmin', 'Add New Admin')
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
                    {t('admin.users.userName')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.users.userEmail')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.users.userStatus')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.users.joinDate')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.users.actions')}
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
                            {user.name || t('admin.users.noName')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.role && (
                          <div className="text-xs text-gray-400 mt-1">
                            {t(`admin.users.role`)}: {user.role}
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
                        {t(`admin.users.${user.status === 'pending_deletion' ? 'pendingDeletion' : user.status}`)}
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
                            {t('admin.users.lastLogin')}: {formatDate(user.last_login, language)}
                          </div>
                        )}
                        {user.status === 'pending_deletion' && user.deletion_scheduled_at && (
                          <div className="flex items-center text-xs text-red-500 mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {t('admin.users.deletionScheduled')}: {formatDate(user.deletion_scheduled_at, language)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* View User Details */}
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title={t('admin.users.viewProfile')}
                        onClick={() => handleViewUserDetails(user)}
                      >
                        <Eye className="h-5 w-5" />
                      </button>

                      {/* View User Activity */}
                      <button
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        title={t('admin.users.userActivity')}
                        onClick={() => handleViewUserActivity(user)}
                      >
                        <Activity className="h-5 w-5" />
                      </button>

                      {/* Block/Unblock User */}
                      {user.status === 'active' ? (
                        <button
                          className="text-orange-600 hover:text-orange-900 mr-3"
                          title={t('admin.users.blockUser')}
                          onClick={() => handleBlockUserClick(user)}
                        >
                          <UserX className="h-5 w-5" />
                        </button>
                      ) : user.status === 'blocked' ? (
                        <button
                          className="text-green-600 hover:text-green-900 mr-3"
                          title={t('admin.users.unblockUser')}
                          onClick={() => handleUnblockUser(user.id)}
                        >
                          <UserCheck className="h-5 w-5" />
                        </button>
                      ) : null}

                      {/* Delete/Restore User */}
                      {user.status === 'pending_deletion' ? (
                        <button
                          className="text-green-600 hover:text-green-900"
                          title={t('admin.users.restoreUser')}
                          onClick={() => handleDeleteUserClick(user)}
                        >
                          <RotateCcw className="h-5 w-5" />
                        </button>
                      ) : (
                        <button
                          className="text-red-600 hover:text-red-900"
                          title={t('admin.users.deleteUser')}
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
