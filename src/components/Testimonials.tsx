import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useLanguageStore } from '../store/languageStore';

const Testimonials = () => {
  const { language } = useLanguageStore();
  const isRTL = language === 'ar';
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Patient",
      image: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      content: "The AI consultation was surprisingly accurate. It identified my condition when I had been misdiagnosed twice before. The interface was easy to use, and I got my results in minutes.",
      rating: 5
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Healthcare Professional",
      image: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      content: "As a doctor, I was skeptical at first. But this platform has become an invaluable tool in my practice. It helps with preliminary diagnoses and lets me focus on complex cases.",
      rating: 5
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Parent",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      content: "When my daughter developed a rash at midnight, I was able to get immediate guidance without an emergency room visit. The peace of mind alone is worth it.",
      rating: 4
    },
    {
      id: 4,
      name: "David Wilson",
      role: "Remote Worker",
      image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      content: "Living in a rural area, access to specialists is limited. This AI service has connected me with the right doctors and helped manage my chronic condition effectively.",
      rating: 5
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-b from-white to-blue-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Thousands of people have trusted our AI medical consultation service.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Mobile testimonials (one at a time) */}
            <div className="block md:hidden">
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonials[currentIndex].image}
                    alt={testimonials[currentIndex].name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className={`${isRTL ? 'mr-4 text-right' : 'ml-4'}`}>
                    <h3 className="font-semibold text-lg">{testimonials[currentIndex].name}</h3>
                    <p className="text-gray-600">{testimonials[currentIndex].role}</p>
                    <div className={`flex mt-1 ${isRTL ? 'justify-end' : ''}`}>
                      {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className={`text-gray-700 ${isRTL ? 'text-right' : ''}`}>{testimonials[currentIndex].content}</p>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={prevTestimonial}
                  className="bg-blue-100 p-2 rounded-full text-blue-700 hover:bg-blue-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextTestimonial}
                  className="bg-blue-100 p-2 rounded-full text-blue-700 hover:bg-blue-200"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Desktop testimonials (grid) */}
            <div className="hidden md:grid md:grid-cols-2 gap-6">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white rounded-xl shadow-lg p-8 transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className={`${isRTL ? 'mr-4 text-right' : 'ml-4'}`}>
                      <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                      <p className="text-gray-600">{testimonial.role}</p>
                      <div className={`flex mt-1 ${isRTL ? 'justify-end' : ''}`}>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className={`text-gray-700 ${isRTL ? 'text-right' : ''}`}>{testimonial.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;