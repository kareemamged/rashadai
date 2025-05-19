import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminAccountManager from '../../components/admin/AdminAccountManager';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { Navigate } from 'react-router-dom';

const AdminAccountsPage: React.FC = () => {
  const { adminUser } = useAdminAuthStore();

  // Only super_admin can access this page
  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  if (adminUser.role !== 'super_admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <AdminLayout>
      <AdminAccountManager />
    </AdminLayout>
  );
};

export default AdminAccountsPage;
