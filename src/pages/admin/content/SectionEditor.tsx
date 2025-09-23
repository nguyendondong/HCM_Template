import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import toast from 'react-hot-toast';
import {
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  ChevronRight,
  Eye,
  EyeOff,
  Image as ImageIcon,
  File,
  UploadCloud,
  Check
} from 'lucide-react';

interface ContentField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'boolean' | 'select' | 'color';
  options?: string[];
  required?: boolean;
}

interface SectionContent {
  id: string;
  type: string;
  title: string;
  fields: { [key: string]: any };
  active: boolean;
  updatedAt?: any;
}

interface SectionEditorProps {}

const SectionEditor: React.FC<SectionEditorProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sectionParam = searchParams.get('section');

  const [section, setSection] = useState<string>(sectionParam || 'overview');
  const [sectionData, setSectionData] = useState<SectionContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SectionContent | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // Định nghĩa các trường dữ liệu cho từng loại section
  const sectionFields: Record<string, ContentField[]> = {
    overview: [
      { key: 'title', label: 'Tiêu đề', type: 'text', required: true },
      { key: 'subtitle', label: 'Phụ đề', type: 'text' },
      { key: 'description', label: 'Mô tả', type: 'textarea' },
      { key: 'imageUrl', label: 'Hình ảnh', type: 'image' },
      { key: 'stats', label: 'Thống kê', type: 'textarea' },
      { key: 'backgroundColor', label: 'Màu nền', type: 'color' }
    ],
    introduction: [
      { key: 'title', label: 'Tiêu đề', type: 'text', required: true },
      { key: 'content', label: 'Nội dung', type: 'textarea', required: true },
      { key: 'imageUrl', label: 'Hình ảnh', type: 'image' },
      { key: 'position', label: 'Vị trí', type: 'select', options: ['left', 'right', 'center'] }
    ],
    journey: [
      { key: 'title', label: 'Tiêu đề', type: 'text', required: true },
      { key: 'description', label: 'Mô tả', type: 'textarea' },
      { key: 'mapType', label: 'Loại bản đồ', type: 'select', options: ['vietnam', 'hochiminh', 'world'] },
      { key: 'showLabels', label: 'Hiển thị nhãn', type: 'boolean' }
    ],
    documents: [
      { key: 'title', label: 'Tiêu đề', type: 'text', required: true },
      { key: 'description', label: 'Mô tả', type: 'textarea' },
      { key: 'categories', label: 'Danh mục tài liệu', type: 'textarea' },
      { key: 'layout', label: 'Bố cục', type: 'select', options: ['grid', 'list', 'masonry'] }
    ],
    'vr-technology': [
      { key: 'title', label: 'Tiêu đề', type: 'text', required: true },
      { key: 'description', label: 'Mô tả', type: 'textarea' },
      { key: 'videoUrl', label: 'Video demo', type: 'text' },
      { key: 'features', label: 'Tính năng', type: 'textarea' }
    ],
    'mini-game': [
      { key: 'title', label: 'Tiêu đề', type: 'text', required: true },
      { key: 'description', label: 'Mô tả', type: 'textarea' },
      { key: 'gameCount', label: 'Số lượng trò chơi', type: 'text' },
      { key: 'backgroundImage', label: 'Hình nền', type: 'image' }
    ]
  };

  const sections = [
    { id: 'overview', label: 'Tổng quan', collection: 'overview-content' },
    { id: 'introduction', label: 'Giới thiệu', collection: 'introduction-content' },
    { id: 'journey', label: 'Di tích lịch sử', collection: 'journey-content' },
    { id: 'documents', label: 'Tư liệu', collection: 'documents-content' },
    { id: 'vr-technology', label: 'Công nghệ VR', collection: 'vr-content' },
    { id: 'mini-game', label: 'Mini Game', collection: 'minigame-content' }
  ];

  useEffect(() => {
    // Cập nhật URL khi section thay đổi
    if (section !== sectionParam) {
      navigate(`/admin/content?section=${section}`, { replace: true });
    }

    loadSectionData(section);
  }, [section]);

  const loadSectionData = async (sectionId: string) => {
    try {
      setLoading(true);
      const sectionInfo = sections.find(s => s.id === sectionId);

      if (sectionInfo) {
        const contentCollection = collection(db, sectionInfo.collection);
        const querySnapshot = await getDocs(contentCollection);

        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          type: sectionId,
          title: doc.data().title || 'Không có tiêu đề',
          fields: doc.data(),
          active: doc.data().active !== false,
          updatedAt: doc.data().updatedAt
        }));

        setSectionData(data);
      } else {
        setSectionData([]);
      }
    } catch (error) {
      console.error('Error loading section data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (sectionId: string) => {
    setSection(sectionId);
    setSelectedItem(null);
    setEditMode(false);
    setFormData({});
  };

  const handleEdit = (item: SectionContent) => {
    setSelectedItem(item);
    setFormData(item.fields);
    setEditMode(true);
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setFormData({
      title: '',
      active: true,
    });
    setEditMode(true);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    // ...existing code...
    try {
      // ...existing code for saving...
      toast.success('Lưu section thành công!');
    } catch (error) {
      toast.error('Có lỗi khi lưu section!');
    }
    // ...existing code...
    try {
      // ...existing code for deleting...
      toast.success('Xóa section thành công!');
    } catch (error) {
      toast.error('Có lỗi khi xóa section!');
    }
    try {
      setSaving(true);
      const sectionInfo = sections.find(s => s.id === section);

      if (!sectionInfo) {
        throw new Error('Section not found');
      }

      const saveData = {
        ...formData,
        updatedAt: new Date()
      };

      if (selectedItem) {
        // Update existing item
        await updateDoc(doc(db, sectionInfo.collection, selectedItem.id), saveData);
      } else {
        // Create new item
        saveData.createdAt = new Date();
        await addDoc(collection(db, sectionInfo.collection), saveData);
      }

      setSuccess(selectedItem ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
      setTimeout(() => setSuccess(''), 3000);

      loadSectionData(section);
      setEditMode(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: SectionContent) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nội dung này?')) {
      try {
        const sectionInfo = sections.find(s => s.id === section);
        if (sectionInfo) {
          await updateDoc(doc(db, sectionInfo.collection, item.id), { active: false });
          loadSectionData(section);
        }
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const renderFieldInput = (field: ContentField) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={formData[field.key] || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <textarea
            value={formData[field.key] || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
        );
      case 'select':
        return (
          <select
            value={formData[field.key] || (field.options && field.options[0]) || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {field.options?.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData[field.key] || false}
              onChange={(e) => handleChange(field.key, e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              id={`field-${field.key}`}
            />
            <label htmlFor={`field-${field.key}`} className="ml-2 text-sm text-gray-700">
              {formData[field.key] ? 'Bật' : 'Tắt'}
            </label>
          </div>
        );
      case 'color':
        return (
          <div className="flex items-center">
            <input
              type="color"
              value={formData[field.key] || '#ffffff'}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="w-10 h-10 rounded border border-gray-300"
            />
            <input
              type="text"
              value={formData[field.key] || '#ffffff'}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="ml-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
            />
          </div>
        );
      case 'image':
        return (
          <div>
            <div className="flex">
              <input
                type="text"
                value={formData[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập URL hình ảnh"
              />
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300"
              >
                <UploadCloud size={16} />
              </button>
            </div>
            {formData[field.key] && (
              <div className="mt-2 p-2 border rounded-md">
                <img
                  src={formData[field.key]}
                  alt="Preview"
                  className="max-h-40 rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.fallback-image')) {
                      const fallback = window.document.createElement('div');
                      fallback.className = 'fallback-image max-h-40 bg-gray-100 flex items-center justify-center rounded p-8';
                      fallback.innerHTML = '<svg class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" /></svg>';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Nội dung Trang Web</h1>
        {!editMode && (
          <button
            onClick={handleCreate}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} className="mr-1" />
            Tạo nội dung mới
          </button>
        )}
      </div>

      {success && (
        <div className="mb-6 bg-green-50 text-green-700 border border-green-200 rounded-md px-4 py-3 flex items-center">
          <Check size={18} className="mr-2" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-medium text-gray-700">Mục trang chủ</h2>
              <p className="text-gray-500 text-sm">Chọn mục để chỉnh sửa nội dung</p>
            </div>
            <div className="divide-y">
              {sections.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  className={`w-full text-left py-3 px-4 flex items-center justify-between hover:bg-gray-50 ${
                    section === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight size={16} className={section === item.id ? 'text-blue-600' : 'text-gray-400'} />
                </button>
              ))}
            </div>
          </div>

          {!editMode && selectedItem && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="font-medium text-gray-700">Thao tác nhanh</h2>
              </div>
              <div className="p-4 space-y-2">
                <button
                  onClick={() => handleEdit(selectedItem)}
                  className="w-full text-left py-2 px-3 text-blue-600 hover:bg-blue-50 rounded-md flex items-center"
                >
                  <Edit size={16} className="mr-2" />
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="w-full text-left py-2 px-3 text-gray-600 hover:bg-gray-50 rounded-md flex items-center"
                >
                  <Eye size={16} className="mr-2" />
                  {previewMode ? 'Ẩn xem trước' : 'Xem trước'}
                </button>
                <button
                  onClick={() => handleDelete(selectedItem)}
                  className="w-full text-left py-2 px-3 text-red-600 hover:bg-red-50 rounded-md flex items-center"
                >
                  <Trash2 size={16} className="mr-2" />
                  Xóa
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center h-48 bg-white rounded-lg shadow-sm border">
              <div className="text-gray-500">Đang tải dữ liệu...</div>
            </div>
          ) : editMode ? (
            // Edit Form
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h2 className="font-medium text-gray-700">
                  {selectedItem ? `Chỉnh sửa: ${selectedItem.title}` : 'Tạo nội dung mới'}
                </h2>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setSelectedItem(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {sectionFields[section]?.map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {renderFieldInput(field)}
                    </div>
                  ))}

                  <div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.active !== false}
                        onChange={(e) => handleChange('active', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        id="active-status"
                      />
                      <label htmlFor="active-status" className="ml-2 text-sm text-gray-700">
                        Hiển thị trên trang chủ
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setSelectedItem(null);
                      }}
                      className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                      <Save size={16} className="mr-1" />
                      {saving ? 'Đang lưu...' : selectedItem ? 'Cập nhật' : 'Tạo mới'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Content List & Details
            <>
              {sectionData.length > 0 ? (
                <div className="space-y-6">
                  {/* Item List */}
                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-4 border-b flex justify-between items-center">
                      <div>
                        <h2 className="font-medium text-gray-700">Nội dung {sections.find(s => s.id === section)?.label}</h2>
                        <p className="text-gray-500 text-sm">{sectionData.length} mục</p>
                      </div>
                      <div>
                        <button
                          onClick={() => handleCreate()}
                          className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          <Plus size={14} className="mr-1" />
                          Tạo mới
                        </button>
                      </div>
                    </div>
                    <div className="divide-y">
                      {sectionData.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                          className={`p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${
                            selectedItem?.id === item.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`h-2 w-2 rounded-full mr-3 ${
                                item.active ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            ></div>
                            <div>
                              <div className="font-medium text-gray-900">{item.title}</div>
                              <div className="text-sm text-gray-500">
                                ID: {item.id.substring(0, 8)}... • Cập nhật: {item.updatedAt?.toDate().toLocaleDateString() || 'N/A'}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(item);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selected Item Details */}
                  {selectedItem && (
                    <div className={`bg-white rounded-lg shadow-sm border ${previewMode ? 'border-blue-300' : ''}`}>
                      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <h2 className="font-medium text-gray-700">
                          {previewMode ? 'Xem trước' : 'Chi tiết nội dung'}
                        </h2>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setPreviewMode(!previewMode)}
                            className={`p-1.5 rounded-md ${
                              previewMode ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
                            }`}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(selectedItem)}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </div>

                      {previewMode ? (
                        <div className="p-6">
                          <h2 className="text-2xl font-bold mb-2">{selectedItem.fields.title}</h2>
                          {selectedItem.fields.subtitle && (
                            <p className="text-lg text-gray-600 mb-4">{selectedItem.fields.subtitle}</p>
                          )}
                          {selectedItem.fields.description && (
                            <p className="mb-4">{selectedItem.fields.description}</p>
                          )}
                          {selectedItem.fields.imageUrl && (
                            <div className="mb-4">
                              <img
                                src={selectedItem.fields.imageUrl}
                                alt={selectedItem.fields.title}
                                className="max-w-full rounded-lg"
                              />
                            </div>
                          )}
                          {selectedItem.fields.content && (
                            <div className="prose max-w-none">
                              <div className="whitespace-pre-wrap">{selectedItem.fields.content}</div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <div className="space-y-4">
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500 mb-1">Tiêu đề</h3>
                                  <p className="text-gray-900">{selectedItem.fields.title}</p>
                                </div>
                                {selectedItem.fields.subtitle && (
                                  <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Phụ đề</h3>
                                    <p className="text-gray-900">{selectedItem.fields.subtitle}</p>
                                  </div>
                                )}
                                {selectedItem.fields.description && (
                                  <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Mô tả</h3>
                                    <p className="text-gray-900">{selectedItem.fields.description}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="space-y-4">
                                {selectedItem.fields.imageUrl && (
                                  <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Hình ảnh</h3>
                                    <img
                                      src={selectedItem.fields.imageUrl}
                                      alt={selectedItem.fields.title}
                                      className="max-h-40 rounded border p-1"
                                    />
                                  </div>
                                )}
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500 mb-1">Trạng thái</h3>
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      selectedItem.active
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {selectedItem.active ? (
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
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {selectedItem.fields.content && (
                            <div className="mt-6 pt-6 border-t">
                              <h3 className="text-sm font-medium text-gray-500 mb-2">Nội dung chi tiết</h3>
                              <div className="bg-gray-50 p-4 rounded-md border">
                                <div className="whitespace-pre-wrap">{selectedItem.fields.content}</div>
                              </div>
                            </div>
                          )}
                          <div className="mt-6 pt-6 border-t">
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Thông tin kỹ thuật</h3>
                            <div className="bg-gray-50 p-4 rounded-md text-xs font-mono overflow-auto">
                              <pre>{JSON.stringify(selectedItem, null, 2)}</pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <File size={24} className="text-gray-400" />
                  </div>
                  <h2 className="text-xl font-medium text-gray-900 mb-2">Không có nội dung nào</h2>
                  <p className="text-gray-500 mb-6">
                    Chưa có nội dung nào trong mục {sections.find(s => s.id === section)?.label}. Hãy tạo mới!
                  </p>
                  <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
                  >
                    <Plus size={16} className="mr-1" />
                    Tạo nội dung mới
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionEditor;
