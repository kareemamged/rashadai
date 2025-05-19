import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Brain, Clock, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleConsultation = () => {
    navigate('/consultation');
  };

  const handleAboutUs = () => {
    navigate('/about');
  };

  return (
    <section className="pt-8 pb-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-12 lg:mb-0"  >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6 rtl:text-right">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed rtl:text-right">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse rtl:text-right">
              <button
                onClick={handleConsultation}
                className="bg-primary text-white font-semibold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                 
              >
                {t('home.hero.ctaButton')}
              </button>
              <button
                onClick={handleAboutUs}
                className="bg-white hover:bg-gray-50 text-secondary font-semibold py-3 px-8 rounded-full border border-secondary transition duration-300 ease-in-out shadow-sm"
                 
              >
                {t('home.hero.secondaryButton')}
              </button>
            </div>
          </div>
          <div className="lg:w-1/2"  >
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="AI Medical Consultation"
                className="rounded-xl shadow-2xl w-full object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg"  >
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ltr:ml-3 rtl:mr-3 rtl:text-right">
                    <p className="text-gray-800 font-semibold">{t('home.features.feature1.title')}</p>
                    <p className="text-gray-500 text-sm">{t('common.comingSoon')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-6 rounded-xl shadow-md transition duration-300 hover:shadow-xl"  >
            <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <Stethoscope className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 rtl:text-right">{t('home.features.feature2.title')}</h3>
            <p className="text-gray-600 rtl:text-right">{t('home.features.feature2.description')}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md transition duration-300 hover:shadow-xl"  >
            <div className="bg-teal-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 rtl:text-right">{t('home.features.feature3.title')}</h3>
            <p className="text-gray-600 rtl:text-right">{t('home.features.feature3.description')}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md transition duration-300 hover:shadow-xl"  >
            <div className="bg-purple-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 rtl:text-right">{t('home.features.feature4.title')}</h3>
            <p className="text-gray-600 rtl:text-right">{t('home.features.feature4.description')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;