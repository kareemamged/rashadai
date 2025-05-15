import React from 'react';
import { useTranslation } from 'react-i18next';
import SiteImage from './SiteImage';
import { Activity } from 'lucide-react';

const MissionSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const isRTL = currentLanguage === 'ar';
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            {t('mission.title', 'Revolutionizing Healthcare Through')}
          </h2>
          <div className="text-blue-600 text-3xl font-bold">
            {t('mission.subtitle', 'Artificial Intelligence')}
          </div>
          <p className="mt-4 text-gray-600 max-w-3xl mx-auto">
            {t('mission.description', 'At RashadAI, we\'re dedicated to making healthcare more accessible, accurate, and affordable through the innovative application of artificial intelligence technology.')}
          </p>
        </div>
        
        <div className={`flex flex-col ${isRTL ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12`}>
          <div className="md:w-1/2">
            <h3 className="text-2xl font-bold mb-4">
              {t('mission.sectionTitle', 'Our Mission')}
            </h3>
            
            <p className="text-gray-700 mb-4">
              {t('mission.paragraph1', 'RashadAI was founded with a simple yet powerful mission: to democratize access to quality healthcare through technology. We believe that everyone deserves timely medical guidance, regardless of location, income, or circumstance.')}
            </p>
            
            <p className="text-gray-700 mb-6">
              {t('mission.paragraph2', 'By combining advanced artificial intelligence with medical expertise, we\'re creating solutions that provide preliminary medical assessments, health monitoring, and wellness guidance to individuals worldwide.')}
            </p>
            
            <div className="flex items-center text-blue-600 font-medium">
              <Activity className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('mission.tagline', 'Harnessing AI to make healthcare smarter, faster, and more personalized.')}
            </div>
          </div>
          
          <div className="md:w-1/2">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <SiteImage
                imageKey="mission_image"
                alt={t('mission.imageAlt', 'Doctor analyzing medical data with AI')}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
