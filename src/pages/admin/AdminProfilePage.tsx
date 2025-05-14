import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminProfile from '../../components/admin/AdminProfile';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { Navigate } from 'react-router-dom';

const AdminProfilePage: React.FC = () => {
  const { adminUser } = useAdminAuthStore();

  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <AdminLayout>
      <AdminProfile />
    </AdminLayout>
  );
};

export default AdminProfilePage;
