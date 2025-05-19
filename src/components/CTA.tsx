import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CTA = () => {
  const { t } = useTranslation();
  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6" >
            {t('home.cta.title')}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto"  >
            {t('home.cta.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse"  >
            <a href="/consultation">
              <button
                className="bg-white text-primary hover:bg-blue-50 font-semibold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg inline-flex items-center justify-center"
              >
                {t('home.cta.button')}
                <ArrowRight className="ltr:ml-2 rtl:mr-2 h-5 w-5 rtl:rotate-180" />
              </button>
            </a>
            {/* <button className="disabled bg-gray-500 text-gray-300 border-2 border-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-8 rounded-full transition duration-300 ease-in-out">
              View Pricing Plans
            </button> */}
          </div>

          {/* <div className="mt-12 flex flex-col sm:flex-row items-center justify-center text-white text-sm space-y-4 sm:space-y-0 sm:space-x-12">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span>24/7 support</span>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default CTA;