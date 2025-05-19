import React, { useState, useEffect } from 'react';
import { Star, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { useTestimonialsStore, Testimonial } from '../store/testimonialsStore';
import { useAuthStore } from '../store/authStore';
import { useAdminStore } from '../store/adminStore';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TestimonialsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { testimonials, isLoading: storeLoading, error: storeError, fetchTestimonials, addTestimonial } = useTestimonialsStore();
  const { t, i18n } = useTranslation();

  const [newTestimonial, setNewTestimonial] = useState({
    user_name: '',
    role: '',
    content: '',
    rating: 5,
    image_url: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch testimonials when component mounts
  useEffect(() => {
    const loadTestimonials = async () => {
      console.log("Testimonials page: Loading testimonials...");
      await fetchTestimonials(true); // true = fetch all testimonials

      // إضافة مستمع للتغييرات في متجر التقييمات
      const unsubscribe = useTestimonialsStore.subscribe(
        (state) => state.testimonials,
        (testimonials) => {
          console.log("Testimonials page: Store updated, testimonials count:", testimonials.length);
        }
      );

      // تنظيف المستمع عند إلغاء تحميل المكون
      return () => {
        unsubscribe();
      };
    };

    loadTestimonials();
  }, [fetchTestimonials]);

  // Pre-fill user name if logged in
  useEffect(() => {
    if (user) {
      setNewTestimonial(prev => ({
        ...prev,
        user_name: user.name || user.email.split('@')[0] || ''
      }));
    }
  }, [user]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is logged in
    if (!user) {
      setError(i18n.language === 'ar' ? 'يرجى تسجيل الدخول لإرسال تقرير' : 'Please log in to submit a testimonial');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Use a default image if none provided
      const testimonialData = {
        ...newTestimonial,
        image_url: newTestimonial.image_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(newTestimonial.user_name) + '&background=random'
      };

      console.log('Submitting testimonial:', testimonialData);

      const result = await addTestimonial(testimonialData);

      if (result) {
        console.log('Testimonial submitted successfully');
        setSuccess(t('testimonials.submitSuccess'));
        setNewTestimonial({
          user_name: user.name || user.email.split('@')[0] || '',
          role: '',
          content: '',
          rating: 5,
          image_url: ''
        });

        // Refresh testimonials to show the new one
        await fetchTestimonials(true);

        // تأكد من أن التقييم الجديد موجود في المتجر
        const currentTestimonials = useTestimonialsStore.getState().testimonials;
        console.log('Current testimonials after submission:', currentTestimonials.length);

        // تحديث localStorage يدويًا للتأكد من حفظ التقييم
        try {
          const localStorageKey = 'testimonials-storage';
          const storedData = localStorage.getItem(localStorageKey);
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (parsedData && parsedData.state) {
              parsedData.state.testimonials = currentTestimonials;
              localStorage.setItem(localStorageKey, JSON.stringify(parsedData));
              console.log('Updated localStorage with new testimonial');
            }
          }
        } catch (localStorageError) {
          console.error('Error updating localStorage:', localStorageError);
        }

        // تحديث إحصائيات لوحة التحكم
        try {
          await useAdminStore.getState().fetchStats();
          console.log('Updated dashboard stats after new testimonial submission');
        } catch (statsError) {
          console.error('Error updating dashboard stats:', statsError);
        }
      } else {
        console.error('Failed to submit testimonial');
        throw new Error(t('testimonials.commentError'));
      }
    } catch (err: any) {
      setError(err.message || t('testimonials.commentError'));
    } finally {
      setSubmitting(false);
    }
  };

  // Format date - always use Gregorian calendar
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: 'gregory' // Always use Gregorian calendar even for Arabic
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center"  >{t('testimonials.title')}</h1>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-12"  >
              <h2 className="text-2xl font-semibold mb-6 rtl:text-right"  >{t('testimonials.shareExperience')}</h2>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center"  >
                  <AlertCircle className="w-5 h-5 ltr:mr-2 rtl:ml-2 flex-shrink-0" />
                  <span className="rtl:text-right">{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 flex items-center"  >
                  <CheckCircle className="w-5 h-5 ltr:mr-2 rtl:ml-2 flex-shrink-0" />
                  <span className="rtl:text-right">{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4"  >
                  <label className="block text-gray-700 text-sm font-bold mb-2 rtl:text-right">
                    {t('testimonials.yourName')}
                  </label>
                  <input
                    type="text"
                    value={newTestimonial.user_name}
                    onChange={(e) => setNewTestimonial({...newTestimonial, user_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 rtl:text-right"
                    required
                  />
                </div>

                <div className="mb-4"  >
                  <label className="block text-gray-700 text-sm font-bold mb-2 rtl:text-right">
                    {t('testimonials.yourRole')}
                  </label>
                  <input
                    type="text"
                    value={newTestimonial.role}
                    onChange={(e) => setNewTestimonial({...newTestimonial, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 rtl:text-right"
                    required
                    placeholder={t('testimonials.rolePlaceholder')}
                  />
                </div>

                <div className="mb-4"  >
                  <label className="block text-gray-700 text-sm font-bold mb-2 rtl:text-right">
                    {t('testimonials.yourExperience')}
                  </label>
                  <textarea
                    value={newTestimonial.content}
                    onChange={(e) => setNewTestimonial({...newTestimonial, content: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 rtl:text-right"
                    rows={4}
                    required
                  />
                </div>

                <div className="mb-6"  >
                  <label className="block text-gray-700 text-sm font-bold mb-2 rtl:text-right">
                    {t('testimonials.rating')}
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewTestimonial({...newTestimonial, rating: star})}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= newTestimonial.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div  >
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center">
                        <Loader className="w-5 h-5 animate-spin ltr:mr-2 rtl:ml-2" />
                        {t('testimonials.submitting')}
                      </span>
                    ) : (
                      t('testimonials.submitButton')
                    )}
                  </button>
                </div>
              </form>
            </div>

            {storeLoading ? (
              <div className="flex justify-center py-12" >
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : storeError ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center" >
                <AlertCircle className="w-5 h-5 ltr:mr-2 rtl:ml-2 flex-shrink-0" />
                <span className="rtl:text-right">{t('testimonials.loadError')}: {storeError}</span>
              </div>
            ) : testimonials.length === 0 ? (
              <div className="text-center py-12 text-gray-500" >
                <p className="rtl:text-right">{t('testimonials.noTestimonials')}</p>
              </div>
            ) : (
              <div className="space-y-6"  >
                {testimonials
                  .filter(testimonial => testimonial.approved || testimonial.status === 'approved')
                  .map((testimonial, index) => (
                  <div
                    key={testimonial.id}
                    className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"



                  >
                    <div className="flex items-center mb-4">
                      <img
                        src={testimonial.image_url}
                        alt={testimonial.user_name}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          // If image fails to load, use a default avatar
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.user_name)}&background=random`;
                        }}
                      />
                      <div className="ltr:ml-4 rtl:mr-4">
                        <h3 className="font-semibold rtl:text-right">{testimonial.user_name}</h3>
                        <p className="text-gray-600 text-sm rtl:text-right">{testimonial.role}</p>
                        <div className="flex mt-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 text-yellow-400 fill-current"
                            />
                          ))}
                        </div>
                      </div>
                      <div className="ltr:ml-auto rtl:mr-auto text-xs text-gray-500 rtl:text-right">
                        {formatDate(testimonial.created_at)}
                      </div>
                    </div>
                    <p className="text-gray-700 rtl:text-right">{testimonial.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TestimonialsPage;