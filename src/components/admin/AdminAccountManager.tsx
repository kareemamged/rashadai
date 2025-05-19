import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/languageStore';
import { supabase } from '../../lib/supabase';
import {
  User,
  Mail,
  Lock,
  Save,
  Loader,
  AlertCircle,
  CheckCircle,
  UserPlus,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: string;
}

const AdminAccountManager: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const isRTL = language === 'ar';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([]);

  // Debug state changes
  useEffect(() => {
    console.log('adminAccounts state changed:', adminAccounts);
  }, [adminAccounts]);

  // New admin form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('admin');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Load admin accounts
  useEffect(() => {
    console.log('AdminAccountManager component mounted, loading admin accounts...');
    loadAdminAccounts();
  }, []);

  const loadAdminAccounts = async () => {
    console.log('Loading admin accounts...');
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, name, email, role')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading admin accounts:', error);
        setError(t('admin.accounts.loadError', 'Error loading admin accounts'));
        return;
      }

      console.log('Loaded admin accounts:', data);
      console.log('Setting admin accounts state...');
      setAdminAccounts(data || []);
      console.log('Admin accounts state set:', data?.length || 0, 'accounts');
    } catch (err) {
      console.error('Exception in loadAdminAccounts:', err);
      setError(t('admin.accounts.loadError', 'Error loading admin accounts'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!newAdminName || !newAdminEmail || !newAdminPassword) {
      setError(t('admin.accounts.requiredFields', 'All fields are required'));
      return;
    }

    if (newAdminPassword !== confirmPassword) {
      setError(t('admin.accounts.passwordMismatch', 'Passwords do not match'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Creating admin user with parameters:', {
        p_email: newAdminEmail,
        p_name: newAdminName,
        p_role: newAdminRole,
        p_password: '********' // Masked for security
      });

      // Create admin user with specified password
      const { data, error } = await supabase.rpc('create_admin_user', {
        p_email: newAdminEmail,
        p_name: newAdminName,
        p_role: newAdminRole,
        p_password: newAdminPassword
      });

      if (error) {
        console.error('Error creating admin account:', error);
        setError(t('admin.accounts.createError', 'Error creating admin account'));
        return;
      }

      console.log('Create admin user response:', data);

      if (!data.success) {
        console.error('Failed to create admin account:', data.message);
        setError(data.message || t('admin.accounts.createError', 'Error creating admin account'));
        return;
      }

      console.log('Admin user created successfully with ID:', data.admin_id);

      // Clear form and close modal
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminRole('admin');
      setNewAdminPassword('');
      setConfirmPassword('');
      setIsModalOpen(false);

      // Show success message
      setSuccess(t('admin.accounts.createSuccess', 'Admin account created successfully'));

      // Reload admin accounts
      console.log('Reloading admin accounts after creating new account');
      await loadAdminAccounts();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Exception in handleCreateAdmin:', err);
      setError(t('admin.accounts.createError', 'Error creating admin account'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">{t('admin.accounts.title', 'Admin Accounts')}</h1>
          <button
            onClick={() => loadAdminAccounts()}
            className="ml-3 p-2 text-blue-600 hover:bg-blue-50 rounded-full"
            title={t('common.refresh', 'Refresh')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6"></path>
              <path d="M3 12a9 9 0 0 1 15-6.7l3 2.7"></path>
              <path d="M3 22v-6h6"></path>
              <path d="M21 12a9 9 0 0 1-15 6.7l-3-2.7"></path>
            </svg>
          </button>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <UserPlus className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t('admin.accounts.addAdmin', 'Add New Admin')}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}

      {/* Debug info */}
      <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
        <div>Admin accounts count: {adminAccounts.length}</div>
        <div>Loading state: {isLoading ? 'true' : 'false'}</div>
        <button
          onClick={() => loadAdminAccounts()}
          className="mt-1 px-2 py-1 bg-blue-500 text-white rounded text-xs"
        >
          Force Reload
        </button>
      </div>

      {isLoading && adminAccounts.length === 0 ? (
        <div className="flex justify-center items-center h-40">
          <Loader className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.accounts.name', 'Name')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.accounts.email', 'Email')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.accounts.role', 'Role')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {console.log('Rendering admin accounts:', adminAccounts)}
              {adminAccounts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    {t('admin.accounts.noAccounts', 'No admin accounts found')}
                  </td>
                </tr>
              ) : (
                adminAccounts.map((admin) => (
                  <tr key={admin.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{admin.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {admin.role}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {t('admin.accounts.addAdmin', 'Add New Admin')}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateAdmin}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.accounts.name', 'Name')}
                    </label>
                    <div className="relative rounded-md">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                        placeholder={t('admin.accounts.namePlaceholder', 'Enter admin name')}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.accounts.email', 'Email')}
                    </label>
                    <div className="relative rounded-md">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                        placeholder={t('admin.accounts.emailPlaceholder', 'Enter admin email')}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.accounts.role', 'Role')}
                    </label>
                    <select
                      id="role"
                      value={newAdminRole}
                      onChange={(e) => setNewAdminRole(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full py-2 px-3 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="admin">{t('admin.accounts.roleAdmin', 'Admin')}</option>
                      <option value="super_admin">{t('admin.accounts.roleSuperAdmin', 'Super Admin')}</option>
                      <option value="content_admin">{t('admin.accounts.roleContentAdmin', 'Content Admin')}</option>
                      <option value="moderator">{t('admin.accounts.roleModerator', 'Moderator')}</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.accounts.password', 'Password')}
                    </label>
                    <div className="relative rounded-md">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        id="password"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                        placeholder={t('admin.accounts.passwordPlaceholder', 'Enter password')}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.accounts.confirmPassword', 'Confirm Password')}
                    </label>
                    <div className="relative rounded-md">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                        placeholder={t('admin.accounts.confirmPasswordPlaceholder', 'Confirm password')}
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-blue-300"
                    >
                      {isLoading ? (
                        <>
                          <Loader className="animate-spin h-4 w-4 mr-2" />
                          {t('common.saving', 'Saving...')}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {t('common.save', 'Save')}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      {t('common.cancel', 'Cancel')}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccountManager;
