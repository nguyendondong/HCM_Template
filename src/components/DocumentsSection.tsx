import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Image, Video, Download } from 'lucide-react';

const DocumentsSection: React.FC = () => {
  const documentCategories = [
    {
      icon: FileText,
      title: 'Văn bản lịch sử',
      description: 'Tuyên ngôn độc lập, Di chúc, các bài viết và diễn văn quan trọng',
      items: ['Tuyên ngôn độc lập 1945', 'Di chúc của Chủ tịch Hồ Chí Minh', 'Những bài viết về đạo đức']
    },
    {
      icon: Image,
      title: 'Hình ảnh quý hiếm',
      description: 'Bộ sưu tập ảnh lịch sử về cuộc đời và sự nghiệp của Bác',
      items: ['Ảnh thời trẻ ở Paris', 'Ảnh trong chiến khu Việt Bắc', 'Ảnh với nhân dân các địa phương']
    },
    {
      icon: Video,
      title: 'Video tư liệu',
      description: 'Những thước phim quý giá ghi lại hoạt động của Chủ tịch Hồ Chí Minh',
      items: ['Đọc Tuyên ngôn độc lập', 'Gặp gỡ đại biểu các dân tộc', 'Thăm các tỉnh thành']
    }
  ];

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
            Tư liệu về Chủ tịch Hồ Chí Minh
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Kho tàng tư liệu quý giá về cuộc đời và sự nghiệp của vị lãnh tụ vĩ đại,
            bao gồm văn bản, hình ảnh và video lịch sử được sưu tập và bảo quản cẩn thận.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {documentCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <category.icon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{category.title}</h3>
              <p className="text-gray-600 mb-6">{category.description}</p>

              <div className="space-y-3">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/documents"
                className="mt-6 w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                <Download size={18} />
                <span>Xem chi tiết</span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Featured Document */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 bg-white rounded-2xl p-8 shadow-lg"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Tuyên ngôn độc lập 2/9/1945
              </h3>
              <p className="text-gray-600 mb-6">
                "Tất cả mọi người đều sinh ra có quyền bình đẳng. Tạo hóa cho họ những quyền không ai có thể xâm phạm được;
                trong những quyền ấy, có quyền được sống, quyền tự do và quyền mưu cầu hạnh phúc."
              </p>
              <button className="inline-flex items-center space-x-2 px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors duration-200 font-medium">
                <FileText size={18} />
                <span>Đọc toàn văn</span>
              </button>
            </div>
            <div className="bg-gray-100 rounded-xl p-6 text-center">
              <FileText size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Bản scan tài liệu gốc</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DocumentsSection;
