import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Download, Image, Video, Search, Calendar, User, BookOpen } from 'lucide-react';

const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    // Store the target section (documents for Documents)
    sessionStorage.setItem('targetSection', 'documents');
    navigate('/');
  };
  const documentCategories = [
    {
      id: 'declarations',
      icon: FileText,
      title: 'Tuyên ngôn và Văn kiện',
      description: 'Các văn bản chính thức quan trọng nhất',
      documents: [
        {
          id: 'tuyen-ngon-doc-lap',
          title: 'Tuyên ngôn độc lập 2/9/1945',
          description: 'Văn kiện lịch sử tuyên bố nền độc lập của nước Việt Nam Dân chủ Cộng hòa',
          date: '2/9/1945',
          type: 'PDF',
          size: '2.3 MB',
          downloadUrl: '#',
          previewImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop'
        },
        {
          id: 'di-chuc',
          title: 'Di chúc của Chủ tịch Hồ Chí Minh',
          description: 'Lời dặn dò cuối cùng của Bác với Đảng và nhân dân',
          date: '10/5/1969',
          type: 'PDF',
          size: '1.8 MB',
          downloadUrl: '#',
          previewImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
        },
        {
          id: 'loi-keu-goi',
          title: 'Lời kêu gọi toàn quốc kháng chiến',
          description: 'Bản kêu gọi toàn dân tộc đứng lên chống thực dân Pháp',
          date: '19/12/1946',
          type: 'PDF',
          size: '1.5 MB',
          downloadUrl: '#',
          previewImage: 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=400&h=300&fit=crop'
        }
      ]
    },
    {
      id: 'writings',
      icon: BookOpen,
      title: 'Tác phẩm và Bài viết',
      description: 'Những bài viết, tác phẩm của Chủ tịch Hồ Chí Minh',
      documents: [
        {
          id: 'duong-kach-menh',
          title: 'Đường Kách mệnh',
          description: 'Tác phẩm viết về con đường cách mạng của nhân dân ta',
          date: '1927',
          type: 'PDF',
          size: '5.2 MB',
          downloadUrl: '#',
          previewImage: 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=400&h=300&fit=crop'
        },
        {
          id: 'nhat-ky-trong-tu',
          title: 'Nhật ký trong tù',
          description: 'Những bài thơ viết trong thời gian bị giam cầm tại Trung Quốc',
          date: '1942-1943',
          type: 'PDF',
          size: '3.7 MB',
          downloadUrl: '#',
          previewImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
        }
      ]
    },
    {
      id: 'photos',
      icon: Image,
      title: 'Hình ảnh lịch sử',
      description: 'Bộ sưu tập ảnh quý hiếm về cuộc đời Bác',
      documents: [
        {
          id: 'anh-thoi-tre',
          title: 'Ảnh thời trẻ ở Paris',
          description: 'Những bức ảnh hiếm hoi về thời gian Bác học tập và hoạt động tại Pháp',
          date: '1917-1923',
          type: 'ZIP',
          size: '45.6 MB',
          downloadUrl: '#',
          previewImage: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop'
        },
        {
          id: 'anh-chien-khu',
          title: 'Ảnh trong chiến khu Việt Bắc',
          description: 'Những khoảnh khắc của Bác trong thời kỳ kháng chiến',
          date: '1946-1954',
          type: 'ZIP',
          size: '67.8 MB',
          downloadUrl: '#',
          previewImage: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400&h=300&fit=crop'
        }
      ]
    },
    {
      id: 'videos',
      icon: Video,
      title: 'Video tư liệu',
      description: 'Những thước phim quý giá ghi lại hoạt động của Bác',
      documents: [
        {
          id: 'doc-tuyen-ngon',
          title: 'Đọc Tuyên ngôn độc lập',
          description: 'Cảnh Bác Hồ đọc Tuyên ngôn độc lập tại Quảng trường Ba Đình',
          date: '2/9/1945',
          type: 'MP4',
          size: '156.3 MB',
          downloadUrl: '#',
          previewImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop'
        },
        {
          id: 'gap-go-dan-toc',
          title: 'Gặp gỡ đại biểu các dân tộc',
          description: 'Bác Hồ tiếp các đại biểu dân tộc thiểu số',
          date: '1968',
          type: 'MP4',
          size: '89.7 MB',
          downloadUrl: '#',
          previewImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
        }
      ]
    }
  ];

  const [selectedCategory, setSelectedCategory] = useState(documentCategories[0].id);
  const [searchTerm, setSearchTerm] = useState('');

  const getCurrentCategory = () => {
    return documentCategories.find(cat => cat.id === selectedCategory) || documentCategories[0];
  };

  const filteredDocuments = getCurrentCategory().documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'PDF': return 'bg-red-100 text-red-700';
      case 'ZIP': return 'bg-blue-100 text-blue-700';
      case 'MP4': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-900 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <button
              onClick={handleBackToHome}
              className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Quay về trang chủ
            </button>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Tư liệu về Chủ tịch Hồ Chí Minh
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl">
              Kho tàng tư liệu quý giá về cuộc đời và sự nghiệp của vị lãnh tụ vĩ đại,
              bao gồm văn bản, hình ảnh và video lịch sử được sưu tập và bảo quản cẩn thận.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Danh mục tư liệu</h3>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tư liệu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                {documentCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <category.icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{category.title}</div>
                        <div className="text-xs text-gray-500">{category.documents.length} tài liệu</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Category Header */}
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    {React.createElement(getCurrentCategory().icon, { className: "w-6 h-6 text-blue-600" })}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{getCurrentCategory().title}</h2>
                    <p className="text-gray-600">{getCurrentCategory().description}</p>
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  Tìm thấy {filteredDocuments.length} tài liệu
                </div>
              </div>

              {/* Documents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDocuments.map((document, index) => (
                  <motion.div
                    key={document.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative">
                      <img
                        src={document.previewImage}
                        alt={document.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 right-4 space-y-2">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getFileTypeColor(document.type)}`}>
                          {document.type}
                        </span>
                        <div className="bg-black/60 text-white px-2 py-1 rounded text-xs">
                          {document.size}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{document.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{document.description}</p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{document.date}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <User className="w-4 h-4" />
                          <span>Chủ tịch Hồ Chí Minh</span>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm">
                          <FileText className="w-4 h-4" />
                          <span>Xem chi tiết</span>
                        </button>
                        <button className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredDocuments.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy tài liệu</h3>
                  <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Featured Document */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-200"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Tài liệu nổi bật: Tuyên ngôn độc lập 2/9/1945
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "Tất cả mọi người đều sinh ra có quyền bình đẳng. Tạo hóa cho họ những quyền không ai có thể xâm phạm được;
                trong những quyền ấy, có quyền được sống, quyền tự do và quyền mưu cầu hạnh phúc."
              </p>
              <div className="flex space-x-4">
                <button className="flex items-center space-x-2 px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors duration-200 font-medium">
                  <FileText className="w-5 h-5" />
                  <span>Đọc toàn văn</span>
                </button>
                <button className="flex items-center space-x-2 px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium border border-gray-300">
                  <Download className="w-5 h-5" />
                  <span>Tải xuống</span>
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-lg">
              <FileText size={64} className="mx-auto text-yellow-500 mb-4" />
              <p className="text-gray-600 font-medium">Văn kiện lịch sử quan trọng nhất</p>
              <p className="text-sm text-gray-500 mt-2">Được UNESCO công nhận là Di sản tài liệu thế giới</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DocumentsPage;
