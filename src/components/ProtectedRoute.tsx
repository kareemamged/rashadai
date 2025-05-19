import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminRoute?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminRoute = false }) => {
  const { user, isLoading, checkAuth } = useAuthStore();
  const { adminUser, isLoading: isAdminLoading } = useAdminAuthStore();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  // استخدام useEffect لتجنب تحديثات الحالة أثناء التصيير
  useEffect(() => {
    // التحقق من حالة المصادقة عند تحميل المكون
    const checkAuthentication = async () => {
      try {
        // التحقق من وجود جلسة صالحة
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          console.debug('No valid session found in ProtectedRoute');
        } else {
          console.debug('Valid session found in ProtectedRoute');
          // تحديث حالة المستخدم في المخزن
          await checkAuth();
        }
      } catch (error) {
        console.error('Error checking authentication in ProtectedRoute:', error);
      } finally {
        // تعيين الحالة إلى جاهزة بعد التحقق
        setIsReady(true);
      }
    };

    checkAuthentication();

    return () => {};
  }, [checkAuth]);

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
