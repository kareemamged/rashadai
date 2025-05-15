import React, { useState, useEffect } from 'react';
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
  X
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

  const [contentOpen, setContentOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [isRTL, setIsRTL] = useState(language === 'ar');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    setIsRTL(language === 'ar');
  }, [language]);

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
    <div className="min-h-screen bg-gray-100 flex" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg h-screen overflow-y-auto">
        <div className="p-4 flex items-center">
          <Activity className={`h-8 w-8 text-blue-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          <span className="text-xl font-bold">RashadAI Admin</span>
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
          <div>
            <button
              onClick={() => setContentOpen(!contentOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 ${
                location.pathname.includes('/admin/content')
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <div className="flex items-center">
                <FileText className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                <span>{t('admin.content.title', 'Content Management')}</span>
              </div>
              {contentOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {contentOpen && (
              <div className={`${isRTL ? 'pr-10' : 'pl-10'} py-1`}>
                <Link
                  to="/admin/content/blog"
                  className={`block py-2 px-4 rounded ${
                    isActive('/admin/content/blog')
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {t('admin.content.blog', 'Blog Posts')}
                </Link>
                <Link
                  to="/admin/content/comments"
                  className={`block py-2 px-4 rounded ${
                    isActive('/admin/content/comments')
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {t('admin.content.comments', 'Comments')}
                </Link>
                <Link
                  to="/admin/content/testimonials"
                  className={`block py-2 px-4 rounded ${
                    isActive('/admin/content/testimonials')
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {t('admin.content.testimonials', 'Testimonials')}
                </Link>
              </div>
            )}
          </div>

          {/* User Management */}
          <div>
            <button
              onClick={() => setUsersOpen(!usersOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 ${
                location.pathname.includes('/admin/users')
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <div className="flex items-center">
                <Users className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                <span>{t('admin.users.title', 'User Management')}</span>
              </div>
              {usersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {usersOpen && (
              <div className={`${isRTL ? 'pr-10' : 'pl-10'} py-1`}>
                <Link
                  to="/admin/users/patients"
                  className={`block py-2 px-4 rounded ${
                    isActive('/admin/users/patients')
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {t('admin.users.patients', 'Patients')}
                </Link>
                <Link
                  to="/admin/users/doctors"
                  className={`block py-2 px-4 rounded ${
                    isActive('/admin/users/doctors')
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {t('admin.users.doctors', 'Doctors')}
                </Link>
                <Link
                  to="/admin/users/admins"
                  className={`block py-2 px-4 rounded ${
                    isActive('/admin/users/admins')
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {t('admin.users.admins', 'Administrators')}
                </Link>
              </div>
            )}
          </div>

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

          {/* Admin Accounts - Only visible to super_admin */}
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

          {/* Settings */}
          <Link
            to="/admin/settings"
            className={`flex items-center px-4 py-3 ${
              isActive('/admin/settings')
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Settings className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            {t('admin.settings.title', 'Settings')}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white shadow-sm">
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
                          {t('admin.settings.title', 'Settings')}
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
                          {t('admin.settings.title', 'Settings')}
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

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout