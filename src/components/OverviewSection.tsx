import React from 'react';
import { motion } from 'framer-motion';
import { Book, Users, Target, Award } from 'lucide-react';

const OverviewSection: React.FC = () => {
  const stats = [
    { icon: Book, number: '50+', label: 'Di tích lịch sử' },
    { icon: Users, number: '1M+', label: 'Lượt tham quan' },
    { icon: Target, number: '100%', label: 'Chính xác lịch sử' },
    { icon: Award, number: '#1', label: 'Nền tảng Địa điểm ' }
  ];

  return (
    <section id="overview" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Tổng quan dự án
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Khám phá hành trình cách mạng của Chủ tịch Hồ Chí Minh qua các di tích lịch sử quan trọng,
            kết hợp công nghệ hiện đại để mang đến trải nghiệm học tập sống động và ý nghĩa.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <stat.icon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</h3>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OverviewSection;
