import React from 'react';
import Layout from '../../components/Layout';
import { Shield, FileText, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/languageStore';
import { Link } from 'react-router-dom';

const HIPAACompliance: React.FC = () => {
  const { t: _t } = useTranslation(); // t is imported but not used yet
  const { language } = useLanguageStore();

  return (
    <Layout>
      <div className={`pt-8 pb-16 bg-white ${language === 'ar' ? 'font-cairo' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {language === 'ar' ? 'الامتثال لقانون HIPAA' : 'HIPAA Compliance'}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {language === 'ar'
                ? 'التزامنا بحماية معلوماتك الصحية والحفاظ على الامتثال للوائح الرعاية الصحية.'
                : 'Our commitment to protecting your health information and maintaining compliance with healthcare regulations.'
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
                  <Shield className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'التزامنا بالامتثال لـ HIPAA' : 'Our Commitment to HIPAA Compliance'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'ar'
                    ? 'تلتزم رشاد AI بحماية معلوماتك الصحية والامتثال لقانون نقل وحماية التأمين الصحي (HIPAA) لعام 1996. نحن نطبق تدابير صارمة للخصوصية والأمان لحماية معلوماتك الصحية المحمية (PHI).'
                    : 'RashadAI is committed to protecting your health information and maintaining compliance with the Health Insurance Portability and Accountability Act (HIPAA) of 1996. We implement strict privacy and security measures to safeguard your Protected Health Information (PHI).'}
                </p>
                <p className="text-gray-700">
                  {language === 'ar'
                    ? 'بصفتنا مقدم خدمة رعاية صحية، ندرك أهمية الحفاظ على سرية وسلامة وتوافر معلوماتك الصحية. منصتنا مصممة مع مراعاة الخصوصية والأمان كمبادئ أساسية.'
                    : 'As a healthcare service provider, we understand the importance of maintaining the confidentiality, integrity, and availability of your health information. Our platform is designed with privacy and security as fundamental principles.'}
                </p>
              </section>

              <section className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <Lock className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'تدابير الأمان' : 'Security Measures'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'ar'
                    ? 'نطبق تدابير أمان شاملة لحماية معلوماتك الصحية:'
                    : 'We employ comprehensive security measures to protect your health information:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  {language === 'ar' ? (
                    <>
                      <li>تشفير شامل لجميع عمليات نقل البيانات</li>
                      <li>تخزين آمن للبيانات في منشآت متوافقة مع HIPAA</li>
                      <li>مراجعات وتقييمات أمان منتظمة</li>
                      <li>ضوابط وصول وبروتوكولات مصادقة</li>
                      <li>تدريب الموظفين على الامتثال لـ HIPAA</li>
                      <li>إجراءات نسخ احتياطي آمنة واستعادة الكوارث</li>
                      <li>مراقبة مستمرة لمحاولات الوصول غير المصرح به</li>
                    </>
                  ) : (
                    <>
                      <li>End-to-end encryption for all data transmission</li>
                      <li>Secure data storage in HIPAA-compliant facilities</li>
                      <li>Regular security audits and assessments</li>
                      <li>Access controls and authentication protocols</li>
                      <li>Employee training on HIPAA compliance</li>
                      <li>Secure backup and disaster recovery procedures</li>
                      <li>Continuous monitoring for unauthorized access attempts</li>
                    </>
                  )}
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <FileText className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'حقوقك بموجب HIPAA' : 'Your Rights Under HIPAA'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'ar'
                    ? 'يمنحك HIPAA حقوقًا معينة فيما يتعلق بمعلوماتك الصحية:'
                    : 'HIPAA provides you with certain rights regarding your health information:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  {language === 'ar' ? (
                    <>
                      <li><strong>حق الوصول:</strong> لديك الحق في عرض والحصول على نسخ من معلوماتك الصحية.</li>
                      <li><strong>حق التعديل:</strong> يمكنك طلب تصحيح معلوماتك الصحية إذا كنت تعتقد أنها غير صحيحة أو غير مكتملة.</li>
                      <li><strong>حق الحصول على سجل الإفصاحات:</strong> يمكنك طلب قائمة بالحالات التي قمنا فيها بالإفصاح عن معلوماتك الصحية.</li>
                      <li><strong>حق طلب القيود:</strong> يمكنك أن تطلب منا تقييد المعلومات الصحية التي نستخدمها أو نشاركها.</li>
                      <li><strong>حق طلب التواصل السري:</strong> يمكنك أن تطلب منا التواصل معك بطريقة أو في مكان محدد.</li>
                      <li><strong>حق الحصول على نسخة ورقية من هذا الإشعار:</strong> يمكنك طلب نسخة ورقية من هذا الإشعار في أي وقت.</li>
                    </>
                  ) : (
                    <>
                      <li><strong>Right to Access:</strong> You have the right to view and obtain copies of your health information.</li>
                      <li><strong>Right to Amend:</strong> You can request corrections to your health information if you believe it is incorrect or incomplete.</li>
                      <li><strong>Right to an Accounting of Disclosures:</strong> You can request a list of instances where we have disclosed your health information.</li>
                      <li><strong>Right to Request Restrictions:</strong> You can ask us to limit the health information we use or share.</li>
                      <li><strong>Right to Request Confidential Communications:</strong> You can ask us to contact you in a specific way or at a specific location.</li>
                      <li><strong>Right to a Paper Copy of This Notice:</strong> You can ask for a paper copy of this notice at any time.</li>
                    </>
                  )}
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <Shield className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'اتفاقيات الشركاء التجاريين' : 'Business Associate Agreements'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'ar'
                    ? 'نحتفظ باتفاقيات شركاء تجاريين (BAAs) مع جميع مزودي الخدمات الخارجيين الذين قد يكون لديهم وصول إلى معلوماتك الصحية المحمية (PHI). تضمن هذه الاتفاقيات أن يلتزم شركاؤنا بنفس معايير الخصوصية والأمان العالية التي نلتزم بها.'
                    : 'We maintain Business Associate Agreements (BAAs) with all third-party vendors who may have access to Protected Health Information (PHI). These agreements ensure that our partners maintain the same high standards of privacy and security that we do.'}
                </p>
              </section>

              <section className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <FileText className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'إشعار خرق البيانات' : 'Breach Notification'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'ar'
                    ? 'في حال حدوث خرق غير متوقع لمعلوماتك الصحية المحمية غير المؤمنة، سنقوم بما يلي:'
                    : 'In the unlikely event of a breach of unsecured protected health information, we will:'}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  {language === 'ar' ? (
                    <>
                      <li>إخطار الأفراد المتضررين دون تأخير غير مبرر (وفي موعد لا يتجاوز 60 يومًا من اكتشاف الخرق)</li>
                      <li>تضمين وصف للخرق، وأنواع المعلومات المتأثرة، والخطوات التي يجب على الأفراد اتخاذها لحماية أنفسهم، وما نقوم به للتحقيق والتخفيف من أثر الخرق، وإجراءات التواصل لمزيد من المعلومات</li>
                      <li>إخطار وزارة الصحة والخدمات الإنسانية الأمريكية</li>
                      <li>إخطار وسائل الإعلام البارزة في بعض الحالات</li>
                    </>
                  ) : (
                    <>
                      <li>Notify affected individuals without unreasonable delay (and no later than 60 days after discovery)</li>
                      <li>Include a description of the breach, the types of information involved, steps individuals should take to protect themselves, what we are doing to investigate and mitigate the breach, and contact procedures for more information</li>
                      <li>Notify the Secretary of Health and Human Services</li>
                      <li>Notify prominent media outlets in certain circumstances</li>
                    </>
                  )}
                </ul>
              </section>

              <section>
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <FileText className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'اتصل بنا' : 'Contact Us'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'ar'
                    ? 'إذا كان لديك أي أسئلة حول امتثالنا لـ HIPAA أو للإبلاغ عن أي مخاوف:'
                    : 'If you have any questions about our HIPAA compliance or to report a concern:'}
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
            </div>
          </div>


          {/* Additional Links */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {language === 'ar'
                    ? 'تعرف على كيفية جمع واستخدام وحماية معلوماتك الشخصية.'
                    : 'Learn how we collect, use, and protect your personal information.'}
                </p>
                <Link to="/privacy" className={`text-blue-600 hover:text-blue-800 font-medium ${language === 'ar' ? 'flex items-center' : ''}`}>
                  {language === 'ar'
                    ? <><span className="ml-1">قراءة سياسة الخصوصية</span> ←</>
                    : 'Read Privacy Policy →'}
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

export default HIPAACompliance;
