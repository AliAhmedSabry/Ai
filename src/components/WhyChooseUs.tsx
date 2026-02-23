import React from 'react';
import { motion } from 'framer-motion';
import {Brain,Zap,Target,BarChart,MessageCircle,Rocket } from 'lucide-react';

const WhyChooseUs: React.FC = () => {
const reasons = [
  {
    icon: Brain,
    title: 'AI-Powered Smart Learning',
    titleAr: 'تعلم ذكي بالذكاء الاصطناعي',
    description: 'Our advanced AI explains lessons in simple ways, adapts to your level, and helps you truly understand — not just memorize.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: Zap,
    title: 'Instant Homework Help',
    titleAr: 'مساعدة فورية في الواجبات',
    description: 'Stuck on a problem? Get step-by-step explanations instantly and learn how to solve it on your own.',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: Target,
    title: 'Personalized Study Plans',
    titleAr: 'خطة مذاكرة مخصصة',
    description: 'The app builds a smart study schedule based on your goals, weak points, and available time.',
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    icon: BarChart,
    title: 'Progress Tracking',
    titleAr: 'متابعة التقدم',
    description: 'Track your performance, identify weak areas, and improve faster with smart analytics.',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: MessageCircle,
    title: '24/7 AI Study Assistant',
    titleAr: 'مساعد دراسي 24/7',
    description: 'Ask unlimited questions anytime and get clear, accurate answers instantly.',
    color: 'from-pink-500 to-pink-600'
  },
  {
    icon: Rocket,
    title: 'Boost Productivity',
    titleAr: 'زيادة الإنتاجية',
    description: 'Stay focused with smart reminders, study timers, and distraction-free learning tools.',
    color: 'from-indigo-500 to-indigo-600'
  }
];


  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose Our Academy?
          </h2>
          <p className="text-2xl font-bold text-blue-600 mb-6" dir="rtl">
            لماذا تختار أكاديميتنا؟
          </p>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover what makes our learning experience unique and effective for students worldwide.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -10 }}
            >
              <motion.div
                className={`w-16 h-16 bg-gradient-to-r ${reason.color} rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <reason.icon className="w-8 h-8 text-white" />
              </motion.div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{reason.title}</h3>
              <p className="text-blue-600 font-medium mb-4 text-right" dir="rtl">{reason.titleAr}</p>
              <p className="text-gray-600 leading-relaxed">{reason.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg cursor-pointer"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Join 5,000+ Students Today!
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
