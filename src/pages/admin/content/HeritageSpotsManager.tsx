import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../lib/firebase';
import toast from 'react-hot-toast';
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  X
} from 'lucide-react';
import { FirebaseHeritageSpot } from '../../../types/firebase';

interface HeritageSpotsManagerProps {}

const HeritageSpotsManager: React.FC<HeritageSpotsManagerProps> = () => {
  const [spots, setSpots] = useState<FirebaseHeritageSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSpot, setEditingSpot] = useState<FirebaseHeritageSpot | null>(null);
  const [formData, setFormData] = useState<Partial<FirebaseHeritageSpot>>({
    name: '',
    description: '',
    mapPosition: { x: 0, y: 0 },
    side: 'left',
    imageUrl: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchHeritageSpots();
  }, []);

  const fetchHeritageSpots = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'heritage-spots'));
      const spotsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Ensure mapPosition exists with default values
          mapPosition: data.mapPosition || { x: 0, y: 0 }
        };
      }) as FirebaseHeritageSpot[];

      setSpots(spotsData);
    } catch (error) {
      console.error('Error fetching heritage spots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const spotData = {
        ...formData,
        updatedAt: Timestamp.now(),
        ...(editingSpot ? {} : { createdAt: Timestamp.now() })
      };

      if (editingSpot) {
        // Update existing spot
        await updateDoc(doc(db, 'heritage-spots', editingSpot.id), spotData);
        toast.success('Cập nhật di tích thành công!');
      } else {
        // Create new spot
        await addDoc(collection(db, 'heritage-spots'), spotData);
        toast.success('Tạo di tích mới thành công!');
      }

      await fetchHeritageSpots();
      handleCloseForm();
    } catch (error) {
      console.error('Error saving heritage spot:', error);
      toast.error('Có lỗi xảy ra khi lưu dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (spotId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa điểm này?')) {
      try {
        await deleteDoc(doc(db, 'heritage-spots', spotId));
        await fetchHeritageSpots();
        toast.success('Xóa di tích thành công!');
      } catch (error) {
        console.error('Error deleting heritage spot:', error);
        toast.error('Có lỗi xảy ra khi xóa di tích!');
      }
    }
  };

  const handleEdit = (spot: FirebaseHeritageSpot) => {
    setEditingSpot(spot);
    setFormData({
      name: spot.name,
      description: spot.description,
      mapPosition: spot.mapPosition || { x: 0, y: 0 },
      side: spot.side,
      imageUrl: spot.imageUrl || '',
      url: spot.url || ''
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSpot(null);
    setFormData({
      name: '',
      description: '',
      mapPosition: { x: 0, y: 0 },
      side: 'left',
      imageUrl: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...((prev as any)[parent] || {}),
          [child]: parseFloat(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const storageRef = ref(storage, `heritage-spots/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      setFormData(prev => ({
        ...prev,
        imageUrl: downloadURL
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  if (loading && spots.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Địa điểm</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Thêm Map
        </button>
      </div>

      {/* Heritage Spots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {spots.map((spot) => (
          <div key={spot.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {spot.imageUrl && (
              <img
                src={spot.imageUrl}
                alt={spot.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{spot.name}</h3>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{spot.description}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  Vị trí: {spot.mapPosition?.x ?? 0}%, {spot.mapPosition?.y ?? 0}%
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  spot.side === 'left' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {spot.side === 'left' ? 'Bên trái' : 'Bên phải'}
                </span>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleEdit(spot)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Chỉnh sửa"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(spot.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Xóa"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingSpot ? 'Chỉnh sửa Địa điểm ' : 'Thêm Địa điểm  mới'}
              </h2>
              <button
                onClick={handleCloseForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Địa điểm  *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL *
                </label>
                <input
                  type="text"
                  name="url"
                  value={formData.url || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả *
                </label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vị trí X (%) *
                  </label>
                  <input
                    type="number"
                    name="mapPosition.x"
                    value={formData.mapPosition?.x || 0}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vị trí Y (%) *
                  </label>
                  <input
                    type="number"
                    name="mapPosition.y"
                    value={formData.mapPosition?.y || 0}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phía hiển thị *
                </label>
                <select
                  name="side"
                  value={formData.side || 'left'}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="left">Bên trái</option>
                  <option value="right">Bên phải</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình ảnh
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {uploading && (
                  <p className="text-sm text-blue-600 mt-1">Đang tải lên...</p>
                )}
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Đang lưu...' : (editingSpot ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeritageSpotsManager;
