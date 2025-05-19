import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from './store/languageStore';
import ThemeProvider from './components/ThemeProvider';
import Home from './pages/Home';
import TestimonialsPage from './pages/Testimonials';
import BlogPage from './pages/BlogPage';
import PostDetailPage from './pages/PostDetailPage';
import ConsultationForm from './pages/Consultation';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import TermsAndConditions from './pages/TermsAndConditions';
import Services from './pages/Services';
import OurVision from './pages/OurVision';
import AdminPanel from './pages/admin/AdminPanel';
import DashboardPage from './pages/admin/DashboardPage';
import ContentManagementPage from './pages/admin/ContentManagementPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import DesignControlPage from './pages/admin/DesignControlPage';
import PermissionsManagerPage from './pages/admin/PermissionsManagerPage';
import WebsiteSettingsPage from './pages/admin/WebsiteSettingsPage';
import EmailSettingsPage from './pages/admin/EmailSettingsPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import AdminAccountsPage from './pages/admin/AdminAccountsPage';
import TextsPage from './pages/admin/TextsPage';
import ImagesPage from './pages/admin/ImagesPage';
import Cookies from './pages/legal/Cookies';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import HIPAACompliance from './pages/legal/HIPAACompliance';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import NewPassword from './pages/auth/NewPassword';
import EmailConfirmation from './pages/auth/EmailConfirmation';
import Callback from './pages/auth/Callback';
import Chat from './pages/Chat';
import Profile from './pages/profile/Profile';
import ChangePassword from './pages/profile/ChangePassword';
import Settings from './pages/profile/Settings';
import ChatHistory from './pages/profile/ChatHistory';
import SavedMessages from './pages/profile/SavedMessages';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import { ToastProvider } from './components/ToastContainer';
import LanguageTest from './components/LanguageTest';
import NotificationProvider from './components/ui/NotificationProvider';

function App() {
  const { checkAuth } = useAuthStore();
  const { i18n } = useTranslation();
  const { language } = useLanguageStore();

  useEffect(() => {
    // التحقق من حالة المصادقة عند تحميل التطبيق
    const checkAuthentication = async () => {
      try {
        console.log('Checking authentication status on app load');
        await checkAuth();
      } catch (error) {
        console.error('Error checking authentication on app load:', error);
      }
    };

    checkAuthentication();
  }, [checkAuth]);

  // Actualizar el idioma cuando cambie en el store
  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;

      if (language === 'ar') {
        document.body.classList.add('rtl');
        document.body.style.direction = 'rtl';
        document.body.style.textAlign = 'right';
      } else {
        document.body.classList.remove('rtl');
        document.body.style.direction = 'ltr';
        document.body.style.textAlign = 'left';
      }

      // Forzar actualización de la dirección en todos los elementos con dir explícito
      const elementsWithDir = document.querySelectorAll('[dir]');
      elementsWithDir.forEach(el => {
        if (el instanceof HTMLElement) {
          if (language === 'ar') {
            el.dir = 'rtl';
          } else {
            el.dir = 'ltr';
          }
        }
      });
    }
  }, [language, i18n]);

  return (
    <ThemeProvider>
      <NotificationProvider>
        <ToastProvider>
          <Router>
            <Routes>
            <Route path="/" element={<Home />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/consultation" element={<ConsultationForm />} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/category/:category" element={<BlogPage />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
          <Route path="/admin/login" element={<AdminPanel />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/content/*" element={<ContentManagementPage />} />
          <Route path="/admin/users/*" element={<UserManagementPage />} />
          <Route path="/admin/design" element={<DesignControlPage />} />
          <Route path="/admin/texts" element={<TextsPage />} />
          <Route path="/admin/images" element={<ImagesPage />} />
          <Route path="/admin/permissions" element={<PermissionsManagerPage />} />
          <Route path="/admin/settings" element={<WebsiteSettingsPage />} />
          <Route path="/admin/email-settings" element={<EmailSettingsPage />} />
          <Route path="/admin/profile" element={<AdminProfilePage />} />
          <Route path="/admin/accounts" element={<AdminAccountsPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/services" element={<Services />} />
          <Route path="/vision" element={<OurVision />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/hipaa-compliance" element={<HIPAACompliance />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password/update" element={<NewPassword />} />
          <Route path="/reset-password/update/*" element={<NewPassword />} />
          <Route path="/email-confirmation" element={<EmailConfirmation />} />
          <Route path="/auth/email-confirmation" element={<EmailConfirmation />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/chat-history" element={<ProtectedRoute><ChatHistory /></ProtectedRoute>} />
          <Route path="/saved-messages" element={<ProtectedRoute><SavedMessages /></ProtectedRoute>} />
          <Route path="/language-test" element={<LanguageTest />} />
          <Route path="/auth/callback" element={<Callback />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Router>
        </ToastProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
