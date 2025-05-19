import React from 'react';
import Layout from '../components/Layout';
import { useTranslation } from 'react-i18next';
import {
  Stethoscope,
  Brain,
  MessageCircle,
  FileText,
  Clock,
  Shield,
  Users,
  Award,
  Zap,
  BookOpen,
  Activity,
  Heart
} from 'lucide-react';

const Services: React.FC = () => {
  const { t } = useTranslation();


  return (
    <Layout>
      <div className="pt-8 pb-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {t('services.title')}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {t('services.subtitle')}
            </p>
          </div>

          {/* Main Services Section */}
          <div className="max-w-7xl mx-auto mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

              {/* AI Medical Consultation */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"  >
                <div className="p-8">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-6 mx-auto"  >
                    <Brain className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-center text-gray-900 mb-4">{t('services.service1.title')}</h3>
                  <p className="text-gray-600 text-center mb-6">
                    {t('services.service1.description')}
                  </p>
                  <div className="flex justify-center"  >
                    <a href="/consultation" className="text-blue-600 hover:text-blue-800 font-medium">{t('services.service1.cta')} {!document.dir || document.dir === 'ltr' ? '→' : '←'}</a>
                  </div>
                </div>
              </div>

              {/* Specialist Consultation */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"  >
                <div className="p-8">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-6 mx-auto"  >
                    <Stethoscope className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-center text-gray-900 mb-4">{t('services.service3.title')} <span className="text-sm font-normal text-amber-600 ltr:ml-1 rtl:mr-1">({t('common.comingSoon')})</span></h3>
                  <p className="text-gray-600 text-center mb-6">
                    {t('services.service3.description')}
                  </p>
                  <div className="flex justify-center"  >
                    <a href="/consultation" className="text-blue-600 hover:text-blue-800 font-medium">{t('services.service3.cta')} {!document.dir || document.dir === 'ltr' ? '→' : '←'}</a>
                  </div>
                </div>
              </div>

              {/* Follow-up Care */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"  >
                <div className="p-8">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-6 mx-auto"  >
                    <Clock className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-center text-gray-900 mb-4">{t('services.service4.title')} <span className="text-sm font-normal text-amber-600 ltr:ml-1 rtl:mr-1">({t('common.comingSoon')})</span></h3>
                  <p className="text-gray-600 text-center mb-6">
                    {t('services.service4.description')}
                  </p>
                  <div className="flex justify-center"  >
                    <a href="/consultation" className="text-blue-600 hover:text-blue-800 font-medium">{t('services.service4.cta')} {!document.dir || document.dir === 'ltr' ? '→' : '←'}</a>
                  </div>
                </div>
              </div>

              {/* Medical Reports Analysis */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"  >
                <div className="p-8">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-6 mx-auto"  >
                    <FileText className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-center text-gray-900 mb-4">{t('services.service2.title')} <span className="text-sm font-normal text-amber-600 ltr:ml-1 rtl:mr-1">({t('common.comingSoon')})</span></h3>
                  <p className="text-gray-600 text-center mb-6">
                    {t('services.service2.description')}
                  </p>
                  <div className="flex justify-center"  >
                    <a href="/consultation" className="text-blue-600 hover:text-blue-800 font-medium">{t('services.service2.cta')} {!document.dir || document.dir === 'ltr' ? '→' : '←'}</a>
                  </div>
                </div>
              </div>

              {/* Health Chat */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"  >
                <div className="p-8">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-6 mx-auto"  >
                    <MessageCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-center text-gray-900 mb-4">{t('chat.title')}</h3>
                  <p className="text-gray-600 text-center mb-6">
                    {t('chat.placeholder')}
                  </p>
                  <div className="flex justify-center"  >
                    <a href="/chat" className="text-blue-600 hover:text-blue-800 font-medium">{t('chat.startNew')} {!document.dir || document.dir === 'ltr' ? '→' : '←'}</a>
                  </div>
                </div>
              </div>

              {/* Health Education */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"  >
                <div className="p-8">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-6 mx-auto"  >
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-center text-gray-900 mb-4">{t('blog.title')}</h3>
                  <p className="text-gray-600 text-center mb-6">
                    {t('blog.subtitle')}
                  </p>
                  <div className="flex justify-center"  >
                    <a href="/blog" className="text-blue-600 hover:text-blue-800 font-medium">{t('blog.readMore')} {!document.dir || document.dir === 'ltr' ? '→' : '←'}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Services Section */}
          <div className="max-w-4xl mx-auto text-center mb-12"  >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t('services.title')}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-12">
              {t('services.subtitle')}
            </p>
          </div>

          <div className="max-w-7xl mx-auto mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Premium Service 1 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md overflow-hidden p-8"  >
                <div className="flex items-start">
                  <div className="flex-shrink-0"  >
                    <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full">
                      <Activity className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="ml-6 mr-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 rtl:text-right">{t('services.service1.title')}</h3>
                    <p className="text-gray-600 mb-4 rtl:text-right">
                      {t('services.service1.description')}
                    </p>
                    <ul className="list-disc rtl:list-inside text-gray-600 mb-4 rtl:text-right"  >
                      {t('services.service1.features', { returnObjects: true }).map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                    <a href="/consultation" className="text-blue-600 hover:text-blue-800 font-medium rtl:text-right block"  >
                      {t('services.service1.cta')} {!document.dir || document.dir === 'ltr' ? '→' : '←'}
                    </a>
                  </div>
                </div>
              </div>

              {/* Premium Service 2 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md overflow-hidden p-8"  >
                <div className="flex items-start">
                  <div className="flex-shrink-0"  >
                    <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full">
                      <Heart className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="ml-6 mr-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 rtl:text-right">{t('services.service4.title')}</h3>
                    <p className="text-gray-600 mb-4 rtl:text-right">
                      {t('services.service4.description')}
                    </p>
                    <ul className="list-disc rtl:list-inside text-gray-600 mb-4 rtl:text-right"  >
                      {t('services.service4.features', { returnObjects: true }).map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                    <a href="/consultation" className="text-blue-600 hover:text-blue-800 font-medium rtl:text-right block"  >
                      {t('services.service4.cta')} {!document.dir || document.dir === 'ltr' ? '→' : '←'}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Why Choose Us Section */}
          <div className="max-w-4xl mx-auto text-center mb-12 py-8 bg-gradient-to-b from-blue-50 to-white rounded-xl"  >
            <h2 className="text-3xl font-bold text-gray-900 mb-6"   >
              {t('home.features.title')}
            </h2>
            <div className="w-24 h-1 bg-blue-500 mx-auto mb-6"  ></div>
            <p className="text-lg text-gray-600 leading-relaxed mb-12 max-w-3xl mx-auto px-4"  >
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className="max-w-7xl mx-auto mb-16"  >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

              {/* Feature 1 */}
              <div className="text-center bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"   >
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4 mx-auto"  >
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('home.features.feature1.title')}</h3>
                <p className="text-gray-600">
                  {t('home.features.feature1.description')}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"   >
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4 mx-auto"  >
                  <Award className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('home.features.feature2.title')}</h3>
                <p className="text-gray-600">
                  {t('home.features.feature2.description')}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"   >
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4 mx-auto"  >
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('home.features.feature3.title')}</h3>
                <p className="text-gray-600">
                  {t('home.features.feature3.description')}
                </p>
              </div>

              {/* Feature 4 */}
              <div className="text-center bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"   >
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4 mx-auto"  >
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('home.features.feature4.title')}</h3>
                <p className="text-gray-600">
                  {t('home.features.feature4.description')}
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg overflow-hidden"   >
            <div className="px-8 py-12 text-center relative">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"  ></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full translate-x-1/2 translate-y-1/2"  ></div>

              <h2 className="text-3xl font-bold text-white mb-4 relative z-10"  >
                {t('home.cta.title')}
              </h2>
              <div className="w-16 h-1 bg-white opacity-50 mx-auto mb-6"  ></div>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto"  >
                {t('home.cta.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4"  >
                <a href="/consultation" className="inline-block bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg shadow hover:bg-blue-50 transition-all duration-300 hover:scale-105">
                  {t('services.service1.cta')}
                </a>
                <a href="/chat" className="inline-block bg-transparent text-white border border-white font-semibold px-6 py-3 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-300 hover:scale-105">
                  {t('chat.startNew')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Services;
