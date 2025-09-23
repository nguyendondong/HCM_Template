import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../lib/firebase';
import {
  Headset,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Upload,
  Eye,
  FileVideo,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface VRContent {
  id: string;
  spotId: string;
  title: string;
  description: string;
  type: 'video360' | 'image360' | 'interactive';
  mediaUrl: string;
  thumbnailUrl?: string;
  audioUrl?: string;
  duration?: number; // for videos in seconds
  hotspots?: VRHotspot[];
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

interface VRHotspot {
  id: string;
  position: { x: number; y: number; z: number };
  title: string;
  description?: string;
  action: 'info' | 'navigate' | 'audio' | 'video';
  actionData?: string;
}

interface VRContentManagerProps {}

const VRContentManager: React.FC<VRContentManagerProps> = () => {
  const [vrContents, setVrContents] = useState<VRContent[]>([]);
  const [heritageSpots, setHeritageSpots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState<VRContent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<Partial<VRContent>>({
    spotId: '',
    title: '',
    description: '',
    type: 'video360',
    mediaUrl: '',
    thumbnailUrl: '',
    audioUrl: '',
    duration: 0,
    hotspots: [],
    isActive: true
  });

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  useEffect(() => {
    fetchVRContents();
    fetchHeritageSpots();
  }, []);

  const fetchVRContents = async () => {
    try {
      setLoading(true);
      const contentsQuery = query(collection(db, 'vrContents'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(contentsQuery);
      const contentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VRContent[];
      setVrContents(contentsData);
    } catch (error) {
      console.error('Error fetching VR contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeritageSpots = async () => {
    try {
      const spotsQuery = query(collection(db, 'heritageSpots'), orderBy('name'));
      const querySnapshot = await getDocs(spotsQuery);
      const spotsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHeritageSpots(spotsData);
    } catch (error) {
      console.error('Error fetching heritage spots:', error);
    }
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let updatedFormData = { ...formData };

      // Upload media file
      if (mediaFile) {
        const mediaPath = `vr-content/${Date.now()}-${mediaFile.name}`;
        updatedFormData.mediaUrl = await uploadFile(mediaFile, mediaPath);
      }

      // Upload thumbnail
      if (thumbnailFile) {
        const thumbnailPath = `vr-thumbnails/${Date.now()}-${thumbnailFile.name}`;
        updatedFormData.thumbnailUrl = await uploadFile(thumbnailFile, thumbnailPath);
      }

      // Upload audio
      if (audioFile) {
        const audioPath = `vr-audio/${Date.now()}-${audioFile.name}`;
        updatedFormData.audioUrl = await uploadFile(audioFile, audioPath);
      }

      const contentData = {
        ...updatedFormData,
        updatedAt: new Date()
      };

      if (editingContent) {
        await updateDoc(doc(db, 'vrContents', editingContent.id), contentData);
      } else {
        await addDoc(collection(db, 'vrContents'), {
          ...contentData,
          createdAt: new Date()
        });
      }

      await fetchVRContents();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving VR content:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (content: VRContent) => {
    setEditingContent(content);
    setFormData(content);
    setShowModal(true);
  };

  const handleDelete = async (contentId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nội dung VR này?')) {
      try {
        // TODO: Also delete associated files from storage
        await deleteDoc(doc(db, 'vrContents', contentId));
        await fetchVRContents();
      } catch (error) {
        console.error('Error deleting VR content:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingContent(null);
    setFormData({
      spotId: '',
      title: '',
      description: '',
      type: 'video360',
      mediaUrl: '',
      thumbnailUrl: '',
      audioUrl: '',
      duration: 0,
      hotspots: [],
      isActive: true
    });
    setMediaFile(null);
    setThumbnailFile(null);
    setAudioFile(null);
  };

  const addHotspot = () => {
    const newHotspot: VRHotspot = {
      id: Date.now().toString(),
      position: { x: 0, y: 0, z: 0 },
      title: '',
      description: '',
      action: 'info',
      actionData: ''
    };

    setFormData(prev => ({
      ...prev,
      hotspots: [...(prev.hotspots || []), newHotspot]
    }));
  };

  const updateHotspot = (index: number, updatedHotspot: VRHotspot) => {
    setFormData(prev => ({
      ...prev,
      hotspots: prev.hotspots?.map((h, i) => i === index ? updatedHotspot : h) || []
    }));
  };

  const removeHotspot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      hotspots: prev.hotspots?.filter((_, i) => i !== index) || []
    }));
  };

  const getSpotName = (spotId: string) => {
    const spot = heritageSpots.find(s => s.id === spotId);
    return spot ? spot.name : 'Không xác định';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video360':
        return FileVideo;
      case 'image360':
        return ImageIcon;
      case 'interactive':
        return Headset;
      default:
        return Headset;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'video360':
        return 'Video 360°';
      case 'image360':
        return 'Ảnh 360°';
      case 'interactive':
        return 'Tương tác';
      default:
        return type;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredContents = vrContents.filter(content =>
    content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getSpotName(content.spotId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Đang tải nội dung VR...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Nội dung VR</h1>
          <p className="text-gray-600 mt-1">Tổng cộng {vrContents.length} nội dung VR</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Thêm Nội dung VR
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm nội dung VR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* VR Contents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContents.map((content) => {
          const TypeIcon = getTypeIcon(content.type);

          return (
            <div key={content.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-100 relative">
                {content.thumbnailUrl ? (
                  <img
                    src={content.thumbnailUrl}
                    alt={content.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <TypeIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                {/* Type badge */}
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <TypeIcon size={12} className="mr-1" />
                    {getTypeLabel(content.type)}
                  </span>
                </div>

                {/* Status badge */}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    content.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {content.isActive ? (
                      <CheckCircle size={12} className="mr-1" />
                    ) : (
                      <AlertCircle size={12} className="mr-1" />
                    )}
                    {content.isActive ? 'Hoạt động' : 'Tạm dừng'}
                  </span>
                </div>

                {/* Duration for videos */}
                {content.type === 'video360' && content.duration && (
                  <div className="absolute bottom-2 right-2">
                    <span className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                      {formatDuration(content.duration)}
                    </span>
                  </div>
                )}
              </div>

              {/* Content Info */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">{content.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{content.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>{getSpotName(content.spotId)}</span>
                  {content.hotspots && content.hotspots.length > 0 && (
                    <span>{content.hotspots.length} hotspots</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => window.open(content.mediaUrl, '_blank')}
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Eye size={16} className="mr-1" />
                    Xem trước
                  </button>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(content)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(content.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredContents.length === 0 && (
        <div className="text-center py-12">
          <Headset className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có nội dung VR nào</h3>
          <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách thêm nội dung VR đầu tiên.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingContent ? 'Chỉnh sửa Nội dung VR' : 'Thêm Nội dung VR Mới'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa điểm
                  </label>
                  <select
                    value={formData.spotId}
                    onChange={(e) => setFormData(prev => ({ ...prev, spotId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Chọn Địa điểm </option>
                    {heritageSpots.map(spot => (
                      <option key={spot.id} value={spot.id}>{spot.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại nội dung
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="video360">Video 360°</option>
                    <option value="image360">Ảnh 360°</option>
                    <option value="interactive">Tương tác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              {/* File uploads */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File media chính
                  </label>
                  <input
                    type="file"
                    accept={formData.type === 'video360' ? 'video/*' : 'image/*'}
                    onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={!editingContent}
                  />
                  {formData.mediaUrl && (
                    <p className="text-xs text-gray-500 mt-1">Đã có file hiện tại</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audio (tùy chọn)
                  </label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {formData.type === 'video360' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời lượng (giây)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              )}

              {/* Hotspots */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Hotspots ({formData.hotspots?.length || 0})
                  </label>
                  <button
                    type="button"
                    onClick={addHotspot}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    <Plus size={16} className="inline mr-1" />
                    Thêm hotspot
                  </button>
                </div>

                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {formData.hotspots?.map((hotspot, index) => (
                    <div key={hotspot.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-900">Hotspot {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeHotspot(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Tiêu đề"
                          value={hotspot.title}
                          onChange={(e) => updateHotspot(index, { ...hotspot, title: e.target.value })}
                          className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <select
                          value={hotspot.action}
                          onChange={(e) => updateHotspot(index, { ...hotspot, action: e.target.value as any })}
                          className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="info">Thông tin</option>
                          <option value="navigate">Điều hướng</option>
                          <option value="audio">Phát audio</option>
                          <option value="video">Phát video</option>
                        </select>

                        <div className="col-span-2">
                          <textarea
                            placeholder="Mô tả"
                            value={hotspot.description}
                            onChange={(e) => updateHotspot(index, { ...hotspot, description: e.target.value })}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            rows={2}
                          />
                        </div>

                        <div className="col-span-2 grid grid-cols-3 gap-1">
                          <input
                            type="number"
                            placeholder="X"
                            step="0.1"
                            value={hotspot.position.x}
                            onChange={(e) => updateHotspot(index, {
                              ...hotspot,
                              position: { ...hotspot.position, x: Number(e.target.value) }
                            })}
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <input
                            type="number"
                            placeholder="Y"
                            step="0.1"
                            value={hotspot.position.y}
                            onChange={(e) => updateHotspot(index, {
                              ...hotspot,
                              position: { ...hotspot.position, y: Number(e.target.value) }
                            })}
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <input
                            type="number"
                            placeholder="Z"
                            step="0.1"
                            value={hotspot.position.z}
                            onChange={(e) => updateHotspot(index, {
                              ...hotspot,
                              position: { ...hotspot.position, z: Number(e.target.value) }
                            })}
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Kích hoạt nội dung VR
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={uploading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center disabled:opacity-50"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Upload size={16} className="mr-2 animate-spin" />
                      Đang tải lên...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      {editingContent ? 'Cập nhật' : 'Tạo mới'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VRContentManager;
