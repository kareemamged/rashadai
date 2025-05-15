import React from 'react';
import { useTranslation } from 'react-i18next';
import SiteImage from './SiteImage';

const LeadershipSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">
          {t('leadership.title', 'Meet Our Leadership Team')}
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          {t('leadership.description', 'Our team combines expertise in medicine, artificial intelligence, and healthcare technology to create innovative solutions that transform patient care.')}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Leader 1 */}
          <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="h-64 overflow-hidden">
              <SiteImage
                imageKey="team_leader_1"
                alt={t('leadership.leader1.name', 'Dr. Emma Richards')}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="font-bold text-xl mb-1">{t('leadership.leader1.name', 'Dr. Emma Richards')}</h3>
              <p className="text-blue-600 mb-3">{t('leadership.leader1.title', 'Founder & CEO')}</p>
              <p className="text-gray-600">
                {t('leadership.leader1.bio', 'Former Chief of Medicine with 15 years of clinical experience and a passion for healthcare innovation.')}
              </p>
            </div>
          </div>
          
          {/* Leader 2 */}
          <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="h-64 overflow-hidden">
              <SiteImage
                imageKey="team_leader_2"
                alt={t('leadership.leader2.name', 'Dr. Michael Chen')}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="font-bold text-xl mb-1">{t('leadership.leader2.name', 'Dr. Michael Chen')}</h3>
              <p className="text-blue-600 mb-3">{t('leadership.leader2.title', 'Chief Medical Officer')}</p>
              <p className="text-gray-600">
                {t('leadership.leader2.bio', 'Board-certified physician with specialized training in medical informatics and AI applications in healthcare.')}
              </p>
            </div>
          </div>
          
          {/* Leader 3 */}
          <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="h-64 overflow-hidden">
              <SiteImage
                imageKey="team_leader_3"
                alt={t('leadership.leader3.name', 'Sarah Johnson')}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="font-bold text-xl mb-1">{t('leadership.leader3.name', 'Sarah Johnson')}</h3>
              <p className="text-blue-600 mb-3">{t('leadership.leader3.title', 'CTO')}</p>
              <p className="text-gray-600">
                {t('leadership.leader3.bio', 'AI researcher with previous experience at leading tech companies and a focus on ethical AI development.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadershipSection;
