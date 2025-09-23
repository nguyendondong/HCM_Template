import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, EyeOff, FileText, Image, Video, Plus, Trash2 } from 'lucide-react';

interface DocumentCategory {
  icon?: string;
  title?: string;
  description?: string;
  items?: string[];
  itemCount?: number;
}

interface DocumentsSectionContent {
  id?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  categories?: DocumentCategory[];
  isActive?: boolean;
}

interface DocumentsSectionEditorProps {
  formData: DocumentsSectionContent;
  setFormData: (data: any) => void;
}

const DocumentsSectionEditor: React.FC<DocumentsSectionEditorProps> = ({ formData, setFormData }) => {
  const [showPreview, setShowPreview] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryChange = (index: number, field: string, value: any) => {
    const newCategories = [...(formData.categories || [])];
    newCategories[index] = { ...newCategories[index], [field]: value };
    setFormData((prev: any) => ({
      ...prev,
      categories: newCategories
    }));
  };

  const handleCategoryItemChange = (categoryIndex: number, itemIndex: number, value: string) => {
    const newCategories = [...(formData.categories || [])];
    const newItems = [...(newCategories[categoryIndex].items || [])];
    newItems[itemIndex] = value;
    newCategories[categoryIndex] = { ...newCategories[categoryIndex], items: newItems };
    setFormData((prev: any) => ({
      ...prev,
      categories: newCategories
    }));
  };

  const addCategory = () => {
    const newCategories = [...(formData.categories || []), {
      icon: 'FileText',
      title: '',
      description: '',
      items: [],
      itemCount: 0
    }];
    setFormData((prev: any) => ({
      ...prev,
      categories: newCategories
    }));
    toast.success('Thêm danh mục thành công!');
  };

  const removeCategory = (index: number) => {
    const newCategories = formData.categories?.filter((_: any, i: number) => i !== index) || [];
    setFormData((prev: any) => ({
      ...prev,
      categories: newCategories
    }));
    toast.success('Xóa danh mục thành công!');
  };

  const addCategoryItem = (categoryIndex: number) => {
    const newCategories = [...(formData.categories || [])];
    const newItems = [...(newCategories[categoryIndex].items || []), ''];
    newCategories[categoryIndex] = { ...newCategories[categoryIndex], items: newItems };
    setFormData((prev: any) => ({
      ...prev,
      categories: newCategories
    }));
  };

  const removeCategoryItem = (categoryIndex: number, itemIndex: number) => {
    const newCategories = [...(formData.categories || [])];
    const newItems = newCategories[categoryIndex].items?.filter((_: any, i: number) => i !== itemIndex) || [];
    newCategories[categoryIndex] = { ...newCategories[categoryIndex], items: newItems };
    setFormData((prev: any) => ({
      ...prev,
      categories: newCategories
    }));
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return <FileText className="w-6 h-6" />;
      case 'Image': return <Image className="w-6 h-6" />;
      case 'Video': return <Video className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
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
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{formData.title || 'Tiêu đề Documents Section'}</h1>
              <h2 className="text-xl text-gray-600 mb-6">{formData.subtitle || 'Subtitle'}</h2>
              <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
                {formData.description || 'Mô tả về kho tàng tư liệu'}
              </p>
            </div>

            {formData.categories && formData.categories.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {formData.categories.map((category, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        {getIconComponent(category.icon || 'FileText')}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{category.title}</h3>
                      <p className="text-gray-600 mb-4">{category.description}</p>
                      <div className="text-2xl font-bold text-blue-600">{category.itemCount || 0}</div>
                      <p className="text-sm text-gray-500">tài liệu</p>
                    </div>

                    {category.items && category.items.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Danh mục:</h4>
                        <ul className="space-y-2">
                          {category.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="text-sm text-gray-700 flex items-center">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Edit Mode
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề chính</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Kho Tàng Tư Liệu Quý Giá"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề phụ</label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tài liệu lịch sử về Chủ tịch Hồ Chí Minh"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả về kho tàng tư liệu..."
            />
          </div>

          {/* Categories Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">Danh mục tài liệu</label>
              <button
                type="button"
                onClick={addCategory}
                className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Thêm danh mục
              </button>
            </div>

            {formData.categories?.map((category, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold text-gray-900">Danh mục {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeCategory(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Icon</label>
                    <select
                      value={category.icon || 'FileText'}
                      onChange={(e) => handleCategoryChange(index, 'icon', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="FileText">FileText (Văn bản)</option>
                      <option value="Image">Image (Hình ảnh)</option>
                      <option value="Video">Video</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Số lượng tài liệu</label>
                    <input
                      type="number"
                      value={category.itemCount || 0}
                      onChange={(e) => handleCategoryChange(index, 'itemCount', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="120"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tiêu đề danh mục</label>
                  <input
                    type="text"
                    value={category.title || ''}
                    onChange={(e) => handleCategoryChange(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Văn bản lịch sử"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mô tả danh mục</label>
                  <textarea
                    value={category.description || ''}
                    onChange={(e) => handleCategoryChange(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mô tả về danh mục này..."
                  />
                </div>

                {/* Category Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs text-gray-500">Danh sách mục</label>
                    <button
                      type="button"
                      onClick={() => addCategoryItem(index)}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      + Thêm mục
                    </button>
                  </div>

                  {category.items?.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleCategoryItemChange(index, itemIndex, e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Tên mục..."
                      />
                      <button
                        type="button"
                        onClick={() => removeCategoryItem(index, itemIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsSectionEditor;
