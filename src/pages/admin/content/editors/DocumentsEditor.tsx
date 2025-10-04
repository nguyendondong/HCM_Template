import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, EyeOff, File, Image } from 'lucide-react';

interface DocumentContent {
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  type?: 'document' | 'image' | 'video';
  fileUrl?: string;
  thumbnailUrl?: string;
  fileSize?: string;
  uploadDate?: string;
  tags?: string[];
  content?: string;
  author?: string;
  isPublic?: boolean;
  downloadCount?: number;
}

interface DocumentsContent {
  id?: string;
  title?: string;
  description?: string;
  categories?: Array<{
    id: string;
    name: string;
    description?: string;
    icon?: string;
  }>;
  documents?: DocumentContent[];
  featuredDocuments?: string[];
  searchPlaceholder?: string;
  emptyMessage?: string;
}

interface DocumentsEditorProps {
  formData: DocumentsContent;
  setFormData: (data: any) => void;
}

const DocumentsEditor: React.FC<DocumentsEditorProps> = ({ formData, setFormData }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'categories' | 'documents'>('general');

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryChange = (index: number, field: string, value: string) => {
    const newCategories = [...(formData.categories || [])];
    newCategories[index] = { ...newCategories[index], [field]: value };
    setFormData((prev: any) => ({
      ...prev,
      categories: newCategories
    }));
  };

  const addCategory = () => {
    const newCategories = [...(formData.categories || []), { id: Date.now().toString(), name: '', description: '', icon: '' }];
    setFormData((prev: any) => ({
      ...prev,
      categories: newCategories
    }));
    toast.success('Thêm danh mục mới thành công!');
  };

  const removeCategory = (index: number) => {
    const newCategories = formData.categories?.filter((_: any, i: number) => i !== index) || [];
    setFormData((prev: any) => ({
      ...prev,
      categories: newCategories
    }));
    toast.success('Xóa danh mục thành công!');
  };

  const handleDocumentChange = (index: number, field: string, value: any) => {
    const newDocuments = [...(formData.documents || [])];
    newDocuments[index] = { ...newDocuments[index], [field]: value };
    setFormData((prev: any) => ({
      ...prev,
      documents: newDocuments
    }));
  };

  const addDocument = () => {
    const newDocument: DocumentContent = {
      id: Date.now().toString(),
      title: '',
      description: '',
      category: formData.categories?.[0]?.id || '',
      type: 'document',
      fileUrl: '',
      thumbnailUrl: '',
      tags: [],
      author: '',
      isPublic: true,
      downloadCount: 0
    };
    const newDocuments = [...(formData.documents || []), newDocument];
    setFormData((prev: any) => ({
      ...prev,
      documents: newDocuments
    }));
    toast.success('Thêm tài liệu mới thành công!');
  };

  const removeDocument = (index: number) => {
    const newDocuments = formData.documents?.filter((_: any, i: number) => i !== index) || [];
    setFormData((prev: any) => ({
      ...prev,
      documents: newDocuments
    }));
    toast.success('Xóa tài liệu thành công!');
  };

  const handleDocumentTagsChange = (docIndex: number, tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    handleDocumentChange(docIndex, 'tags', tags);
  };

  return (
    <div className="space-y-6">
      {/* Preview Toggle */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
          {showPreview ? 'Ẩn Preview' : 'Xem Preview'}
        </button>
      </div>

      {showPreview ? (
        // Preview Mode
        <div className="bg-gray-50 p-6 rounded-lg border">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{formData.title || 'Tài liệu'}</h1>
              <p className="text-lg text-gray-600">{formData.description || 'Khám phá các tài liệu quý giá'}</p>
            </div>

            {/* Categories */}
            {formData.categories && formData.categories.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Danh mục tài liệu</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.categories.map((category: any, index: number) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                      <div className="text-center">
                        {category.icon && <div className="text-2xl mb-2">{category.icon}</div>}
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        {category.description && <p className="text-sm text-gray-600 mt-1">{category.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            {formData.documents && formData.documents.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tài liệu ({formData.documents.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {formData.documents.map((doc: DocumentContent, index: number) => (
                    <div key={index} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                      {doc.thumbnailUrl ? (
                        <img src={doc.thumbnailUrl} alt={doc.title} className="w-full h-48 object-cover rounded-t-lg" />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                          {doc.type === 'image' ? <Image className="w-12 h-12 text-gray-400" /> : <File className="w-12 h-12 text-gray-400" />}
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 line-clamp-2">{doc.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            doc.type === 'document' ? 'bg-blue-100 text-blue-800' :
                            doc.type === 'image' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {doc.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{doc.description}</p>
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {doc.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                              <span key={tagIndex} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                {tag}
                              </span>
                            ))}
                            {doc.tags.length > 3 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                +{doc.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{doc.author}</span>
                          {doc.downloadCount !== undefined && <span>{doc.downloadCount} lượt tải</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Edit Mode
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'general'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Thông tin chung
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('categories')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'categories'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Danh mục ({formData.categories?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('documents')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'documents'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tài liệu ({formData.documents?.length || 0})
              </button>
            </nav>
          </div>

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề trang</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tài liệu về Chủ tịch Hồ Chí Minh"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả trang</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Khám phá bộ sưu tập tài liệu quý giá về cuộc đời và sự nghiệp của Chủ tịch Hồ Chí Minh"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Placeholder tìm kiếm</label>
                  <input
                    type="text"
                    value={formData.searchPlaceholder || ''}
                    onChange={(e) => handleInputChange('searchPlaceholder', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tìm kiếm tài liệu..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thông báo khi không có kết quả</label>
                  <input
                    type="text"
                    value={formData.emptyMessage || ''}
                    onChange={(e) => handleInputChange('emptyMessage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Không tìm thấy tài liệu nào"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Quản lý danh mục</h3>
                <button
                  type="button"
                  onClick={addCategory}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  Thêm danh mục
                </button>
              </div>

              {formData.categories?.map((category: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tên danh mục</label>
                      <input
                        type="text"
                        value={category.name || ''}
                        onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Thư tín"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Icon/Emoji</label>
                      <input
                        type="text"
                        value={category.icon || ''}
                        onChange={(e) => handleCategoryChange(index, 'icon', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="📄"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Mô tả</label>
                      <input
                        type="text"
                        value={category.description || ''}
                        onChange={(e) => handleCategoryChange(index, 'description', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Các thư tín của Chủ tịch Hồ Chí Minh"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeCategory(index)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      Xóa danh mục
                    </button>
                  </div>
                </div>
              ))}

              {(!formData.categories || formData.categories.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <File className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Chưa có danh mục nào. Thêm danh mục đầu tiên để bắt đầu.</p>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Quản lý tài liệu</h3>
                <button
                  type="button"
                  onClick={addDocument}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                  disabled={!formData.categories || formData.categories.length === 0}
                >
                  Thêm tài liệu
                </button>
              </div>

              {(!formData.categories || formData.categories.length === 0) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-sm text-yellow-800">Bạn cần tạo ít nhất một danh mục trước khi thêm tài liệu.</p>
                </div>
              )}

              {formData.documents?.map((doc: DocumentContent, index: number) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tiêu đề tài liệu</label>
                      <input
                        type="text"
                        value={doc.title || ''}
                        onChange={(e) => handleDocumentChange(index, 'title', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Bản di chúc của Chủ tịch Hồ Chí Minh"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Loại tài liệu</label>
                      <select
                        value={doc.type || 'document'}
                        onChange={(e) => handleDocumentChange(index, 'type', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="document">Tài liệu</option>
                        <option value="image">Hình ảnh</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Danh mục</label>
                      <select
                        value={doc.category || ''}
                        onChange={(e) => handleDocumentChange(index, 'category', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="">Chọn danh mục</option>
                        {formData.categories?.map((cat: any) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tác giả</label>
                      <input
                        type="text"
                        value={doc.author || ''}
                        onChange={(e) => handleDocumentChange(index, 'author', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Hồ Chí Minh"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-1">Mô tả</label>
                    <textarea
                      value={doc.description || ''}
                      onChange={(e) => handleDocumentChange(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Mô tả ngắn gọn về tài liệu"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">URL file tài liệu</label>
                      <input
                        type="url"
                        value={doc.fileUrl || ''}
                        onChange={(e) => handleDocumentChange(index, 'fileUrl', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="https://example.com/document.pdf"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">URL hình thu nhỏ</label>
                      <input
                        type="url"
                        value={doc.thumbnailUrl || ''}
                        onChange={(e) => handleDocumentChange(index, 'thumbnailUrl', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="https://example.com/thumbnail.jpg"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-1">Tags (phân cách bằng dấu phẩy)</label>
                    <input
                      type="text"
                      value={doc.tags?.join(', ') || ''}
                      onChange={(e) => handleDocumentTagsChange(index, e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="di chúc, lãnh đạo, cách mạng"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`public-${index}`}
                        checked={doc.isPublic || false}
                        onChange={(e) => handleDocumentChange(index, 'isPublic', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor={`public-${index}`} className="text-sm text-gray-700">Công khai</label>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      Xóa tài liệu
                    </button>
                  </div>
                </div>
              ))}

              {(!formData.documents || formData.documents.length === 0) && formData.categories && formData.categories.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                  <File className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Chưa có tài liệu nào. Thêm tài liệu đầu tiên để bắt đầu.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentsEditor;
