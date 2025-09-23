import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Edit, Save, AlertTriangle, Check, X, Eye, ChevronLeft, Plus } from 'lucide-react';

interface ContentDetailsProps {}

const ContentDetails: React.FC<ContentDetailsProps> = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchContent();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      // Assuming we know the collection and ID
      // In a real app, you might need to search through multiple collections
      const contentDoc = await getDoc(doc(db, 'contents', id as string));

      if (contentDoc.exists()) {
        const contentData = { id: contentDoc.id, ...contentDoc.data() };
        setContent(contentData);
        setFormData(contentData);
      } else {
        setError('Không tìm thấy nội dung với ID này');
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      setError('Đã xảy ra lỗi khi tải nội dung');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateDoc(doc(db, 'contents', id as string), {
        ...formData,
        updatedAt: new Date()
      });
      setContent(formData);
      setEditMode(false);
      setSuccess('Cập nhật nội dung thành công!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating content:', error);
      setError('Đã xảy ra lỗi khi cập nhật nội dung');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Đang tải nội dung...</div>
      </div>
    );
  }

  if (error && !content) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
        <button
          onClick={() => navigate('/admin/content')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft size={16} className="mr-1" />
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/content')}
            className="mr-3 p-2 hover:bg-gray-100 rounded-full"
            title="Quay lại"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {content ? content.title : 'Chi tiết nội dung'}
            </h1>
            {content && (
              <p className="text-gray-500 text-sm">
                ID: {content.id} • Loại: {content.type || 'Không xác định'}
              </p>
            )}
          </div>
        </div>
        <div>
          {editMode ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFormData(content);
                  setEditMode(false);
                }}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center"
              >
                <X size={16} className="mr-1" />
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <Save size={16} className="mr-1" />
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Edit size={16} className="mr-1" />
              Chỉnh sửa
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
          <AlertTriangle size={18} className="mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
          <Check size={18} className="mr-2" />
          {success}
        </div>
      )}

      {/* Content Preview */}
      {!editMode && content && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 bg-white rounded-lg shadow p-6 border">
            <div className="prose max-w-none">
              <h2>{content.title}</h2>
              {content.subtitle && <h3 className="text-gray-500">{content.subtitle}</h3>}
              <p>{content.description || 'Không có mô tả'}</p>

              {content.content && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-lg font-medium mb-2">Nội dung chi tiết</h4>
                  <div className="whitespace-pre-wrap">{content.content}</div>
                </div>
              )}
            </div>

            {content.imageUrl && (
              <div className="mt-4">
                <img
                  src={content.imageUrl}
                  alt={content.title}
                  className="max-w-full rounded-md"
                />
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6 border">
            <h3 className="text-lg font-medium mb-4">Thông tin</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">Trạng thái</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  content.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <Eye size={12} className="mr-1" />
                  {content.isActive ? 'Hiển thị' : 'Ẩn'}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">Loại nội dung</span>
                <span className="font-medium">{content.type}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">Hiển thị trên navbar</span>
                <span className="font-medium">{content.navbarId || 'Không'}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">Ngày tạo</span>
                <span className="text-sm">
                  {content.createdAt ? new Date(content.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">Cập nhật lần cuối</span>
                <span className="text-sm">
                  {content.updatedAt ? new Date(content.updatedAt.seconds * 1000).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Hành động nhanh</h4>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate(`/admin/content/edit/${content.id}`)}
                  className="text-blue-600 hover:bg-blue-50 py-2 px-3 rounded-md text-sm flex items-center"
                >
                  <Edit size={14} className="mr-1.5" />
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => navigate('/admin/content/preview/' + content.id)}
                  className="text-gray-600 hover:bg-gray-50 py-2 px-3 rounded-md text-sm flex items-center"
                >
                  <Eye size={14} className="mr-1.5" />
                  Xem trên trang chính
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {editMode && (
        <div className="bg-white rounded-lg shadow p-6 border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Phụ đề
                </label>
                <input
                  type="text"
                  id="subtitle"
                  name="subtitle"
                  value={formData.subtitle || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="navbarId" className="block text-sm font-medium text-gray-700 mb-1">
                  ID hiển thị trên navbar
                </label>
                <input
                  type="text"
                  id="navbarId"
                  name="navbarId"
                  value={formData.navbarId || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive || false}
                    onChange={handleToggle}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Kích hoạt hiển thị
                  </label>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung chi tiết
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content || ''}
                  onChange={handleChange}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  URL hình ảnh
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {formData.imageUrl && (
                <div className="mb-4 border p-2 rounded-md">
                  <p className="text-xs text-gray-500 mb-1">Xem trước hình ảnh:</p>
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="max-h-40 rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.fallback-content-image')) {
                        const fallback = window.document.createElement('div');
                        fallback.className = 'fallback-content-image max-h-40 bg-gray-100 flex items-center justify-center rounded p-8';
                        fallback.innerHTML = '<svg class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" /></svg>';
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Related Content */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Nội dung liên quan</h2>
          <button className="flex items-center text-blue-600 hover:text-blue-700">
            <Plus size={16} className="mr-1" />
            Thêm nội dung
          </button>
        </div>

        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-3 border-b bg-gray-50">
            <p className="text-gray-500 text-sm">Hiển thị các nội dung thuộc cùng danh mục</p>
          </div>

          <div className="p-6 text-center text-gray-500">
            Chưa có nội dung liên quan nào.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDetails;
