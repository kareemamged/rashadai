import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Loader } from 'lucide-react';
import { useTestimonialsStore } from '../store/testimonialsStore';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TestimonialsSlider = () => {
  const { testimonials, isLoading, fetchTestimonials, getHighRatedTestimonials } = useTestimonialsStore();
  const { t, i18n } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filteredTestimonials, setFilteredTestimonials] = useState<typeof testimonials>([]);
  const isRTL = i18n.language === 'ar';

  // Fetch testimonials when component mounts
  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  // Filter testimonials with rating > 3 (including pending ones)
  useEffect(() => {
    if (testimonials.length > 0) {
      const highRated = getHighRatedTestimonials();
      console.log('High rated testimonials count:', highRated.length);
      setFilteredTestimonials(highRated);

      // Reset current index when language changes to prevent issues
      setCurrentIndex(0);
    }
  }, [testimonials, getHighRatedTestimonials, i18n.language]);

  const nextTestimonial = () => {
    if (filteredTestimonials.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredTestimonials.length);
  };

  const prevTestimonial = () => {
    if (filteredTestimonials.length === 0) return;
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? filteredTestimonials.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    if (filteredTestimonials.length > 0) {
      const timer = setInterval(() => {
        nextTestimonial();
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [filteredTestimonials.length]);

  if (isLoading) {
    return (
      <section id="testimonials" className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('home.testimonials.title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('home.testimonials.subtitle')}
            </p>
          </div>
          <div className="flex justify-center"  >
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </section>
    );
  }

  if (filteredTestimonials.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-b from-white to-blue-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('home.testimonials.title')}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('home.testimonials.subtitle')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto relative"  >
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(${isRTL ? '' : '-'}${currentIndex * 100}%)`,
              }}
            >
              {filteredTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="w-full flex-shrink-0 px-8"
                >
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                    <div className={`flex items-center mb-4 ${isRTL ? 'text-right' : ''}`}  >
                      <img
                        src={testimonial.image_url}
                        alt={testimonial.user_name}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          // If image fails to load, use a default avatar
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.user_name)}&background=random`;
                        }}
                      />
                      <div className={`${isRTL ? 'mr-3' : 'ml-3'}`}>
                        <h3 className="font-semibold text-base">
                          {testimonial.user_name}
                        </h3>
                        <p className="text-gray-600 text-sm">{testimonial.role}</p>
                        <div className={`flex mt-1 ${isRTL ? '' : ''}`}>
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-3.5 h-3.5 text-yellow-400 fill-current"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className={`text-gray-700 text-base leading-relaxed ${isRTL ? 'text-right' : ''}`}   >
                      {testimonial.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {filteredTestimonials.length > 1 && (
            <>
              <button
                onClick={isRTL ? nextTestimonial : prevTestimonial}
                className={`absolute ${isRTL ? 'right-0 translate-x-3' : 'left-0 -translate-x-3'} top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md text-blue-600 hover:text-blue-700 focus:outline-none transition-transform hover:scale-110`}
                 
              >
                {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>

              <button
                onClick={isRTL ? prevTestimonial : nextTestimonial}
                className={`absolute ${isRTL ? 'left-0 -translate-x-3' : 'right-0 translate-x-3'} top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md text-blue-600 hover:text-blue-700 focus:outline-none transition-transform hover:scale-110`}
                 
              >
                {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>

              <div className="flex justify-center mt-6 gap-2"  >
                {filteredTestimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      currentIndex === index
                        ? 'bg-blue-600 w-5'
                        : 'bg-blue-200 w-2.5 hover:bg-blue-300'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-12"  >
          <Link
            to="/testimonials"
            className={`inline-flex items-center text-blue-600 hover:text-blue-800 font-medium ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            {t('home.testimonials.viewAll')}
            <ChevronRight className={`w-4 h-4 ${isRTL ? 'ml-0 mr-1 rotate-180' : 'ml-1'}`} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSlider;