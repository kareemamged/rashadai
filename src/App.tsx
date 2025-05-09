import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from './store/languageStore';
import Layout from './components/Layout';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import TestimonialsSlider from './components/TestimonialsSlider';
import FAQ from './components/FAQ';
import CTA from './components/CTA';
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
import Cookies from './pages/legal/Cookies';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import HIPAACompliance from './pages/legal/HIPAACompliance';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
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

function App() {
  const { checkAuth } = useAuthStore();
  const { i18n } = useTranslation();
  const { language } = useLanguageStore();

  useEffect(() => {
    // Check authentication status when the app loads
    checkAuth();
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
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            <Layout>
              <Hero />
              <Features />
              <HowItWorks />
              <TestimonialsSlider />
              <FAQ />
              <CTA />
            </Layout>
          } />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/consultation" element={<ConsultationForm />} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/category/:category" element={<BlogPage />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
          <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
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
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/chat-history" element={<ProtectedRoute><ChatHistory /></ProtectedRoute>} />
          <Route path="/saved-messages" element={<ProtectedRoute><SavedMessages /></ProtectedRoute>} />
          <Route path="/language-test" element={<LanguageTest />} />
          <Route path="/auth/callback" element={<Navigate to="/chat" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
