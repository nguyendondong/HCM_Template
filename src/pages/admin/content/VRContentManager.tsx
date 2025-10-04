import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
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
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface VRExperience {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  image?: string;
  vrUrl?: string;
  videoPreview?: string;
  location?: {
    name: string;
    coordinates: [number, number];
  };
  features?: string[];
  interactiveElements?: any[];
  supportedDevices?: string[];
  languages?: string[];
  rating?: number;
  totalRatings?: number;
  viewCount?: number;
  isActive: boolean;
  isFeatured?: boolean;
  order?: number;
  createdAt: any;
  updatedAt: any;
}

interface VRContentManagerProps {}

const VRContentManager: React.FC<VRContentManagerProps> = () => {
  const [vrContents, setVrContents] = useState<VRExperience[]>([]);
  const [vrCategories, setVrCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState<VRExperience | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<Partial<VRExperience>>({
    title: '',
    description: '',
    category: '',
    difficulty: 'Dễ',
    duration: '',
    image: '',
    vrUrl: '',
    videoPreview: '',
    features: [],
    isActive: true,
    isFeatured: false
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchVRExperiences();
    fetchVRCategories();
  }, []);

  const fetchVRExperiences = async () => {
    try {
      setLoading(true);
      const experiencesQuery = query(collection(db, 'vr-experiences'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(experiencesQuery);
      const experiencesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VRExperience[];
      setVrContents(experiencesData);
    } catch (error) {
      console.error('Error fetching VR experiences:', error);
      toast.error('Lỗi khi tải danh sách trải nghiệm VR');
    } finally {
      setLoading(false);
    }
  };

  const fetchVRCategories = async () => {
    try {
      const categoriesQuery = query(collection(db, 'vr-featured'), orderBy('title'));
      const querySnapshot = await getDocs(categoriesQuery);
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVrCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching VR categories:', error);
      toast.error('Lỗi khi tải danh mục VR');
    }
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    try {
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      toast.success('Tải lên hình ảnh thành công!');
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Lỗi khi tải lên hình ảnh');
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let updatedFormData = { ...formData };

      if (imageFile) {
        const imagePath = `vr-images/${Date.now()}-${imageFile.name}`;
        updatedFormData.image = await uploadFile(imageFile, imagePath);
      }

      const experienceData = {
        ...updatedFormData,
        updatedAt: new Date()
      };

      if (editingContent) {
        await updateDoc(doc(db, 'vr-experiences', editingContent.id), experienceData);
        toast.success('Cập nhật trải nghiệm VR thành công!');
      } else {
        await addDoc(collection(db, 'vr-experiences'), {
          ...experienceData,
          createdAt: new Date()
        });
        toast.success('Thêm trải nghiệm VR mới thành công!');
      }

      await fetchVRExperiences();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving VR experience:', error);
      toast.error('Lỗi khi lưu trải nghiệm VR');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (content: VRExperience) => {
    setEditingContent(content);
    setFormData(content);
    setShowModal(true);
  };

  const handleDelete = async (contentId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa trải nghiệm VR này?')) {
      try {
        await deleteDoc(doc(db, 'vr-experiences', contentId));
        await fetchVRExperiences();
        toast.success('Xóa trải nghiệm VR thành công!');
      } catch (error) {
        console.error('Error deleting VR experience:', error);
        toast.error('Lỗi khi xóa trải nghiệm VR');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingContent(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      difficulty: 'Dễ',
      duration: '',
      image: '',
      vrUrl: '',
      videoPreview: '',
      features: [],
      isActive: true,
      isFeatured: false
    });
    setImageFile(null);
  };

  const filteredContents = vrContents.filter(content =>
    content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.description.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Trải nghiệm VR</h1>
          <p className="text-gray-600 mt-1">Tổng cộng {vrContents.length} trải nghiệm VR</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Thêm Trải nghiệm VR
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm trải nghiệm VR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* VR Experiences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContents.map((experience) => (
          <div key={experience.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Thumbnail */}
            <div className="aspect-video bg-gray-100 relative">
              {experience.image ? (
                <img
                  src={experience.image}
                  alt={experience.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Headset className="h-12 w-12 text-gray-400" />
                </div>
              )}

              {/* Status badge */}
              <div className="absolute top-2 right-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  experience.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {experience.isActive ? (
                    <CheckCircle size={12} className="mr-1" />
                  ) : (
                    <AlertCircle size={12} className="mr-1" />
                  )}
                  {experience.isActive ? 'Hoạt động' : 'Tạm dừng'}
                </span>
              </div>

              {/* Duration */}
              {experience.duration && (
                <div className="absolute bottom-2 right-2">
                  <span className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                    {experience.duration}
                  </span>
                </div>
              )}
            </div>

            {/* Content Info */}
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-1">{experience.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{experience.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <span>Độ khó: {experience.difficulty}</span>
                {experience.features && experience.features.length > 0 && (
                  <span>{experience.features.length} tính năng</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => window.open(experience.vrUrl || experience.image, '_blank')}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                  disabled={!experience.vrUrl && !experience.image}
                >
                  <Eye size={16} className="mr-1" />
                  Xem trước
                </button>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(experience)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(experience.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredContents.length === 0 && (
        <div className="text-center py-12">
          <Headset className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có trải nghiệm VR nào</h3>
          <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách thêm trải nghiệm VR đầu tiên.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingContent ? 'Chỉnh sửa Trải nghiệm VR' : 'Thêm Trải nghiệm VR Mới'}
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
                    Danh mục
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {vrCategories.map(category => (
                      <option key={category.id} value={category.id}>{category.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Độ khó
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Dễ">Dễ</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khó">Khó</option>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời lượng (ví dụ: 15-20 phút)
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="15-20 phút"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL VR Experience
                </label>
                <input
                  type="url"
                  value={formData.vrUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, vrUrl: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/vr-experience"
                />
              </div>

              {/* File uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hình ảnh chính
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.image && (
                    <p className="text-xs text-gray-500 mt-1">Đã có hình ảnh hiện tại</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Kích hoạt trải nghiệm VR
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                    Nổi bật
                  </label>
                </div>
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
