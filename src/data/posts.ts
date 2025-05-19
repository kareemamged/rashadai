import { Post } from '../types';

// Sample blog posts data
export const posts: Post[] = [
  {
    id: '1',
    title: {
      en: 'New AI Treatment Breakthrough',
      ar: 'اختراق جديد في العلاج بالذكاء الاصطناعي'
    },
    summary: {
      en: 'Recent developments in AI-assisted medical treatments show promising results for patients with chronic conditions.',
      ar: 'تُظهر التطورات الأخيرة في العلاجات الطبية المدعومة بالذكاء الاصطناعي نتائج واعدة للمرضى الذين يعانون من حالات مزمنة.'
    },
    content: {
      en: `
      <p>A groundbreaking development in AI-assisted medical treatments has shown remarkable promise for patients suffering from various chronic conditions. This innovative approach combines machine learning algorithms with traditional medical knowledge to create personalized treatment plans.</p>

      <p>The study, conducted over a three-year period, demonstrated a 45% improvement in patient outcomes when compared to standard treatment protocols. Researchers attribute this success to the AI's ability to analyze vast amounts of medical data and identify patterns that might be missed by human practitioners.</p>

      <p>"This represents a paradigm shift in how we approach chronic disease management," says Dr. Maria Chen, lead researcher on the project. "By leveraging artificial intelligence, we can create truly personalized medicine that adapts to each patient's unique needs and responses."</p>

      <p>The technology is currently being implemented in select hospitals across the country, with plans for wider distribution within the next two years. Patients interested in participating in ongoing trials can contact their healthcare providers for more information.</p>

      <p>While the results are promising, medical professionals emphasize that AI serves as a tool to enhance human medical expertise rather than replace it. The most effective applications combine technological capabilities with the nuanced understanding and empathy of trained healthcare providers.</p>
      `,
      ar: `
      <p>أظهر تطور رائد في العلاجات الطبية المدعومة بالذكاء الاصطناعي وعدًا ملحوظًا للمرضى الذين يعانون من حالات مزمنة مختلفة. يجمع هذا النهج المبتكر بين خوارزميات التعلم الآلي والمعرفة الطبية التقليدية لإنشاء خطط علاج مخصصة.</p>

      <p>أظهرت الدراسة، التي أجريت على مدى ثلاث سنوات، تحسنًا بنسبة 45% في نتائج المرضى مقارنة ببروتوكولات العلاج القياسية. يعزو الباحثون هذا النجاح إلى قدرة الذكاء الاصطناعي على تحليل كميات هائلة من البيانات الطبية وتحديد الأنماط التي قد يفوتها الممارسون البشريون.</p>

      <p>"هذا يمثل تحولًا نموذجيًا في كيفية تعاملنا مع إدارة الأمراض المزمنة،" تقول الدكتورة ماريا تشن، الباحثة الرئيسية في المشروع. "من خلال الاستفادة من الذكاء الاصطناعي، يمكننا إنشاء طب مخصص حقًا يتكيف مع الاحتياجات والاستجابات الفريدة لكل مريض."</p>

      <p>يتم حاليًا تنفيذ التكنولوجيا في مستشفيات مختارة في جميع أنحاء البلاد، مع خطط لتوزيع أوسع خلال العامين المقبلين. يمكن للمرضى المهتمين بالمشاركة في التجارب الجارية الاتصال بمقدمي الرعاية الصحية للحصول على مزيد من المعلومات.</p>

      <p>على الرغم من أن النتائج واعدة، يؤكد المتخصصون الطبيون أن الذكاء الاصطناعي يعمل كأداة لتعزيز الخبرة الطبية البشرية وليس لاستبدالها. تجمع التطبيقات الأكثر فعالية بين القدرات التكنولوجية والفهم الدقيق والتعاطف من مقدمي الرعاية الصحية المدربين.</p>
      `
    },
    category: 'news',
    publishedDate: '2024-05-15',
    imageUrl: 'https://images.pexels.com/photos/3825586/pexels-photo-3825586.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    author: {
      name: 'Dr. James Wilson',
      avatarUrl: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    }
  },
  {
    id: '2',
    title: {
      en: '5 Ways to Improve Your Heart Health',
      ar: '5 طرق لتحسين صحة قلبك'
    },
    summary: {
      en: 'Simple lifestyle changes that can significantly reduce your risk of heart disease and improve overall cardiovascular health.',
      ar: 'تغييرات بسيطة في نمط الحياة يمكن أن تقلل بشكل كبير من خطر الإصابة بأمراض القلب وتحسن صحة القلب والأوعية الدموية بشكل عام.'
    },
    content: {
      en: `
      <p>Heart disease remains one of the leading causes of death worldwide, but the good news is that many risk factors are within our control. By making these five simple lifestyle changes, you can significantly improve your heart health and reduce your risk of cardiovascular problems.</p>

      <h3>1. Adopt a Heart-Healthy Diet</h3>
      <p>Focus on consuming a variety of fruits, vegetables, whole grains, and lean proteins. Limit saturated fats, trans fats, sodium, and added sugars. The Mediterranean and DASH diets have been shown to be particularly beneficial for heart health.</p>

      <h3>2. Engage in Regular Physical Activity</h3>
      <p>Aim for at least 150 minutes of moderate-intensity aerobic exercise or 75 minutes of vigorous activity each week. Even small amounts of movement throughout the day can make a difference. Find activities you enjoy so you're more likely to stick with them.</p>

      <h3>3. Maintain a Healthy Weight</h3>
      <p>Excess weight, especially around the midsection, puts additional strain on your heart. Even modest weight loss can reduce this burden and improve blood pressure, cholesterol levels, and blood sugar control.</p>

      <h3>4. Prioritize Quality Sleep</h3>
      <p>Poor sleep quality and insufficient sleep duration are associated with increased risk of heart disease. Most adults need 7-9 hours of quality sleep each night. Establish a regular sleep schedule and create a restful environment to improve sleep quality.</p>

      <h3>5. Manage Stress Effectively</h3>
      <p>Chronic stress can contribute to heart disease through various mechanisms, including elevated blood pressure and inflammation. Find healthy stress management techniques that work for you, such as mindfulness, deep breathing exercises, or regular physical activity.</p>

      <p>Remember, it's never too late to start making heart-healthy choices. Even small changes can have significant benefits when maintained over time. Consult with your healthcare provider before making major lifestyle changes, especially if you have existing health conditions.</p>
      `,
      ar: `
      <p>لا تزال أمراض القلب من الأسباب الرئيسية للوفاة في جميع أنحاء العالم، ولكن الخبر السار هو أن العديد من عوامل الخطر تحت سيطرتنا. من خلال إجراء هذه التغييرات الخمسة البسيطة في نمط الحياة، يمكنك تحسين صحة قلبك بشكل كبير وتقليل خطر الإصابة بمشاكل القلب والأوعية الدموية.</p>

      <h3>1. اعتماد نظام غذائي صحي للقلب</h3>
      <p>ركز على تناول مجموعة متنوعة من الفواكه والخضروات والحبوب الكاملة والبروتينات الخالية من الدهون. حد من الدهون المشبعة والدهون المتحولة والصوديوم والسكريات المضافة. ثبت أن حمية البحر المتوسط ونظام DASH الغذائي مفيدان بشكل خاص لصحة القلب.</p>

      <h3>2. ممارسة النشاط البدني بانتظام</h3>
      <p>اهدف إلى ممارسة 150 دقيقة على الأقل من التمارين الهوائية متوسطة الشدة أو 75 دقيقة من النشاط القوي كل أسبوع. حتى كميات صغيرة من الحركة طوال اليوم يمكن أن تحدث فرقًا. ابحث عن الأنشطة التي تستمتع بها حتى تكون أكثر عرضة للالتزام بها.</p>

      <h3>3. الحفاظ على وزن صحي</h3>
      <p>يضع الوزن الزائد، خاصة حول منطقة الوسط، ضغطًا إضافيًا على قلبك. حتى فقدان الوزن المتواضع يمكن أن يقلل من هذا العبء ويحسن ضغط الدم ومستويات الكوليسترول والتحكم في نسبة السكر في الدم.</p>

      <h3>4. إعطاء الأولوية لنوم جيد</h3>
      <p>ترتبط جودة النوم السيئة ومدة النوم غير الكافية بزيادة خطر الإصابة بأمراض القلب. يحتاج معظم البالغين إلى 7-9 ساعات من النوم الجيد كل ليلة. ضع جدولًا منتظمًا للنوم وأنشئ بيئة مريحة لتحسين جودة النوم.</p>

      <h3>5. إدارة التوتر بشكل فعال</h3>
      <p>يمكن أن يساهم الإجهاد المزمن في أمراض القلب من خلال آليات مختلفة، بما في ذلك ارتفاع ضغط الدم والالتهاب. ابحث عن تقنيات صحية لإدارة التوتر تناسبك، مثل اليقظة الذهنية وتمارين التنفس العميق أو النشاط البدني المنتظم.</p>

      <p>تذكر، لم يفت الأوان أبدًا للبدء في اتخاذ خيارات صحية للقلب. حتى التغييرات الصغيرة يمكن أن يكون لها فوائد كبيرة عند الحفاظ عليها بمرور الوقت. استشر مقدم الرعاية الصحية الخاص بك قبل إجراء تغييرات كبيرة في نمط الحياة، خاصة إذا كنت تعاني من حالات صحية موجودة.</p>
      `
    },
    category: 'tip',
    publishedDate: '2024-05-10',
    imageUrl: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    author: {
      name: 'Dr. Sarah Johnson',
      avatarUrl: 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    }
  },
  {
    id: '3',
    title: {
      en: 'RashadAI Launches New Mobile App',
      ar: 'RashadAI يطلق تطبيقًا جديدًا للهواتف المحمولة'
    },
    summary: {
      en: 'Our new mobile application brings AI-powered medical consultation to your smartphone, making healthcare more accessible than ever.',
      ar: 'يجلب تطبيقنا الجديد للهواتف المحمولة استشارات طبية مدعومة بالذكاء الاصطناعي إلى هاتفك الذكي، مما يجعل الرعاية الصحية أكثر سهولة من أي وقت مضى.'
    },
    content: {
      en: `
      <p>We're excited to announce the launch of our new RashadAI mobile application, designed to bring the power of AI-assisted medical consultation directly to your smartphone. This innovative app represents our commitment to making healthcare more accessible, affordable, and convenient for everyone.</p>

      <p>The RashadAI mobile app includes all the features you've come to expect from our web platform, optimized for a seamless mobile experience. Key features include:</p>

      <ul>
        <li><strong>Symptom Assessment:</strong> Describe your symptoms and receive AI-generated guidance</li>
        <li><strong>Medication Reminders:</strong> Never miss a dose with customizable medication alerts</li>
        <li><strong>Secure Health Records:</strong> Store and access your medical information safely</li>
        <li><strong>Direct Messaging:</strong> Communicate with healthcare providers through our secure platform</li>
        <li><strong>Appointment Scheduling:</strong> Book consultations with specialists with just a few taps</li>
      </ul>

      <p>"The launch of our mobile app represents a significant step forward in our mission to democratize healthcare," says RashadAI CEO Emma Richards. "By putting these powerful tools in people's pockets, we're helping them take control of their health in unprecedented ways."</p>

      <p>The app is now available for download on both iOS and Android platforms. New users can sign up for a free 30-day trial to experience the full range of premium features before deciding on a subscription plan.</p>

      <p>We're committed to continually improving the app based on user feedback and the latest advancements in AI and healthcare technology. Regular updates will introduce new features and enhance existing functionality to provide the best possible experience for our users.</p>
    `,
      ar: `
      <p>يسرنا أن نعلن عن إطلاق تطبيق RashadAI الجديد للهواتف المحمولة، المصمم لجلب قوة الاستشارات الطبية المدعومة بالذكاء الاصطناعي مباشرة إلى هاتفك الذكي. يمثل هذا التطبيق المبتكر التزامنا بجعل الرعاية الصحية أكثر سهولة وبأسعار معقولة وملائمة للجميع.</p>

      <p>يتضمن تطبيق RashadAIللهواتف المحمولة جميع الميزات التي اعتدت عليها من منصتنا على الويب، مع تحسينها لتجربة سلسة على الهاتف المحمول. تشمل الميزات الرئيسية:</p>

      <ul>
        <li><strong>تقييم الأعراض:</strong> وصف أعراضك والحصول على إرشادات مولدة بالذكاء الاصطناعي</li>
        <li><strong>تذكيرات الأدوية:</strong> لا تفوت أي جرعة مع تنبيهات الأدوية القابلة للتخصيص</li>
        <li><strong>سجلات صحية آمنة:</strong> تخزين والوصول إلى معلوماتك الطبية بأمان</li>
        <li><strong>المراسلة المباشرة:</strong> التواصل مع مقدمي الرعاية الصحية من خلال منصتنا الآمنة</li>
        <li><strong>جدولة المواعيد:</strong> حجز استشارات مع المتخصصين بنقرات قليلة فقط</li>
      </ul>

      <p>"يمثل إطلاق تطبيقنا للهواتف المحمولة خطوة مهمة إلى الأمام في مهمتنا لتعميم الرعاية الصحية،" تقول إيما ريتشاردز، الرئيس التنفيذي لشركة RashadAI. "من خلال وضع هذه الأدوات القوية في جيوب الناس، نساعدهم على التحكم في صحتهم بطرق غير مسبوقة."</p>

      <p>التطبيق متاح الآن للتنزيل على منصات iOS و Android. يمكن للمستخدمين الجدد الاشتراك في تجربة مجانية لمدة 30 يومًا لتجربة المجموعة الكاملة من الميزات المتميزة قبل اتخاذ قرار بشأن خطة الاشتراك.</p>

      <p>نحن ملتزمون بتحسين التطبيق باستمرار بناءً على ملاحظات المستخدمين وأحدث التطورات في تكنولوجيا الذكاء الاصطناعي والرعاية الصحية. ستقدم التحديثات المنتظمة ميزات جديدة وتعزز الوظائف الحالية لتوفير أفضل تجربة ممكنة لمستخدمينا.</p>
    `
    },
    category: 'news',
    publishedDate: '2024-05-05',
    imageUrl: 'https://images.pexels.com/photos/6476590/pexels-photo-6476590.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    author: {
      name: 'Emma Richards',
      avatarUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    }
  },
  {
    id: '4',
    title: {
      en: 'Understanding Telemedicine: Benefits and Limitations',
      ar: 'فهم التطبيب عن بعد: الفوائد والقيود'
    },
    summary: {
      en: 'A comprehensive guide to telemedicine services, explaining when they\'re most useful and when you should seek in-person care.',
      ar: 'دليل شامل لخدمات التطبيب عن بعد، يشرح متى تكون أكثر فائدة ومتى يجب عليك طلب الرعاية الشخصية.'
    },
    content: {
      en: `
      <p>Telemedicine has revolutionized healthcare delivery, especially in recent years. This comprehensive guide explains the benefits and limitations of virtual healthcare services to help you make informed decisions about your medical care.</p>

      <h3>Benefits of Telemedicine</h3>

      <h4>Convenience and Accessibility</h4>
      <p>Telemedicine eliminates travel time and reduces waiting room delays. It's particularly valuable for people in rural areas, those with mobility issues, or busy individuals who struggle to fit healthcare appointments into their schedules.</p>

      <h4>Cost-Effectiveness</h4>
      <p>Virtual visits often cost less than in-person appointments, both in terms of direct medical expenses and indirect costs like transportation and time off work. Many insurance plans now cover telemedicine services.</p>

      <h4>Continuity of Care</h4>
      <p>Telemedicine makes it easier to maintain regular contact with healthcare providers for chronic condition management, medication adjustments, and follow-up appointments.</p>

      <h4>Reduced Exposure to Illness</h4>
      <p>Virtual appointments eliminate potential exposure to contagious illnesses that might be present in waiting rooms and healthcare facilities.</p>

      <h3>Limitations and Considerations</h3>

      <h4>Physical Examination Constraints</h4>
      <p>Some conditions require hands-on physical examinations that simply cannot be conducted virtually. Diagnostic procedures like lab tests, imaging studies, and biopsies must be performed in person.</p>

      <h4>Technology Barriers</h4>
      <p>Not everyone has access to reliable internet connections or devices needed for virtual appointments. Some patients, particularly older adults, may not be comfortable with the technology.</p>

      <h4>Communication Challenges</h4>
      <p>Virtual interactions may miss subtle non-verbal cues that can be important in diagnosis and treatment. Some patients find it more difficult to build rapport with healthcare providers through screens.</p>

      <h3>When to Choose Telemedicine</h3>
      <p>Telemedicine is generally well-suited for:</p>
      <ul>
        <li>Minor illnesses like colds, allergies, and rashes</li>
        <li>Mental health consultations</li>
        <li>Follow-up appointments for stable chronic conditions</li>
        <li>Medication management and prescription renewals</li>
        <li>Reviewing test results</li>
        <li>Nutritional counseling</li>
      </ul>

      <h3>When to Seek In-Person Care</h3>
      <p>Consider in-person visits for:</p>
      <ul>
        <li>Emergency situations and severe symptoms</li>
        <li>Conditions requiring physical examination</li>
        <li>Diagnostic testing and procedures</li>
        <li>Complex health issues with multiple symptoms</li>
        <li>New, undiagnosed conditions</li>
      </ul>

      <p>The future of healthcare likely involves a hybrid approach that combines the convenience of telemedicine with traditional in-person care. By understanding the strengths and limitations of each approach, you can make the best choices for your specific healthcare needs.</p>
    `,
      ar: `
      <p>لقد أحدث التطبيب عن بعد ثورة في تقديم الرعاية الصحية، خاصة في السنوات الأخيرة. يشرح هذا الدليل الشامل فوائد وقيود خدمات الرعاية الصحية الافتراضية لمساعدتك على اتخاذ قرارات مستنيرة بشأن رعايتك الطبية.</p>

      <h3>فوائد التطبيب عن بعد</h3>

      <h4>الراحة وسهولة الوصول</h4>
      <p>يلغي التطبيب عن بعد وقت السفر ويقلل من تأخيرات غرفة الانتظار. وهو ذو قيمة خاصة للأشخاص في المناطق الريفية، وأولئك الذين يعانون من مشاكل في التنقل، أو الأفراد المشغولين الذين يكافحون لتناسب مواعيد الرعاية الصحية في جداولهم.</p>

      <h4>فعالية التكلفة</h4>
      <p>غالبًا ما تكلف الزيارات الافتراضية أقل من المواعيد الشخصية، سواء من حيث النفقات الطبية المباشرة أو التكاليف غير المباشرة مثل النقل والإجازة من العمل. تغطي العديد من خطط التأمين الآن خدمات التطبيب عن بعد.</p>

      <h4>استمرارية الرعاية</h4>
      <p>يسهل التطبيب عن بعد الحفاظ على اتصال منتظم مع مقدمي الرعاية الصحية لإدارة الحالات المزمنة، وتعديلات الأدوية، ومواعيد المتابعة.</p>

      <h4>تقليل التعرض للمرض</h4>
      <p>تلغي المواعيد الافتراضية التعرض المحتمل للأمراض المعدية التي قد تكون موجودة في غرف الانتظار ومرافق الرعاية الصحية.</p>

      <h3>القيود والاعتبارات</h3>

      <h4>قيود الفحص البدني</h4>
      <p>تتطلب بعض الحالات فحوصات بدنية يدوية لا يمكن إجراؤها افتراضيًا. يجب إجراء الإجراءات التشخيصية مثل اختبارات المختبر ودراسات التصوير والخزعات شخصيًا.</p>

      <h4>حواجز التكنولوجيا</h4>
      <p>ليس لدى الجميع إمكانية الوصول إلى اتصالات إنترنت موثوقة أو الأجهزة اللازمة للمواعيد الافتراضية. قد لا يشعر بعض المرضى، وخاصة كبار السن، بالراحة مع التكنولوجيا.</p>

      <h4>تحديات التواصل</h4>
      <p>قد تفتقد التفاعلات الافتراضية إشارات غير لفظية دقيقة يمكن أن تكون مهمة في التشخيص والعلاج. يجد بعض المرضى صعوبة أكبر في بناء علاقة مع مقدمي الرعاية الصحية من خلال الشاشات.</p>

      <h3>متى تختار التطبيب عن بعد</h3>
      <p>التطبيب عن بعد مناسب بشكل عام لـ:</p>
      <ul>
        <li>الأمراض البسيطة مثل نزلات البرد والحساسية والطفح الجلدي</li>
        <li>استشارات الصحة النفسية</li>
        <li>مواعيد المتابعة للحالات المزمنة المستقرة</li>
        <li>إدارة الأدوية وتجديد الوصفات الطبية</li>
        <li>مراجعة نتائج الاختبارات</li>
        <li>الاستشارات الغذائية</li>
      </ul>

      <h3>متى تطلب الرعاية الشخصية</h3>
      <p>فكر في الزيارات الشخصية لـ:</p>
      <ul>
        <li>حالات الطوارئ والأعراض الشديدة</li>
        <li>الحالات التي تتطلب فحصًا بدنيًا</li>
        <li>الاختبارات والإجراءات التشخيصية</li>
        <li>مشاكل صحية معقدة ذات أعراض متعددة</li>
        <li>حالات جديدة غير مشخصة</li>
      </ul>

      <p>من المحتمل أن يتضمن مستقبل الرعاية الصحية نهجًا هجينًا يجمع بين راحة التطبيب عن بعد والرعاية الشخصية التقليدية. من خلال فهم نقاط القوة والقيود في كل نهج، يمكنك اتخاذ أفضل الخيارات لاحتياجات الرعاية الصحية الخاصة بك.</p>
    `
    },
    category: 'tip',
    publishedDate: '2024-05-01',
    imageUrl: 'https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    author: {
      name: 'Dr. Michael Chen',
      avatarUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    }
  },
  {
    id: '5',
    title: {
      en: 'New Research on Sleep and Immune Function',
      ar: 'أبحاث جديدة حول النوم ووظيفة المناعة'
    },
    summary: {
      en: 'Recent studies highlight the critical role of quality sleep in maintaining a robust immune system and overall health.',
      ar: 'تسلط الدراسات الحديثة الضوء على الدور الحاسم للنوم الجيد في الحفاظ على نظام مناعي قوي وصحة عامة.'
    },
    content: {
      en: `
      <p>Recent research has shed new light on the intricate relationship between sleep and immune function, emphasizing the critical importance of quality sleep for maintaining overall health and preventing disease.</p>

      <p>A groundbreaking study published last month in the Journal of Immunology Research demonstrated that consistent sleep deprivation—even mild shortfalls of 1-2 hours per night—can reduce immune cell activity by up to 30% after just one week. This reduction in immune function makes the body significantly more vulnerable to infections and may contribute to chronic inflammation.</p>

      <p>"We've known for some time that sleep and immunity are connected, but these new findings reveal just how quickly and dramatically sleep deficiency can impact our body's defense systems," explains Dr. Rebecca Torres, immunologist and lead researcher on the study.</p>

      <h3>Key Findings from Recent Research</h3>

      <p>Multiple studies over the past year have contributed to our understanding of the sleep-immunity connection:</p>

      <ul>
        <li>During sleep, especially deep sleep, the body produces and releases cytokines—proteins that target infection and inflammation</li>
        <li>Sleep deprivation decreases the production of protective cytokines while increasing inflammatory markers</li>
        <li>Regular sleep of 7-9 hours improves T-cell functioning, enhancing the body's ability to fight viral infections</li>
        <li>Quality of sleep matters as much as quantity—fragmented sleep provides fewer immune benefits than continuous sleep</li>
        <li>Consistent sleep schedules support the body's circadian rhythms, which regulate immune system activity</li>
      </ul>

      <h3>Practical Applications</h3>

      <p>Based on these findings, health experts recommend several strategies to optimize sleep for immune support:</p>

      <ol>
        <li><strong>Prioritize sleep consistency</strong> by going to bed and waking up at the same times, even on weekends</li>
        <li><strong>Create a sleep-conducive environment</strong> that is dark, quiet, and cool</li>
        <li><strong>Limit screen time</strong> for at least one hour before bedtime to reduce exposure to sleep-disrupting blue light</li>
        <li><strong>Manage stress</strong> through relaxation techniques such as meditation or deep breathing exercises</li>
        <li><strong>Avoid caffeine and alcohol</strong> close to bedtime, as both can interfere with sleep quality</li>
      </ol>

      <p>"These findings emphasize that quality sleep should be considered a pillar of immune health, alongside nutrition, physical activity, and stress management," notes Dr. Torres. "In our busy society, we often sacrifice sleep, but these studies show that doing so comes at a considerable cost to our health."</p>

      <p>As research in this area continues, scientists hope to develop more targeted interventions to help those with sleep disorders improve their immune function and overall health outcomes.</p>
    `,
      ar: `
      <p>ألقت الأبحاث الحديثة ضوءًا جديدًا على العلاقة المعقدة بين النوم ووظيفة المناعة، مؤكدة على الأهمية الحاسمة للنوم الجيد للحفاظ على الصحة العامة والوقاية من الأمراض.</p>

      <p>أظهرت دراسة رائدة نُشرت الشهر الماضي في مجلة أبحاث المناعة أن الحرمان المستمر من النوم - حتى النقص البسيط من 1-2 ساعة في الليلة - يمكن أن يقلل من نشاط الخلايا المناعية بنسبة تصل إلى 30٪ بعد أسبوع واحد فقط. هذا الانخفاض في وظيفة المناعة يجعل الجسم أكثر عرضة للإصابة بالعدوى بشكل كبير وقد يساهم في الالتهاب المزمن.</p>

      <p>"لقد عرفنا منذ فترة أن النوم والمناعة مرتبطان، لكن هذه النتائج الجديدة تكشف مدى سرعة وشدة تأثير نقص النوم على أنظمة الدفاع في أجسامنا،" توضح الدكتورة ريبيكا توريس، أخصائية المناعة والباحثة الرئيسية في الدراسة.</p>

      <h3>النتائج الرئيسية من الأبحاث الحديثة</h3>

      <p>ساهمت دراسات متعددة على مدار العام الماضي في فهمنا للعلاقة بين النوم والمناعة:</p>

      <ul>
        <li>خلال النوم، خاصة النوم العميق، ينتج الجسم ويطلق السيتوكينات - وهي بروتينات تستهدف العدوى والالتهابات</li>
        <li>يقلل الحرمان من النوم من إنتاج السيتوكينات الواقية مع زيادة علامات الالتهاب</li>
        <li>النوم المنتظم لمدة 7-9 ساعات يحسن وظائف الخلايا التائية، مما يعزز قدرة الجسم على مكافحة العدوى الفيروسية</li>
        <li>جودة النوم مهمة بقدر الكمية - النوم المتقطع يوفر فوائد مناعية أقل من النوم المستمر</li>
        <li>تدعم جداول النوم المتسقة إيقاعات الجسم اليومية، التي تنظم نشاط الجهاز المناعي</li>
      </ul>

      <h3>التطبيقات العملية</h3>

      <p>بناءً على هذه النتائج، يوصي خبراء الصحة بعدة استراتيجيات لتحسين النوم لدعم المناعة:</p>

      <ol>
        <li><strong>إعطاء الأولوية لاتساق النوم</strong> من خلال الذهاب إلى الفراش والاستيقاظ في نفس الأوقات، حتى في عطلات نهاية الأسبوع</li>
        <li><strong>خلق بيئة مواتية للنوم</strong> تكون مظلمة وهادئة وباردة</li>
        <li><strong>الحد من وقت الشاشة</strong> لمدة ساعة واحدة على الأقل قبل وقت النوم لتقليل التعرض للضوء الأزرق الذي يعطل النوم</li>
        <li><strong>إدارة التوتر</strong> من خلال تقنيات الاسترخاء مثل التأمل أو تمارين التنفس العميق</li>
        <li><strong>تجنب الكافيين والكحول</strong> قبل وقت النوم، حيث يمكن أن يتداخل كلاهما مع جودة النوم</li>
      </ol>

      <p>"تؤكد هذه النتائج أن النوم الجيد يجب اعتباره ركيزة من ركائز صحة المناعة، إلى جانب التغذية والنشاط البدني وإدارة التوتر،" تلاحظ الدكتورة توريس. "في مجتمعنا المزدحم، غالبًا ما نضحي بالنوم، لكن هذه الدراسات تظهر أن القيام بذلك يأتي بتكلفة كبيرة على صحتنا."</p>

      <p>مع استمرار البحث في هذا المجال، يأمل العلماء في تطوير تدخلات أكثر استهدافًا لمساعدة أولئك الذين يعانون من اضطرابات النوم على تحسين وظائف المناعة لديهم ونتائج الصحة العامة.</p>
    `
    },
    category: 'news',
    publishedDate: '2024-04-28',
    imageUrl: 'https://images.pexels.com/photos/3771069/pexels-photo-3771069.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    author: {
      name: 'Dr. Rebecca Torres',
      avatarUrl: 'https://images.pexels.com/photos/3764119/pexels-photo-3764119.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    }
  },
  {
    id: '6',
    title: {
      en: 'Managing Seasonal Allergies: Expert Tips',
      ar: 'إدارة الحساسية الموسمية: نصائح الخبراء'
    },
    summary: {
      en: 'Practical strategies to minimize allergy symptoms and enjoy the changing seasons without discomfort.',
      ar: 'استراتيجيات عملية لتقليل أعراض الحساسية والاستمتاع بتغير الفصول دون انزعاج.'
    },
    content: {
      en: `
      <p>For millions of people, the changing seasons bring not just new weather but also the misery of seasonal allergies. While complete avoidance of allergens isn't always possible, these expert-recommended strategies can help you manage symptoms effectively and enjoy seasonal changes with minimal discomfort.</p>

      <h3>Understanding Seasonal Allergies</h3>

      <p>Seasonal allergies, also known as allergic rhinitis or hay fever, occur when your immune system overreacts to environmental allergens like pollen, mold spores, or grass. This hypersensitivity triggers the release of histamines and other chemicals that cause familiar symptoms like sneezing, runny nose, itchy eyes, and congestion.</p>

      <h3>Preventive Strategies</h3>

      <h4>Track Pollen Counts</h4>
      <p>Use weather apps or websites to monitor local pollen forecasts. When counts are high, limit outdoor activities, especially in the morning when pollen levels typically peak. After a rainstorm is often the best time to venture outdoors, as rain helps clear pollen from the air.</p>

      <h4>Create an Allergen Barrier</h4>
      <p>Consider wearing wraparound sunglasses to protect your eyes from airborne allergens. For those with severe allergies, wearing a mask during outdoor activities can significantly reduce exposure, particularly when doing yard work or exercising outdoors.</p>

      <h4>Modify Your Home Environment</h4>
      <ul>
        <li>Keep windows closed during high pollen seasons, using air conditioning if needed</li>
        <li>Use high-efficiency air purifiers in bedrooms and frequently used living spaces</li>
        <li>Change clothes and shower after spending time outdoors to remove pollen</li>
        <li>Wash bedding weekly in hot water to remove allergen accumulation</li>
        <li>Consider removing shoes at the door to avoid tracking allergens inside</li>
      </ul>

      <h3>Treatment Options</h3>

      <h4>Over-the-Counter Medications</h4>
      <p>Several effective options are available without prescription:</p>
      <ul>
        <li><strong>Antihistamines</strong> block the action of histamine, reducing sneezing, itching, and runny nose</li>
        <li><strong>Decongestants</strong> reduce nasal congestion but should be used sparingly and not by those with certain health conditions</li>
        <li><strong>Nasal corticosteroid sprays</strong> reduce inflammation and are considered among the most effective allergy treatments</li>
        <li><strong>Saline nasal irrigation</strong> helps flush allergens from nasal passages</li>
      </ul>

      <h4>Prescription Treatments</h4>
      <p>If over-the-counter options aren't providing relief, consult with a healthcare provider about:</p>
      <ul>
        <li>Prescription-strength antihistamines or corticosteroids</li>
        <li>Leukotriene modifiers for allergy symptoms resistant to other treatments</li>
        <li>Immunotherapy (allergy shots or sublingual tablets) for long-term symptom reduction</li>
      </ul>

      <h3>Natural Approaches</h3>

      <p>Some people find relief through complementary approaches:</p>
      <ul>
        <li>Local honey consumption (though scientific evidence is limited)</li>
        <li>Nasal irrigation with saline solution</li>
        <li>Certain herbal supplements like butterbur (consult healthcare providers before trying)</li>
        <li>Acupuncture, which some studies suggest may help with allergy symptoms</li>
      </ul>

      <p>"The key to managing seasonal allergies is developing a multi-faceted approach that combines environmental modifications, medication when needed, and lifestyle adjustments," explains allergist Dr. Sophia Martinez. "With the right strategy, most people can significantly reduce their allergy burden."</p>

      <p>Consider tracking your symptoms and their correlation with activities, locations, and weather conditions to develop a personalized management plan that works best for your specific allergy profile.</p>
    `,
      ar: `
      <p>بالنسبة لملايين الأشخاص، لا تجلب تغيرات الفصول طقسًا جديدًا فحسب، بل تجلب أيضًا معاناة الحساسية الموسمية. في حين أن التجنب الكامل للمسببات ليس ممكنًا دائمًا، يمكن أن تساعدك هذه الاستراتيجيات الموصى بها من قبل الخبراء على إدارة الأعراض بفعالية والاستمتاع بالتغيرات الموسمية مع الحد الأدنى من الانزعاج.</p>

      <h3>فهم الحساسية الموسمية</h3>

      <p>تحدث الحساسية الموسمية، المعروفة أيضًا باسم التهاب الأنف التحسسي أو حمى القش، عندما يبالغ جهاز المناعة لديك في رد الفعل تجاه مسببات الحساسية البيئية مثل حبوب اللقاح أو جراثيم العفن أو العشب. تؤدي هذه الحساسية المفرطة إلى إطلاق الهيستامين ومواد كيميائية أخرى تسبب أعراضًا مألوفة مثل العطس وسيلان الأنف وحكة العينين واحتقان الأنف.</p>

      <h3>استراتيجيات وقائية</h3>

      <h4>تتبع عدد حبوب اللقاح</h4>
      <p>استخدم تطبيقات الطقس أو المواقع الإلكترونية لمراقبة توقعات حبوب اللقاح المحلية. عندما تكون الأعداد مرتفعة، قلل من الأنشطة الخارجية، خاصة في الصباح عندما تصل مستويات حبوب اللقاح عادة إلى ذروتها. غالبًا ما يكون الوقت بعد العاصفة المطرية هو أفضل وقت للخروج، حيث يساعد المطر على تنظيف حبوب اللقاح من الهواء.</p>

      <h4>إنشاء حاجز ضد مسببات الحساسية</h4>
      <p>فكر في ارتداء نظارات شمسية ملفوفة لحماية عينيك من مسببات الحساسية المحمولة جوًا. بالنسبة لأولئك الذين يعانون من حساسية شديدة، يمكن أن يقلل ارتداء قناع أثناء الأنشطة الخارجية بشكل كبير من التعرض، خاصة عند القيام بأعمال الحديقة أو ممارسة الرياضة في الهواء الطلق.</p>

      <h4>تعديل بيئة منزلك</h4>
      <ul>
        <li>أبقِ النوافذ مغلقة خلال مواسم حبوب اللقاح المرتفعة، واستخدم مكيف الهواء إذا لزم الأمر</li>
        <li>استخدم منقيات هواء عالية الكفاءة في غرف النوم والمساحات المعيشية المستخدمة بشكل متكرر</li>
        <li>غيّر ملابسك واستحم بعد قضاء الوقت في الخارج لإزالة حبوب اللقاح</li>
        <li>اغسل الفراش أسبوعيًا بالماء الساخن لإزالة تراكم مسببات الحساسية</li>
        <li>فكر في خلع الأحذية عند الباب لتجنب جلب مسببات الحساسية إلى الداخل</li>
      </ul>

      <h3>خيارات العلاج</h3>

      <h4>الأدوية التي لا تستلزم وصفة طبية</h4>
      <p>تتوفر عدة خيارات فعالة بدون وصفة طبية:</p>
      <ul>
        <li><strong>مضادات الهيستامين</strong> تمنع عمل الهيستامين، مما يقلل من العطس والحكة وسيلان الأنف</li>
        <li><strong>مزيلات الاحتقان</strong> تقلل من احتقان الأنف ولكن يجب استخدامها بشكل محدود وليس من قبل أولئك الذين يعانون من حالات صحية معينة</li>
        <li><strong>بخاخات الكورتيكوستيرويد الأنفية</strong> تقلل الالتهاب وتعتبر من بين أكثر علاجات الحساسية فعالية</li>
        <li><strong>غسل الأنف بالمحلول الملحي</strong> يساعد على طرد مسببات الحساسية من ممرات الأنف</li>
      </ul>

      <h4>العلاجات التي تستلزم وصفة طبية</h4>
      <p>إذا لم توفر الخيارات التي لا تستلزم وصفة طبية الراحة، استشر مقدم الرعاية الصحية بشأن:</p>
      <ul>
        <li>مضادات الهيستامين أو الكورتيكوستيرويدات بقوة الوصفة الطبية</li>
        <li>معدلات الليكوترين لأعراض الحساسية المقاومة للعلاجات الأخرى</li>
        <li>العلاج المناعي (حقن الحساسية أو أقراص تحت اللسان) للحد من الأعراض على المدى الطويل</li>
      </ul>

      <h3>النهج الطبيعية</h3>

      <p>يجد بعض الناس الراحة من خلال النهج التكميلية:</p>
      <ul>
        <li>استهلاك العسل المحلي (على الرغم من أن الأدلة العلمية محدودة)</li>
        <li>غسل الأنف بمحلول ملحي</li>
        <li>بعض المكملات العشبية مثل نبات البتربور (استشر مقدمي الرعاية الصحية قبل التجربة)</li>
        <li>الوخز بالإبر، الذي تشير بعض الدراسات إلى أنه قد يساعد في أعراض الحساسية</li>
      </ul>

      <p>"المفتاح لإدارة الحساسية الموسمية هو تطوير نهج متعدد الأوجه يجمع بين التعديلات البيئية، والأدوية عند الحاجة، والتعديلات في نمط الحياة،" توضح أخصائية الحساسية الدكتورة صوفيا مارتينيز. "مع الاستراتيجية المناسبة، يمكن لمعظم الناس تقليل عبء الحساسية لديهم بشكل كبير."</p>

      <p>فكر في تتبع أعراضك وارتباطها بالأنشطة والمواقع وظروف الطقس لتطوير خطة إدارة شخصية تعمل بشكل أفضل لملف الحساسية الخاص بك.</p>
    `
    },
    category: 'tip',
    publishedDate: '2024-04-22',
    imageUrl: 'https://images.pexels.com/photos/5939401/pexels-photo-5939401.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    author: {
      name: 'Dr. Sophia Martinez',
      avatarUrl: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    }
  }
];

export const getPostById = (id: string): Post | undefined => {
  console.log("Looking for post with ID:", id, typeof id);
  console.log("Available IDs:", posts.map(post => post.id));
  return posts.find(post => post.id === id);
};