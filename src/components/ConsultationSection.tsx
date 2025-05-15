import React from 'react';
import { useTranslation } from 'react-i18next';
import SiteImage from './SiteImage';
import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const ConsultationSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const isRTL = currentLanguage === 'ar';
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className={`flex flex-col ${isRTL ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12`}>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-4">
              {t('consultation.title', 'AI-Powered Medical Consultation')}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {t('consultation.description', 'Get instant medical guidance from our advanced AI system trained on millions of medical records. Available 24/7, secure, and affordable.')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                to="/consultation"
                className="inline-flex justify-center items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                {t('consultation.startButton', 'Start Free Consultation')}
              </Link>
              
              <Link
                to="/about"
                className="inline-flex justify-center items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-md border border-blue-600 hover:bg-blue-50 transition-colors"
              >
                {t('consultation.learnMoreButton', 'Learn More')}
              </Link>
            </div>
          </div>
          
          <div className="md:w-1/2 relative">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <SiteImage
                imageKey="consultation_image"
                alt={t('consultation.imageAlt', 'Doctor consulting with patient')}
                className="w-full h-auto"
              />
            </div>
            
            <div className="absolute bottom-4 left-4 bg-white rounded-md shadow-md p-3 flex items-center">
              <Clock className="h-5 w-5 text-green-500 mr-2" />
              <div>
                <div className="text-sm font-medium">{t('consultation.availability', '24/7 Availability')}</div>
                <div className="text-xs text-gray-500">{t('consultation.comingSoon', 'Coming Soon')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultationSection;
