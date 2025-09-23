import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Image, Video, Download } from 'lucide-react';
import { useDocumentsSection } from '../contexts/ContentContext';

const DocumentsSection: React.FC = () => {
  const { content: documentsContent, isLoading, categories } = useDocumentsSection();

  // Icon mapping for dynamic icons
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    FileText,
    Image,
    Video
  };

  // Helper function to get icon component from icon name
  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || FileText;
  };

  // Show loading state
  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="animate-pulse">Đang tải...</div>
        </div>
      </section>
    );
  }

  // Return early if section is not active
  if (!documentsContent?.isActive) {
    return null;
  }

  return (
    <section id="documents" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {documentsContent.title}
          </h2>
          <h3 className="text-xl text-gray-500 mb-4">
            {documentsContent.subtitle}
          </h3>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {documentsContent.description}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {categories.map((category: any, index: number) => {
            const IconComponent = getIconComponent(category.icon);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                  <IconComponent className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{category.title}</h3>
                <p className="text-gray-600 mb-6">{category.description}</p>

                <div className="space-y-3">
                  {category.items.map((item: string, itemIndex: number) => (
                    <div key={itemIndex} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="text-sm text-gray-500 mb-4">
                  {category.itemCount} tài liệu
                </div>

                <Link
                  to="/documents"
                  className="mt-6 w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  <Download size={18} />
                  <span>Xem chi tiết</span>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 text-center"
        >
          <Link
            to={documentsContent.callToAction?.href || "/documents"}
            className="inline-flex items-center space-x-2 px-8 py-4 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors duration-200 font-medium text-lg"
          >
            <FileText size={20} />
            <span>{documentsContent.callToAction?.text || "Xem tất cả tài liệu"}</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default DocumentsSection;
