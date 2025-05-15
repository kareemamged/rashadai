import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { Activity } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminRoute?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminRoute = false }) => {
  const { user, isLoading } = useAuthStore();
  const { adminUser, isLoading: isAdminLoading } = useAdminAuthStore();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  // استخدام useEffect لتجنب تحديثات الحالة أثناء التصيير
  useEffect(() => {
    // تأخير قصير لضمان تحميل جميع البيانات
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // إذا كان جاري التحميل أو لم يكتمل التأخير، عرض شاشة التحميل
  if (isLoading || isAdminLoading || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // إذا لم يكن المستخدم مسجل دخول، توجيهه إلى صفحة تسجيل الدخول المناسبة
  if (!user) {
    // إذا كان المسار يتطلب صلاحيات مشرف، توجيهه إلى صفحة تسجيل دخول المشرف
    if (adminRoute || location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    // وإلا، توجيهه إلى صفحة تسجيل الدخول العادية
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // إذا كان المسار يتطلب صلاحيات مشرف ولكن المستخدم ليس مشرفًا، توجيهه إلى صفحة تسجيل دخول المشرف
  if (adminRoute && !adminUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // إذا كان المستخدم مسجل دخول ولديه الصلاحيات المطلوبة، عرض المحتوى
  return <>{children}</>;
};

export default ProtectedRoute;
