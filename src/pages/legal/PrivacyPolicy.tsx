import React from 'react';
import Layout from '../../components/Layout';
import { Shield, FileText, Eye, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/languageStore';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  const { t: _t } = useTranslation(); // t is imported but not used yet
  const { language } = useLanguageStore();

  return (
    <Layout>
      <div className={`pt-8 pb-16 bg-white ${language === 'ar' ? 'font-cairo' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {language === 'ar'
                ? 'كيف نجمع ونستخدم ونحمي معلوماتك الشخصية.'
                : 'How we collect, use, and protect your personal information.'
              }
            </p>
            <div className="flex justify-center mt-8">
              <span className="text-sm text-gray-500">
                {language === 'ar' ? 'آخر تحديث: 5 مايو 2025' : 'Last Updated: May 5, 2025'}
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md mb-12">
            <div className="prose prose-lg max-w-none prose-blue">
              <section className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <FileText className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'مقدمة' : 'Introduction'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'ar'
                    ? 'رشاد AI ("نحن" أو "لنا") ملتزمة بحماية خصوصيتك. توضح سياسة الخصوصية هذه كيفية جمع واستخدام والكشف عن وحماية معلوماتك عند استخدام خدمتنا.'
                    : 'RashadAI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.'
                  }
                </p>
                <p className="text-gray-700">
                  {language === 'ar'
                    ? 'يرجى قراءة سياسة الخصوصية هذه بعناية. من خلال الوصول إلى منصتنا أو استخدامها، فإنك تقر بأنك قد قرأت وفهمت وتوافق على الالتزام بجميع شروط سياسة الخصوصية هذه. إذا كنت لا توافق على سياساتنا وممارساتنا، فيرجى عدم استخدام خدماتنا.'
                    : 'Please read this Privacy Policy carefully. By accessing or using our platform, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.'
                  }
                </p>
              </section>

              <section className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <Eye className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'المعلومات التي نجمعها' : 'Information We Collect'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'ar'
                    ? 'نجمع عدة أنواع من المعلومات من مستخدمي منصتنا أو عنهم:'
                    : 'We collect several types of information from and about users of our platform:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  {language === 'ar' ? (
                    <>
                      <li>
                        <strong>المعلومات الشخصية:</strong> تتضمن المعلومات التي يمكن أن تحدد هويتك كفرد، مثل اسمك، عنوان بريدك الإلكتروني، رقم هاتفك، وعنوانك البريدي.
                      </li>
                      <li>
                        <strong>المعلومات الصحية:</strong> معلومات عن حالتك الصحية، وتاريخك الطبي، وأي بيانات صحية أخرى تقدمها أثناء الاستشارات.
                      </li>
                      <li>
                        <strong>بيانات الاستخدام:</strong> معلومات حول كيفية وصولك إلى منصتنا واستخدامها، بما في ذلك عنوان الـIP ونوع المتصفح ومعلومات الجهاز والصفحات التي تزورها ومدة بقائك على المنصة.
                      </li>
                      <li>
                        <strong>بيانات التواصل:</strong> سجلات اتصالاتك معنا، بما في ذلك استفسارات دعم العملاء والملاحظات.
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <strong>Personal Information:</strong> This includes information that can identify you as an individual, such as your name, email address, telephone number, and postal address.
                      </li>
                      <li>
                        <strong>Health Information:</strong> Information about your health conditions, medical history, and other health-related data that you provide during consultations.
                      </li>
                      <li>
                        <strong>Usage Data:</strong> Information about how you access and use our platform, including your IP address, browser type, device information, pages visited, and time spent on the platform.
                      </li>
                      <li>
                        <strong>Communication Data:</strong> Records of your communications with us, including customer support inquiries and feedback.
                      </li>
                    </>
                  )}
                </ul>
              </section>


              <section className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <Shield className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'مشاركة المعلومات والإفصاح عنها' : 'Information Sharing and Disclosure'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'ar'
                    ? 'قد نشارك معلوماتك في الحالات التالية:'
                    : 'We may share your information in the following circumstances:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  {language === 'ar' ? (
                    <>
                      <li>
                        <strong>مع مزودي الخدمات:</strong> قد نشارك معلوماتك مع بائعين طرف ثالث يقدمون خدمات نيابة عنا، مثل الاستضافة، تحليل البيانات، معالجة المدفوعات، وخدمة العملاء.
                      </li>
                      <li>
                        <strong>لأسباب قانونية:</strong> قد نكشف عن معلوماتك إذا تطلب القانون ذلك، مثل الامتثال لأمر استدعاء أو إجراء قانوني مشابه.
                      </li>
                      <li>
                        <strong>بموافقتك:</strong> قد نشارك معلوماتك مع أطراف ثالثة عندما تمنحنا موافقتك على ذلك.
                      </li>
                      <li>
                        <strong>نقل الأعمال:</strong> في حالة الاندماج أو الاستحواذ أو بيع كل أو جزء من أصولنا، قد يتم نقل معلوماتك كجزء من الصفقة.
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <strong>With Service Providers:</strong> We may share your information with third-party vendors who provide services on our behalf, such as hosting, data analysis, payment processing, and customer service.
                      </li>
                      <li>
                        <strong>For Legal Reasons:</strong> We may disclose your information if required by law, such as to comply with a subpoena or similar legal process.
                      </li>
                      <li>
                        <strong>With Your Consent:</strong> We may share your information with third parties when you have given us your consent to do so.
                      </li>
                      <li>
                        <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of the transaction.
                      </li>
                    </>
                  )}
                </ul>
                <p className="text-gray-700 mt-4">
                  {language === 'ar'
                    ? 'نحن لا نبيع أو نؤجر أو نؤجر معلوماتك الشخصية لأطراف ثالثة.'
                    : 'We do not sell, rent, or lease your personal information to third parties.'}
                </p>
              </section>



              <section className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <Shield className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'مشاركة المعلومات والإفصاح عنها' : 'Information Sharing and Disclosure'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'ar'
                    ? 'قد نشارك معلوماتك في الحالات التالية:'
                    : 'We may share your information in the following circumstances:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  {language === 'ar' ? (
                    <>
                      <li>
                        <strong>مع مزودي الخدمات:</strong> قد نشارك معلوماتك مع بائعين طرف ثالث يقدمون خدمات نيابة عنا، مثل الاستضافة، تحليل البيانات، معالجة المدفوعات، وخدمة العملاء.
                      </li>
                      <li>
                        <strong>لأسباب قانونية:</strong> قد نكشف عن معلوماتك إذا تطلب القانون ذلك، مثل الامتثال لأمر استدعاء أو إجراء قانوني مشابه.
                      </li>
                      <li>
                        <strong>بموافقتك:</strong> قد نشارك معلوماتك مع أطراف ثالثة عندما تمنحنا موافقتك على ذلك.
                      </li>
                      <li>
                        <strong>نقل الأعمال:</strong> في حالة الاندماج أو الاستحواذ أو بيع كل أو جزء من أصولنا، قد يتم نقل معلوماتك كجزء من الصفقة.
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <strong>With Service Providers:</strong> We may share your information with third-party vendors who provide services on our behalf, such as hosting, data analysis, payment processing, and customer service.
                      </li>
                      <li>
                        <strong>For Legal Reasons:</strong> We may disclose your information if required by law, such as to comply with a subpoena or similar legal process.
                      </li>
                      <li>
                        <strong>With Your Consent:</strong> We may share your information with third parties when you have given us your consent to do so.
                      </li>
                      <li>
                        <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of the transaction.
                      </li>
                    </>
                  )}
                </ul>
                <p className="text-gray-700 mt-4">
                  {language === 'ar'
                    ? 'نحن لا نبيع أو نؤجر أو نؤجر معلوماتك الشخصية لأطراف ثالثة.'
                    : 'We do not sell, rent, or lease your personal information to third parties.'}
                </p>
              </section>


              <section className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <Lock className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'أمان البيانات' : 'Data Security'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'ar'
                    ? 'نقوم بتنفيذ تدابير تقنية وتنظيمية مناسبة لحماية معلوماتك الشخصية:'
                    : 'We implement appropriate technical and organizational measures to protect your personal information:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  {language === 'ar' ? (
                    <>
                      <li>تشفير شامل لنقل البيانات</li>
                      <li>تخزين آمن للبيانات مع التشفير أثناء الراحة</li>
                      <li>تقييمات أمان منتظمة واختبارات اختراق</li>
                      <li>ضوابط وصول وآليات مصادقة</li>
                      <li>تدريب الموظفين على حماية البيانات والخصوصية</li>
                    </>
                  ) : (
                    <>
                      <li>End-to-end encryption for data transmission</li>
                      <li>Secure data storage with encryption at rest</li>
                      <li>Regular security assessments and penetration testing</li>
                      <li>Access controls and authentication mechanisms</li>
                      <li>Employee training on data protection and privacy</li>
                    </>
                  )}
                </ul>
                <p className="text-gray-700 mt-4">
                  {language === 'ar'
                    ? 'بينما نسعى لاستخدام وسائل مقبولة تجارياً لحماية معلوماتك الشخصية، لا توجد طريقة نقل عبر الإنترنت أو طريقة تخزين إلكترونية آمنة بنسبة 100%. لا يمكننا ضمان الأمان المطلق.'
                    : 'While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the Internet or method of electronic storage is 100% secure. We cannot guarantee absolute security.'}
                </p>
              </section>


              <section className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <FileText className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'حقوقك' : 'Your Rights'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'ar'
                    ? 'اعتمادًا على موقعك، قد تكون لديك حقوق معينة تتعلق بمعلوماتك الشخصية:'
                    : 'Depending on your location, you may have certain rights regarding your personal information:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  {language === 'ar' ? (
                    <>
                      <li><strong>الوصول:</strong> يمكنك طلب الوصول إلى معلوماتك الشخصية.</li>
                      <li><strong>التصحيح:</strong> يمكنك طلب تصحيح المعلومات غير الدقيقة أو غير المكتملة.</li>
                      <li><strong>الحذف:</strong> يمكنك طلب حذف معلوماتك الشخصية في ظروف معينة.</li>
                      <li><strong>التقييد:</strong> يمكنك طلب تقييد معالجة معلوماتك.</li>
                      <li><strong>قابلية نقل البيانات:</strong> يمكنك طلب نسخة من معلوماتك بتنسيق منظم ومستخدم شائعًا وقابل للقراءة آليًا.</li>
                      <li><strong>الاعتراض:</strong> يمكنك الاعتراض على معالجتنا لمعلوماتك الشخصية.</li>
                    </>
                  ) : (
                    <>
                      <li><strong>Access:</strong> You can request access to your personal information.</li>
                      <li><strong>Correction:</strong> You can request that we correct inaccurate or incomplete information.</li>
                      <li><strong>Deletion:</strong> You can request that we delete your personal information in certain circumstances.</li>
                      <li><strong>Restriction:</strong> You can request that we restrict the processing of your information.</li>
                      <li><strong>Data Portability:</strong> You can request a copy of your information in a structured, commonly used, and machine-readable format.</li>
                      <li><strong>Objection:</strong> You can object to our processing of your personal information.</li>
                    </>
                  )}
                </ul>
                <p className="text-gray-700 mt-4">
                  {language === 'ar'
                    ? 'لممارسة أي من هذه الحقوق، يرجى الاتصال بنا باستخدام المعلومات المقدمة في قسم "اتصل بنا".'
                    : 'To exercise any of these rights, please contact us using the information provided in the "Contact Us" section.'}
                </p>
              </section>


              <section>
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <FileText className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'اتصل بنا' : 'Contact Us'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'ar'
                    ? 'إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر:'
                    : 'If you have any questions about this Privacy Policy, please contact us:'}
                </p>
                <address className="text-gray-700 not-italic whitespace-pre-line">
                  {language === 'ar' ? (
                    <>
                      مسؤول الخصوصية<br />
                      رشاد AI، شركة RashadAI, Inc.<br />
                      123 طريق الابتكار<br />
                      سان فرانسيسكو، كاليفورنيا 94103<br />
                      البريد الإلكتروني: privacy@rashadai.com<br />
                      الهاتف: +201286904277
                    </>
                  ) : (
                    <>
                      Privacy Officer<br />
                      RashadAI, Inc.<br />
                      123 Innovation Way<br />
                      San Francisco, CA 94103<br />
                      Email: privacy@rashadai.com<br />
                      Phone: +201286904277
                    </>
                  )}
                </address>
              </section>


              <section className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <FileText className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'التغييرات على سياسة الخصوصية هذه' : 'Changes to This Privacy Policy'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'ar'
                    ? 'قد نقوم بتحديث سياسة الخصوصية الخاصة بنا من وقت لآخر. سنقوم بإعلامك بأي تغييرات من خلال نشر سياسة الخصوصية الجديدة على هذه الصفحة وتحديث تاريخ "آخر تحديث". ننصحك بمراجعة سياسة الخصوصية هذه بشكل دوري لأي تغييرات.'
                    : 'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.'}
                </p>
              </section>


              <section className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <FileText className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'خصوصية الأطفال' : "Children's Privacy"}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'ar'
                    ? 'خدماتنا غير موجهة للأفراد دون سن 18 عامًا. نحن لا نجمع معلومات شخصية من الأطفال عن قصد. إذا كنت أحد الوالدين أو الوصي وتعتقد أن طفلك قد زودنا بمعلومات شخصية، يرجى الاتصال بنا، وسنتخذ خطوات لحذف هذه المعلومات.'
                    : 'Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us, and we will take steps to delete such information.'}
                </p>
              </section>

            </div>
          </div>

          {/* Additional Links */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {language === 'ar' ? 'الامتثال لقانون HIPAA' : 'HIPAA Compliance'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {language === 'ar'
                    ? 'تعرف على ممارسات حماية بيانات الرعاية الصحية لدينا.'
                    : 'Learn about our healthcare data protection practices.'}
                </p>
                <Link to="/hipaa-compliance" className={`text-blue-600 hover:text-blue-800 font-medium ${language === 'ar' ? 'flex items-center' : ''}`}>
                  {language === 'ar'
                    ? <><span className="ml-1">قراءة بيان HIPAA</span> ←</>
                    : 'Read HIPAA Statement →'}
                </Link>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {language === 'ar' ? 'الشروط والأحكام' : 'Terms and Conditions'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {language === 'ar'
                    ? 'فهم الشروط التي تحكم استخدام خدماتنا.'
                    : 'Understand the terms governing the use of our services.'}
                </p>
                <Link to="/terms" className={`text-blue-600 hover:text-blue-800 font-medium ${language === 'ar' ? 'flex items-center' : ''}`}>
                  {language === 'ar'
                    ? <><span className="ml-1">قراءة الشروط</span> ←</>
                    : 'Read Terms →'}
                </Link>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {language === 'ar' ? 'سياسة ملفات تعريف الارتباط' : 'Cookie Policy'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {language === 'ar'
                    ? 'تفاصيل حول كيفية استخدامنا لملفات تعريف الارتباط على موقعنا.'
                    : 'Details about how we use cookies on our website.'}
                </p>
                <Link to="/cookies" className={`text-blue-600 hover:text-blue-800 font-medium ${language === 'ar' ? 'flex items-center' : ''}`}>
                  {language === 'ar'
                    ? <><span className="ml-1">قراءة سياسة ملفات تعريف الارتباط</span> ←</>
                    : 'Read Cookie Policy →'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
