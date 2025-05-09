import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  Activity,
  LayoutDashboard,
  Users,
  Settings,
  LogOut
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const signOut = useAuthStore((state) => state.signOut);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 flex items-center">
          <Activity className="h-8 w-8 text-blue-600 mr-2" />
          <span className="text-xl font-bold">RashadAI Admin</span>
        </div>
        
        <nav className="mt-8">
          <a
            href="/admin/dashboard"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          >
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Dashboard
          </a>
          
          <a
            href="/admin/users"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          >
            <Users className="h-5 w-5 mr-3" />
            Admin Users
          </a>
          
          <a
            href="/admin/settings"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          >
            <Settings className="h-5 w-5 mr-3" />
            Site Settings
          </a>
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4">
            <h1 className="text-xl font-semibold">Admin Panel</h1>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout