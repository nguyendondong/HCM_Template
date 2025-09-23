import React, { useState } from 'react';
import { Eye, EyeOff, UploadCloud } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../../lib/firebase';
import toast from 'react-hot-toast';

interface IntroductionContent {
  id?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  mainContent?: string;
  videoPath?: string;
  videoUrl?: string;
  highlights?: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  features?: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  biography?: {
    title: string;
    content: string[];
  };
  timeline?: Array<{
    year: string;
    title: string;
    description: string;
  }>;
  quote?: {
    text: string;
    author: string;
  };
  callToAction?: {
    text: string;
    targetSection: string;
  };
  backgroundImage?: string;
  isActive?: boolean;
}

interface IntroductionEditorProps {
  formData: IntroductionContent;
  setFormData: (data: any) => void;
}

const IntroductionEditor: React.FC<IntroductionEditorProps> = ({ formData, setFormData }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoUploadError, setVideoUploadError] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // Video upload handler
  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset errors
    setVideoUploadError('');

    // Validate file type (videos)
    const validTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      toast.error('Chỉ hỗ trợ file video: MP4, MOV, AVI, WebM');
      return;
    }

    // Validate file size (max 100MB for videos)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast.error('Kích thước video không được vượt quá 100MB');
      return;
    }

    try {
      // Set uploading state
      setVideoUploading(true);
      setVideoUploadProgress(0);

      // Create storage reference
      const timestamp = Date.now();
      const fileName = `intro_video_${timestamp}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, `videos/introduction/${fileName}`);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setVideoUploadProgress(prev => {
          const newProgress = Math.min(prev + 5, 90);
          return newProgress;
        });
      }, 200);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      clearInterval(progressInterval);

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Complete progress
      setVideoUploadProgress(100);

      // Update form data with new URL
      handleInputChange('videoPath', downloadURL);

      // Success toast
      toast.success('Upload video thành công!');

      // Reset state after delay
      setTimeout(() => {
        setVideoUploading(false);
        setVideoUploadProgress(0);
      }, 1500);

    } catch (error) {
      console.error('Video upload failed:', error);
      toast.error('Upload video thất bại. Vui lòng thử lại!');
      setVideoUploading(false);
      setVideoUploadProgress(0);
    }
  };

  const handleHighlightChange = (index: number, field: string, value: string) => {
    const newHighlights = [...(formData.highlights || [])];
    newHighlights[index] = { ...newHighlights[index], [field]: value };
    setFormData((prev: any) => ({
      ...prev,
      highlights: newHighlights
    }));
  };

  const addHighlight = () => {
    const newHighlights = [...(formData.highlights || []), { title: '', description: '', icon: '' }];
    setFormData((prev: any) => ({
      ...prev,
      highlights: newHighlights
    }));
  };

  const removeHighlight = (index: number) => {
    const newHighlights = formData.highlights?.filter((_: any, i: number) => i !== index) || [];
    setFormData((prev: any) => ({
      ...prev,
      highlights: newHighlights
    }));
  };

  const handleTimelineChange = (index: number, field: string, value: string) => {
    const newTimeline = [...(formData.timeline || [])];
    newTimeline[index] = { ...newTimeline[index], [field]: value };
    setFormData((prev: any) => ({
      ...prev,
      timeline: newTimeline
    }));
  };

  const addTimelineItem = () => {
    const newTimeline = [...(formData.timeline || []), { year: '', title: '', description: '' }];
    setFormData((prev: any) => ({
      ...prev,
      timeline: newTimeline
    }));
  };

  const removeTimelineItem = (index: number) => {
    const newTimeline = formData.timeline?.filter((_: any, i: number) => i !== index) || [];
    setFormData((prev: any) => ({
      ...prev,
      timeline: newTimeline
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
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{formData.title || 'Tiêu đề chính'}</h1>
              <h2 className="text-xl text-gray-600 mb-6">{formData.subtitle || 'Tiêu đề phụ'}</h2>
              <p className="text-lg text-gray-700 leading-relaxed">{formData.description || 'Mô tả ngắn về nội dung'}</p>
            </div>

            {formData.mainContent && (
              <div className="prose prose-lg max-w-none mb-8">
                <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formData.mainContent.replace(/\n/g, '<br />') }} />
              </div>
            )}

            {formData.videoPath && (
              <div className="mb-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Video giới thiệu</h3>
                <div className="bg-gray-200 p-4 rounded-lg">
                  <p className="text-gray-600">Video: {formData.videoPath}</p>
                  <p className="text-sm text-gray-500">(Video sẽ được hiển thị ở đây trong trang web thực tế)</p>
                </div>
              </div>
            )}

            {formData.biography && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{formData.biography.title || 'Tiểu sử'}</h3>
                <div className="bg-white p-6 rounded-lg shadow space-y-4">
                  {formData.biography.content?.map((paragraph: string, index: number) => (
                    <p key={index} className="text-gray-700 leading-relaxed">{paragraph}</p>
                  ))}
                </div>
              </div>
            )}

            {formData.highlights && formData.highlights.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {formData.highlights.map((highlight: any, index: number) => (
                  <div key={index} className="text-center p-6 bg-white rounded-lg shadow">
                    {highlight.icon && <div className="text-3xl mb-4">{highlight.icon}</div>}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{highlight.title}</h3>
                    <p className="text-gray-600">{highlight.description}</p>
                  </div>
                ))}
              </div>
            )}

            {formData.timeline && formData.timeline.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Dòng thời gian</h3>
                <div className="space-y-4">
                  {formData.timeline.map((item: any, index: number) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow">
                      <div className="flex-shrink-0 w-16 text-center">
                        <span className="text-lg font-bold text-blue-600">{item.year}</span>
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                        <p className="text-gray-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.quote && (
              <div className="text-center bg-blue-50 p-8 rounded-lg">
                <blockquote className="text-xl italic text-gray-800 mb-4">"{formData.quote.text}"</blockquote>
                <cite className="text-gray-600 font-medium">— {formData.quote.author}</cite>
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
                placeholder="Chủ tịch Hồ Chí Minh"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề phụ</label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Người cha của dân tộc Việt Nam"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả ngắn</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả ngắn gọn về nội dung giới thiệu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung chính</label>
            <textarea
              value={formData.mainContent || ''}
              onChange={(e) => handleInputChange('mainContent', e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nội dung chi tiết về chủ đề giới thiệu..."
            />
          </div>

          {/* Video Path */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Đường dẫn Video</label>
            <div className="flex">
              <input
                type="text"
                value={formData.videoPath || ''}
                onChange={(e) => handleInputChange('videoPath', e.target.value)}
                className={`w-full px-3 py-2 border ${videoUploadError ? 'border-red-500' : 'border-gray-300'} rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Đường dẫn đến video giới thiệu"
              />
              <div className="relative">
                <input
                  type="file"
                  id="video-upload"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={videoUploading}
                />
                <button
                  type="button"
                  className={`px-4 py-2 rounded-r-md transition-colors ${
                    videoUploading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                  disabled={videoUploading}
                >
                  {videoUploading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Uploading...
                    </div>
                  ) : (
                    <UploadCloud size={18} />
                  )}
                </button>
              </div>
            </div>
            {videoUploadError && <p className="mt-1 text-sm text-red-500">{videoUploadError}</p>}
            {videoUploading && (
              <div className="mt-2 bg-blue-50 rounded-md p-2">
                <div className="flex justify-between text-sm text-blue-700 mb-1">
                  <span>Đang upload video...</span>
                  <span>{videoUploadProgress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${videoUploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Video Preview */}
            {formData.videoPath && (
              <div className="mt-3 p-3 border rounded-lg bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <video
                  src={formData.videoPath}
                  className="w-full max-w-md h-auto rounded-md border"
                  controls
                  onError={(e) => {
                    console.error('Video load error:', e);
                  }}
                >
                  Trình duyệt không hỗ trợ video này.
                </video>
              </div>
            )}
          </div>

          {/* Biography Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tiểu sử</label>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tiêu đề tiểu sử</label>
                <input
                  type="text"
                  value={formData.biography?.title || ''}
                  onChange={(e) => handleInputChange('biography', {
                    ...formData.biography,
                    title: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Cuộc đời và sự nghiệp"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nội dung tiểu sử (mỗi đoạn trên một dòng)</label>
                <textarea
                  value={formData.biography?.content?.join('\n') || ''}
                  onChange={(e) => handleInputChange('biography', {
                    ...formData.biography,
                    content: e.target.value.split('\n').filter(line => line.trim())
                  })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mỗi đoạn văn trên một dòng..."
                />
              </div>
            </div>
          </div>

          {/* Highlights Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">Điểm nổi bật</label>
              <button
                type="button"
                onClick={addHighlight}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                Thêm điểm nổi bật
              </button>
            </div>

            {formData.highlights?.map((highlight: any, index: number) => (
              <div key={index} className="grid grid-cols-3 gap-4 mb-4 p-4 border border-gray-200 rounded-md">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Icon/Emoji</label>
                  <input
                    type="text"
                    value={highlight.icon || ''}
                    onChange={(e) => handleHighlightChange(index, 'icon', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="🏛️"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tiêu đề</label>
                  <input
                    type="text"
                    value={highlight.title || ''}
                    onChange={(e) => handleHighlightChange(index, 'title', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Lãnh đạo xuất sắc"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mô tả</label>
                  <input
                    type="text"
                    value={highlight.description || ''}
                    onChange={(e) => handleHighlightChange(index, 'description', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Mô tả chi tiết"
                  />
                </div>
                <div className="col-span-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeHighlight(index)}
                    className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">Dòng thời gian</label>
              <button
                type="button"
                onClick={addTimelineItem}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
              >
                Thêm mốc thời gian
              </button>
            </div>

            {formData.timeline?.map((item: any, index: number) => (
              <div key={index} className="grid grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-md">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Năm</label>
                  <input
                    type="text"
                    value={item.year || ''}
                    onChange={(e) => handleTimelineChange(index, 'year', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="1890"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tiêu đề</label>
                  <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => handleTimelineChange(index, 'title', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Sinh ra tại Kim Liên"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mô tả</label>
                  <input
                    type="text"
                    value={item.description || ''}
                    onChange={(e) => handleTimelineChange(index, 'description', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Mô tả sự kiện"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeTimelineItem(index)}
                    className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quote Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">Câu trích dẫn nổi bật</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nội dung trích dẫn</label>
                <textarea
                  value={formData.quote?.text || ''}
                  onChange={(e) => handleInputChange('quote', { ...formData.quote, text: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Không có gì quý hơn độc lập tự do"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tác giả</label>
                <input
                  type="text"
                  value={formData.quote?.author || ''}
                  onChange={(e) => handleInputChange('quote', { ...formData.quote, author: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Hồ Chí Minh"
                />
              </div>
            </div>
          </div>

          {/* Background Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL hình nền</label>
            <input
              type="url"
              value={formData.backgroundImage || ''}
              onChange={(e) => handleInputChange('backgroundImage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/background.jpg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default IntroductionEditor;
