import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Shield, FileText, Cookie, Settings, Bell, ExternalLink, Info, HelpCircle, ChevronDown, ChevronUp, Check, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/languageStore';
import { Link } from 'react-router-dom';

const Cookies: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const { t: _t } = useTranslation(); // t is imported but not used yet
  const { language } = useLanguageStore();

  const toggleFaq = (index: number) => {
    if (activeFaq === index) {
      setActiveFaq(null);
    } else {
      setActiveFaq(index);
    }
  };

  const faqs = language === 'ar' ? [
    {
      question: "ماذا يحدث إذا قمت بتعطيل ملفات تعريف الارتباط؟",
      answer: "قد يؤثر تعطيل ملفات تعريف الارتباط على تجربة التصفح الخاصة بك. ملفات تعريف الارتباط الأساسية ضرورية لكي يعمل الموقع بشكل صحيح. إذا قمت بتعطيل ملفات تعريف الارتباط الوظيفية أو التحليلية، فقد لا تعمل بعض الميزات كما هو متوقع."
    },
    {
      question: "هل تستخدم ملفات تعريف الارتباط لتتبع معلوماتي الشخصية؟",
      answer: "نحن نستخدم ملفات تعريف الارتباط لتحسين تجربتك على موقعنا، لكننا لا نستخدمها لجمع معلومات تعريف شخصية دون موافقتك. تجمع ملفات تعريف الارتباط التحليلية الخاصة بنا بيانات مجهولة لمساعدتنا على فهم كيفية تفاعل المستخدمين مع موقعنا."
    },
    {
      question: "كم من الوقت تبقى ملفات تعريف الارتباط على جهازي؟",
      answer: "تختلف المدة حسب نوع ملف تعريف الارتباط. ملفات تعريف الارتباط الخاصة بالجلسة مؤقتة وتنتهي صلاحيتها عند إغلاق المتصفح. تظل ملفات تعريف الارتباط الدائمة على جهازك حتى تنتهي صلاحيتها أو تحذفها يدويًا."
    },
    {
      question: "هل يمكنني السماح بملفات تعريف ارتباط معينة بشكل انتقائي؟",
      answer: "نعم، يمكنك إدارة تفضيلات ملفات تعريف الارتباط الخاصة بك من خلال أداة موافقة ملفات تعريف الارتباط الخاصة بنا أو إعدادات المتصفح الخاص بك. يتيح لك ذلك قبول أو رفض فئات محددة من ملفات تعريف الارتباط بناءً على تفضيلاتك."
    }
  ] : [
    {
      question: "What happens if I disable cookies?",
      answer: "Disabling cookies may affect your browsing experience. Essential cookies are necessary for the website to function properly. If you disable functional or analytics cookies, some features may not work as expected."
    },
    {
      question: "Do you use cookies to track my personal information?",
      answer: "We use cookies to improve your experience on our website, but we do not use them to collect personally identifiable information without your consent. Our analytics cookies collect anonymous data to help us understand how users interact with our website."
    },
    {
      question: "How long do cookies stay on my device?",
      answer: "The duration varies depending on the type of cookie. Session cookies are temporary and expire when you close your browser. Persistent cookies remain on your device until they expire or you delete them manually."
    },
    {
      question: "Can I selectively allow certain cookies?",
      answer: "Yes, you can manage your cookie preferences through our cookie consent tool or your browser settings. This allows you to accept or reject specific categories of cookies based on your preferences."
    }
  ];

  return (
    <Layout>
      <div className={`pt-8 pb-16 bg-white ${language === 'ar' ? 'font-cairo' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {language === 'ar' ? 'سياسة ملفات تعريف الارتباط' : 'Cookie Policy'}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {language === 'ar'
                ? 'معلومات حول كيفية استخدام رشاد AI لملفات تعريف الارتباط والتقنيات المماثلة على منصتنا.'
                : 'Information about how RashadAI uses cookies and similar technologies on our platform.'
              }
            </p>
            <div className="flex justify-center mt-8">
              <span className="text-sm text-gray-500">
                {language === 'ar' ? 'آخر تحديث: 10 مايو 2024' : 'Last Updated: May 10, 2024'}
              </span>
            </div>

            {/* Quick Navigation */}
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {(language === 'ar'
                ? ['ما هي ملفات تعريف الارتباط', 'كيف نستخدم ملفات تعريف الارتباط', 'أنواع ملفات تعريف الارتباط', 'إدارة ملفات تعريف الارتباط', 'الموافقة على ملفات تعريف الارتباط', 'الأسئلة الشائعة']
                : ['What Are Cookies', 'How We Use Cookies', 'Types of Cookies', 'Managing Cookies', 'Cookie Consent', 'FAQ']
              ).map((section, index) => (
                <Link
                  key={section}
                  to={`#${(language === 'ar'
                    ? ['what-are-cookies', 'how-we-use-cookies', 'types-of-cookies', 'managing-cookies', 'cookie-consent', 'faq'][index]
                    : section.toLowerCase().replace(/\s+/g, '-')
                  )}`}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  {section}
                </Link>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md mb-12">
            <div className="prose prose-lg max-w-none prose-blue">
              <section id="what-are-cookies" className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <Cookie className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'ما هي ملفات تعريف الارتباط' : 'What Are Cookies'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'ar'
                    ? 'ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم وضعها على جهاز الكمبيوتر أو الجهاز المحمول الخاص بك عند زيارة موقعنا. يتم استخدامها على نطاق واسع لجعل مواقع الويب تعمل بكفاءة أكبر وتوفير معلومات مفيدة لأصحاب المواقع.'
                    : 'Cookies are small text files that are placed on your computer or mobile device when you visit our website. They are widely used to make websites work more efficiently and provide useful information to website owners.'
                  }
                </p>
                <p className="text-gray-700 mb-4">
                  {language === 'ar'
                    ? 'تسمح لنا ملفات تعريف الارتباط بالتعرف على جهازك وتزويدك بتجربة مخصصة على موقعنا. كما أنها تساعدنا على فهم كيفية استخدام موقعنا حتى نتمكن من تحسين وظائفه ومحتواه.'
                    : 'Cookies allow us to recognize your device and provide you with a personalized experience on our website. They also help us understand how our website is being used so we can improve its functionality and content.'
                  }
                </p>
                <div className="bg-blue-50 p-4 rounded-lg mt-4">
                  <div className={`flex items-start ${language === 'ar' ? '' : ''}`}>
                    <AlertCircle className={`h-5 w-5 text-blue-600 mt-0.5 ${language === 'ar' ? 'ml-2' : 'mr-2'} flex-shrink-0`} />
                    <p className={`text-blue-800 text-sm ${language === 'ar' ? 'text-right' : ''}`}>
                      {language === 'ar'
                        ? 'عند زيارة موقعنا للمرة الأولى، سنعرض لك شريط ملفات تعريف الارتباط الذي يسمح لك باختيار أنواع ملفات تعريف الارتباط التي تريد قبولها. يمكنك تغيير تفضيلاتك في أي وقت من خلال أداة موافقة ملفات تعريف الارتباط الخاصة بنا.'
                        : 'When you visit our website for the first time, we will show you a cookie banner that allows you to choose which types of cookies you want to accept. You can change your preferences at any time through our Cookie Consent tool.'
                      }
                    </p>
                  </div>
                </div>
              </section>

              <section id="how-we-use-cookies" className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <Info className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'كيف نستخدم الكوكيز' : 'How We Use Cookies'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'ar'
                    ? 'في RashadAI، نستخدم الكوكيز لأغراض متعددة، منها:'
                    : 'At RashadAI, we use cookies for various purposes, including:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  {language === 'ar' ? (
                    <>
                      <li><strong>المصادقة والأمان</strong> - للحفاظ على تسجيل دخولك وحماية بياناتك</li>
                      <li><strong>التفضيلات</strong> - لتذكر إعداداتك وتفضيلاتك للزيارات المستقبلية</li>
                      <li><strong>التحليلات</strong> - لفهم كيفية تفاعل الزوار مع موقعنا</li>
                      <li><strong>الأداء</strong> - لتحسين سرعة ووظائف موقعنا</li>
                      <li><strong>التخصيص</strong> - لتقديم محتوى وتوصيات مخصصة</li>
                      <li><strong>الوظائف</strong> - لتعزيز الميزات والخدمات المتاحة لك</li>
                    </>
                  ) : (
                    <>
                      <li><strong>Authentication and Security</strong> - To keep you signed in to your account and protect your data</li>
                      <li><strong>Preferences</strong> - To remember your settings and preferences for future visits</li>
                      <li><strong>Analytics</strong> - To understand how visitors interact with our website</li>
                      <li><strong>Performance</strong> - To improve the speed and functionality of our website</li>
                      <li><strong>Personalization</strong> - To provide personalized content and recommendations</li>
                      <li><strong>Functionality</strong> - To enhance the features and services available to you</li>
                    </>
                  )}
                </ul>
                <p className="text-gray-700 mt-4">
                  {language === 'ar'
                    ? 'نحن نحترم خصوصيتك ونستخدم فقط الكوكيز الضرورية لتشغيل موقعنا بشكل صحيح أو التي تحسن تجربتك. يمكنك التحكم في الكوكيز التي تقبلها من خلال أداة الموافقة على الكوكيز الخاصة بنا.'
                    : 'We respect your privacy and only use cookies that are necessary for the proper functioning of our website or that improve your experience. You can control which cookies you accept through our Cookie Consent tool.'}
                </p>
              </section>


              <section id="types-of-cookies" className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <FileText className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'أنواع ملفات تعريف الارتباط التي نستخدمها' : 'Types of Cookies We Use'}
                </h2>

                {/* Cookie Type Tabs */}
                <div className="mb-6 border-b border-gray-200">
                  <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                    <li className="mr-2">
                      <button
                        onClick={() => setActiveTab('all')}
                        className={`inline-block p-4 rounded-t-lg ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-600'}`}
                      >
                        {language === 'ar' ? 'جميع ملفات تعريف الارتباط' : 'All Cookies'}
                      </button>
                    </li>
                    <li className="mr-2">
                      <button
                        onClick={() => setActiveTab('essential')}
                        className={`inline-block p-4 rounded-t-lg ${activeTab === 'essential' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-600'}`}
                      >
                        {language === 'ar' ? 'أساسية' : 'Essential'}
                      </button>
                    </li>
                    <li className="mr-2">
                      <button
                        onClick={() => setActiveTab('functional')}
                        className={`inline-block p-4 rounded-t-lg ${activeTab === 'functional' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-600'}`}
                      >
                        {language === 'ar' ? 'وظيفية' : 'Functional'}
                      </button>
                    </li>
                    <li className="mr-2">
                      <button
                        onClick={() => setActiveTab('analytics')}
                        className={`inline-block p-4 rounded-t-lg ${activeTab === 'analytics' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-600'}`}
                      >
                        {language === 'ar' ? 'تحليلات' : 'Analytics'}
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab('marketing')}
                        className={`inline-block p-4 rounded-t-lg ${activeTab === 'marketing' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-600'}`}
                      >
                        {language === 'ar' ? 'تسويق' : 'Marketing'}
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="space-y-6">
                  {(activeTab === 'all' || activeTab === 'essential') && (
                    <div className={`bg-gray-50 p-4 rounded-lg border-green-500 ${language === 'ar' ? 'border-r-4' : 'border-l-4'}`}>
                      <div className={`flex items-center mb-2 ${language === 'ar' ? '' : ''}`}>
                        <Check className={`h-5 w-5 text-green-500 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                        <h3 className="font-semibold text-gray-800">{language === 'ar' ? 'ملفات تعريف الارتباط الأساسية' : 'Essential Cookies'}</h3>
                      </div>
                      <p className={`text-gray-700 ${language === 'ar' ? 'text-right' : ''}`}>
                        {language === 'ar'
                          ? 'ملفات تعريف الارتباط هذه مطلوبة لكي يعمل الموقع بشكل صحيح. فهي تمكّن الوظائف الأساسية مثل الأمان وإدارة الشبكة والوصول إلى الحساب. لا يمكنك تعطيل ملفات تعريف الارتباط هذه لأن الموقع لن يعمل بشكل صحيح بدونها.'
                          : 'These cookies are required for the website to function properly. They enable core functionality such as security, network management, and account access. You cannot disable these cookies as the website would not function properly without them.'
                        }
                      </p>
                      <div className={`mt-3 text-sm text-gray-500 ${language === 'ar' ? 'text-right' : ''}`}>
                        <span className="font-medium">{language === 'ar' ? 'المدة:' : 'Duration:'}</span> {language === 'ar' ? 'من جلسة إلى سنة واحدة' : 'Session to 1 year'}
                      </div>
                    </div>
                  )}

                  {(activeTab === 'all' || activeTab === 'functional') && (
                    <div className={`bg-gray-50 p-4 rounded-lg border-blue-500 ${language === 'ar' ? 'border-r-4' : 'border-l-4'}`}>
                      <div className={`flex items-center mb-2 ${language === 'ar' ? '' : ''}`}>
                        <Check className={`h-5 w-5 text-blue-500 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                        <h3 className="font-semibold text-gray-800">{language === 'ar' ? 'ملفات تعريف الارتباط الوظيفية' : 'Functional Cookies'}</h3>
                      </div>
                      <p className={`text-gray-700 ${language === 'ar' ? 'text-right' : ''}`}>
                        {language === 'ar'
                          ? 'تمكننا ملفات تعريف الارتباط هذه من توفير وظائف وتخصيص محسّنين. قد يتم تعيينها من قبلنا أو من قبل مزودي خدمات خارجيين أضفنا خدماتهم إلى صفحاتنا. إذا قمت بتعطيل ملفات تعريف الارتباط هذه، فقد لا تعمل بعض أو كل هذه الخدمات بشكل صحيح.'
                          : 'These cookies enable us to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages. If you disable these cookies, some or all of these services may not function properly.'
                        }
                      </p>
                      <div className={`mt-3 text-sm text-gray-500 ${language === 'ar' ? 'text-right' : ''}`}>
                        <span className="font-medium">{language === 'ar' ? 'المدة:' : 'Duration:'}</span> {language === 'ar' ? '30 يومًا إلى سنة واحدة' : '30 days to 1 year'}
                      </div>
                    </div>
                  )}

                  {(activeTab === 'all' || activeTab === 'analytics') && (
                    <div className={`bg-gray-50 p-4 rounded-lg border-purple-500 ${language === 'ar' ? 'border-r-4' : 'border-l-4'}`}>
                      <div className={`flex items-center mb-2 ${language === 'ar' ? '' : ''}`}>
                        <Check className={`h-5 w-5 text-purple-500 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                        <h3 className="font-semibold text-gray-800">{language === 'ar' ? 'ملفات تعريف الارتباط التحليلية' : 'Analytics Cookies'}</h3>
                      </div>
                      <p className={`text-gray-700 ${language === 'ar' ? 'text-right' : ''}`}>
                        {language === 'ar'
                          ? 'تساعدنا ملفات تعريف الارتباط هذه على فهم كيفية تفاعل الزوار مع موقعنا من خلال جمع المعلومات والإبلاغ عنها بشكل مجهول. تسمح لنا بحساب الزيارات ومصادر حركة المرور حتى نتمكن من قياس وتحسين أداء موقعنا.'
                          : 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. They allow us to count visits and traffic sources so we can measure and improve the performance of our site.'
                        }
                      </p>
                      <div className={`mt-3 text-sm text-gray-500 ${language === 'ar' ? 'text-right' : ''}`}>
                        <span className="font-medium">{language === 'ar' ? 'المدة:' : 'Duration:'}</span> {language === 'ar' ? 'يوم واحد إلى سنتين' : '1 day to 2 years'}
                      </div>
                    </div>
                  )}

                  {(activeTab === 'all' || activeTab === 'marketing') && (
                    <div className={`bg-gray-50 p-4 rounded-lg border-orange-500 ${language === 'ar' ? 'border-r-4' : 'border-l-4'}`}>
                      <div className={`flex items-center mb-2 ${language === 'ar' ? '' : ''}`}>
                        <Check className={`h-5 w-5 text-orange-500 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                        <h3 className="font-semibold text-gray-800">{language === 'ar' ? 'ملفات تعريف الارتباط التسويقية' : 'Marketing Cookies'}</h3>
                      </div>
                      <p className={`text-gray-700 ${language === 'ar' ? 'text-right' : ''}`}>
                        {language === 'ar'
                          ? 'تُستخدم ملفات تعريف الارتباط هذه لتتبع الزوار عبر مواقع الويب. يتم تعيينها لعرض إعلانات مستهدفة بناءً على اهتماماتك وسلوكك عبر الإنترنت. كما أنها تساعد في قياس فعالية الحملات الإعلانية.'
                          : 'These cookies are used to track visitors across websites. They are set to display targeted advertisements based on your interests and online behavior. They also help measure the effectiveness of advertising campaigns.'
                        }
                      </p>
                      <div className={`mt-3 text-sm text-gray-500 ${language === 'ar' ? 'text-right' : ''}`}>
                        <span className="font-medium">{language === 'ar' ? 'المدة:' : 'Duration:'}</span> {language === 'ar' ? '30 يومًا إلى سنة واحدة' : '30 days to 1 year'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Cookie Table */}
                <div className="mt-8 overflow-y-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className={`py-3.5 pl-4 pr-3 text-sm font-semibold text-gray-900 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          {language === 'ar' ? 'اسم ملف تعريف الارتباط' : 'Cookie Name'}
                        </th>
                        <th scope="col" className={`px-3 py-3.5 text-sm font-semibold text-gray-900 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          {language === 'ar' ? 'النوع' : 'Type'}
                        </th>
                        <th scope="col" className={`px-3 py-3.5 text-sm font-semibold text-gray-900 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          {language === 'ar' ? 'الغرض' : 'Purpose'}
                        </th>
                        <th scope="col" className={`px-3 py-3.5 text-sm font-semibold text-gray-900 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          {language === 'ar' ? 'المدة' : 'Duration'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      <tr>
                        <td className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 ${language === 'ar' ? 'text-right' : ''}`}>auth_session</td>
                        <td className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 ${language === 'ar' ? 'text-right' : ''}`}>
                          {language === 'ar' ? 'أساسية' : 'Essential'}
                        </td>
                        <td className={`px-3 py-4 text-sm text-gray-500 ${language === 'ar' ? 'text-right' : ''}`}>
                          {language === 'ar' ? 'المصادقة وإدارة الجلسة' : 'Authentication and session management'}
                        </td>
                        <td className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 ${language === 'ar' ? 'text-right' : ''}`}>
                          {language === 'ar' ? 'الجلسة' : 'Session'}
                        </td>
                      </tr>
                      <tr>
                        <td className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 ${language === 'ar' ? 'text-right' : ''}`}>user_preferences</td>
                        <td className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 ${language === 'ar' ? 'text-right' : ''}`}>
                          {language === 'ar' ? 'وظيفية' : 'Functional'}
                        </td>
                        <td className={`px-3 py-4 text-sm text-gray-500 ${language === 'ar' ? 'text-right' : ''}`}>
                          {language === 'ar' ? 'تخزين تفضيلات وإعدادات المستخدم' : 'Stores user preferences and settings'}
                        </td>
                        <td className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 ${language === 'ar' ? 'text-right' : ''}`}>
                          {language === 'ar' ? 'سنة واحدة' : '1 year'}
                        </td>
                      </tr>
                      <tr>
                        <td className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 ${language === 'ar' ? 'text-right' : ''}`}>_ga</td>
                        <td className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 ${language === 'ar' ? 'text-right' : ''}`}>
                          {language === 'ar' ? 'تحليلات' : 'Analytics'}
                        </td>
                        <td className={`px-3 py-4 text-sm text-gray-500 ${language === 'ar' ? 'text-right' : ''}`}>
                          {language === 'ar' ? 'تحليلات جوجل - تمييز المستخدمين' : 'Google Analytics - Distinguishes users'}
                        </td>
                        <td className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 ${language === 'ar' ? 'text-right' : ''}`}>
                          {language === 'ar' ? 'سنتان' : '2 years'}
                        </td>
                      </tr>
                      <tr>
                        <td className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 ${language === 'ar' ? 'text-right' : ''}`}>_fbp</td>
                        <td className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 ${language === 'ar' ? 'text-right' : ''}`}>
                          {language === 'ar' ? 'تسويق' : 'Marketing'}
                        </td>
                        <td className={`px-3 py-4 text-sm text-gray-500 ${language === 'ar' ? 'text-right' : ''}`}>
                          {language === 'ar' ? 'بيكسل فيسبوك - تتبع التحويلات' : 'Facebook Pixel - Tracks conversions'}
                        </td>
                        <td className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 ${language === 'ar' ? 'text-right' : ''}`}>
                          {language === 'ar' ? '90 يوم' : '90 days'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section id="managing-cookies" className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <Settings className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'إدارة ملفات تعريف الارتباط' : 'Managing Cookies'}
                </h2>
                <p className={`text-gray-700 mb-4 ${language === 'ar' ? 'text-right' : ''}`}>
                  {language === 'ar'
                    ? 'يمكنك التحكم في ملفات تعريف الارتباط وإدارتها بطرق مختلفة. يرجى الأخذ في الاعتبار أن إزالة أو حظر ملفات تعريف الارتباط يمكن أن يؤثر على تجربة المستخدم الخاصة بك وقد لا تكون أجزاء من موقعنا متاحة بالكامل.'
                    : 'You can control and manage cookies in various ways. Please keep in mind that removing or blocking cookies can impact your user experience and parts of our website may no longer be fully accessible.'
                  }
                </p>

                <div className={`bg-yellow-50 ${language === 'ar' ? 'border-r-4' : 'border-l-4'} border-yellow-400 p-4 rounded mb-6`}>
                  <h3 className={`text-lg font-semibold text-yellow-800 mb-2 ${language === 'ar' ? 'text-right' : ''}`}>
                    {language === 'ar' ? 'إعدادات المتصفح' : 'Browser Controls'}
                  </h3>
                  <p className={`text-yellow-700 ${language === 'ar' ? 'text-right' : ''}`}>
                    {language === 'ar'
                      ? 'تقبل معظم المتصفحات ملفات تعريف الارتباط تلقائيًا، ولكن يمكنك تعديل إعدادات المتصفح لرفض ملفات تعريف الارتباط أو تنبيهك عندما يحاول موقع ويب وضع ملف تعريف ارتباط على جهاز الكمبيوتر الخاص بك.'
                      : 'Most browsers automatically accept cookies, but you can modify your browser settings to decline cookies or alert you when a website is attempting to place a cookie on your computer.'
                    }
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className={`font-semibold text-gray-800 mb-2 ${language === 'ar' ? 'text-right' : ''}`}>Google Chrome</h3>
                    <ol className={`list-decimal ${language === 'ar' ? 'pr-5 text-right' : 'pl-5'} text-sm text-gray-700 space-y-1`}>
                      {language === 'ar' ? (
                        <>
                          <li>انقر على النقاط الثلاث في الزاوية العلوية اليمنى</li>
                          <li>حدد "الإعدادات"</li>
                          <li>انقر على "الخصوصية والأمان"</li>
                          <li>حدد "ملفات تعريف الارتباط وبيانات الموقع الأخرى"</li>
                          <li>اختر إعدادات ملفات تعريف الارتباط المفضلة لديك</li>
                        </>
                      ) : (
                        <>
                          <li>Click the three dots in the top-right corner</li>
                          <li>Select "Settings"</li>
                          <li>Click on "Privacy and security"</li>
                          <li>Select "Cookies and other site data"</li>
                          <li>Choose your preferred cookie settings</li>
                        </>
                      )}
                    </ol>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className={`font-semibold text-gray-800 mb-2 ${language === 'ar' ? 'text-right' : ''}`}>Mozilla Firefox</h3>
                    <ol className={`list-decimal ${language === 'ar' ? 'pr-5 text-right' : 'pl-5'} text-sm text-gray-700 space-y-1`}>
                      {language === 'ar' ? (
                        <>
                          <li>انقر على زر القائمة (ثلاثة خطوط) في الزاوية العلوية اليمنى</li>
                          <li>حدد "الإعدادات"</li>
                          <li>انقر على "الخصوصية والأمان"</li>
                          <li>انتقل إلى قسم "ملفات تعريف الارتباط وبيانات الموقع"</li>
                          <li>اختر إعدادات ملفات تعريف الارتباط المفضلة لديك</li>
                        </>
                      ) : (
                        <>
                          <li>Click the menu button (three lines) in the top-right</li>
                          <li>Select "Settings"</li>
                          <li>Click on "Privacy & Security"</li>
                          <li>Go to the "Cookies and Site Data" section</li>
                          <li>Choose your preferred cookie settings</li>
                        </>
                      )}
                    </ol>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className={`font-semibold text-gray-800 mb-2 ${language === 'ar' ? 'text-right' : ''}`}>Safari</h3>
                    <ol className={`list-decimal ${language === 'ar' ? 'pr-5 text-right' : 'pl-5'} text-sm text-gray-700 space-y-1`}>
                      {language === 'ar' ? (
                        <>
                          <li>انقر على "Safari" في شريط القائمة</li>
                          <li>حدد "التفضيلات"</li>
                          <li>انتقل إلى علامة التبويب "الخصوصية"</li>
                          <li>اختر إعدادات ملفات تعريف الارتباط وبيانات الموقع</li>
                        </>
                      ) : (
                        <>
                          <li>Click "Safari" in the menu bar</li>
                          <li>Select "Preferences"</li>
                          <li>Go to the "Privacy" tab</li>
                          <li>Choose your cookie and website data settings</li>
                        </>
                      )}
                    </ol>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className={`font-semibold text-gray-800 mb-2 ${language === 'ar' ? 'text-right' : ''}`}>Microsoft Edge</h3>
                    <ol className={`list-decimal ${language === 'ar' ? 'pr-5 text-right' : 'pl-5'} text-sm text-gray-700 space-y-1`}>
                      {language === 'ar' ? (
                        <>
                          <li>انقر على النقاط الثلاث في الزاوية العلوية اليمنى</li>
                          <li>حدد "الإعدادات"</li>
                          <li>انقر على "ملفات تعريف الارتباط وأذونات الموقع"</li>
                          <li>حدد "إدارة وحذف ملفات تعريف الارتباط وبيانات الموقع"</li>
                          <li>اختر إعدادات ملفات تعريف الارتباط المفضلة لديك</li>
                        </>
                      ) : (
                        <>
                          <li>Click the three dots in the top-right corner</li>
                          <li>Select "Settings"</li>
                          <li>Click on "Cookies and site permissions"</li>
                          <li>Select "Manage and delete cookies and site data"</li>
                          <li>Choose your preferred cookie settings</li>
                        </>
                      )}
                    </ol>
                  </div>
                </div>

                <p className={`text-gray-700 mb-4 ${language === 'ar' ? 'text-right' : ''}`}>
                  {language === 'ar'
                    ? 'يمكنك إدارة تفضيلات ملفات تعريف الارتباط الخاصة بك من خلال:'
                    : 'You can manage your cookie preferences through:'
                  }
                </p>
                <ul className={`list-disc ${language === 'ar' ? 'pr-6 text-right' : 'pl-6'} mt-4 space-y-2 text-gray-700`}>
                  <li>
                    <strong>{language === 'ar' ? 'إعدادات المتصفح' : 'Browser settings'}</strong> -
                    {language === 'ar' ? ' كما هو موضح أعلاه، لحظر أو حذف ملفات تعريف الارتباط' : ' As shown above, to block or delete cookies'}
                  </li>
                  <li>
                    <strong>{language === 'ar' ? 'أداة موافقة ملفات تعريف الارتباط الخاصة بنا' : 'Our cookie consent tool'}</strong> -
                    {language === 'ar' ? ' متاحة في أسفل موقعنا لإدارة التفضيلات' : ' Available at the bottom of our website to manage preferences'}
                  </li>
                  <li>
                    <strong>{language === 'ar' ? 'أدوات إلغاء الاشتراك من جهات خارجية' : 'Third-party opt-out tools'}</strong> -
                    {language === 'ar'
                      ? ` لخدمات محددة مثل تحليلات جوجل (قم بزيارة `
                      : ' For specific services like Google Analytics (visit '
                    }
                    <Link to="https://tools.google.com/dlpage/gaoptout" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      {language === 'ar' ? 'إلغاء الاشتراك في تحليلات جوجل' : 'Google Analytics Opt-out'}
                    </Link>
                    {language === 'ar' ? ')' : ')'}
                  </li>
                </ul>
              </section>

              <section id="cookie-consent" className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <Check className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'الموافقة على ملفات تعريف الارتباط' : 'Cookie Consent'}
                </h2>
                <p className={`text-gray-700 mb-4 ${language === 'ar' ? 'text-right' : ''}`}>
                  {language === 'ar'
                    ? 'عند زيارة موقعنا للمرة الأولى، سترى شريط ملفات تعريف الارتباط في أسفل الشاشة. يتيح لك هذا الشريط:'
                    : 'When you visit our website for the first time, you will see a cookie banner at the bottom of the screen. This banner allows you to:'
                  }
                </p>
                <ul className={`list-disc ${language === 'ar' ? 'pr-6 text-right' : 'pl-6'} space-y-2 text-gray-700 mb-4`}>
                  <li>{language === 'ar' ? 'قبول جميع ملفات تعريف الارتباط' : 'Accept all cookies'}</li>
                  <li>{language === 'ar' ? 'رفض ملفات تعريف الارتباط غير الأساسية' : 'Reject non-essential cookies'}</li>
                  <li>{language === 'ar' ? 'تخصيص تفضيلات ملفات تعريف الارتباط الخاصة بك' : 'Customize your cookie preferences'}</li>
                </ul>

                <div className="bg-gray-100 p-5 rounded-lg border border-gray-200 mb-6">
                  <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <div>
                      <h3 className={`font-semibold text-gray-800 mb-2 ${language === 'ar' ? 'text-right' : ''}`}>
                        {language === 'ar' ? 'مثال على موافقة ملفات تعريف الارتباط' : 'Cookie Consent Example'}
                      </h3>
                      <p className={`text-sm text-gray-600 ${language === 'ar' ? 'text-right' : ''}`}>
                        {language === 'ar' ? 'هكذا يظهر شريط موافقة ملفات تعريف الارتباط على موقعنا.' : 'This is how our cookie consent banner appears on our website.'}
                      </p>
                    </div>
                    <div className={`flex ${language === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                      <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm font-medium">
                        {language === 'ar' ? 'تخصيص' : 'Customize'}
                      </button>
                      <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm font-medium">
                        {language === 'ar' ? 'رفض الكل' : 'Reject All'}
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium">
                        {language === 'ar' ? 'قبول الكل' : 'Accept All'}
                      </button>
                    </div>
                  </div>
                  <p className={`text-xs text-gray-500 ${language === 'ar' ? 'text-right' : ''}`}>
                    {language === 'ar'
                      ? 'نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح الخاصة بك، وتقديم إعلانات أو محتوى مخصص، وتحليل حركة المرور لدينا. بالنقر على "قبول الكل"، فإنك توافق على استخدامنا لملفات تعريف الارتباط.'
                      : 'We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.'
                    }
                  </p>
                </div>

                <p className={`text-gray-700 mb-4 ${language === 'ar' ? 'text-right' : ''}`}>
                  {language === 'ar'
                    ? 'يمكنك تغيير تفضيلات ملفات تعريف الارتباط الخاصة بك في أي وقت بالنقر على رابط "إعدادات ملفات تعريف الارتباط" في تذييل موقعنا.'
                    : 'You can change your cookie preferences at any time by clicking on the "Cookie Settings" link in the footer of our website.'
                  }
                </p>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className={`flex items-start ${language === 'ar' ? '' : ''}`}>
                    <Info className={`h-5 w-5 text-blue-600 mt-0.5 ${language === 'ar' ? 'ml-2' : 'mr-2'} flex-shrink-0`} />
                    <p className={`text-blue-800 text-sm ${language === 'ar' ? 'text-right' : ''}`}>
                      {language === 'ar'
                        ? 'حتى إذا رفضت جميع ملفات تعريف الارتباط الاختيارية، فسنظل نضع ملفات تعريف الارتباط الأساسية الضرورية للتشغيل السليم لموقعنا. لا تتعقب ملفات تعريف الارتباط هذه نشاط التصفح الخاص بك لأغراض تسويقية.'
                        : 'Even if you reject all optional cookies, we will still set essential cookies that are necessary for the proper functioning of our website. These cookies do not track your browsing activity for marketing purposes.'
                      }
                    </p>
                  </div>
                </div>
              </section>

              <section id="third-party-cookies" className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <ExternalLink className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'ملفات تعريف الارتباط من جهات خارجية' : 'Third-Party Cookies'}
                </h2>
                <p className={`text-gray-700 mb-4 ${language === 'ar' ? 'text-right' : ''}`}>
                  {language === 'ar'
                    ? 'يتم وضع بعض ملفات تعريف الارتباط بواسطة خدمات من جهات خارجية تظهر على صفحاتنا. نحن لا نتحكم في هذه الجهات الخارجية أو ملفات تعريف الارتباط الخاصة بها. قد تستخدم ملفات تعريف الارتباط هذه من قبل مزودي الخدمة من جهات خارجية لجمع معلومات حول أنشطتك عبر الإنترنت بمرور الوقت وعبر مواقع ويب مختلفة.'
                    : 'Some cookies are placed by third-party services that appear on our pages. We do not control these third parties or their cookies. These cookies may be used by the third-party service providers to collect information about your online activities over time and across different websites.'
                  }
                </p>
                <p className={`text-gray-700 mb-4 ${language === 'ar' ? 'text-right' : ''}`}>
                  {language === 'ar'
                    ? 'خدمات الجهات الخارجية التي نستخدمها والتي قد تضع ملفات تعريف الارتباط تشمل:'
                    : 'Third-party services we use that may place cookies include:'
                  }
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className={`font-semibold text-gray-800 mb-2 ${language === 'ar' ? 'text-right' : ''}`}>
                      {language === 'ar' ? 'تحليلات' : 'Analytics'}
                    </h3>
                    <ul className={`list-disc ${language === 'ar' ? 'pr-5 text-right' : 'pl-5'} text-sm text-gray-700`}>
                      <li>Google Analytics</li>
                      <li>Hotjar</li>
                      <li>Mixpanel</li>
                    </ul>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className={`font-semibold text-gray-800 mb-2 ${language === 'ar' ? 'text-right' : ''}`}>
                      {language === 'ar' ? 'وسائل التواصل الاجتماعي' : 'Social Media'}
                    </h3>
                    <ul className={`list-disc ${language === 'ar' ? 'pr-5 text-right' : 'pl-5'} text-sm text-gray-700`}>
                      <li>Facebook Pixel</li>
                      <li>Twitter</li>
                      <li>LinkedIn</li>
                    </ul>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className={`font-semibold text-gray-800 mb-2 ${language === 'ar' ? 'text-right' : ''}`}>
                      {language === 'ar' ? 'خدمات أخرى' : 'Other Services'}
                    </h3>
                    <ul className={`list-disc ${language === 'ar' ? 'pr-5 text-right' : 'pl-5'} text-sm text-gray-700`}>
                      <li>{language === 'ar' ? 'معالجات الدفع' : 'Payment processors'}</li>
                      <li>{language === 'ar' ? 'شبكات توصيل المحتوى' : 'Content delivery networks'}</li>
                      <li>{language === 'ar' ? 'أدوات دعم العملاء' : 'Customer support tools'}</li>
                    </ul>
                  </div>
                </div>
                <p className={`text-gray-700 mt-4 ${language === 'ar' ? 'text-right' : ''}`}>
                  {language === 'ar'
                    ? `يجب أن يكون لكل من هذه الأطراف الثالثة سياسة الخصوصية وسياسة ملفات تعريف الارتباط الخاصة بهم والتي ستحكم استخدامهم لملفات تعريف الارتباط. يمكنك العثور على روابط لسياساتهم على صفحة `
                    : 'Each of these third parties should have their own privacy policy and cookie policy which will govern their use of cookies. You can find links to their policies on our '
                  }
                  <Link to="/privacy" className="text-blue-600 hover:underline">
                    {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
                  </Link>
                  {language === 'ar' ? ' الخاصة بنا.' : ' page.'}
                </p>
              </section>

              <section id="faq" className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <HelpCircle className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleFaq(index)}
                        className={`w-full flex justify-between items-center p-4 ${language === 'ar' ? 'text-right' : 'text-left'} bg-gray-50 hover:bg-gray-100 transition-colors`}
                      >
                        <span className="font-medium text-gray-900">{faq.question}</span>
                        {activeFaq === index ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                      {activeFaq === index && (
                        <div className="p-4 bg-white">
                          <p className={`text-gray-700 ${language === 'ar' ? 'text-right' : ''}`}>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section id="updates" className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <Bell className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'تحديثات هذه السياسة' : 'Updates to This Policy'}
                </h2>
                <p className={`text-gray-700 mb-4 ${language === 'ar' ? 'text-right' : ''}`}>
                  {language === 'ar'
                    ? 'قد نقوم بتحديث سياسة ملفات تعريف الارتباط هذه من وقت لآخر لتعكس التغييرات في التكنولوجيا أو اللوائح أو ممارسات أعمالنا. ستصبح أي تغييرات سارية المفعول عندما ننشر السياسة المنقحة على هذه الصفحة.'
                    : 'We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our business practices. Any changes will become effective when we post the revised policy on this page.'
                  }
                </p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                  <h3 className={`font-semibold text-gray-800 mb-2 ${language === 'ar' ? 'text-right' : ''}`}>
                    {language === 'ar' ? 'تاريخ تحديث السياسة' : 'Policy Update History'}
                  </h3>
                  <ul className={`text-sm text-gray-700 space-y-2 ${language === 'ar' ? 'text-right' : ''}`}>
                    <li>
                      <strong>{language === 'ar' ? '10 مايو 2024:' : 'May 10, 2024:'}</strong>
                      {language === 'ar'
                        ? ' تم تحديث سياسة ملفات تعريف الارتباط بمعلومات محسنة حول أنواع ملفات تعريف الارتباط وإدارتها.'
                        : ' Updated cookie policy with enhanced information about cookie types and management.'}
                    </li>
                    <li>
                      <strong>{language === 'ar' ? '15 يناير 2024:' : 'January 15, 2024:'}</strong>
                      {language === 'ar'
                        ? ' تمت إضافة معلومات حول مزودي التحليلات من جهات خارجية.'
                        : ' Added information about third-party analytics providers.'}
                    </li>
                    <li>
                      <strong>{language === 'ar' ? '5 أكتوبر 2023:' : 'October 5, 2023:'}</strong>
                      {language === 'ar'
                        ? ' تم نشر سياسة ملفات تعريف الارتباط الأولية.'
                        : ' Initial cookie policy published.'}
                    </li>
                  </ul>
                </div>
                <p className={`text-gray-700 ${language === 'ar' ? 'text-right' : ''}`}>
                  {language === 'ar'
                    ? 'سنقوم بإخطارك بأي تغييرات مهمة من خلال نشر إشعار على موقعنا أو عن طريق إرسال إشعار بالبريد الإلكتروني إليك. نشجعك على مراجعة هذه الصفحة بشكل دوري للبقاء على اطلاع حول استخدامنا لملفات تعريف الارتباط.'
                    : 'We will notify you of any significant changes by posting a notice on our website or by sending you an email notification. We encourage you to periodically review this page to stay informed about our use of cookies.'
                  }
                </p>
              </section>

              <section id="contact-us">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <Shield className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'اتصل بنا' : 'Contact Us'}
                </h2>
                <p className={`text-gray-700 mb-4 ${language === 'ar' ? 'text-right' : ''}`}>
                  {language === 'ar'
                    ? 'إذا كان لديك أي أسئلة حول سياسة ملفات تعريف الارتباط الخاصة بنا أو كيفية استخدامنا لملفات تعريف الارتباط، يرجى الاتصال بنا:'
                    : 'If you have any questions about our Cookie Policy or how we use cookies, please contact us:'
                  }
                </p>
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <address className={`text-gray-700 not-italic ${language === 'ar' ? 'text-right' : ''}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={language === 'ar' ? 'order-2' : ''}>
                        <p className="font-medium mb-1">RashadAI, Inc.</p>
                        <p>123 Innovation Way</p>
                        <p>San Francisco, CA 94103</p>
                      </div>
                      <div className={language === 'ar' ? 'order-1' : ''}>
                        <p>
                          <span className="font-medium">{language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}</span>
                          <Link to="mailto:privacy@rashadai.com" className="text-blue-600 hover:underline">privacy@rashadai.com</Link>
                        </p>
                        <p>
                          <span className="font-medium">{language === 'ar' ? 'الهاتف:' : 'Phone:'}</span>
                          +201286904277
                        </p>
                        <p>
                          <span className="font-medium">{language === 'ar' ? 'ساعات العمل:' : 'Hours:'}</span>
                          {language === 'ar' ? 'الاثنين-الجمعة، 9 صباحًا - 5 مساءً بتوقيت المحيط الهادئ' : 'Monday-Friday, 9am-5pm PT'}
                        </p>
                      </div>
                    </div>
                  </address>
                </div>
              </section>
            </div>
          </div>

          {/* Additional Links */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {language === 'ar' ? 'الشروط والأحكام' : 'Terms and Conditions'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {language === 'ar'
                    ? 'شروط الخدمة واتفاقية المستخدم الخاصة بنا.'
                    : 'Our terms of service and user agreement.'}
                </p>
                <Link
                  to="/terms"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {language === 'ar' ? 'اقرأ الشروط →' : 'Read Terms →'}
                </Link>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {language === 'ar'
                    ? 'تعرف على كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك الشخصية.'
                    : 'Learn how we collect, use, and protect your personal information.'}
                </p>
                <Link
                  to="/privacy"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {language === 'ar' ? 'اقرأ سياسة الخصوصية →' : 'Read Privacy Policy →'}
                </Link>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {language === 'ar' ? 'الامتثال لـ HIPAA' : 'HIPAA Compliance'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {language === 'ar'
                    ? 'تفاصيل حول ممارساتنا في حماية بيانات الرعاية الصحية.'
                    : 'Details about our healthcare data protection practices.'}
                </p>
                <Link
                  to="/hipaa-compliance"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {language === 'ar' ? 'اقرأ بيان HIPAA →' : 'Read HIPAA Statement →'}
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Cookies;