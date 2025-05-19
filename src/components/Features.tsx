import React from 'react';
import {
  Zap,
  HeartPulse,
  FileText,
  PictureInPicture,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Features = () => {
  const { t } = useTranslation();
  const features = [
    {
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      title: t('home.features.feature1.title'),
      description: t('home.features.feature1.description')
    },
    {
      icon: <HeartPulse className="h-6 w-6 text-red-500" />,
      title: t('home.features.feature2.title'),
      description: t('home.features.feature2.description')
    },
    {
      icon: <FileText className="h-6 w-6 text-blue-500" />,
      title: t('home.features.feature3.title'),
      description: t('home.features.feature3.description')
    },
    {
      icon: <PictureInPicture className="h-6 w-6 text-purple-500" />,
      title: t('home.features.feature4.title'),
      description: t('home.features.feature4.description')
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-green-500" />,
      title: t('chat.title'),
      description: t('chat.disclaimer')
    },
    {
      icon: <Calendar className="h-6 w-6 text-indigo-500" />,
      title: t('services.service3.title'),
      description: t('services.service3.description')
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('home.features.title')}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('home.features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-md transition-all duration-300 hover:shadow-xl border border-gray-100"


            >
              <div className="p-3 bg-blue-50 rounded-full inline-flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 rtl:text-right">{feature.title}</h3>
              <p className="text-gray-600 rtl:text-right">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href="#how-it-works"
            className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
          >
            {t('home.howItWorks.title')}
            <svg
              className="ltr:ml-2 rtl:mr-2 w-5 h-5 rtl:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Features;