import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
  query,
  orderBy
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { db, storage } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  FileText,
  Folder,
  Plus,
  Edit,
  Trash2,
  UploadCloud,
  Search,
  Save,
  X,
  List,
  Grid,
  Tag,
  Calendar,
  Languages,
  MapPin,
  Paperclip
} from 'lucide-react';

// Interfaces
interface Document {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  content?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  language?: string;
  year?: number;
  location?: string;
  digitalUrl?: string;
  significance?: string;
  tags?: string[];
  metadata?: any;
  isPublic?: boolean;
  isFeatured?: boolean;
  downloadCount?: number;
  viewCount?: number;
  order?: number;
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

// Helper function to get icon component based on icon name
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'FileText': return FileText;
    case 'Folder': return Folder;
    case 'GraduationCap': return FileText; // Fallback, replace with actual icon if available
    case 'Ship': return FileText; // Fallback
    case 'Flag': return FileText; // Fallback
    case 'BookOpen': return FileText; // Fallback
    case 'Mail': return FileText; // Fallback
    case 'Building': return FileText; // Fallback
    case 'Globe': return FileText; // Fallback
    default: return FileText;
  }
};

const DocumentManager: React.FC = () => {
  const { currentUser } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'categories' | 'documents'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'category' | 'document'>('category');
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [uploading, setUploading] = useState<{[key: string]: boolean}>({});
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [uploadErrors, setUploadErrors] = useState<{[key: string]: string}>({});

  // Fetch categories and documents
  useEffect(() => {
    fetchCategories();
    fetchDocuments();
  }, []);

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, 'document-categories'), orderBy('order'));
      const querySnapshot = await getDocs(q);
      const fetchedCategories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(fetchedCategories);

      // Select first category by default if available
      if (fetchedCategories.length > 0 && !selectedCategory) {
        setSelectedCategory(fetchedCategories[0].id);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const q = query(collection(db, 'documents'), orderBy('title'));
      const querySnapshot = await getDocs(q);
      const fetchedDocuments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Document[];
      setDocuments(fetchedDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered documents based on selected category
  const filteredDocuments = selectedCategory
    ? documents.filter(doc => doc.category === selectedCategory && doc.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : documents.filter(doc => doc.title.toLowerCase().includes(searchTerm.toLowerCase()));

  // Filtered categories based on search
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Form handling
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));

    // Clear error for this field if any
    if (formErrors[name]) {
      setFormErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: checked }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagString = e.target.value;
    const tagsArray = tagString.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    setFormData((prev: any) => ({ ...prev, tags: tagsArray }));
  };

  // File upload handlers
  const generateFileName = (originalName: string, type: 'document' | 'thumbnail'): string => {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop();
    const prefix = type === 'document' ? 'doc' : 'thumb';
    return `${prefix}_${timestamp}.${extension}`;
  };

  const uploadFile = async (file: File, type: 'document' | 'thumbnail'): Promise<string> => {
    // Check authentication
    if (!currentUser) {
      throw new Error('Bạn cần đăng nhập để upload file');
    }

    try {
      const fileName = generateFileName(file.name, type);
      const folderPath = type === 'document' ? 'documents' : 'thumbnails';
      const storageRef = ref(storage, `${folderPath}/${fileName}`);

      // Reset errors and set uploading state
      setUploadErrors(prev => ({ ...prev, [type]: '' }));
      setUploading(prev => ({ ...prev, [type]: true }));
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[type] || 0;
          const newProgress = Math.min(currentProgress + 10, 90);
          return { ...prev, [type]: newProgress };
        });
      }, 100);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      clearInterval(progressInterval);

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Complete progress
      setUploadProgress(prev => ({ ...prev, [type]: 100 }));

      // Reset state after delay
      setTimeout(() => {
        setUploading(prev => ({ ...prev, [type]: false }));
        setUploadProgress(prev => ({ ...prev, [type]: 0 }));
      }, 1000);

      return downloadURL;
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(prev => ({ ...prev, [type]: false }));
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));
      setUploadErrors(prev => ({
        ...prev,
        [type]: 'Upload thất bại. Vui lòng thử lại!'
      }));
      throw error;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'document' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = type === 'document'
      ? ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      : ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      toast.error(type === 'document'
        ? 'Chỉ hỗ trợ file PDF, DOC, DOCX, TXT'
        : 'Chỉ hỗ trợ file ảnh JPG, PNG, GIF, WEBP');
      return;
    }

    // Validate file size (10MB for documents, 5MB for images)
    const maxSize = type === 'document' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File quá lớn. Tối đa ${type === 'document' ? '10MB' : '5MB'}`);
      return;
    }

    try {
      const downloadURL = await uploadFile(file, type);
      const fieldName = type === 'document' ? 'digitalUrl' : 'thumbnailUrl';

      setFormData((prev: any) => ({
        ...prev,
        [fieldName]: downloadURL
      }));

      // Clear any errors for this field
      if (formErrors[fieldName]) {
        setFormErrors(prev => ({ ...prev, [fieldName]: '' }));
      }

      toast.success(`Upload ${type === 'document' ? 'tài liệu' : 'hình ảnh'} thành công!`);
    } catch (error) {
      toast.error(`Lỗi upload: ${error}`);
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    // Common validations
    if (!formData.title?.trim()) {
      errors.title = 'Tiêu đề không được để trống';
    }

    if (formType === 'document') {
      if (!formData.digitalUrl?.trim()) {
        errors.digitalUrl = 'URL tài liệu không được để trống';
      }

      if (!formData.thumbnailUrl?.trim()) {
        errors.thumbnailUrl = 'URL hình thu nhỏ không được để trống';
      }

      if (!formData.category) {
        errors.category = 'Vui lòng chọn danh mục';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create and edit handlers
  const handleCreate = (type: 'category' | 'document') => {
    setFormType(type);
    setEditingItem(null);

    if (type === 'category') {
      setFormData({
        title: '',
        description: '',
        icon: 'FileText',
        tags: [],
        isActive: true,
        isFeatured: false
      });
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'pdf',
        language: 'vietnamese',
        year: new Date().getFullYear(),
        location: '',
        digitalUrl: '',
        thumbnailUrl: '',
        significance: '',
        tags: [],
        category: selectedCategory || ''
      });
    }

    setShowForm(true);
  };

  const handleEdit = (item: Category | Document, type: 'category' | 'document') => {
    setFormType(type);
    setEditingItem(item);

    // For tags, ensure they're in the right format (only for documents)
    const formattedItem = {
      ...item,
      ...(type === 'document' && { tags: (item as Document).tags || [] })
    };

    setFormData(formattedItem);
    setShowForm(true);
  };

  const handleDelete = async (item: Category | Document, type: 'category' | 'document') => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${type === 'category' ? 'danh mục' : 'tài liệu'} này?`)) {
      return;
    }

    try {
      const collectionName = type === 'category' ? 'document-categories' : 'documents';
      await deleteDoc(doc(db, collectionName, item.id));

      if (type === 'category') {
        // Delete all documents in this category or update them
        const docsToDelete = documents.filter(d => d.category === item.id);
        for (const docItem of docsToDelete) {
          await deleteDoc(doc(db, 'documents', docItem.id));
        }

        await fetchCategories();
        await fetchDocuments();
      } else {
        await fetchDocuments();
      }

      toast.success(`Xóa ${type === 'category' ? 'danh mục' : 'tài liệu'} thành công!`);
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast.error(`Có lỗi khi xóa: ${error}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const collectionName = formType === 'category' ? 'document-categories' : 'documents';
      const now = new Date();

      const data = {
        ...formData,
        updatedAt: now
      };

      // If creating new item, add createdAt
      if (!editingItem) {
        data.createdAt = now;
      }

      if (editingItem) {
        await updateDoc(doc(db, collectionName, editingItem.id), data);
        toast.success(`Cập nhật ${formType === 'category' ? 'danh mục' : 'tài liệu'} thành công!`);
      } else {
        await addDoc(collection(db, collectionName), data);
        toast.success(`Tạo mới ${formType === 'category' ? 'danh mục' : 'tài liệu'} thành công!`);
      }

      // Refresh data
      if (formType === 'category') {
        await fetchCategories();
      } else {
        await fetchDocuments();
      }

      setShowForm(false);
    } catch (error) {
      console.error(`Error ${editingItem ? 'updating' : 'creating'} ${formType}:`, error);
      toast.error(`Có lỗi khi lưu: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // UI Utilities

  const renderCategoryForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tiêu đề <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title || ''}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border ${formErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder="Nhập tiêu đề danh mục"
        />
        {formErrors.title && <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả
        </label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập mô tả chi tiết về danh mục"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Icon
        </label>
        <select
          name="icon"
          value={formData.icon || 'FileText'}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="FileText">Tài liệu</option>
          <option value="GraduationCap">Học tập</option>
          <option value="Ship">Du lịch</option>
          <option value="Flag">Cách mạng</option>
          <option value="BookOpen">Sách</option>
          <option value="Mail">Thư từ</option>
          <option value="Building">Tòa nhà</option>
          <option value="Globe">Toàn cầu</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Thẻ (phân cách bằng dấu phẩy)
        </label>
        <input
          type="text"
          name="tags"
          value={formData.tags?.join(', ') || ''}
          onChange={handleTagsChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập các thẻ, ngăn cách bởi dấu phẩy"
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:space-x-4">
        <div className="flex items-center mb-2 sm:mb-0">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive !== false}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
            Kích hoạt
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isFeatured"
            name="isFeatured"
            checked={formData.isFeatured === true}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700">
            Nổi bật
          </label>
        </div>
      </div>
    </div>
  );

  const renderDocumentForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tiêu đề <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title || ''}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border ${formErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder="Nhập tiêu đề tài liệu"
        />
        {formErrors.title && <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả
        </label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập mô tả chi tiết về tài liệu"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Danh mục <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category || ''}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border ${formErrors.category ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Chọn danh mục</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {formErrors.category && <p className="mt-1 text-sm text-red-500">{formErrors.category}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Loại tài liệu
          </label>
          <select
            name="type"
            value={formData.type || 'pdf'}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pdf">PDF</option>
            <option value="image">Hình ảnh</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="document">Văn bản</option>
            <option value="photos">Bộ sưu tập ảnh</option>
            <option value="others">Khác</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Năm
          </label>
          <input
            type="number"
            name="year"
            value={formData.year || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="VD: 1945"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngôn ngữ
          </label>
          <select
            name="language"
            value={formData.language || 'vietnamese'}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="vietnamese">Tiếng Việt</option>
            <option value="english">Tiếng Anh</option>
            <option value="french">Tiếng Pháp</option>
            <option value="chinese">Tiếng Trung</option>
            <option value="russian">Tiếng Nga</option>
            <option value="multilingual">Đa ngôn ngữ</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vị trí
          </label>
          <input
            type="text"
            name="location"
            value={formData.location || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="VD: Hà Nội"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL tài liệu số <span className="text-red-500">*</span>
        </label>
        <div className="flex">
          <input
            type="text"
            name="digitalUrl"
            value={formData.digitalUrl || ''}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border ${formErrors.digitalUrl ? 'border-red-500' : 'border-gray-300'} rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="/documents/filename.pdf"
          />
          <div className="relative">
            <input
              type="file"
              id="document-upload"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => handleFileUpload(e, 'document')}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading.document}
            />
            <button
              type="button"
              className={`px-4 py-2 rounded-r-md transition-colors ${
                uploading.document
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              disabled={uploading.document}
            >
              {uploading.document ? (
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
        {formErrors.digitalUrl && <p className="mt-1 text-sm text-red-500">{formErrors.digitalUrl}</p>}
        {uploadErrors.document && <p className="mt-1 text-sm text-red-500">{uploadErrors.document}</p>}
        {uploading.document && (
          <div className="mt-2 bg-blue-50 rounded-md p-2">
            <div className="flex justify-between text-sm text-blue-700 mb-1">
              <span>Đang upload tài liệu...</span>
              <span>{uploadProgress.document || 0}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress.document || 0}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL hình thu nhỏ <span className="text-red-500">*</span>
        </label>
        <div className="flex">
          <input
            type="text"
            name="thumbnailUrl"
            value={formData.thumbnailUrl || ''}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border ${formErrors.thumbnailUrl ? 'border-red-500' : 'border-gray-300'} rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="/images/documents/thumbnail.jpg"
          />
          <div className="relative">
            <input
              type="file"
              id="thumbnail-upload"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'thumbnail')}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading.thumbnail}
            />
            <button
              type="button"
              className={`px-4 py-2 rounded-r-md transition-colors ${
                uploading.thumbnail
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              disabled={uploading.thumbnail}
            >
              {uploading.thumbnail ? (
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
        {formErrors.thumbnailUrl && <p className="mt-1 text-sm text-red-500">{formErrors.thumbnailUrl}</p>}
        {uploadErrors.thumbnail && <p className="mt-1 text-sm text-red-500">{uploadErrors.thumbnail}</p>}
        {uploading.thumbnail && (
          <div className="mt-2 bg-blue-50 rounded-md p-2">
            <div className="flex justify-between text-sm text-blue-700 mb-1">
              <span>Đang upload hình ảnh...</span>
              <span>{uploadProgress.thumbnail || 0}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress.thumbnail || 0}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="mt-3 p-3 border rounded-lg bg-gray-50">
          <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
          {formData.thumbnailUrl ? (
            <img
              src={formData.thumbnailUrl}
              alt="Thumbnail preview"
              className="h-32 w-auto object-cover rounded-md border"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.fallback-thumbnail')) {
                  const fallback = window.document.createElement('div');
                  fallback.className = 'fallback-thumbnail h-32 w-32 bg-gray-100 flex items-center justify-center rounded-md border';
                  fallback.innerHTML = '<div class="w-8 h-8 text-gray-400"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM18 20H6V4h7v5h5v11z"/></svg></div>';
                  parent.appendChild(fallback);
                }
              }}
            />
          ) : (
            <div className="h-32 w-32 bg-gray-100 flex items-center justify-center rounded-md border">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ý nghĩa lịch sử
        </label>
        <textarea
          name="significance"
          value={formData.significance || ''}
          onChange={handleInputChange}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Mô tả ý nghĩa lịch sử của tài liệu"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Thẻ (phân cách bằng dấu phẩy)
        </label>
        <input
          type="text"
          name="tags"
          value={formData.tags?.join(', ') || ''}
          onChange={handleTagsChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="VD: tuyên ngôn, 1945, lịch sử"
        />
      </div>
    </div>
  );

  // Early return if not authenticated
  if (!currentUser) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Vui lòng đăng nhập để quản lý documents.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tài liệu</h1>
          <p className="text-gray-600 mt-1">
            {activeTab === 'categories'
              ? `${categories.length} danh mục`
              : `${filteredDocuments.length} tài liệu ${selectedCategory ? 'trong danh mục này' : ''}`}
          </p>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-l-md ${
              activeTab === 'categories'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Folder size={18} className="inline-block mr-1 -mt-1" /> Danh mục
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-r-md ${
              activeTab === 'documents'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText size={18} className="inline-block mr-1 -mt-1" /> Tài liệu
          </button>

          <div className="ml-4">
            <button
              onClick={() => handleCreate(activeTab === 'categories' ? 'category' : 'document')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Plus size={18} className="inline-block mr-1 -mt-1" />
              Tạo {activeTab === 'categories' ? 'danh mục' : 'tài liệu'} mới
            </button>
          </div>
        </div>
      </div>

      {/* Search and filter bar */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={`Tìm kiếm ${activeTab === 'categories' ? 'danh mục' : 'tài liệu'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {activeTab === 'documents' && (
            <div className="w-full sm:w-64">
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="flex rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <List size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div>
        {loading && categories.length === 0 && documents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Danh mục
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mô tả
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số lượng tài liệu
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCategories.map((category) => {
                      const documentCount = documents.filter(doc => doc.category === category.id).length;
                      return (
                        <tr key={category.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                {React.createElement(getIconComponent(category.icon), { className: "w-5 h-5 text-blue-600" })}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                <div className="text-xs text-gray-500">ID: {category.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">{category.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {documentCount} tài liệu
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              category.isActive !== false
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {category.isActive !== false ? 'Kích hoạt' : 'Vô hiệu'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEdit(category, 'category')}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                              title="Chỉnh sửa"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(category, 'category')}
                              className="text-red-600 hover:text-red-900"
                              title="Xóa"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredCategories.length === 0 && (
                  <div className="text-center py-12">
                    <Folder size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Không tìm thấy danh mục nào</h3>
                    <p className="text-gray-500 mb-4">Hãy tạo danh mục mới để bắt đầu.</p>
                    <button
                      onClick={() => handleCreate('category')}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus size={16} className="mr-2" /> Tạo danh mục mới
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredDocuments.map((document) => {
                      const category = categories.find(cat => cat.id === document.category);

                      return (
                        <div key={document.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                          <div className="relative">
                            {document.thumbnailUrl ? (
                              <img
                                src={document.thumbnailUrl}
                                alt={document.title}
                                className="w-full h-40 object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent && !parent.querySelector('.fallback-placeholder')) {
                                    const fallback = window.document.createElement('div');
                                    fallback.className = 'fallback-placeholder w-full h-40 bg-gray-100 flex items-center justify-center';
                                    fallback.innerHTML = '<div class="w-12 h-12 text-gray-400"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM18 20H6V4h7v5h5v11z"/></svg></div>';
                                    parent.appendChild(fallback);
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                                <FileText className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {document.type || 'PDF'}
                              </span>
                            </div>
                            {category && (
                              <div className="absolute bottom-2 left-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 bg-opacity-70 text-white">
                                  {category.name}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="p-4">
                            <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">{document.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{document.description}</p>

                            <div className="flex flex-wrap gap-1 mb-3">
                              {document.year && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  <Calendar size={10} className="mr-1" />
                                  {document.year}
                                </span>
                              )}
                              {document.language && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  <Languages size={10} className="mr-1" />
                                  {document.language}
                                </span>
                              )}
                            </div>

                            <div className="flex justify-between mt-4">
                              <button
                                onClick={() => handleEdit(document, 'document')}
                                className="flex-1 mr-2 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center justify-center"
                              >
                                <Edit size={14} className="mr-1" /> Chỉnh sửa
                              </button>
                              <button
                                onClick={() => handleDelete(document, 'document')}
                                className="py-1.5 px-2 text-red-600 bg-red-50 rounded hover:bg-red-100"
                                title="Xóa"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add New Document Card */}
                    <div
                      onClick={() => handleCreate('document')}
                      className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center h-full cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    >
                      <div className="rounded-full bg-blue-100 p-3 mb-4">
                        <Plus size={24} className="text-blue-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Thêm tài liệu mới</h3>
                      <p className="text-sm text-gray-500 text-center">
                        Nhấp vào đây để tạo tài liệu mới
                      </p>
                    </div>

                    {filteredDocuments.length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Không tìm thấy tài liệu nào</h3>
                        <p className="text-gray-500 mb-4">
                          {selectedCategory
                            ? 'Không có tài liệu nào trong danh mục này hoặc không khớp với từ khóa tìm kiếm.'
                            : 'Không tìm thấy tài liệu. Hãy thử một từ khóa khác hoặc tạo tài liệu mới.'}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tài liệu
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Danh mục
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Thông tin
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Thao tác
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredDocuments.map((document) => {
                          const category = categories.find(cat => cat.id === document.category);

                          return (
                            <tr key={document.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded overflow-hidden">
                                    {document.thumbnailUrl ? (
                                      <img
                                        src={document.thumbnailUrl}
                                        alt=""
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          const parent = target.parentElement;
                                          if (parent && !parent.querySelector('.fallback-small')) {
                                            const fallback = window.document.createElement('div');
                                            fallback.className = 'fallback-small h-full w-full flex items-center justify-center';
                                            fallback.innerHTML = '<div class="w-4 h-4 text-gray-400"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM18 20H6V4h7v5h5v11z"/></svg></div>';
                                            parent.appendChild(fallback);
                                          }
                                        }}
                                      />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{document.title}</div>
                                    <div className="text-xs text-gray-500 max-w-xs truncate">{document.description}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {category ? (
                                  <div className="flex items-center">
                                    {React.createElement(getIconComponent(category.icon), { className: "w-4 h-4 text-gray-500 mr-1" })}
                                    <span className="text-sm text-gray-900">{category.name}</span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500">Không có danh mục</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-xs text-gray-500 space-y-1">
                                  <div className="flex items-center">
                                    <Tag size={12} className="mr-1" />
                                    <span className="truncate max-w-xs">
                                      {document.type || 'PDF'}
                                      {document.year && ` • ${document.year}`}
                                      {document.language && ` • ${document.language}`}
                                    </span>
                                  </div>
                                  {document.location && (
                                    <div className="flex items-center">
                                      <MapPin size={12} className="mr-1" />
                                      <span>{document.location}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center">
                                    <Paperclip size={12} className="mr-1" />
                                    <a
                                      href={document.digitalUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-600 hover:underline truncate max-w-xs"
                                    >
                                      {document.digitalUrl}
                                    </a>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleEdit(document, 'document')}
                                  className="text-blue-600 hover:text-blue-900 mr-3"
                                  title="Chỉnh sửa"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(document, 'document')}
                                  className="text-red-600 hover:text-red-900"
                                  title="Xóa"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {filteredDocuments.length === 0 && (
                      <div className="text-center py-12">
                        <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Không tìm thấy tài liệu nào</h3>
                        <p className="text-gray-500 mb-4">
                          {selectedCategory
                            ? 'Không có tài liệu nào trong danh mục này hoặc không khớp với từ khóa tìm kiếm.'
                            : 'Không tìm thấy tài liệu. Hãy thử một từ khóa khác hoặc tạo tài liệu mới.'}
                        </p>
                        <button
                          onClick={() => handleCreate('document')}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus size={16} className="mr-2" /> Tạo tài liệu mới
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10">
              <h2 className="text-xl font-bold">
                {editingItem
                  ? `Chỉnh sửa: ${editingItem.title}`
                  : `Tạo ${formType === 'category' ? 'danh mục' : 'tài liệu'} mới`}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {formType === 'category' ? renderCategoryForm() : renderDocumentForm()}

              <div className="mt-6 pt-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  <Save size={16} className="mr-1" />
                  {loading ? 'Đang lưu...' : (editingItem ? 'Cập nhật' : 'Tạo mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;
