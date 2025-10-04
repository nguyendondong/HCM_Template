import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { useVRTechnologySection } from '../contexts/ContentContext';

// Helper function to get icon from icon name
const getIcon = (iconName: string): React.ComponentType<{ className?: string }> => {
  const Icon = (LucideIcons as any)[iconName];
  return Icon || LucideIcons.Circle;
};

const VRTechnologySection: React.FC = () => {
  const { content, isLoading, features, experiences } = useVRTechnologySection();

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="animate-pulse">Đang tải...</div>
        </div>
      </section>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <section id="vr-technology" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {content.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {content.subtitle}
          </p>
        </motion.div>

        {/* VR Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.slice(0, 4).map((feature, index) => {
            const IconComponent = getIcon(feature.icon);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 bg-gray-50 rounded-2xl hover:bg-red-50 transition-colors duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <IconComponent className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* VR Experiences */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Trải nghiệm VR nổi bật
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {experiences.slice(0, 3).map((experience, index) => (
              <motion.div
                key={experience.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative">
                  <img
                    src={experience.image}
                    alt={experience.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      // Fallback nếu image không load được
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400&h=300&fit=crop';
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {experience.duration}
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{experience.title}</h4>
                  <p className="text-gray-600 mb-4">{experience.description}</p>
                  <Link
                    to="/vr-experience"
                    className="block w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium text-center"
                  >
                    Trải nghiệm ngay
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Benefits for Education */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-4">
            Lợi ích trong giáo dục
          </h3>
          <p className="text-red-100 mb-6 max-w-2xl mx-auto">
            {content.description || 'Công nghệ VR giúp học sinh không chỉ học về lịch sử mà còn "sống" trong lịch sử, tạo ra những kỷ niệm học tập khó quên và hiểu biết sâu sắc hơn.'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">95%</div>
              <div className="text-red-100">Học sinh hứng thú hơn</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">80%</div>
              <div className="text-red-100">Cải thiện khả năng ghi nhớ</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">90%</div>
              <div className="text-red-100">Hiểu bài học tốt hơn</div>
            </div>
          </div>

          {/* Dynamic Call to Action */}
          {content.callToAction && (
            <div className="mt-6">
              <Link
                to={content.callToAction.href}
                className="inline-flex items-center px-6 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-all duration-300"
              >
                {content.callToAction.text}
                <LucideIcons.ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default VRTechnologySection;
