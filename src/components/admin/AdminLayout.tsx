import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/languageStore';
import {
  Activity,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  FileText,
  Palette,
  ShieldCheck,
  BarChart2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Star,
  Bell,
  User,
  Menu,
  X,
  Type,
  Image,
  Mail
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const signOut = useAuthStore((state) => state.signOut);
  const user = useAuthStore((state) => state.user);
  const { adminUser, signOutAdmin } = useAdminAuthStore();

  // التحقق من وجود مستخدم مشرف
  useEffect(() => {
    if (!adminUser) {
      console.log('No admin user found in AdminLayout, redirecting to login page');
      // استخدام setTimeout لتجنب مشاكل التوجيه
      const timer = setTimeout(() => {
        navigate('/admin/login', { state: { from: location } });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [adminUser, navigate, location]);

  // متغيرات الحالة
  const [isRTL, setIsRTL] = useState(language === 'ar');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // تحديث اتجاه الصفحة عند تغيير اللغة
  useEffect(() => {
    setIsRTL(language === 'ar');
  }, [language]);

  // إغلاق القائمة الجانبية عند النقر خارجها في الشاشات الصغيرة
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth < 1024 && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  const handleSignOut = async () => {
    try {
      console.log('Signing out from admin panel');

      // تسجيل خروج من حساب الأدمن
      if (adminUser) {
        await signOutAdmin();
        console.log('Admin user signed out');
      }

      // تسجيل خروج من حساب المستخدم العادي إذا كان مسجل دخول
      if (user) {
        await signOut();
        console.log('Regular user signed out');
      }

      // استخدام setTimeout لتجنب مشاكل التوجيه
      setTimeout(() => {
        navigate('/admin/login');
      }, 100);
    } catch (error) {
      console.error('Error signing out:', error);
      navigate('/admin/login');
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center">
          {window.designSettings?.logo ? (
            <img src={window.designSettings.logo} alt="Logo" className={`h-8 w-auto ${isRTL ? 'ml-2' : 'mr-2'}`} />
          ) : (
            <Activity className={`h-8 w-8 text-blue-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          )}
          <span className="text-xl font-bold">{window.siteName ? `${window.siteName} Admin` : 'RashadAI Admin'}</span>
        </div>
        <div className="flex items-center">
          {/* User Profile Icon - Mobile */}
          <div className="relative mr-2">
            <div
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="cursor-pointer"
            >
              {adminUser?.avatar ? (
                <img
                  src={adminUser.avatar}
                  alt={adminUser.name || 'Admin'}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  {(adminUser?.name || adminUser?.email || 'A').charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Mobile Profile Dropdown */}
            {profileMenuOpen && (
              <div className="absolute right-0 top-10 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                <div className="py-1">
                  <Link
                    to="/admin/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    {t('admin.profile.title', 'Profile')}
                  </Link>
                  <Link
                    to="/admin/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {t('admin.settings.title', 'Website Settings')}
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('admin.logout', 'Sign Out')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Menu Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar - Fixed on large screens, slide-in on mobile */}
      <div
        ref={sidebarRef}
        className={`bg-white shadow-lg h-screen overflow-y-auto fixed lg:static top-0 ${isRTL ? 'right-0' : 'left-0'} z-40 transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64 translate-x-0' : 'w-64 lg:translate-x-0 ' + (isRTL ? 'translate-x-full' : '-translate-x-full')}`}
      >
        {/* Sidebar Header - Only visible on large screens */}
        <div className="p-4 flex items-center justify-between lg:justify-start">
          <div className="flex items-center">
            {window.designSettings?.logo ? (
              <img src={window.designSettings.logo} alt="Logo" className={`h-8 w-auto ${isRTL ? 'ml-2' : 'mr-2'}`} />
            ) : (
              <Activity className={`h-8 w-8 text-blue-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            )}
            <span className="text-xl font-bold">{window.siteName ? `${window.siteName} Admin` : 'RashadAI Admin'}</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6">
          {/* Dashboard */}
          <Link
            to="/admin/dashboard"
            className={`flex items-center px-4 py-3 ${isActive('/admin/dashboard')
              ? 'bg-blue-50 text-blue-600 font-medium'
              : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}
          >
            <LayoutDashboard className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            {t('admin.dashboard.title', 'Dashboard')}
          </Link>

          {/* Content Management */}
          <Link
            to="/admin/content"
            className={`flex items-center px-4 py-3 ${
              location.pathname.includes('/admin/content')
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <FileText className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            {t('admin.content.title', 'Content Management')}
          </Link>

          {/* User Management */}
          <Link
            to="/admin/users"
            className={`flex items-center px-4 py-3 ${
              location.pathname.includes('/admin/users')
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Users className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            {t('admin.users.title', 'User Management')}
          </Link>

          {/* Design Control */}
          <Link
            to="/admin/design"
            className={`flex items-center px-4 py-3 ${
              isActive('/admin/design')
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Palette className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            {t('admin.design.title', 'Design Control')}
          </Link>

          {/* Texts Control */}
          <Link
            to="/admin/texts"
            className={`flex items-center px-4 py-3 ${
              isActive('/admin/texts')
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Type className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            {t('admin.texts.title', 'Website Texts')}
          </Link>

          {/* Images Control - Temporarily hidden
          <Link
            to="/admin/images"
            className={`flex items-center px-4 py-3 ${
              isActive('/admin/images')
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Image className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            {t('admin.images.title', 'Website Images')}
          </Link>
          */}

          {/* Permissions Manager */}
          <Link
            to="/admin/permissions"
            className={`flex items-center px-4 py-3 ${
              isActive('/admin/permissions')
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <ShieldCheck className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            {t('admin.permissions.title', 'Permissions')}
          </Link>

          {/* Admin Accounts - Temporarily hidden
          {adminUser?.role === 'super_admin' && (
            <Link
              to="/admin/accounts"
              className={`flex items-center px-4 py-3 ${
                isActive('/admin/accounts')
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <Users className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              {t('admin.accounts.title', 'Admin Accounts')}
            </Link>
          )}
          */}

          {/* Profile */}
          <Link
            to="/admin/profile"
            className={`flex items-center px-4 py-3 ${
              isActive('/admin/profile')
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <User className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            {t('admin.profile.title', 'Profile')}
          </Link>

          {/* Website Settings */}
          <Link
            to="/admin/settings"
            className={`flex items-center px-4 py-3 ${
              isActive('/admin/settings')
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Settings className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            {t('admin.settings.title', 'Website Settings')}
          </Link>

          {/* Email Settings */}
          <Link
            to="/admin/email-settings"
            className={`flex items-center px-4 py-3 ${
              isActive('/admin/email-settings')
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Mail className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            {t('admin.settings.emailSettings', 'Email Settings')}
          </Link>

          {/* Logout */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 mt-4"
          >
            <LogOut className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            {t('admin.logout', 'Sign Out')}
          </button>
        </nav>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden lg:ml-0">
        <header className="bg-white shadow-sm hidden lg:block">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">{t('admin.panel', 'Admin Panel')}</h1>

            {/* User info with dropdown menu */}
            <div className="flex items-center relative">
              {adminUser ? (
                <div className="flex items-center">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  >
                    <span className="text-sm text-gray-600 mr-2">
                      {adminUser.name || adminUser.email}
                    </span>
                    {adminUser.avatar ? (
                      <img
                        src={adminUser.avatar}
                        alt={adminUser.name || 'Admin'}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        {(adminUser.name || adminUser.email || 'A').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Profile dropdown menu */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 top-10 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                      <div className="py-1">
                        <Link
                          to="/admin/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          {t('admin.profile.title', 'Profile')}
                        </Link>
                        <Link
                          to="/admin/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          {t('admin.settings.title', 'Website Settings')}
                        </Link>
                        <hr className="my-1" />
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            handleSignOut();
                          }}
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          {t('admin.logout', 'Sign Out')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : user && (
                <div className="flex items-center">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  >
                    <span className="text-sm text-gray-600 mr-2">
                      {user.name || user.email}
                    </span>
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name || 'Admin'}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        {(user.name || user.email || 'A').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Profile dropdown menu */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 top-10 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                      <div className="py-1">
                        <Link
                          to="/admin/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          {t('admin.profile.title', 'Profile')}
                        </Link>
                        <Link
                          to="/admin/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          {t('admin.settings.title', 'Website Settings')}
                        </Link>
                        <hr className="my-1" />
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            handleSignOut();
                          }}
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          {t('admin.logout', 'Sign Out')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout