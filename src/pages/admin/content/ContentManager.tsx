import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, query, orderBy, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import {
  HeroEditor,
  IntroductionEditor,
  NavigationEditor,
  FooterEditor
} from './editors';
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Globe,
  Eye,
  EyeOff,
  Search,
  Save,
  X
} from 'lucide-react';

interface ContentItem {
  id: string;
  type: 'hero' | 'introduction' | 'navigation' | 'footer';
  title: string;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
  [key: string]: any;
}

const ContentManager: React.FC = () => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('hero');
  const [showEditor, setShowEditor] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const contentTypes = [
    { key: 'hero', label: 'Hero Section', icon: Globe, collection: 'heroContent' },
    { key: 'introduction', label: 'Giới thiệu', icon: FileText, collection: 'introductionContent' },
    { key: 'navigation', label: 'Navigation', icon: Globe, collection: 'navigationContent' },
    { key: 'footer', label: 'Footer', icon: Globe, collection: 'footerContent' },
  ];

  useEffect(() => {
    fetchContents();
  }, []);

  const getCollectionName = (contentType: string) => {
    const type = contentTypes.find(t => t.key === contentType);
    return type?.collection || `${contentType}Content`;
  };

  // Helper function to get title for different content types
  const getContentTitle = (content: ContentItem) => {
    switch (content.type) {
      case 'navigation':
        return content.logo?.text || 'Navigation Menu';
      case 'footer':
        return content.brandSection?.title || 'Footer Content';
      default:
        return content.title || `${content.type} Content`;
    }
  };

  // Helper function to get description for different content types
  const getContentDescription = (content: ContentItem) => {
    switch (content.type) {
      case 'navigation':
        return `${content.menuItems?.length || 0} menu items`;
      case 'footer':
        return content.brandSection?.description || content.description;
      default:
        return content.description || content.subtitle;
    }
  };

  const fetchContents = async () => {
    try {
      setLoading(true);
      const allContents: ContentItem[] = [];

      for (const type of contentTypes) {
        try {
          const contentQuery = query(collection(db, type.collection), orderBy('updatedAt', 'desc'));
          const querySnapshot = await getDocs(contentQuery);

          const typeContents = querySnapshot.docs.map(doc => ({
            id: doc.id,
            type: type.key as ContentItem['type'],
            ...(doc.data() as any)
          })) as ContentItem[];

          allContents.push(...typeContents);
        } catch (error) {
          console.log(`Collection ${type.collection} might not exist yet`);
        }
      }

      setContents(allContents);
    } catch (error) {
      console.error('Error fetching contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (content: ContentItem) => {
    try {
      const collectionName = getCollectionName(content.type);
      await updateDoc(doc(db, collectionName, content.id), {
        isActive: !content.isActive,
        updatedAt: new Date()
      });
      await fetchContents();
    } catch (error) {
      console.error('Error updating content status:', error);
    }
  };

  const handleDelete = async (content: ContentItem) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nội dung này?')) {
      try {
        const collectionName = getCollectionName(content.type);
        await deleteDoc(doc(db, collectionName, content.id));
        await fetchContents();
      } catch (error) {
        console.error('Error deleting content:', error);
      }
    }
  };

  const handleEdit = (content: ContentItem) => {
    setEditingContent(content);
    setFormData(content);
    setShowEditor(true);
  };

  const handleCreate = () => {
    setEditingContent(null);
    setFormData({
      type: activeTab,
      title: '',
      isActive: true,
    });
    setShowEditor(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const collectionName = getCollectionName(formData.type);

      const saveData = {
        ...formData,
        updatedAt: new Date(),
        ...(editingContent ? {} : { createdAt: new Date() })
      };

      if (editingContent) {
        await updateDoc(doc(db, collectionName, editingContent.id), saveData);
      } else {
        await addDoc(collection(db, collectionName), saveData);
      }

      await fetchContents();
      setShowEditor(false);
      setEditingContent(null);
      setFormData({});
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setLoading(false);
    }
  };  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return 'N/A';
    }
  };

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = content.type === activeTab;
    return matchesSearch && matchesTab;
  });

  if (loading && contents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Nội dung</h1>
            <p className="text-gray-600 mt-2">Quản lý tất cả nội dung trên website</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {contentTypes.map(type => {
                const Icon = type.icon;
                const count = contents.filter(c => c.type === type.key).length;
                return (
                  <button
                    key={type.key}
                    onClick={() => setActiveTab(type.key)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === type.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {type.label}
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content Header */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {contentTypes.find(t => t.key === activeTab)?.label}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredContents.length} mục nội dung
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleCreate}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo mới
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="bg-white rounded-lg shadow-sm">
          {filteredContents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nội dung
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cập nhật
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContents.map((content) => (
                    <tr key={`${content.type}-${content.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{getContentTitle(content)}</div>
                          {getContentDescription(content) && (
                            <div className="text-sm text-gray-500 max-w-md truncate">
                              {getContentDescription(content)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(content)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                            content.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {content.isActive ? (
                            <>
                              <Eye size={12} className="mr-1" />
                              Hoạt động
                            </>
                          ) : (
                            <>
                              <EyeOff size={12} className="mr-1" />
                              Tạm dừng
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(content.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(content)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(content)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Chưa có {contentTypes.find(t => t.key === activeTab)?.label} nào
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Bắt đầu bằng cách tạo {contentTypes.find(t => t.key === activeTab)?.label} đầu tiên của bạn.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo mới
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Editor Modal */}
        {showEditor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto m-4">
              <div className="sticky top-0 bg-white px-6 py-4 border-b z-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">
                    {editingContent ? `Chỉnh sửa: ${editingContent.title}` : `Tạo ${contentTypes.find(t => t.key === activeTab)?.label} mới`}
                  </h2>
                  <button
                    onClick={() => setShowEditor(false)}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tiêu đề <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập tiêu đề"
                        required
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isActive !== false}
                          onChange={(e) => setFormData((prev: any) => ({ ...prev, isActive: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                        />
                        <span className="text-sm font-medium text-gray-700">Kích hoạt ngay</span>
                      </label>
                    </div>
                  </div>

                  {/* Content-specific Editor */}
                  {activeTab === 'hero' && (
                    <HeroEditor formData={formData} setFormData={setFormData} />
                  )}
                  {activeTab === 'introduction' && (
                    <IntroductionEditor formData={formData} setFormData={setFormData} />
                  )}
                  {activeTab === 'navigation' && (
                    <NavigationEditor formData={formData} setFormData={setFormData} />
                  )}
                  {activeTab === 'footer' && (
                    <FooterEditor formData={formData} setFormData={setFormData} />
                  )}

                  {/* Save/Cancel Buttons */}
                  <div className="flex justify-end gap-3 pt-6 border-t">
                    <button
                      onClick={() => setShowEditor(false)}
                      className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!formData.title}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
                    >
                      <Save size={16} />
                      {editingContent ? 'Cập nhật' : 'Tạo mới'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentManager;
