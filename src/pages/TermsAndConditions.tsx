import React from 'react';
import Layout from '../components/Layout';
import { Shield, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../store/languageStore';
import { Link } from 'react-router-dom';

const TermsAndConditions: React.FC = () => {
  const { t: _t } = useTranslation(); // t is imported but not used yet
  const { language } = useLanguageStore();

  return (
    <Layout>
      <div className={`pt-8 pb-16 bg-white ${language === 'ar' ? 'font-cairo' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {language === 'ar' ? 'الشروط والأحكام' : 'Terms and Conditions'}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {language === 'ar'
                ? 'يرجى قراءة هذه الشروط والأحكام بعناية قبل استخدام منصة رشاد AI.'
                : 'Please read these terms and conditions carefully before using the RashadAI platform.'
              }
            </p>
            <div className="flex justify-center mt-8">
              <span className="text-sm text-gray-500">
                {language === 'ar' ? 'آخر تحديث: 15 يونيو 2025' : 'Last Updated: June 15, 2025'}
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
                    ? 'مرحبًا بك في رشاد AI. من خلال الوصول إلى أو استخدام موقعنا الإلكتروني وتطبيق الهاتف المحمول والخدمات (يشار إليها مجتمعة باسم "الخدمات")، فإنك توافق على الالتزام بهذه الشروط والأحكام ("الشروط"). إذا كنت لا توافق على هذه الشروط، فيرجى عدم استخدام خدماتنا.'
                    : 'Welcome to RashadAI. By accessing or using our website, mobile application, and services (collectively, the "Services"), you agree to be bound by these Terms and Conditions (the "Terms"). If you do not agree to these Terms, please do not use our Services.'
                  }
                </p>
                <p className="text-gray-700">
                  {language === 'ar'
                    ? 'يتم تقديم الخدمات بواسطة شركة رشاد AI ("نحن" أو "لنا"). نحتفظ بالحق في تعديل هذه الشروط في أي وقت. استمرارك في استخدام الخدمات بعد أي تغييرات يشير إلى قبولك للشروط المعدلة.'
                    : 'The Services are provided by RashadAI, Inc. ("we," "us," or "our"). We reserve the right to modify these Terms at any time. Your continued use of the Services after any changes indicates your acceptance of the modified Terms.'
                  }
                </p>
              </section>

              <section className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <FileText className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'إخلاء المسؤولية الطبية' : 'Medical Disclaimer'}
                </h2>
                <div className={`bg-yellow-50 ${language === 'ar' ? 'border-r-4' : 'border-l-4'} border-yellow-400 p-4 rounded mb-6`}>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    {language === 'ar' ? 'إشعار مهم' : 'Important Notice'}
                  </h3>
                  <p className="text-yellow-700">
                    {language === 'ar'
                      ? 'رشاد AI ليس بديلاً عن المشورة الطبية المهنية أو التشخيص أو العلاج. احرص دائمًا على طلب مشورة طبيبك أو مقدم الرعاية الصحية المؤهل الآخر بشأن أي أسئلة قد تكون لديك بخصوص حالة طبية.'
                      : 'RashadAI is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.'
                    }
                  </p>
                </div>
                <p className="text-gray-700 mb-4">
                  {language === 'ar'
                    ? 'المعلومات المقدمة من رشاد AI هي لأغراض إعلامية وتعليمية فقط. يوفر نظام الذكاء الاصطناعي لدينا تقييمات أولية بناءً على المعلومات التي تقدمها، ولكن لا ينبغي اعتبار هذه التقييمات تشخيصات طبية نهائية.'
                    : 'The information provided by RashadAI is for informational and educational purposes only. Our AI system provides preliminary assessments based on the information you provide, but these assessments should not be considered as definitive medical diagnoses.'
                  }
                </p>
                <p className="text-gray-700 mb-4">
                  {language === 'ar'
                    ? 'لا تتجاهل أبدًا المشورة الطبية المهنية أو تؤخر طلبها بسبب شيء قرأته أو تعلمته من خلال خدماتنا. إذا كنت تعتقد أنك تعاني من حالة طبية طارئة، فاتصل بطبيبك أو بخدمات الطوارئ على الفور.'
                    : 'Never disregard professional medical advice or delay seeking it because of something you have read or learned through our Services. If you think you may have a medical emergency, call your doctor or emergency services immediately.'
                  }
                </p>
                <p className="text-gray-700">
                  {language === 'ar'
                    ? 'لا توصي رشاد AI أو تؤيد أي اختبارات أو أطباء أو منتجات أو إجراءات أو آراء أو معلومات أخرى محددة قد يتم ذكرها من خلال خدماتنا.'
                    : 'RashadAI does not recommend or endorse any specific tests, physicians, products, procedures, opinions, or other information that may be mentioned through our Services.'
                  }
                </p>
              </section>

              <section className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <Shield className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'حسابات المستخدمين' : 'User Accounts'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'ar'
                    ? 'للوصول إلى ميزات معينة من خدماتنا، قد تحتاج إلى إنشاء حساب. أنت مسؤول عن الحفاظ على سرية معلومات حسابك، بما في ذلك كلمة المرور الخاصة بك، وعن جميع الأنشطة التي تحدث تحت حسابك.'
                    : 'To access certain features of our Services, you may need to create an account. You are responsible for maintaining the confidentiality of your account information, including your password, and for all activity that occurs under your account.'
                  }
                </p>
                <p className="text-gray-700 mb-4">
                  {language === 'ar'
                    ? 'أنت توافق على تقديم معلومات دقيقة وحديثة وكاملة أثناء عملية التسجيل وعلى تحديث هذه المعلومات للحفاظ على دقتها وحداثتها واكتمالها.'
                    : 'You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.'
                  }
                </p>
                <p className="text-gray-700">
                  {language === 'ar'
                    ? 'نحتفظ بالحق في تعليق أو إنهاء حسابك إذا ثبت أن أي معلومات مقدمة غير دقيقة أو غير حديثة أو غير كاملة، أو إذا اعتقدنا أن حسابك قد تم استخدامه لأنشطة احتيالية أو غير مصرح بها.'
                    : 'We reserve the right to suspend or terminate your account if any information provided proves to be inaccurate, not current, or incomplete, or if we believe your account has been used for fraudulent or unauthorized activities.'
                  }
                </p>
              </section>

              <section className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <Shield className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'الخصوصية وحماية البيانات' : 'Privacy and Data Protection'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'ar'
                    ? 'خصوصيتك مهمة بالنسبة لنا. تصف سياسة الخصوصية الخاصة بنا كيفية جمع واستخدام ومشاركة وحماية معلوماتك الشخصية. باستخدام خدماتنا، فإنك تقر بأنك قد قرأت وفهمت سياسة الخصوصية الخاصة بنا، والتي تم دمجها في هذه الشروط بالإشارة إليها.'
                    : 'Your privacy is important to us. Our Privacy Policy describes how we collect, use, share, and protect your personal information. By using our Services, you acknowledge that you have read and understand our Privacy Policy, which is incorporated into these Terms by reference.'
                  }
                </p>
                <p className="text-gray-700 mb-4">
                  {language === 'ar'
                    ? 'نحن نمتثل لقوانين ولوائح حماية البيانات المعمول بها، بما في ذلك قانون HIPAA (قانون نقل التأمين الصحي والمساءلة) في الولايات المتحدة. نحن ننفذ تدابير تقنية وتنظيمية مناسبة لحماية معلوماتك الشخصية.'
                    : 'We comply with applicable data protection laws and regulations, including HIPAA (Health Insurance Portability and Accountability Act) in the United States. We implement appropriate technical and organizational measures to protect your personal information.'
                  }
                </p>
                <p className="text-gray-700">
                  {language === 'ar'
                    ? 'لديك الحق في الوصول إلى معلوماتك الشخصية أو تصحيحها أو حذفها كما هو موضح في سياسة الخصوصية الخاصة بنا. لممارسة هذه الحقوق، يرجى الاتصال بنا على privacy@rashadai.com.'
                    : 'You have the right to access, correct, or delete your personal information as described in our Privacy Policy. To exercise these rights, please contact us at privacy@rashadai.com.'
                  }
                </p>
              </section>

              <section className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <FileText className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'مسؤوليات المستخدم' : 'User Responsibilities'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'ar' ? 'باستخدام خدماتنا، فإنك توافق على:' : 'By using our Services, you agree to:'}
                </p>
                <ul className={`list-disc ${language === 'ar' ? 'pr-6 text-right' : 'pl-6'} mb-4 text-gray-700 space-y-2`}>
                  {language === 'ar' ? (
                    <>
                      <li>تقديم معلومات دقيقة وكاملة عن أعراضك وتاريخك الطبي وغيرها من المعلومات المتعلقة بالصحة؛</li>
                      <li>استخدام الخدمات فقط للأغراض القانونية ووفقًا لهذه الشروط؛</li>
                      <li>عدم استخدام الخدمات بأي طريقة يمكن أن تضعف أو تثقل كاهل أو تضر بالخدمات أو تتداخل مع استخدام أي طرف آخر للخدمات؛</li>
                      <li>عدم محاولة الوصول غير المصرح به إلى أي جزء من الخدمات أو الحسابات الأخرى أو أنظمة الكمبيوتر أو الشبكات المتصلة بالخدمات؛</li>
                      <li>عدم استخدام الخدمات لحالات الطوارئ الطبية.</li>
                    </>
                  ) : (
                    <>
                      <li>Provide accurate and complete information about your symptoms, medical history, and other health-related information;</li>
                      <li>Use the Services only for lawful purposes and in accordance with these Terms;</li>
                      <li>Not use the Services in any way that could impair, overburden, or damage the Services or interfere with any other party's use of the Services;</li>
                      <li>Not attempt to gain unauthorized access to any part of the Services, other accounts, or computer systems or networks connected to the Services;</li>
                      <li>Not use the Services for emergency medical situations.</li>
                    </>
                  )}
                </ul>
                <p className="text-gray-700">
                  {language === 'ar'
                    ? 'أنت تقر بأن جودة التقييمات التي تقدمها رشاد AI تعتمد على دقة واكتمال المعلومات التي تقدمها.'
                    : 'You acknowledge that the quality of the assessments provided by RashadAI depends on the accuracy and completeness of the information you provide.'
                  }
                </p>
              </section>

              <section className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <FileText className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'ملكية الفكر الاختراعي' : 'Intellectual Property'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {
                    language === 'ar'
                      ? 'كل المحتوى المضمن في أو المتوفر من خلال خدماتنا، بما في ذلك النصوص والرسومات والشعارات والرموز والصور والتسجيلات الصوتية والتنزيلات الرقمية والجمعيات البيانات والبرامج، هو ملك RashadAI أو مزودي محتواه، ويعتبر محميًا بموجب قوانين حقوق الطبع والنشر والعلامة التجارية والملكية الفكرية في'
                      : 'All content included in or made available through our Services, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software, is the property of RashadAI or its content suppliers and is protected by United States and international copyright, trademark, and other intellectual property laws.'
                  }
                </p>
                <p className="text-gray-700 mb-4">
                  {
                    language === 'ar'
                      ? 'وفقًا لهذه الشروط، نمنحك ترخيصًا محدودًا وغير حصري وغير قابل للتحويل وقابل للإلغاء للوصول إلى الخدمات واستخدامها للاستخدام الشخصي غير التجاري. هذا الترخيص لا يشمل:'
                      : 'Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, and revocable license to access and use the Services for your personal, non-commercial use. This license does not include:'
                  }
                </p>
                <ul className={`list-disc ${language === 'ar' ? 'pr-6 text-right' : 'pl-6'} mb-4 text-gray-700 space-y-2`}>
                  {language === 'ar' ? (
                    <>
                      <li>حقك في نسخ أو توزيع أو عرض أو بيع أو ايجار أو نقل أو إنشاء أجزاء مشتقة من أو ترجمة أو تعديل أو تحليل عكسي أو تفكيك أو تفكيك أو غير ذلك من الاستفادة من خدماتنا أو أي جزء منها.</li>
                      <li>الحق في نسخ أو تخزين أي محتوى لأغراض أخرى غير استخدامك الشخصي غير التجاري؛</li>
                      <li>أي حق في استخدام التحقيقات أو الروبوتات أو طرق جمع البيانات والاستخراج المماثلة.</li>
                      <li>أي استخدام لخدماتنا الذي لم يauthorize RashadAI.</li>
                    </>
                  ) : (
                    <>
                      <li>The right to reproduce, distribute, display, sell, lease, transmit, create derivative works from, translate, modify, reverse-engineer, disassemble, decompile, or otherwise exploit the Services or any portion of it;</li>
                      <li>The right to copy or store any content for purposes other than your personal, non-commercial use;</li>
                      <li>Any right to use data mining, robots, or similar data gathering and extraction methods;</li>
                      <li>Any use of the Services that RashadAI did not intend or authorize.</li>
                    </>
                  )}
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <Shield className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'حدود المسؤولية' : 'Limitation of Liability'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {
                    language === 'ar'
                      ? 'إلى الحد الأقصى الذي يسمح به القانون المعمول به، لا تتحمل RashadAI، وشركاتها التابعة، وfficers، وemployees، وagents، وpartners، و licensors مسؤولية عن أي أضرار غير مباشرة أو مفاجئة أو خاصة أو تبعية أو عقوبات أو أضرار أخرى، بما في ذلك但不限 إلى فقدان الارباح أو البيانات أو الاستخدام أو الجودة'
                      : 'To the maximum extent permitted by applicable law, RashadAI, its affiliates, officers, employees, agents, partners, and licensors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:'
                  }
                </p>
                <ol className={`list-decimal ${language === 'ar' ? 'pr-6 text-right' : 'pl-6'} mb-4 text-gray-700 space-y-2`}>
                  {language === 'ar' ? (
                    <>
                      <li>وصولك إلى الخدمات أو استخدامك لها أو عدم قدرتك على الوصول أو الاستخدام؛</li>
                      <li>أي سلوك أو محتوى من طرف ثالث على الخدمات؛</li>
                      <li>أي محتوى تم الحصول عليه من الخدمات؛</li>
                      <li>الوصول غير المصرح به أو الاستخدام أو التعديل على بياناتك أو محتواك؛</li>
                      <li>القرارات الطبية أو الصحية التي تم اتخاذها بناءً على استخدام الخدمات؛</li>
                      <li>الأخطاء أو العثرات أو عدم الدقة في الخدمات.</li>
                    </>
                  ) : (
                    <>
                      <li>Your access to or use of or inability to access or use the Services;</li>
                      <li>Any conduct or content of any third party on the Services;</li>
                      <li>Any content obtained from the Services;</li>
                      <li>Unauthorized access, use, or alteration of your transmissions or content;</li>
                      <li>Medical or health-related decisions made based on the use of the Services;</li>
                      <li>Errors, mistakes, or inaccuracies in the Services.</li>
                    </>
                  )}
                </ol>
                <p className="text-gray-700">
                  {
                    language === 'ar'
                      ? `في أي حال من الأحوال، لن يتجاوز إجمالي مسؤولية RashadAI تجاهك عن جميع الأضرار أو الخسائر أو أسباب الدعوى المبلغ الذي دفعته إلى RashadAI في الأشهر الستة (6) الماضية، أو إذا كان أكبر، مائة دولار (100 دولار).`
                      : `In no event shall RashadAI's total liability to you for all damages, losses, or causes of action exceed the amount you have paid to RashadAI in the last six (6) months, or, if greater, one hundred dollars ($100).`
                  }
                </p>
              </section>

              <section className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <FileText className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'التعويض' : 'Indemnification'}
                </h2>
                <p className="text-gray-700">
                  {language === 'ar'
                    ? 'توافق على الدفاع عن شركة رشاد AI والشركات التابعة لها والمرخصين ومقدمي الخدمات التابعين لها، ومسؤوليها ومديريها وموظفيها ومقاوليها ووكلائها ومرخصيها ومورديها وخلفائها والمتنازل لهم عنهم، وتعويضهم وحمايتهم من وضد أي مطالبات أو التزامات أو أضرار أو أحكام أو تعويضات أو خسائر أو تكاليف أو نفقات أو رسوم (بما في ذلك أتعاب المحاماة المعقولة) الناشئة عن أو المتعلقة بانتهاكك لهذه الشروط أو استخدامك للخدمات، بما في ذلك - على سبيل المثال لا الحصر - مشاركاتك كمستخدم، أو أي استخدام لمحتوى أو خدمات أو منتجات الخدمات بغير ما هو مصرح به صراحة في هذه الشروط.'
                    : "You agree to defend, indemnify, and hold harmless RashadAI, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Services, including, but not limited to, your User Submissions, any use of the Services' content, services, and products other than as expressly authorized in these Terms."}
                </p>
              </section>

              <section className="mb-12">
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <FileText className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'إنهاء الخدمة' : 'Termination'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {language === 'ar'
                    ? 'يجوز لنا إنهاء أو تعليق حسابك والوصول إلى الخدمات فورًا ودون إشعار مسبق أو مسؤولية، لأي سبب كان، بما في ذلك - على سبيل المثال لا الحصر - إذا انتهكت هذه الشروط.'
                    : 'We may terminate or suspend your account and access to the Services immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.'}
                </p>
                <p className="text-gray-700">
                  {language === 'ar'
                    ? 'عند إنهاء الخدمة، سينتهي حقك في استخدام الخدمات فورًا. إذا رغبت في إنهاء حسابك، يمكنك ببساطة التوقف عن استخدام الخدمات أو التواصل معنا عبر support@rashadai.com.'
                    : 'Upon termination, your right to use the Services will immediately cease. If you wish to terminate your account, you may simply discontinue using the Services or contact us at support@rashadai.com.'}
                </p>
              </section>


              <section>
                <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
                  <FileText className={`h-6 w-6 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'اتصل بنا' : 'Contact Us'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {
                    language === 'ar'
                    ? 'إذا كان لديك أي أسئلة حول هذه الشروط، يرجى الاتصال بنا على:'
                    : 'If you have any questions about these Terms, please contact us at:'
                  }
                </p>
                <address className="text-gray-700 not-italic whitespace-pre-line">
                  {language === 'ar' ? (
                    <>
                      رشاد AI، شركة RashadAI, Inc.<br />
                      123 طريق الابتكار<br />
                      سان فرانسيسكو، كاليفورنيا 94103<br />
                      البريد الإلكتروني: legal@rashadai.com<br />
                      الهاتف: +201286904277
                    </>
                  ) : (
                    <>
                      RashadAI, Inc.<br />
                      123 Innovation Way<br />
                      San Francisco, CA 94103<br />
                      Email: legal@rashadai.com<br />
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
                  {language === 'ar' ? 'سياسة ملفات تعريف الارتباط' : 'Cookie Policy'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {language === 'ar'
                    ? 'فهم كيفية استخدامنا لملفات تعريف الارتباط والتقنيات المماثلة.'
                    : 'Understand how we use cookies and similar technologies.'}
                </p>
                <Link to="/cookies" className={`text-blue-600 hover:text-blue-800 font-medium ${language === 'ar' ? 'flex items-center' : ''}`}>
                  {language === 'ar'
                    ? <><span className="ml-1">قراءة سياسة ملفات تعريف الارتباط</span> ←</>
                    : 'Read Cookie Policy →'}
                </Link>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {language === 'ar' ? 'الامتثال لقانون HIPAA' : 'HIPAA Compliance'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {language === 'ar'
                    ? 'تفاصيل حول ممارسات حماية بيانات الرعاية الصحية لدينا.'
                    : 'Details about our healthcare data protection practices.'}
                </p>
                <Link to="/hipaa-compliance" className={`text-blue-600 hover:text-blue-800 font-medium ${language === 'ar' ? 'flex items-center' : ''}`}>
                  {language === 'ar'
                    ? <><span className="ml-1">قراءة بيان HIPAA</span> ←</>
                    : 'Read HIPAA Statement →'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsAndConditions;