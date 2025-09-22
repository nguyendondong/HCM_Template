import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Image as ImageIcon,
  Video,
  Globe,
  Eye,
  EyeOff,
  Search,
  Filter,
  Save,
  X
} from 'lucide-react';

interface ContentItem {
  id: string;
  type: 'hero' | 'introduction' | 'documents' | 'vr' | 'minigame' | 'navigation' | 'footer';
  title: string;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
  [key: string]: any;
}

interface ContentManagerProps {}

const ContentManager: React.FC<ContentManagerProps> = () => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchContents();
  }, []);

  const contentTypes = [
    { key: 'hero', label: 'Hero Section', icon: Globe },
    { key: 'introduction', label: 'Giới thiệu', icon: FileText },
    { key: 'documents', label: 'Tài liệu', icon: FileText },
    { key: 'vr', label: 'VR Experience', icon: Video },
    { key: 'minigame', label: 'Mini Games', icon: ImageIcon },
    { key: 'navigation', label: 'Navigation', icon: Globe },
    { key: 'footer', label: 'Footer', icon: Globe },
  ];

  const fetchContents = async () => {
    try {
      setLoading(true);
      const allContents: ContentItem[] = [];

      // Fetch from different collections
      for (const type of contentTypes) {
        try {
          const collectionName = `${type.key}-content`;
          const contentQuery = query(collection(db, collectionName), orderBy('updatedAt', 'desc'));
          const querySnapshot = await getDocs(contentQuery);

          const typeContents = querySnapshot.docs.map(doc => ({
            id: doc.id,
            type: type.key as ContentItem['type'],
            ...doc.data()
          })) as ContentItem[];

          allContents.push(...typeContents);
        } catch (error) {
          console.log(`Collection ${type.key}-content might not exist yet`);
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
      const collectionName = `${content.type}-content`;
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
        const collectionName = `${content.type}-content`;
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

  const handleCreate = (type: string) => {
    setEditingContent(null);
    setFormData({
      type,
      title: '',
      isActive: true,
    });
    setShowEditor(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const collectionName = `${formData.type}-content`;

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
  };

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || content.type === selectedType;
    return matchesSearch && matchesType;
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Không xác định';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && contents.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Đang tải nội dung...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Nội dung</h1>
          <p className="text-gray-600 mt-1">Tổng cộng {contents.length} mục nội dung</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả loại</option>
              {contentTypes.map(type => (
                <option key={type.key} value={type.key}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter size={20} />
            Bộ lọc
          </button>
        </div>
      </div>

      {/* Content Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {contentTypes.map((type) => (
          <div key={type.key} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <type.icon className="h-6 w-6 text-blue-600 mr-2" />
                <span className="font-medium text-gray-900">{type.label}</span>
              </div>
              <span className="text-sm text-gray-500">
                {contents.filter(c => c.type === type.key).length}
              </span>
            </div>
            <button
              onClick={() => handleCreate(type.key)}
              className="w-full text-sm bg-blue-50 text-blue-600 py-2 rounded-md hover:bg-blue-100 flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Tạo mới
            </button>
          </div>
        ))}
      </div>

      {/* Content List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Danh sách nội dung</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nội dung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{content.title}</div>
                    <div className="text-sm text-gray-500">ID: {content.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {contentTypes.find(t => t.key === content.type)?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(content)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        content.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {content.isActive ? (
                        <>
                          <Eye size={12} className="mr-1" />
                          Hiển thị
                        </>
                      ) : (
                        <>
                          <EyeOff size={12} className="mr-1" />
                          Ẩn
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
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(content)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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

        {filteredContents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy nội dung nào</p>
          </div>
        )}
      </div>

      {/* Content Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {editingContent ? 'Chỉnh sửa nội dung' : 'Tạo nội dung mới'}
              </h2>
              <button
                onClick={() => setShowEditor(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại nội dung
                  </label>
                  <select
                    value={formData.type || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!!editingContent}
                  >
                    {contentTypes.map(type => (
                      <option key={type.key} value={type.key}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Fields Based on Content Type */}
              {formData.type === 'hero' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phụ đề
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Kích hoạt hiển thị
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save size={16} />
                  {loading ? 'Đang lưu...' : (editingContent ? 'Cập nhật' : 'Tạo mới')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManager;
