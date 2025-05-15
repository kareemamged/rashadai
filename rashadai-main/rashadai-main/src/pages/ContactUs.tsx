import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../store/languageStore';

const ContactUs: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [formStatus, setFormStatus] = useState<{
    submitted: boolean;
    error: boolean;
    message: string;
  }>({
    submitted: false,
    error: false,
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission with a delay
    setTimeout(() => {
      setIsSubmitting(false);
      setFormStatus({
        submitted: true,
        error: false,
        message: 'Thank you! Your message has been received. We will get back to you shortly.'
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

      // Reset success message after some time
      setTimeout(() => {
        setFormStatus({
          submitted: false,
          error: false,
          message: ''
        });
      }, 5000);
    }, 1500);
  };

  return (
    <Layout>
      <div className={`pt-24 pb-16 bg-gradient-to-b from-blue-50 to-white ${language === 'ar' ? 'font-cairo' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {t('contact.title')} <span className="text-blue-600">{language === 'ar' ? '' : 'With Us'}</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {t('contact.subtitle')}
            </p>
          </div>

          {/* Contact Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              {
                icon: <Mail className="h-6 w-6 text-blue-600" />,
                title: language === 'ar' ? "راسلنا" : "Email Us",
                details: "support@rashadai.com",
                details2: "info@rashadai.com"
              },
              {
                icon: <Phone className="h-6 w-6 text-blue-600" />,
                title: language === 'ar' ? "اتصل بنا" : "Call Us",
                details: "+201286904277",
                details2: language === 'ar' ? "القاهرة، مصر" : "Cairo, Egypt"
              },
              {
                icon: <MapPin className="h-6 w-6 text-blue-600" />,
                title: language === 'ar' ? "زورنا" : "Visit Us",
                details: language === 'ar' ? "لا يوجد مكتب حتى الآن" : "don't have an office yet",
                details2: ""
              },
              {
                icon: <Clock className="h-6 w-6 text-blue-600" />,
                title: language === 'ar' ? "ساعات الدعم" : "Support Hours",
                details: language === 'ar' ? "دعم الدردشة على مدار الساعة" : "24/7 Chat Support",
                details2: language === 'ar' ? "دعم الهاتف: الاثنين-الجمعة، 9-5 بتوقيت شرق الولايات المتحدة" : "Phone Support: Mon-Fri, 9-5 EST"
              }
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg border border-gray-100 flex flex-col items-center text-center">
                <div className="bg-blue-50 p-4 rounded-full inline-flex mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{item.title}</h3>
                <p className="text-gray-600">{item.details}</p>
                <p className="text-gray-600">{item.details2}</p>
              </div>
            ))}
          </div>

          {/* Contact Form & Map Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'ar' ? 'أرسل لنا رسالة' : 'Send Us a Message'}
              </h2>

              {formStatus.submitted && (
                <div className="mb-6 bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-lg flex items-start">
                  <CheckCircle className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'} flex-shrink-0 mt-0.5`} />
                  <p>{language === 'ar' ? 'شكراً لك! تم استلام رسالتك. سنرد عليك قريباً.' : formStatus.message}</p>
                </div>
              )}

              {formStatus.error && (
                <div className="mb-6 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg">
                  <p>{language === 'ar' ? 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.' : formStatus.message}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'ar' ? 'text-right' : ''}`}>
                      {language === 'ar' ? 'الاسم' : 'Your Name'}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'ar' ? 'text-right' : ''}`}>
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="subject" className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'ar' ? 'text-right' : ''}`}>
                    {language === 'ar' ? 'الموضوع' : 'Subject'}
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">{language === 'ar' ? 'اختر موضوعاً' : 'Select a subject'}</option>
                    <option value="General Inquiry">{language === 'ar' ? 'استفسار عام' : 'General Inquiry'}</option>
                    <option value="Technical Support">{language === 'ar' ? 'الدعم الفني' : 'Technical Support'}</option>
                    <option value="Account Help">{language === 'ar' ? 'مساعدة في الحساب' : 'Account Help'}</option>
                    <option value="Billing Question">{language === 'ar' ? 'سؤال عن الفواتير' : 'Billing Question'}</option>
                    <option value="Partnership Opportunity">{language === 'ar' ? 'فرصة شراكة' : 'Partnership Opportunity'}</option>
                    <option value="Other">{language === 'ar' ? 'أخرى' : 'Other'}</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label htmlFor="message" className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'ar' ? 'text-right' : ''}`}>
                    {language === 'ar' ? 'رسالتك' : 'Your Message'}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300 ease-in-out inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed ${language === 'ar' ? 'flex-row-reverse' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className={`animate-spin ${language === 'ar' ? '-mr-1 ml-3' : '-ml-1 mr-3'} h-5 w-5 text-white`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {language === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      {language === 'ar' ? 'إرسال الرسالة' : 'Send Message'}
                      <Send className={`h-4 w-4 ${language === 'ar' ? 'mr-2' : 'ml-2'}`} />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === 'ar' ? 'موقعنا' : 'Our Location'}
              </h2>
              <div className="bg-gray-200 rounded-xl overflow-hidden h-[400px] shadow-md">
                {/* This would be replaced with an actual map in production */}
                <div className="h-full flex items-center justify-center bg-blue-50">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      {language === 'ar' ? 'المقر الرئيسي لRashadAI' : 'RashadAI Headquarters'}
                    </h3>
                    <p className="text-gray-600">
                      {language === 'ar' ? 'لا يوجد مكتب حتى الآن' : "don't have an office yet"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {language === 'ar' ? 'الأسئلة الشائعة حول التواصل' : 'Frequently Asked Contact Questions'}
            </h2>
            <div className="space-y-4">
              {[
                {
                  question: language === 'ar'
                    ? "ما هي سرعة الرد المتوقعة على استفساري؟"
                    : "How quickly can I expect a response to my inquiry?",
                  answer: language === 'ar'
                    ? "بالنسبة للاستفسارات العامة، نهدف إلى الرد في غضون 24 ساعة. بالنسبة لمشكلات الدعم الفني، يمكنك توقع رد في غضون 12 ساعة. دعم الدردشة بالذكاء الاصطناعي متاح على مدار الساعة طوال أيام الأسبوع للمساعدة الفورية في الأسئلة الشائعة."
                    : "For general inquiries, we aim to respond within 24 hours. For technical support issues, you can expect a response within 12 hours. Our AI chat support is available 24/7 for immediate assistance with common questions."
                },
                {
                  question: language === 'ar'
                    ? "هل يمكنني طلب عرض توضيحي لمنصة RashadAI؟"
                    : "Can I request a demo of the RashadAI platform?",
                  answer: language === 'ar'
                    ? "نعم! يمكنك طلب عرض توضيحي مخصص عن طريق اختيار 'فرصة شراكة' في القائمة المنسدلة للموضوع وذكر اهتمامك بالعرض التوضيحي في رسالتك. سيتواصل معك أحد أعضاء فريقنا لتحديد موعد."
                    : "Yes! You can request a personalized demo by selecting 'Partnership Opportunity' in the subject dropdown and mentioning your interest in a demo in your message. One of our team members will reach out to schedule a time."
                },
                {
                  question: language === 'ar'
                    ? "كيف يمكنني الإبلاغ عن مشكلة تقنية في المنصة؟"
                    : "How can I report a technical issue with the platform?",
                  answer: language === 'ar'
                    ? "للمشكلات التقنية، يرجى اختيار 'الدعم الفني' في القائمة المنسدلة للموضوع وتقديم أكبر قدر ممكن من التفاصيل حول المشكلة التي تواجهها، بما في ذلك الجهاز والمتصفح اللذين تستخدمهما."
                    : "For technical issues, please select 'Technical Support' in the subject dropdown and provide as much detail as possible about the problem you're experiencing, including the device and browser you're using."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactUs;