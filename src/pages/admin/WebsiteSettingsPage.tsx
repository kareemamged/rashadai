import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import WebsiteSettings from '../../components/admin/WebsiteSettings';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { Activity } from 'lucide-react';

const WebsiteSettingsPage = () => {
  const { adminUser, isLoading } = useAdminAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // تأخير قصير لضمان تحميل جميع البيانات
    const timer = setTimeout(() => {
      setIsReady(true);

      // التحقق من وجود مستخدم مشرف
      if (!adminUser && !isLoading) {
        console.log('No admin user found, redirecting to login page');
        navigate('/admin/login', { state: { from: location } });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [adminUser, isLoading, navigate, location]);

  // إذا كان جاري التحميل أو لم يكتمل التأخير، عرض شاشة التحميل
  if (isLoading || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading website settings...</p>
        </div>
      </div>
    );
  }

  // إذا لم يكن هناك مستخدم مشرف، عرض رسالة التوجيه
  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <WebsiteSettings />
    </AdminLayout>
  );
};

export default WebsiteSettingsPage;
