import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Users, Award } from 'lucide-react';
import type { Page } from '../App';

interface HeroProps {
  onNavigate: (page: Page) => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8 },
};

const fadeUpDelayed = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay },
});

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">

            {/* Main Title */}
            <motion.div {...fadeUp}>
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                Master
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mx-4">
                LIFE
              </span>
                Today
              </h1>
              <p className="text-4xl md:text-6xl font-bold text-blue-800 mb-8" dir="rtl">
                Make your education smarter
              </p>
            </motion.div>

            {/* Subtitle */}
            <motion.p
                className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
                {...fadeUpDelayed(0.2)}
            >
              Your Personal AI Study Partner.<br />
              Turning Confusion Into Clarity.<br />
              Boosting Productivity With Smart Learning.
            </motion.p>

            {/* Buttons */}
            <motion.div
                className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
                {...fadeUpDelayed(0.4)}
            >
              <motion.button
                  onClick={() => onNavigate('dashboard')}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center space-x-2 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
              >
                <BookOpen className="w-6 h-6" />
                <span>Start From now</span>
                <ArrowRight className="w-6 h-6" />
              </motion.button>

              <motion.button
                  onClick={() => onNavigate('about')}
                  className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-600 hover:text-white transition-all"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
              >
                Meet us
              </motion.button>
            </motion.div>

            {/* Stats Section */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
                {...fadeUpDelayed(0.6)}
            >
              <StatCard
                  icon={<Users className="w-8 h-8 text-blue-600" />}
                  bg="bg-blue-100"
                  title="5,000+"
                  subtitle="Happy Students"
              />

              <StatCard
                  icon={<ArrowRight className="w-8 h-8 text-green-600" />}
                  bg="bg-green-100"
                  title="50+"
                  subtitle="Interactive Ai assistant"
              />

              <StatCard
                  icon={<Award className="w-8 h-8 text-yellow-600" />}
                  bg="bg-yellow-100"
                  title="First"
                  subtitle="Took the best rating"
              />
            </motion.div>
          </div>
        </div>
      </section>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  bg: string;
  title: string;
  subtitle: string;
}

const StatCard = memo(({ icon, bg, title, subtitle }: StatCardProps) => (
    <div className="text-center">
      <motion.div
          className={`w-16 h-16 ${bg} rounded-full flex items-center justify-center mx-auto mb-4`}
          whileHover={{ scale: 1.1, rotate: 360 }}
          transition={{ duration: 0.5 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{subtitle}</p>
    </div>
));

export default memo(Hero);
