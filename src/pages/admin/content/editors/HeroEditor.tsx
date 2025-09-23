import React from 'react';

interface HeroContent {
  id?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  stats?: Array<{
    icon: string;
    number: string;
    label: string;
    color: string;
  }>;
  actionButton?: {
    text: string;
    targetSection: string;
  };
  backgroundElements?: {
    enableFlags: boolean;
    enableStars: boolean;
    enableDecorations: boolean;
  };
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

interface HeroEditorProps {
  formData: HeroContent;
  setFormData: (data: any) => void;
}

const HeroEditor: React.FC<HeroEditorProps> = ({ formData, setFormData }) => {
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStatChange = (index: number, field: string, value: string) => {
    const newStats = [...(formData.stats || [])];
    newStats[index] = { ...newStats[index], [field]: value };
    setFormData((prev: any) => ({
      ...prev,
      stats: newStats
    }));
  };

  const addStat = () => {
    const newStats = [...(formData.stats || []), { icon: '', number: '', label: '', color: '' }];
    setFormData((prev: any) => ({
      ...prev,
      stats: newStats
    }));
  };

  const removeStat = (index: number) => {
    const newStats = formData.stats?.filter((_: any, i: number) => i !== index) || [];
    setFormData((prev: any) => ({
      ...prev,
      stats: newStats
    }));
  };

  return (
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
            placeholder="Hành Trình Địa điểm "
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề phụ</label>
          <input
            type="text"
            value={formData.subtitle || ''}
            onChange={(e) => handleInputChange('subtitle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Khám Phá Địa điểm  Văn Hóa Việt Nam"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Trải nghiệm tương tác với những Địa điểm  văn hóa quý giá..."
        />
      </div>

      {/* Action Button */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Text nút hành động</label>
          <input
            type="text"
            value={formData.actionButton?.text || ''}
            onChange={(e) => handleInputChange('actionButton', { ...formData.actionButton, text: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Bắt đầu khám phá"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Section</label>
          <input
            type="text"
            value={formData.actionButton?.targetSection || ''}
            onChange={(e) => handleInputChange('actionButton', { ...formData.actionButton, targetSection: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="introduction"
          />
        </div>
      </div>

      {/* Stats Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">Thống kê</label>
          <button
            type="button"
            onClick={addStat}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            Thêm thống kê
          </button>
        </div>

        {formData.stats?.map((stat: any, index: number) => (
          <div key={index} className="grid grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-md">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Icon</label>
              <input
                type="text"
                value={stat.icon || ''}
                onChange={(e) => handleStatChange(index, 'icon', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="MapPin"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Số liệu</label>
              <input
                type="text"
                value={stat.number || ''}
                onChange={(e) => handleStatChange(index, 'number', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="50+"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Label</label>
              <input
                type="text"
                value={stat.label || ''}
                onChange={(e) => handleStatChange(index, 'label', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="Di tích lịch sử"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => removeStat(index)}
                className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Background Elements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">Hiệu ứng nền</label>
        <div className="grid grid-cols-3 gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.backgroundElements?.enableFlags || false}
              onChange={(e) => handleInputChange('backgroundElements', {
                ...formData.backgroundElements,
                enableFlags: e.target.checked
              })}
              className="mr-2"
            />
            <span className="text-sm">Hiển thị cờ</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.backgroundElements?.enableStars || false}
              onChange={(e) => handleInputChange('backgroundElements', {
                ...formData.backgroundElements,
                enableStars: e.target.checked
              })}
              className="mr-2"
            />
            <span className="text-sm">Hiển thị sao</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.backgroundElements?.enableDecorations || false}
              onChange={(e) => handleInputChange('backgroundElements', {
                ...formData.backgroundElements,
                enableDecorations: e.target.checked
              })}
              className="mr-2"
            />
            <span className="text-sm">Hiệu ứng trang trí</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default HeroEditor;
