import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FAQ = () => {
  const { t } = useTranslation();
  // Define FAQ items with translation keys
  const faqItems = [
    {
      questionKey: 'faq.question1',
      answerKey: 'faq.answer1'
    },
    {
      questionKey: 'faq.question2',
      answerKey: 'faq.answer2'
    },
    {
      questionKey: 'faq.question3',
      answerKey: 'faq.answer3'
    },
    {
      questionKey: 'faq.question4',
      answerKey: 'faq.answer4'
    },
    {
      questionKey: 'faq.question5',
      answerKey: 'faq.answer5'
    },
    {
      questionKey: 'faq.question6',
      answerKey: 'faq.answer6'
    }
  ];

  // Map the items to translated content
  const faqs = faqItems.map(item => ({
    question: t(item.questionKey),
    answer: t(item.answerKey)
  }));

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('home.faq.title')}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('home.faq.subtitle')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="mb-4 border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                className="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50 focus:outline-none"
                onClick={() => toggleFaq(index)}
              >
                <span className="font-medium text-left text-gray-800 rtl:text-right">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-blue-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-blue-600" />
                )}
              </button>
              <div
                className={`px-5 transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 overflow-hidden opacity-0'
                }`}
              >
                <p className="text-gray-600 rtl:text-right">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;