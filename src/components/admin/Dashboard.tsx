import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">Welcome</h2>
            <p className="text-gray-600">Logged in as: {user.email}</p>
            <p className="text-gray-600">Role: {user.role}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard