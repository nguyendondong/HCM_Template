import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Download, Image, Video, Search, Calendar, User, BookOpen, Globe, ExternalLink } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useSmartNavigation } from '../hooks/useSmartNavigation';

// Interfaces for Firestore data
interface DocumentCategory {
  id: string;
  name: string; // Changed from 'title' to match admin data
  description: string;
  icon: string;
  color: string;
  order: number;
  isActive?: boolean;
  url?: string; // URL cho liên kết ngoài nếu có
  documents?: Document[];
}

interface Document {
  id: string;
  title: string;
  description: string;
  category: string; // Changed from 'category' to match admin data
  type: string;
  thumbnailUrl?: string; // Changed from 'previewImage'
  fileUrl?: string; // Changed from 'downloadUrl'
  digitalUrl?: string; // Additional field from admin
  year?: number;
  location?: string;
  language?: string;
  significance?: string;
  tags?: string[];
  metadata?: any;
  isPublic?: boolean;
  isFeatured?: boolean;
  downloadCount?: number;
  viewCount?: number;
  order?: number;
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

// Map các icon string từ Firestore thành Lucide component
const getIconComponent = (iconName: string): React.ElementType => {
  const iconMap: Record<string, React.ElementType> = {
    'FileText': FileText,
    'GraduationCap': BookOpen,
    'Ship': Video,
    'Flag': FileText,
    'BookOpen': BookOpen,
    'Mail': Image,
    'Building': FileText,
    'Globe': Globe
  };

  return iconMap[iconName] || FileText; // Default to FileText if icon not found
};

const DocumentsPage: React.FC = () => {
  const { id: routeId } = useParams<{ id: string }>();
  const { isDetailView, goBack, goToDetail } = useSmartNavigation({
    listPath: '/documents',
    targetSection: 'documents'
  });

  const [documentCategories, setDocumentCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(routeId || '');
  const [searchTerm, setSearchTerm] = useState('');

  // Update selected category when route changes
  useEffect(() => {
    if (routeId) {
      setSelectedCategory(routeId);
    }
  }, [routeId]);

  // Fetch data from Firestore
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch categories
        const categoriesSnapshot = await getDocs(collection(db, 'document-categories'));
        const categoriesData: DocumentCategory[] = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as DocumentCategory));

        // Fetch documents
        const documentsSnapshot = await getDocs(collection(db, 'documents'));
        const documentsData: Document[] = documentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Document));

        // Add documents to their respective categories
        const categoriesWithDocs = categoriesData.map(category => ({
          ...category,
          documents: documentsData.filter(doc => doc.category === category.id)
        }));

        setDocumentCategories(categoriesWithDocs);

        // Set default selected category if we have categories
        if (categoriesWithDocs.length > 0) {
          setSelectedCategory(categoriesWithDocs[0].id);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleBack = () => {
    if (isDetailView && !selectedCategory) {
      // If in detail route but no category selected, go back to list
      goBack();
    } else if (selectedCategory) {
      // If category is selected, close detail and stay on current page
      setSelectedCategory('');
    } else {
      // Default back navigation
      goBack();
    }
  };

  const getCurrentCategory = () => {
    return documentCategories.find(cat => cat.id === selectedCategory) ||
           (documentCategories.length > 0 ? documentCategories[0] : null);
  };

  // Get documents for the current category
  const currentCategory = getCurrentCategory();
  const categoryDocuments = currentCategory?.documents || [];

  const filteredDocuments = categoryDocuments.filter(doc =>
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
              onClick={handleBack}
              className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {isDetailView && !selectedCategory ? 'Quay về danh sách' : 'Quay về trang chủ'}
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

              {loading ? (
                <div className="py-20 text-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Đang tải danh mục...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documentCategories.map((category) => {
                    const IconComponent = getIconComponent(category.icon);
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          if (isDetailView) {
                            // If already in detail view, just set the selected category
                            setSelectedCategory(category.id);
                          } else {
                            // Navigate to detail route
                            goToDetail(category.id);
                          }
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                          selectedCategory === category.id
                            ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <IconComponent className="w-5 h-5" />
                          <div>
                            <div className="font-medium">{category.name}</div>
                            <div className="text-xs text-gray-500">{category.documents?.length || 0} tài liệu</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  {/* Liên kết đến website chính thức */}
                  <a
                    href="https://hochiminh.vn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 mt-6 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 transition-all duration-300"
                  >
                    <Globe size={18} />
                    <span className="font-medium">hochiminh.vn</span>
                    <ExternalLink size={16} />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="py-32 text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-xl text-gray-600">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Category Header */}
                <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                  {currentCategory && (
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        {React.createElement(getIconComponent(currentCategory.icon), { className: "w-6 h-6 text-blue-600" })}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{currentCategory.name}</h2>
                        <p className="text-gray-600">{currentCategory.description}</p>
                      </div>
                    </div>
                  )}

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
                        {document.thumbnailUrl ? (
                          <img
                            src={document.thumbnailUrl}
                            alt={document.title}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent && !parent.querySelector('.fallback-placeholder')) {
                                const fallback = window.document.createElement('div');
                                fallback.className = 'fallback-placeholder w-full h-48 bg-gray-100 flex items-center justify-center';
                                fallback.innerHTML = '<div class="w-12 h-12 text-gray-400"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM18 20H6V4h7v5h5v11z"/></svg></div>';
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                            <FileText className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-4 right-4 space-y-2">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getFileTypeColor(document.type)}`}>
                            {document.type}
                          </span>
                          <div className="bg-black/60 text-white px-2 py-1 rounded text-xs">
                            {document.metadata?.fileSize || 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{document.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{document.description}</p>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{document.year || document.metadata?.date || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <User className="w-4 h-4" />
                            <span>{document.metadata?.author || 'Chủ tịch Hồ Chí Minh'}</span>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm">
                            <FileText className="w-4 h-4" />
                            <span>Xem chi tiết</span>
                          </button>
                          <a
                            href={document.fileUrl || document.digitalUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-200 text-sm ${
                              document.fileUrl || document.digitalUrl
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            onClick={(e) => {
                              if (!document.fileUrl && !document.digitalUrl) {
                                e.preventDefault();
                                alert('File không có sẵn để tải xuống');
                              }
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </a>
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
            )}
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
              <p className="text-sm text-gray-500 mt-2">Được UNESCO công nhận là Địa điểm  tài liệu thế giới</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DocumentsPage;
