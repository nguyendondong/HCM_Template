import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Play } from 'lucide-react';

interface VRScene {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  vrUrl?: string;
  duration?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  tags?: string[];
  isActive?: boolean;
  viewCount?: number;
}

interface VRContent {
  id?: string;
  title?: string;
  description?: string;
  introVideo?: {
    url: string;
    title: string;
    duration?: number;
  };
  scenes?: VRScene[];
  categories?: Array<{
    id: string;
    name: string;
    description?: string;
    icon?: string;
  }>;
  instructions?: Array<{
    step: number;
    title: string;
    description: string;
    icon?: string;
  }>;
  requirements?: {
    device: string[];
    browser: string[];
    network: string;
  };
  features?: string[];
}

interface VREditorProps {
  formData: VRContent;
  setFormData: (data: any) => void;
}

const VREditor: React.FC<VREditorProps> = ({ formData, setFormData }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'scenes' | 'instructions' | 'requirements'>('general');

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSceneChange = (index: number, field: string, value: any) => {
    const newScenes = [...(formData.scenes || [])];
    newScenes[index] = { ...newScenes[index], [field]: value };
    setFormData((prev: any) => ({
      ...prev,
      scenes: newScenes
    }));
  };

  const addScene = () => {
    const newScene: VRScene = {
      id: Date.now().toString(),
      title: '',
      description: '',
      thumbnailUrl: '',
      vrUrl: '',
      duration: 0,
      difficulty: 'medium',
      category: formData.categories?.[0]?.id || '',
      tags: [],
      isActive: true,
      viewCount: 0
    };
    const newScenes = [...(formData.scenes || []), newScene];
    setFormData((prev: any) => ({
      ...prev,
      scenes: newScenes
    }));
    toast.success('Thêm scene VR thành công!');
  };

  const removeScene = (index: number) => {
    const newScenes = formData.scenes?.filter((_: any, i: number) => i !== index) || [];
    setFormData((prev: any) => ({
      ...prev,
      scenes: newScenes
    }));
  };

  const handleSceneTagsChange = (sceneIndex: number, tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    handleSceneChange(sceneIndex, 'tags', tags);
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
  };

  const removeCategory = (index: number) => {
    const newCategories = formData.categories?.filter((_: any, i: number) => i !== index) || [];
    setFormData((prev: any) => ({
      ...prev,
      categories: newCategories
    }));
  };

  const handleInstructionChange = (index: number, field: string, value: any) => {
    const newInstructions = [...(formData.instructions || [])];
    newInstructions[index] = { ...newInstructions[index], [field]: value };
    setFormData((prev: any) => ({
      ...prev,
      instructions: newInstructions
    }));
  };

  const addInstruction = () => {
    const newInstruction = {
      step: (formData.instructions?.length || 0) + 1,
      title: '',
      description: '',
      icon: ''
    };
    const newInstructions = [...(formData.instructions || []), newInstruction];
    setFormData((prev: any) => ({
      ...prev,
      instructions: newInstructions
    }));
  };

  const removeInstruction = (index: number) => {
    const newInstructions = formData.instructions?.filter((_: any, i: number) => i !== index) || [];
    // Renumber steps
    newInstructions.forEach((instruction: any, i: number) => {
      instruction.step = i + 1;
    });
    setFormData((prev: any) => ({
      ...prev,
      instructions: newInstructions
    }));
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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{formData.title || 'Trải nghiệm VR'}</h1>
              <p className="text-lg text-gray-600 mb-6">{formData.description || 'Khám phá lịch sử qua công nghệ thực tế ảo'}</p>

              {/* Intro Video */}
              {formData.introVideo?.url && (
                <div className="max-w-2xl mx-auto mb-8">
                  <div className="bg-black rounded-lg overflow-hidden">
                    <div className="aspect-video flex items-center justify-center text-white">
                      <div className="text-center">
                        <Play className="w-16 h-16 mx-auto mb-4 opacity-80" />
                        <h3 className="text-xl font-semibold">{formData.introVideo.title}</h3>
                        {formData.introVideo.duration && (
                          <p className="text-gray-300 mt-2">{Math.floor(formData.introVideo.duration / 60)}:{(formData.introVideo.duration % 60).toString().padStart(2, '0')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Categories */}
            {formData.categories && formData.categories.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Danh mục trải nghiệm</h2>
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

            {/* VR Scenes */}
            {formData.scenes && formData.scenes.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Cảnh VR ({formData.scenes.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {formData.scenes.map((scene: VRScene, index: number) => (
                    <div key={index} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                      {scene.thumbnailUrl ? (
                        <div className="relative">
                          <img src={scene.thumbnailUrl} alt={scene.title} className="w-full h-48 object-cover rounded-t-lg" />
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-lg opacity-0 hover:opacity-100 transition-opacity">
                            <Play className="w-12 h-12 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-600 rounded-t-lg flex items-center justify-center">
                          <div className="text-white text-center">
                            <Play className="w-12 h-12 mx-auto mb-2" />
                            <p className="font-medium">VR Experience</p>
                          </div>
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 line-clamp-2">{scene.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            scene.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                            scene.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {scene.difficulty === 'easy' ? 'Dễ' : scene.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{scene.description}</p>
                        {scene.tags && scene.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {scene.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                              <span key={tagIndex} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                {tag}
                              </span>
                            ))}
                            {scene.tags.length > 3 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                +{scene.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          {scene.duration && <span>{Math.floor(scene.duration / 60)}:{(scene.duration % 60).toString().padStart(2, '0')}</span>}
                          {scene.viewCount !== undefined && <span>{scene.viewCount} lượt xem</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            {formData.instructions && formData.instructions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Hướng dẫn sử dụng</h2>
                <div className="space-y-4">
                  {formData.instructions.map((instruction: any, index: number) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">{instruction.step}</span>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-semibold text-gray-900 mb-1">{instruction.title}</h4>
                        <p className="text-gray-600">{instruction.description}</p>
                      </div>
                      {instruction.icon && <div className="text-xl">{instruction.icon}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {formData.requirements && (
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Yêu cầu hệ thống</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {formData.requirements.device && formData.requirements.device.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Thiết bị</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {formData.requirements.device.map((device: string, index: number) => (
                          <li key={index}>• {device}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {formData.requirements.browser && formData.requirements.browser.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Trình duyệt</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {formData.requirements.browser.map((browser: string, index: number) => (
                          <li key={index}>• {browser}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {formData.requirements.network && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Kết nối mạng</h4>
                      <p className="text-sm text-gray-600">• {formData.requirements.network}</p>
                    </div>
                  )}
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
                onClick={() => setActiveTab('scenes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'scenes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Cảnh VR ({formData.scenes?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('instructions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'instructions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Hướng dẫn ({formData.instructions?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('requirements')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'requirements'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Yêu cầu
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
                  placeholder="Trải nghiệm VR về Chủ tịch Hồ Chí Minh"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả trang</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Khám phá cuộc đời và sự nghiệp của Chủ tịch Hồ Chí Minh qua trải nghiệm thực tế ảo sống động"
                />
              </div>

              {/* Intro Video */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video giới thiệu</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">URL Video</label>
                    <input
                      type="url"
                      value={formData.introVideo?.url || ''}
                      onChange={(e) => handleInputChange('introVideo', { ...formData.introVideo, url: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="https://example.com/intro.mp4"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tiêu đề video</label>
                    <input
                      type="text"
                      value={formData.introVideo?.title || ''}
                      onChange={(e) => handleInputChange('introVideo', { ...formData.introVideo, title: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Video giới thiệu"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Thời lượng (giây)</label>
                    <input
                      type="number"
                      value={formData.introVideo?.duration || ''}
                      onChange={(e) => handleInputChange('introVideo', { ...formData.introVideo, duration: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="120"
                    />
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">Danh mục</label>
                  <button
                    type="button"
                    onClick={addCategory}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    Thêm danh mục
                  </button>
                </div>

                {formData.categories?.map((category: any, index: number) => (
                  <div key={index} className="grid grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-md">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tên danh mục</label>
                      <input
                        type="text"
                        value={category.name || ''}
                        onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Nơi sinh sống"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Icon/Emoji</label>
                      <input
                        type="text"
                        value={category.icon || ''}
                        onChange={(e) => handleCategoryChange(index, 'icon', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="🏡"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Mô tả</label>
                      <input
                        type="text"
                        value={category.description || ''}
                        onChange={(e) => handleCategoryChange(index, 'description', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Các địa điểm sinh sống"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeCategory(index)}
                        className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tính năng (mỗi dòng một tính năng)</label>
                <textarea
                  value={formData.features?.join('\n') || ''}
                  onChange={(e) => handleInputChange('features', e.target.value.split('\n').filter(f => f.trim()))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Trải nghiệm 360 độ\nÂm thanh sống động\nTương tác thời gian thực\nHỗ trợ nhiều ngôn ngữ`}
                />
              </div>
            </div>
          )}

          {/* Scenes Tab */}
          {activeTab === 'scenes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Quản lý cảnh VR</h3>
                <button
                  type="button"
                  onClick={addScene}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                >
                  Thêm cảnh VR
                </button>
              </div>

              {formData.scenes?.map((scene: VRScene, index: number) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tiêu đề cảnh</label>
                      <input
                        type="text"
                        value={scene.title || ''}
                        onChange={(e) => handleSceneChange(index, 'title', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Ngôi nhà tại Kim Liên"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Độ khó</label>
                      <select
                        value={scene.difficulty || 'medium'}
                        onChange={(e) => handleSceneChange(index, 'difficulty', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="easy">Dễ</option>
                        <option value="medium">Trung bình</option>
                        <option value="hard">Khó</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-1">Mô tả</label>
                    <textarea
                      value={scene.description || ''}
                      onChange={(e) => handleSceneChange(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Khám phá ngôi nhà thời thơ ấu của Bác Hồ"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">URL VR</label>
                      <input
                        type="url"
                        value={scene.vrUrl || ''}
                        onChange={(e) => handleSceneChange(index, 'vrUrl', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="https://example.com/vr-scene.html"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">URL Thumbnail</label>
                      <input
                        type="url"
                        value={scene.thumbnailUrl || ''}
                        onChange={(e) => handleSceneChange(index, 'thumbnailUrl', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="https://example.com/thumbnail.jpg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Thời lượng (giây)</label>
                      <input
                        type="number"
                        value={scene.duration || ''}
                        onChange={(e) => handleSceneChange(index, 'duration', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Danh mục</label>
                      <select
                        value={scene.category || ''}
                        onChange={(e) => handleSceneChange(index, 'category', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="">Chọn danh mục</option>
                        {formData.categories?.map((cat: any) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-1">Tags (phân cách bằng dấu phẩy)</label>
                    <input
                      type="text"
                      value={scene.tags?.join(', ') || ''}
                      onChange={(e) => handleSceneTagsChange(index, e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="kim liên, quê hương, thời thơ ấu"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`active-${index}`}
                        checked={scene.isActive || false}
                        onChange={(e) => handleSceneChange(index, 'isActive', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor={`active-${index}`} className="text-sm text-gray-700">Kích hoạt</label>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeScene(index)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      Xóa cảnh
                    </button>
                  </div>
                </div>
              ))}

              {(!formData.scenes || formData.scenes.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Play className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Chưa có cảnh VR nào. Thêm cảnh đầu tiên để bắt đầu.</p>
                </div>
              )}
            </div>
          )}

          {/* Instructions Tab */}
          {activeTab === 'instructions' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Hướng dẫn sử dụng</h3>
                <button
                  type="button"
                  onClick={addInstruction}
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
                >
                  Thêm bước hướng dẫn
                </button>
              </div>

              {formData.instructions?.map((instruction: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Bước</label>
                      <input
                        type="number"
                        value={instruction.step || index + 1}
                        onChange={(e) => handleInstructionChange(index, 'step', parseInt(e.target.value) || index + 1)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Icon/Emoji</label>
                      <input
                        type="text"
                        value={instruction.icon || ''}
                        onChange={(e) => handleInstructionChange(index, 'icon', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="🥽"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Tiêu đề</label>
                      <input
                        type="text"
                        value={instruction.title || ''}
                        onChange={(e) => handleInstructionChange(index, 'title', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Đeo kính VR"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-1">Mô tả chi tiết</label>
                    <textarea
                      value={instruction.description || ''}
                      onChange={(e) => handleInstructionChange(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Đeo kính VR và điều chỉnh cho phù hợp với mắt"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      Xóa bước
                    </button>
                  </div>
                </div>
              ))}

              {(!formData.instructions || formData.instructions.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <p>Chưa có hướng dẫn nào. Thêm bước hướng dẫn đầu tiên.</p>
                </div>
              )}
            </div>
          )}

          {/* Requirements Tab */}
          {activeTab === 'requirements' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Yêu cầu hệ thống</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thiết bị hỗ trợ</label>
                  <textarea
                    value={formData.requirements?.device?.join('\n') || ''}
                    onChange={(e) => handleInputChange('requirements', {
                      ...formData.requirements,
                      device: e.target.value.split('\n').filter(d => d.trim())
                    })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`VR Headset (Oculus, HTC Vive)\nSmartphone với gyroscope\nTablet hỗ trợ VR\nMáy tính có card đồ họa mạnh`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trình duyệt hỗ trợ</label>
                  <textarea
                    value={formData.requirements?.browser?.join('\n') || ''}
                    onChange={(e) => handleInputChange('requirements', {
                      ...formData.requirements,
                      browser: e.target.value.split('\n').filter(b => b.trim())
                    })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Chrome 70+\nFirefox 65+\nSafari 12+\nEdge 79+`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Yêu cầu kết nối mạng</label>
                <input
                  type="text"
                  value={formData.requirements?.network || ''}
                  onChange={(e) => handleInputChange('requirements', {
                    ...formData.requirements,
                    network: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tối thiểu 10 Mbps cho trải nghiệm mượt mà"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VREditor;
