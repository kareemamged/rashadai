import React from 'react';
import { FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon, Activity } from 'lucide-react';
import '../index.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdminStore } from '../store/adminStore';
import { useLanguageStore } from '../store/languageStore';

const Footer = () => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const { systemSettings } = useAdminStore();
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              {systemSettings?.designSettings?.logo ? (
                <img src={systemSettings.designSettings.logo} alt="Logo" className="h-8 w-auto mr-2" />
              ) : (
                <Activity className="h-8 w-8 text-blue-400 mr-2" />
              )}
              <span className="text-xl font-bold">{systemSettings?.siteName || 'RashadAI'}</span>
            </div>
            <p className={`text-gray-400 mb-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {t('about.subtitle')}
            </p>
            <div className="flex gap-4">
              {systemSettings?.socialMedia?.facebook && (
                <Link to={systemSettings.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <FacebookIcon className="h-5 w-5" />
                </Link>
              )}
              {systemSettings?.socialMedia?.twitter && (
                <Link to={systemSettings.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <TwitterIcon className="h-5 w-5" />
                </Link>
              )}
              {systemSettings?.socialMedia?.instagram && (
                <Link to={systemSettings.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <InstagramIcon className="h-5 w-5" />
                </Link>
              )}
              {systemSettings?.socialMedia?.linkedin && (
                <Link to={systemSettings.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <LinkedinIcon className="h-5 w-5" />
                </Link>
              )}
              {systemSettings?.socialMedia?.youtube && (
                <Link to={systemSettings.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                </Link>
              )}
            </div>
          </div>

          <div className="rtl:text-right">
            <h3 className="text-lg font-semibold mb-4">{t('header.services')}</h3>
            <ul className="space-y-2">
              <li><Link to="/chat" className="text-gray-400 hover:text-white transition-colors">{t('services.service1.title')}</Link></li>
              <li><Link to="#soon" className="text-gray-400 opacity-25 disabled hover:text-white transition-colors">{t('services.service2.title')}</Link></li>
              <li><Link to="#soon" className="text-gray-400 opacity-25 disabled hover:text-white transition-colors">{t('services.service3.title')}</Link></li>
              <li><Link to="#soon" className="text-gray-400 opacity-25 disabled hover:text-white transition-colors">{t('services.service4.title')}</Link></li>
            </ul>
          </div>

          <div className="rtl:text-right">
            <h3 className="text-lg font-semibold mb-4">{t('footer.company')}</h3>
            <ul className="space-y-2">
              <li><Link to="/services" className="text-gray-400 hover:text-white transition-colors">{t('header.services')}</Link></li>
              <li><Link to="/vision" className="text-gray-400 hover:text-white transition-colors">{t('header.ourVision')}</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">{t('header.blog')}</Link></li>
              <li><Link to="/testimonials" className="text-gray-400 hover:text-white transition-colors">{t('header.testimonials')}</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">{t('footer.about')}</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">{t('footer.contact')}</Link></li>
            </ul>
          </div>

          <div className="rtl:text-right">
            <h3 className="text-lg font-semibold mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">{t('footer.terms')}</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link to="/hipaa-compliance" className="text-gray-400 hover:text-white transition-colors">{t('footer.hipaa')}</Link></li>
              <li><Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">{t('footer.cookies')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0 rtl:text-right">
            © 2025 {systemSettings?.siteName || 'RashadAI'}. {t('footer.allRightsReserved')}
          </p>
          <div className="flex space-x-6 rtl:space-x-reverse">
            <Link to="/privacy" className="text-gray-500 hover:text-white text-sm transition-colors">{t('footer.privacy').split(' ')[0]}</Link>
            <Link to="/terms" className="text-gray-500 hover:text-white text-sm transition-colors">{t('footer.terms').split(' ')[0]}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;