import React from 'react';
import Layout from '../components/Layout';
import { Activity, Brain, Shield, Users, Award, HeartPulse, Lightbulb, Code } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../store/languageStore';

const AboutUs: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();



  return (
    <Layout>
      <div className={`pt-8 pb-16 bg-gradient-to-b from-blue-50 to-white ${language === 'ar' ? 'font-cairo' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {language === 'ar'
                ? <><span className="text-blue-600">الذكاء الاصطناعي</span> يثور في مجال الرعاية الصحية</>
                : <>Revolutionizing Healthcare Through <span className="text-blue-600">Artificial Intelligence</span></>
              }
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {language === 'ar'
                ? 'في رشاد AI، نحن ملتزمون بجعل الرعاية الصحية أكثر سهولة ودقة وبأسعار معقولة من خلال التطبيق المبتكر لتكنولوجيا الذكاء الاصطناعي.'
                : "At RashadAI, we're dedicated to making healthcare more accessible, accurate, and affordable through the innovative application of artificial intelligence technology."
              }
            </p>
          </div>

          {/* Mission Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {language === 'ar' ? 'مهمتنا' : 'Our Mission'}
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                {language === 'ar'
                  ? 'تأسست رشاد AI بمهمة بسيطة لكنها قوية: توفير وصول ديمقراطي إلى رعاية صحية عالية الجودة من خلال التكنولوجيا. نحن نؤمن بأن الجميع يستحق الحصول على إرشادات طبية في الوقت المناسب، بغض النظر عن الموقع أو الدخل أو الظروف.'
                  : 'RashadAI was founded with a simple yet powerful mission: to democratize access to quality healthcare through technology. We believe that everyone deserves timely medical guidance, regardless of location, income, or circumstance.'
                }
              </p>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                {language === 'ar'
                  ? 'من خلال الجمع بين الذكاء الاصطناعي المتقدم والخبرة الطبية، نقوم بإنشاء حلول توفر تقييمات طبية أولية ومراقبة صحية وإرشادات للعافية للأفراد في جميع أنحاء العالم.'
                  : "By combining advanced artificial intelligence with medical expertise, we're creating solutions that provide preliminary medical assessments, health monitoring, and wellness guidance to individuals worldwide."
                }
              </p>
              <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : 'space-x-4'}`}>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-gray-800 font-medium">
                  {language === 'ar'
                    ? 'تسخير الذكاء الاصطناعي لجعل الرعاية الصحية أكثر ذكاءً وسرعة وتخصيصًا.'
                    : 'Harnessing AI to make healthcare smarter, faster, and more personalized.'
                  }
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <img
                src="https://images.pexels.com/photos/7088530/pexels-photo-7088530.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Medical professionals collaborating"
                className="rounded-xl shadow-xl w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Values Section */}
          <div className="max-w-5xl mx-auto mb-24">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              {language === 'ar' ? 'قيمنا الأساسية' : 'Our Core Values'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <Shield className="h-8 w-8 text-blue-600" />,
                  title: language === 'ar' ? "الثقة والخصوصية" : "Trust & Privacy",
                  description: language === 'ar'
                    ? "نتعامل مع بياناتك الطبية بأقصى درجات العناية والأمان، مما يضمن السرية في كل خطوة."
                    : "We handle your medical data with the utmost care and security, ensuring confidentiality at every step."
                },
                {
                  icon: <Award className="h-8 w-8 text-blue-600" />,
                  title: language === 'ar' ? "التميز السريري" : "Clinical Excellence",
                  description: language === 'ar'
                    ? "تم تدريب الذكاء الاصطناعي لدينا على بيانات طبية موثقة ويتم تحسينه باستمرار مع إشراف خبراء سريريين."
                    : "Our AI is trained on validated medical data and continuously improved with expert clinical oversight."
                },
                {
                  icon: <HeartPulse className="h-8 w-8 text-blue-600" />,
                  title: language === 'ar' ? "التركيز على المريض" : "Patient-Centered",
                  description: language === 'ar'
                    ? "نصمم كل ميزة مع مراعاة احتياجات المرضى الحقيقية، مع التركيز على سهولة الاستخدام والوضوح."
                    : "We design every feature with real patients' needs in mind, focusing on usability and clarity."
                },
                {
                  icon: <Users className="h-8 w-8 text-blue-600" />,
                  title: language === 'ar' ? "الشمولية" : "Inclusivity",
                  description: language === 'ar'
                    ? "نحن ملتزمون بجعل تكنولوجيا الرعاية الصحية متاحة للأشخاص من جميع الخلفيات."
                    : "We're committed to making healthcare technology accessible to people of all backgrounds."
                }
              ].map((value, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg border border-gray-100"
                >
                  <div className="bg-blue-50 p-4 rounded-full inline-flex mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-24">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              {language === 'ar' ? 'تعرف على فريق القيادة لدينا' : 'Meet Our Leadership Team'}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto text-center mb-12">
              {language === 'ar'
                ? 'يجمع فريقنا بين الخبرة في الطب والذكاء الاصطناعي وتكنولوجيا الرعاية الصحية لإنشاء حلول مبتكرة تحول رعاية المرضى.'
                : 'Our team combines expertise in medicine, artificial intelligence, and healthcare technology to create innovative solutions that transform patient care.'
              }
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: language === 'ar' ? "د. إيما ريتشاردز" : "Dr. Emma Richards",
                  role: language === 'ar' ? "المؤسس والرئيس التنفيذي" : "Founder & CEO",
                  bio: language === 'ar'
                    ? "رئيسة سابقة للطب مع 15 عامًا من الخبرة السريرية وشغف بابتكار الرعاية الصحية."
                    : "Former Chief of Medicine with 15 years of clinical experience and a passion for healthcare innovation.",
                  image: "https://images.pexels.com/photos/5214413/pexels-photo-5214413.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                },
                {
                  name: language === 'ar' ? "د. مايكل تشين" : "Dr. Michael Chen",
                  role: language === 'ar' ? "المدير الطبي" : "Chief Medical Officer",
                  bio: language === 'ar'
                    ? "طبيب معتمد مع تدريب متخصص في المعلوماتية الطبية وتطبيقات الذكاء الاصطناعي في الرعاية الصحية."
                    : "Board-certified physician with specialized training in medical informatics and AI applications in healthcare.",
                  image: "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                },
                {
                  name: language === 'ar' ? "سارة جونسون" : "Sarah Johnson",
                  role: language === 'ar' ? "المدير التقني" : "CTO",
                  bio: language === 'ar'
                    ? "باحثة في الذكاء الاصطناعي مع خبرة سابقة في شركات تقنية رائدة وتركيز على تطوير الذكاء الاصطناعي الأخلاقي."
                    : "AI researcher with previous experience at leading tech companies and a focus on ethical AI development.",
                  image: "https://images.pexels.com/photos/3765114/pexels-photo-3765114.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                }
              ].map((member, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg"
                >
                  <div className="h-64 overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technology Section */}
          <div className="max-w-5xl mx-auto" >
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center"  >
              {language === 'ar' ? 'تقنيتنا' : 'Our Technology'}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto text-center mb-12"  >
              {language === 'ar'
                ? 'نجمع بين تقنية الذكاء الاصطناعي المتطورة والخبرة السريرية لإنشاء حلول رعاية صحية موثوقة وفعالة.'
                : 'We combine cutting-edge AI technology with clinical expertise to create reliable, effective healthcare solutions.'
              }
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100"  >
                <div className="bg-blue-50 p-4 rounded-full inline-flex mb-4"  >
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800"  >
                  {language === 'ar' ? 'نماذج الذكاء الاصطناعي المتقدمة' : 'Advanced AI Models'}
                </h3>
                <p className="text-gray-600 mb-4"  >
                  {language === 'ar'
                    ? 'تم تدريب نماذج التعلم الآلي الخاصة بنا على ملايين السجلات الطبية المجهولة والأوراق البحثية والإرشادات السريرية، مما يتيح تقييمًا دقيقًا للأعراض واقتراحات التشخيص الأولية.'
                    : 'Our proprietary machine learning models are trained on millions of anonymous medical records, research papers, and clinical guidelines, enabling accurate symptom assessment and preliminary diagnosis suggestions.'
                  }
                </p>
                <ul className="space-y-2"  >
                  <li className={`flex items-start ${language === 'ar' ? '' : ''}`}  >
                    <Lightbulb className={`h-5 w-5 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'} flex-shrink-0 mt-0.5`} />
                    <span className={`text-gray-700 ${language === 'ar' ? 'text-right' : ''}`}>
                      {language === 'ar'
                        ? 'التعلم المستمر والتحسين من الأبحاث الطبية الجديدة'
                        : 'Continuously learning and improving from new medical research'
                      }
                    </span>
                  </li>
                  <li className={`flex items-start ${language === 'ar' ? '' : ''}`}  >
                    <Lightbulb className={`h-5 w-5 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'} flex-shrink-0 mt-0.5`} />
                    <span className={`text-gray-700 ${language === 'ar' ? 'text-right' : ''}`}>
                      {language === 'ar'
                        ? 'مدرب على التعرف على الأنماط عبر مجموعات متنوعة من المرضى'
                        : 'Trained to recognize patterns across diverse patient populations'
                      }
                    </span>
                  </li>
                  <li className={`flex items-start ${language === 'ar' ? '' : ''}`}  >
                    <Lightbulb className={`h-5 w-5 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'} flex-shrink-0 mt-0.5`} />
                    <span className={`text-gray-700 ${language === 'ar' ? 'text-right' : ''}`}>
                      {language === 'ar'
                        ? 'مصمم بشفافية لشرح منطقه'
                        : 'Designed with transparency to explain its reasoning'
                      }
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100"  >
                <div className="bg-blue-50 p-4 rounded-full inline-flex mb-4"  >
                  <Code className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800"  >
                  {language === 'ar' ? 'تصميم يركز على الإنسان' : 'Human-Centered Design'}
                </h3>
                <p className="text-gray-600 mb-4"  >
                  {language === 'ar'
                    ? 'تم تصميم منصتنا بمدخلات من المرضى والأطباء وخبراء تجربة المستخدم لضمان أنها بديهية ويمكن الوصول إليها ومفيدة بالفعل في سيناريوهات الرعاية الصحية في العالم الحقيقي.'
                    : "Our platform is designed with input from patients, doctors, and user experience experts to ensure it's intuitive, accessible, and actually helpful in real-world healthcare scenarios."
                  }
                </p>
                <ul className="space-y-2"  >
                  <li className={`flex items-start ${language === 'ar' ? '' : ''}`}  >
                    <Lightbulb className={`h-5 w-5 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'} flex-shrink-0 mt-0.5`} />
                    <span className={`text-gray-700 ${language === 'ar' ? 'text-right' : ''}`}>
                      {language === 'ar'
                        ? 'تم اختباره بدقة مع مجموعات مستخدمين متنوعة'
                        : 'Rigorously tested with diverse user groups'
                      }
                    </span>
                  </li>
                  <li className={`flex items-start ${language === 'ar' ? '' : ''}`}  >
                    <Lightbulb className={`h-5 w-5 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'} flex-shrink-0 mt-0.5`} />
                    <span className={`text-gray-700 ${language === 'ar' ? 'text-right' : ''}`}>
                      {language === 'ar'
                        ? 'مصمم للوصول عبر قدرات مختلفة'
                        : 'Designed for accessibility across different abilities'
                      }
                    </span>
                  </li>
                  <li className={`flex items-start ${language === 'ar' ? '' : ''}`}  >
                    <Lightbulb className={`h-5 w-5 text-blue-600 ${language === 'ar' ? 'ml-2' : 'mr-2'} flex-shrink-0 mt-0.5`} />
                    <span className={`text-gray-700 ${language === 'ar' ? 'text-right' : ''}`}>
                      {language === 'ar'
                        ? 'تحديثات منتظمة بناءً على تعليقات المستخدمين والأبحاث الجديدة'
                        : 'Regular updates based on user feedback and new research'
                      }
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Timeline Section */}
      <div className={`py-20 bg-gray-50 ${language === 'ar' ? 'font-cairo' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            {t('about.journey.title')}
          </h2>
          <div className="max-w-4xl mx-auto">
            {[
              {
                year: t('about.journey.milestone1.year'),
                title: t('about.journey.milestone1.title'),
                description: t('about.journey.milestone1.description')
              },
              {
                year: t('about.journey.milestone2.year'),
                title: t('about.journey.milestone2.title'),
                description: t('about.journey.milestone2.description')
              },
              {
                year: t('about.journey.milestone3.year'),
                title: t('about.journey.milestone3.title'),
                description: t('about.journey.milestone3.description')
              },
              {
                year: t('about.journey.milestone4.year'),
                title: t('about.journey.milestone4.title'),
                description: t('about.journey.milestone4.description')
              },
              {
                year: t('about.journey.milestone5.year'),
                title: t('about.journey.milestone5.title'),
                description: t('about.journey.milestone5.description')
              }
            ].map((milestone, index) => (
              <div
                key={index}
                className={`relative ${language === 'ar' ? 'pr-8' : 'pl-8'} pb-12 ${language === 'ar' ? 'border-r-2' : 'border-l-2'} border-blue-200 last:border-transparent last:pb-0`}
              >
                <div
                  className={`absolute ${language === 'ar' ? 'right-[-8px]' : 'left-[-8px]'} top-0 h-4 w-4 rounded-full bg-blue-600`}
                ></div>
                <div className={`${language === 'ar' ? 'mr-6 text-right' : 'ml-6'}`}>
                  <span className="block text-sm font-semibold text-blue-600 mb-1">{milestone.year}</span>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{milestone.title}</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Partners & Recognition Section */}
      <div className={`py-20 ${language === 'ar' ? 'font-cairo' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            {language === 'ar' ? 'الشركاء والتقدير' : 'Partners & Recognition'}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto text-center mb-12">
            {language === 'ar'
              ? 'نحن فخورون بالتعاون مع المنظمات الصحية الرائدة وبالاعتراف بمساهماتنا في ابتكار الرعاية الصحية.'
              : "We're proud to collaborate with leading healthcare organizations and to be recognized for our contributions to healthcare innovation."
            }
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center mb-16">
            <div className="flex justify-center">
              <div className="h-16 w-48 bg-gray-200 rounded flex items-center justify-center text-gray-500 font-semibold hover:bg-gray-300 transition-colors duration-300">
                {language === 'ar' ? 'شريك طبي' : 'Medical Partner'}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="h-16 w-48 bg-gray-200 rounded flex items-center justify-center text-gray-500 font-semibold hover:bg-gray-300 transition-colors duration-300">
                {language === 'ar' ? 'معهد البحوث' : 'Research Institute'}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="h-16 w-48 bg-gray-200 rounded flex items-center justify-center text-gray-500 font-semibold hover:bg-gray-300 transition-colors duration-300">
                {language === 'ar' ? 'مؤسسة الصحة' : 'Health Foundation'}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="h-16 w-48 bg-gray-200 rounded flex items-center justify-center text-gray-500 font-semibold hover:bg-gray-300 transition-colors duration-300">
                {language === 'ar' ? 'مبتكر تقني' : 'Tech Innovator'}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="bg-gray-50 px-6 py-4 rounded-lg hover:bg-gray-100 transition-colors duration-300">
              <span className="font-medium text-gray-800">
              {language === 'ar' ? 'جائزة الابتكار الصحي 2023' : 'Healthcare Innovation Award 2023'}
              </span>
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-lg hover:bg-gray-100 transition-colors duration-300">
              <span className="font-medium text-gray-800">
              {language === 'ar' ? 'أفضل شركة تكنولوجيا صحية 2022' : 'Top Health Tech Startup 2022'}
              </span>
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-lg hover:bg-gray-100 transition-colors duration-300">
              <span className="font-medium text-gray-800">
              {language === 'ar' ? 'فائزة الذكاء الاصطناعي في الطب 2023' : 'AI Excellence in Medicine 2023'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutUs;