import React, { useState } from 'react';
import { X, User, Mail, Lock, Loader, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { useUserManagementStore } from '../../store/userManagementStore';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'patient' | 'doctor' | 'admin';
  onSuccess: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  userType,
  onSuccess
}) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language || 'en';
  const isRTL = language === 'ar';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { fetchUsers } = useUserManagementStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Validate inputs
      if (!name || !email || !password) {
        setError(t('common.allFieldsRequired'));
        setIsSubmitting(false);
        return;
      }

      let userData;
      let rpcError;

      // Use different functions based on user type
      if (userType === 'admin') {
        // Use the special admin creation function for admin users
        console.log('Creating admin user with create_admin_user function');
        const response = await supabase.rpc('create_admin_user', {
          p_email: email,
          p_name: name,
          p_role: 'admin',
          p_password: password
        });

        userData = response.data;
        rpcError = response.error;
      } else {
        // Use the regular function for other user types
        console.log(`Creating ${userType} user with create_new_user function`);
        const response = await supabase.rpc('create_new_user', {
          p_email: email,
          p_password: password,
          p_name: name,
          p_role: userType === 'doctor' ? 'doctor' : 'user',
          p_bypass_auth_check: true // تجاوز التحقق من صلاحيات الأدمن لأن auth.uid() يعود بقيمة null
        });

        userData = response.data;
        rpcError = response.error;
      }

      if (rpcError) {
        console.error('Error creating user:', rpcError);

        // Add more helpful error message
        if (rpcError.message.includes('duplicate key') && rpcError.message.includes('email')) {
          setError(t('admin.users.emailAlreadyExists'));
        } else if (rpcError.message.includes('Only administrators')) {
          setError(t('admin.users.adminRequired'));
        } else {
          setError(rpcError.message);
        }

        setIsSubmitting(false);
        return;
      }

      if (!userData || !userData.success) {
        console.error('Failed to create user:', userData?.message || 'Unknown error');

        // Add more helpful error message
        if (userData?.message && userData.message.includes('Only administrators')) {
          setError(t('admin.users.adminRequired'));
        } else {
          setError(userData?.message || t('admin.users.errorCreatingUser'));
        }

        setIsSubmitting(false);
        return;
      }

      // Success
      setSuccess(t('admin.users.userAdded'));

      // Refresh user list
      // Convert userType to the format expected by fetchUsers
      const role = userType === 'patient' ? 'patient' : userType === 'doctor' ? 'doctor' : 'admin';
      await fetchUsers(role, true);

      // Reset form
      setName('');
      setEmail('');
      setPassword('');

      // Notify parent component
      onSuccess();

      // Close modal after a delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error('Error adding user:', error);
      setError(error.message || t('common.unknownError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 ${isRTL ? 'ml-4' : 'mr-4'}`}>
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {userType === 'patient'
                    ? t('admin.users.addPatient')
                    : userType === 'doctor'
                      ? t('admin.users.addDoctor')
                      : t('admin.users.addAdmin')}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {t('admin.users.addUserDescription')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.users.name')}
              </label>
              <div className="relative rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  placeholder={t('admin.users.name')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.users.email')}
              </label>
              <div className="relative rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  placeholder={t('admin.users.email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('common.password')}
              </label>
              <div className="relative rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  placeholder={t('common.password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                disabled={isSubmitting}
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={onClose}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                    {t('common.loading')}
                  </>
                ) : (
                  t('common.create')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
