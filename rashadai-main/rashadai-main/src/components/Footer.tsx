import React from 'react';
import { FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon, Activity } from 'lucide-react';
import '../index.css';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Activity className="h-8 w-8 text-blue-400 mr-2" />
              <span className="text-xl font-bold">RashadAI</span>
            </div>
            <p className="text-gray-400 mb-4 rtl:text-right">
              {t('about.subtitle')}
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <LinkedinIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="rtl:text-right">
            <h3 className="text-lg font-semibold mb-4">{t('header.services')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('services.service1.title')}</a></li>
              <li><a href="#soon" className="text-gray-400 opacity-25 disabled hover:text-white transition-colors">{t('services.service2.title')}</a></li>
              <li><a href="#soon" className="text-gray-400 opacity-25 disabled hover:text-white transition-colors">{t('services.service3.title')}</a></li>
              <li><a href="#soon" className="text-gray-400 opacity-25 disabled hover:text-white transition-colors">{t('services.service4.title')}</a></li>
            </ul>
          </div>

          <div className="rtl:text-right">
            <h3 className="text-lg font-semibold mb-4">{t('footer.company')}</h3>
            <ul className="space-y-2">
              <li><a href="/services" className="text-gray-400 hover:text-white transition-colors">{t('header.services')}</a></li>
              <li><a href="/vision" className="text-gray-400 hover:text-white transition-colors">{t('header.ourVision')}</a></li>
              <li><a href="/blog" className="text-gray-400 hover:text-white transition-colors">{t('header.blog')}</a></li>
              <li><a href="/testimonials" className="text-gray-400 hover:text-white transition-colors">{t('header.testimonials')}</a></li>
              <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">{t('footer.about')}</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">{t('footer.contact')}</a></li>
            </ul>
          </div>

          <div className="rtl:text-right">
            <h3 className="text-lg font-semibold mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2">
              <li><a href="/terms" className="text-gray-400 hover:text-white transition-colors">{t('footer.terms')}</a></li>
              <li><a href="/privacy" className="text-gray-400 hover:text-white transition-colors">{t('footer.privacy')}</a></li>
              <li><a href="/hipaa-compliance" className="text-gray-400 hover:text-white transition-colors">{t('footer.hipaa')}</a></li>
              <li><a href="/cookies" className="text-gray-400 hover:text-white transition-colors">{t('footer.cookies')}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0 rtl:text-right">
            {t('footer.copyright')}
          </p>
          <div className="flex space-x-6 rtl:space-x-reverse">
            <a href="/privacy" className="text-gray-500 hover:text-white text-sm transition-colors">{t('footer.privacy').split(' ')[0]}</a>
            <a href="/terms" className="text-gray-500 hover:text-white text-sm transition-colors">{t('footer.terms').split(' ')[0]}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;