import React from 'react';
import { ClipboardCheck, Stethoscope, MessageCircle, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HowItWorks = () => {
  const { t } = useTranslation();
  const steps = [
    {
      icon: <ClipboardCheck className="h-10 w-10 text-blue-600" />,
      title: t('home.howItWorks.step1.title'),
      description: t('home.howItWorks.step1.description'),
      color: "bg-blue-100"
    },
    {
      icon: <Stethoscope className="h-10 w-10 text-teal-600" />,
      title: t('home.howItWorks.step2.title'),
      description: t('home.howItWorks.step2.description'),
      color: "bg-teal-100"
    },
    {
      icon: <MessageCircle className="h-10 w-10 text-purple-600" />,
      title: t('home.howItWorks.step3.title'),
      description: t('home.howItWorks.step3.description'),
      color: "bg-purple-100"
    },
    {
      icon: <Calendar className="h-10 w-10 text-red-600" />,
      title: t('services.service3.title'),
      description: t('services.service3.description') + ` (${t('common.comingSoon')})`,
      color: "bg-red-100"
    }
  ];

  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('home.howItWorks.title')}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('home.howItWorks.subtitle')}
          </p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 transform -translate-y-1/2 hidden md:block"   ></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center">
                  <div className={`${step.color} p-6 rounded-full z-10 shadow-md mb-6`}>
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-center">{step.title}</h3>
                  <p className="text-gray-600 text-center">{step.description}</p>
                </div>
                <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-gray-300 z-0">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center"  >
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg">
            {t('home.hero.ctaButton')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;