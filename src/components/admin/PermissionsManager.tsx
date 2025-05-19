import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/languageStore';
import { useAdminStore } from '../../store/adminStore';
import {
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Check,
  FileText,
  Users,
  Palette,
  Settings
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Role, Permission } from '../../store/adminStore';

const PermissionsManager: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const { roles, fetchRoles } = useAdminStore();
  const [isRTL, setIsRTL] = useState(language === 'ar');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formValues, setFormValues] = useState<{
    name: string;
    description: string;
    permissions: Permission[];
  }>({
    name: '',
    description: '',
    permissions: [
      {
        resource: 'content',
        actions: { view: false, create: false, edit: false, delete: false, approve: false }
      },
      {
        resource: 'users',
        actions: { view: false, create: false, edit: false, delete: false, approve: false }
      },
      {
        resource: 'design',
        actions: { view: false, create: false, edit: false, delete: false, approve: false }
      },
      {
        resource: 'settings',
        actions: { view: false, create: false, edit: false, delete: false, approve: false }
      }
    ]
  });

  // Update RTL state when language changes
  useEffect(() => {
    setIsRTL(language === 'ar');
  }, [language]);

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Update form values when selected role changes
  useEffect(() => {
    if (selectedRole) {
      setFormValues({
        name: selectedRole.name,
        description: selectedRole.description,
        permissions: selectedRole.permissions
      });
    } else {
      setFormValues({
        name: '',
        description: '',
        permissions: [
          {
            resource: 'content',
            actions: { view: false, create: false, edit: false, delete: false, approve: false }
          },
          {
            resource: 'users',
            actions: { view: false, create: false, edit: false, delete: false, approve: false }
          },
          {
            resource: 'design',
            actions: { view: false, create: false, edit: false, delete: false, approve: false }
          },
          {
            resource: 'settings',
            actions: { view: false, create: false, edit: false, delete: false, approve: false }
          }
        ]
      });
    }
  }, [selectedRole]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  // Handle permission checkbox changes
  const handlePermissionChange = (resourceIndex: number, action: string, checked: boolean) => {
    const updatedPermissions = [...formValues.permissions];
    updatedPermissions[resourceIndex].actions = {
      ...updatedPermissions[resourceIndex].actions,
      [action]: checked
    };

    setFormValues({
      ...formValues,
      permissions: updatedPermissions
    });
  };

  // Handle role selection
  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setIsEditing(false);
  };

  // Handle new role creation
  const handleNewRole = () => {
    setSelectedRole(null);
    setIsEditing(true);
    setFormValues({
      name: '',
      description: '',
      permissions: [
        {
          resource: 'content',
          actions: { view: false, create: false, edit: false, delete: false, approve: false }
        },
        {
          resource: 'users',
          actions: { view: false, create: false, edit: false, delete: false, approve: false }
        },
        {
          resource: 'design',
          actions: { view: false, create: false, edit: false, delete: false, approve: false }
        },
        {
          resource: 'settings',
          actions: { view: false, create: false, edit: false, delete: false, approve: false }
        }
      ]
    });
  };

  // Handle edit role
  const handleEditRole = () => {
    setIsEditing(true);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (selectedRole) {
      setFormValues({
        name: selectedRole.name,
        description: selectedRole.description,
        permissions: selectedRole.permissions
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if admin_roles table exists
      const { error: checkError } = await supabase
        .from('admin_roles')
        .select('id')
        .limit(1);

      if (checkError && checkError.message.includes('does not exist')) {
        console.warn('admin_roles table does not exist');
        alert('The admin_roles table does not exist. Please create it first.');
        setIsLoading(false);
        return;
      }

      // Get current user to use as creator/updater
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('You must be logged in to perform this action.');
        setIsLoading(false);
        return;
      }

      if (selectedRole) {
        // Update existing role
        const { error } = await supabase
          .from('admin_roles')
          .update({
            name: formValues.name,
            description: formValues.description,
            permissions: formValues.permissions,
            updated_at: new Date().toISOString(),
            updated_by: user.id
          })
          .eq('id', selectedRole.id);

        if (error) {
          console.error('Error updating role:', error);

          // Check if it's an RLS policy error
          if (error.code === '42501') {
            alert('Permission denied: You do not have permission to update roles. This is likely due to a Row Level Security (RLS) policy restriction.');
          } else {
            throw error;
          }
          return;
        }

        alert(t('admin.permissions.roleUpdated'));
      } else {
        // Create new role
        const { error } = await supabase
          .from('admin_roles')
          .insert({
            name: formValues.name,
            description: formValues.description,
            permissions: formValues.permissions,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: user.id,
            updated_by: user.id
          });

        if (error) {
          console.error('Error creating role:', error);

          // Check if it's an RLS policy error
          if (error.code === '42501') {
            alert('Permission denied: You do not have permission to create roles. This is likely due to a Row Level Security (RLS) policy restriction. Please contact your database administrator to grant you the necessary permissions.');
          } else {
            throw error;
          }
          return;
        }

        alert(t('admin.permissions.roleAdded'));
      }

      // Refresh roles
      fetchRoles();
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error saving role:', error);
      alert(`Error saving role: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle role deletion
  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    if (window.confirm(t('common.confirm'))) {
      setIsLoading(true);

      try {
        const { error } = await supabase
          .from('admin_roles')
          .delete()
          .eq('id', selectedRole.id);

        if (error) {
          console.error('Error deleting role:', error);

          // Check if it's an RLS policy error
          if (error.code === '42501') {
            alert('Permission denied: You do not have permission to delete roles. This is likely due to a Row Level Security (RLS) policy restriction.');
          } else {
            throw error;
          }
          return;
        }

        alert(t('admin.permissions.roleDeleted'));
        setSelectedRole(null);
        fetchRoles();
      } catch (error: any) {
        console.error('Error deleting role:', error);
        alert(`Error deleting role: ${error.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Helper function to get resource icon
  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case 'content':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'users':
        return <Users className="h-5 w-5 text-green-500" />;
      case 'design':
        return <Palette className="h-5 w-5 text-purple-500" />;
      case 'settings':
        return <Settings className="h-5 w-5 text-yellow-500" />;
      default:
        return <ShieldCheck className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('admin.permissions.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">{t('admin.permissions.roles')}</h2>
            <button
              onClick={handleNewRole}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <Plus className="h-5 w-5 mr-1" />
              {t('admin.permissions.addRole')}
            </button>
          </div>

          <div className="p-4">
            {roles.length === 0 ? (
              <p className="text-gray-500 text-center py-4">{t('common.noResults')}</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {roles.map((role) => (
                  <li key={role.id}>
                    <button
                      onClick={() => handleRoleSelect(role)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                        selectedRole?.id === role.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="font-medium text-gray-900">{role.name}</div>
                      <div className="text-sm text-gray-500">{role.description}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Role Details / Edit Form */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
          {!selectedRole && !isEditing ? (
            <div className="p-6 text-center">
              <ShieldCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {t('admin.permissions.selectOrCreateRole')}
              </p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                  {isEditing
                    ? selectedRole
                      ? t('admin.permissions.editRole')
                      : t('admin.permissions.addRole')
                    : selectedRole?.name}
                </h2>

                {!isEditing && selectedRole && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleEditRole}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-5 w-5 mr-1" />
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={handleDeleteRole}
                      className="flex items-center text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5 mr-1" />
                      {t('common.delete')}
                    </button>
                  </div>
                )}

                {isEditing && (
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center text-gray-600 hover:text-gray-800"
                  >
                    <X className="h-5 w-5 mr-1" />
                    {t('common.cancel')}
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.permissions.roleName')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formValues.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.permissions.roleDescription')}
                    </label>
                    <textarea
                      name="description"
                      value={formValues.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                    />
                  </div>

                  <div>
                    <h3 className="text-md font-medium text-gray-700 mb-3">
                      {t('admin.permissions.permissions')}
                    </h3>

                    <div className="space-y-6">
                      {formValues.permissions.map((permission, index) => (
                        <div key={permission.resource} className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-2 flex items-center">
                            {getResourceIcon(permission.resource)}
                            <span className="ml-2 font-medium">
                              {t(`admin.permissions.${permission.resource}Permissions`)}
                            </span>
                          </div>

                          <div className="p-4">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={permission.actions.view}
                                  onChange={(e) => handlePermissionChange(index, 'view', e.target.checked)}
                                  className="mr-2"
                                />
                                {t('admin.permissions.viewPermission')}
                              </label>

                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={permission.actions.create}
                                  onChange={(e) => handlePermissionChange(index, 'create', e.target.checked)}
                                  className="mr-2"
                                />
                                {t('admin.permissions.createPermission')}
                              </label>

                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={permission.actions.edit}
                                  onChange={(e) => handlePermissionChange(index, 'edit', e.target.checked)}
                                  className="mr-2"
                                />
                                {t('admin.permissions.editPermission')}
                              </label>

                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={permission.actions.delete}
                                  onChange={(e) => handlePermissionChange(index, 'delete', e.target.checked)}
                                  className="mr-2"
                                />
                                {t('admin.permissions.deletePermission')}
                              </label>

                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={permission.actions.approve}
                                  onChange={(e) => handlePermissionChange(index, 'approve', e.target.checked)}
                                  className="mr-2"
                                />
                                {t('admin.permissions.approvePermission')}
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      {isLoading ? t('common.loading') : t('common.save')}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      {t('admin.permissions.roleDescription')}
                    </h3>
                    <p className="text-gray-900">{selectedRole?.description}</p>
                  </div>

                  <div>
                    <h3 className="text-md font-medium text-gray-700 mb-3">
                      {t('admin.permissions.permissions')}
                    </h3>

                    <div className="space-y-6">
                      {selectedRole?.permissions.map((permission) => (
                        <div key={permission.resource} className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-2 flex items-center">
                            {getResourceIcon(permission.resource)}
                            <span className="ml-2 font-medium">
                              {t(`admin.permissions.${permission.resource}Permissions`)}
                            </span>
                          </div>

                          <div className="p-4">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                              <div className="flex items-center">
                                {permission.actions.view ? (
                                  <Check className="h-5 w-5 text-green-500 mr-2" />
                                ) : (
                                  <X className="h-5 w-5 text-red-500 mr-2" />
                                )}
                                {t('admin.permissions.viewPermission')}
                              </div>

                              <div className="flex items-center">
                                {permission.actions.create ? (
                                  <Check className="h-5 w-5 text-green-500 mr-2" />
                                ) : (
                                  <X className="h-5 w-5 text-red-500 mr-2" />
                                )}
                                {t('admin.permissions.createPermission')}
                              </div>

                              <div className="flex items-center">
                                {permission.actions.edit ? (
                                  <Check className="h-5 w-5 text-green-500 mr-2" />
                                ) : (
                                  <X className="h-5 w-5 text-red-500 mr-2" />
                                )}
                                {t('admin.permissions.editPermission')}
                              </div>

                              <div className="flex items-center">
                                {permission.actions.delete ? (
                                  <Check className="h-5 w-5 text-green-500 mr-2" />
                                ) : (
                                  <X className="h-5 w-5 text-red-500 mr-2" />
                                )}
                                {t('admin.permissions.deletePermission')}
                              </div>

                              <div className="flex items-center">
                                {permission.actions.approve ? (
                                  <Check className="h-5 w-5 text-green-500 mr-2" />
                                ) : (
                                  <X className="h-5 w-5 text-red-500 mr-2" />
                                )}
                                {t('admin.permissions.approvePermission')}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionsManager;
