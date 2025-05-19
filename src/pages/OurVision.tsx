import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useTranslation } from 'react-i18next';
import {
  Lightbulb,
  Target,
  TrendingUp,
  Heart,
  Globe,
  Zap,
  Shield,
  Users
} from 'lucide-react';

const OurVision: React.FC = () => {
  const { t, i18n } = useTranslation();
  // No need to track language separately as we're using i18next for all translations
  return (
    <Layout>
      <div className="pt-8 pb-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {t('vision.title')}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {t('vision.subtitle')}
            </p>
          </div>

          {/* Vision Statement Section */}
          <div className="max-w-7xl mx-auto mb-24">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-10 lg:p-12 flex items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 rtl:text-right">{t('vision.mainVision.title')}</h2>
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed rtl:text-right">
                      {t('vision.mainVision.description')}
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-10 lg:p-12 flex items-center">
                  <div>
                    <div className="bg-white/10 p-4 rounded-full inline-flex mb-6">
                      <Lightbulb className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 rtl:text-right">{t('vision.mainVision.title')}</h3>
                    <p className="text-white/90 text-lg leading-relaxed rtl:text-right">
                      {t('vision.mainVision.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Strategic Pillars Section */}
          <div className="max-w-5xl mx-auto mb-24">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">{t('vision.goals.title')}</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto text-center mb-12">
              {t('vision.goals.goal1.description')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Pillar 1 */}
              <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <div className="bg-blue-100 p-3 rounded-full inline-flex mb-4">
                  <Target className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 rtl:text-right">{t('vision.goals.goal1.title')}</h3>
                <p className="text-gray-700 mb-4 rtl:text-right">
                  {t('vision.goals.goal1.description')}
                </p>
                <ul className="list-disc rtl:list-inside text-gray-600 space-y-2 rtl:text-right">
                  <li>
                    {t('vision.goals.goal1.features.multilingual')}
                  </li>
                  <li>
                    {t('vision.goals.goal1.features.lowBandwidth')}
                  </li>
                  <li>
                    {t('vision.goals.goal1.features.affordable')}
                  </li>
                </ul>
              </div>

              {/* Pillar 2 */}
              <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <div className="bg-blue-100 p-3 rounded-full inline-flex mb-4">
                  <TrendingUp className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 rtl:text-right">{t('vision.goals.goal2.title')}</h3>
                <p className="text-gray-700 mb-4 rtl:text-right">
                  {t('vision.goals.goal2.description')}
                </p>
                <ul className="list-disc rtl:list-inside text-gray-600 space-y-2 rtl:text-right">
                  <li>
                    {t('vision.goals.goal2.features.aiImprovement')}
                  </li>
                  <li>
                    {t('vision.goals.goal2.features.validation')}
                  </li>
                  <li>
                    {t('vision.goals.goal2.features.research')}
                  </li>
                </ul>
              </div>

              {/* Pillar 3 */}
              <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <div className="bg-blue-100 p-3 rounded-full inline-flex mb-4">
                  <Heart className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 rtl:text-right">{t('vision.goals.goal3.title')}</h3>
                <p className="text-gray-700 mb-4 rtl:text-right">
                  {t('vision.goals.goal3.description')}
                </p>
                <ul className="list-disc rtl:list-inside text-gray-600 space-y-2 rtl:text-right">
                  <li>
                    {t('vision.goals.goal3.features.empathetic')}
                  </li>
                  <li>
                    {t('vision.goals.goal3.features.mentalHealth')}
                  </li>
                  <li>
                    {t('vision.goals.goal3.features.patientCentered')}
                  </li>
                </ul>
              </div>

              {/* Pillar 4 */}
              <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <div className="bg-blue-100 p-3 rounded-full inline-flex mb-4">
                  <Globe className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 rtl:text-right">{t('vision.goals.goal4.title')}</h3>
                <p className="text-gray-700 mb-4 rtl:text-right">
                  {t('vision.goals.goal4.description')}
                </p>
                <ul className="list-disc rtl:list-inside text-gray-600 space-y-2 rtl:text-right">
                  <li>
                    {t('vision.goals.goal4.features.ngoPartnerships')}
                  </li>
                  <li>
                    {t('vision.goals.goal4.features.localizedInfo')}
                  </li>
                  <li>
                    {t('vision.goals.goal4.features.crossCultural')}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Future Goals Section */}
          <div className="max-w-7xl mx-auto mb-24">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">{t('vision.future.title')}</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto text-center mb-12">
              {t('vision.future.description')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Goal 1 */}
              <div className="bg-gradient-to-b from-blue-50 to-white rounded-xl shadow-md overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-6 mx-auto">
                    <Zap className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-center text-gray-900 mb-4">{t('vision.goals.goal1.title')}</h3>
                  <p className="text-gray-600 text-center">
                    {t('vision.goals.goal1.description')}
                  </p>
                </div>
              </div>

              {/* Goal 2 */}
              <div className="bg-gradient-to-b from-blue-50 to-white rounded-xl shadow-md overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-6 mx-auto">
                    <Shield className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-center text-gray-900 mb-4">{t('vision.goals.goal2.title')}</h3>
                  <p className="text-gray-600 text-center">
                    {t('vision.goals.goal2.description')}
                  </p>
                </div>
              </div>

              {/* Goal 3 */}
              <div className="bg-gradient-to-b from-blue-50 to-white rounded-xl shadow-md overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-6 mx-auto">
                    <Users className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-center text-gray-900 mb-4">{t('vision.goals.goal3.title')}</h3>
                  <p className="text-gray-600 text-center">
                    {t('vision.goals.goal3.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg overflow-hidden">
            <div className="px-8 py-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                {t('home.cta.title')}
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                {t('home.cta.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a href="/consultation" className="inline-block bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg shadow hover:bg-blue-50 transition-colors duration-300">
                  {t('services.service1.cta')}
                </a>
                <a href="/about" className="inline-block bg-transparent text-white border border-white font-semibold px-6 py-3 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors duration-300">
                  {t('footer.about')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OurVision;
