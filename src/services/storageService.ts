import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata
} from 'firebase/storage';
import { storage } from '../lib/firebase';
import { StorageFile } from '../types/firebase';

// ===== FILE UPLOAD OPERATIONS =====

/**
 * Upload file cơ bản
 */
export const uploadFile = async (
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const storageRef = ref(storage, path);

    if (onProgress) {
      // Upload với progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => {
            console.error('Upload error:', error);
            reject(handleStorageError(error));
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } else {
      // Upload đơn giản
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    }
  } catch (error: any) {
    console.error('Error uploading file:', error);
    throw handleStorageError(error);
  }
};

/**
 * Upload ảnh cho heritage spot
 */
export const uploadHeritageImage = async (
  file: File,
  spotId: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  // Validate file
  validateImageFile(file);

  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const fileName = `${timestamp}_${spotId}.${fileExtension}`;
  const path = `heritage-spots/${spotId}/images/${fileName}`;

  return uploadFile(file, path, onProgress);
};

/**
 * Upload avatar cho user
 */
export const uploadUserAvatar = async (
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  // Validate file
  validateImageFile(file);

  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const fileName = `avatar_${timestamp}.${fileExtension}`;
  const path = `users/${userId}/avatar/${fileName}`;

  return uploadFile(file, path, onProgress);
};

/**
 * Upload document (PDF) cho heritage spot
 */
export const uploadHeritageDocument = async (
  file: File,
  spotId: string,
  documentType: string = 'general',
  onProgress?: (progress: number) => void
): Promise<string> => {
  // Validate PDF file
  validateDocumentFile(file);

  const timestamp = Date.now();
  const fileName = `${documentType}_${timestamp}_${file.name}`;
  const path = `heritage-spots/${spotId}/documents/${fileName}`;

  return uploadFile(file, path, onProgress);
};

// ===== FILE DOWNLOAD OPERATIONS =====

/**
 * Lấy URL download của file
 */
export const getFileDownloadURL = async (path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error: any) {
    console.error('Error getting download URL:', error);
    throw handleStorageError(error);
  }
};

/**
 * Lấy metadata của file
 */
export const getFileMetadata = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    const metadata = await getMetadata(storageRef);
    return metadata;
  } catch (error: any) {
    console.error('Error getting file metadata:', error);
    throw handleStorageError(error);
  }
};

/**
 * Lấy danh sách file trong folder
 */
export const listFilesInFolder = async (folderPath: string): Promise<StorageFile[]> => {
  try {
    const folderRef = ref(storage, folderPath);
    const result = await listAll(folderRef);

    const files = await Promise.all(
      result.items.map(async (itemRef) => {
        const downloadURL = await getDownloadURL(itemRef);
        const metadata = await getMetadata(itemRef);

        return {
          name: itemRef.name,
          fullPath: itemRef.fullPath,
          downloadURL,
          size: metadata.size,
          contentType: metadata.contentType
        } as StorageFile;
      })
    );

    return files;
  } catch (error: any) {
    console.error('Error listing files:', error);
    throw handleStorageError(error);
  }
};

/**
 * Lấy tất cả ảnh của heritage spot
 */
export const getHeritageImages = async (spotId: string): Promise<StorageFile[]> => {
  const folderPath = `heritage-spots/${spotId}/images`;
  return listFilesInFolder(folderPath);
};

/**
 * Lấy tất cả documents của heritage spot
 */
export const getHeritageDocuments = async (spotId: string): Promise<StorageFile[]> => {
  const folderPath = `heritage-spots/${spotId}/documents`;
  return listFilesInFolder(folderPath);
};

// ===== FILE DELETE OPERATIONS =====

/**
 * Xóa file
 */
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error: any) {
    console.error('Error deleting file:', error);
    throw handleStorageError(error);
  }
};

/**
 * Xóa file theo download URL
 */
export const deleteFileByURL = async (downloadURL: string): Promise<void> => {
  try {
    const storageRef = ref(storage, downloadURL);
    await deleteObject(storageRef);
  } catch (error: any) {
    console.error('Error deleting file by URL:', error);
    throw handleStorageError(error);
  }
};

/**
 * Xóa tất cả ảnh của heritage spot
 */
export const deleteHeritageImages = async (spotId: string): Promise<void> => {
  try {
    const folderRef = ref(storage, `heritage-spots/${spotId}/images`);
    const result = await listAll(folderRef);

    const deletePromises = result.items.map(itemRef => deleteObject(itemRef));
    await Promise.all(deletePromises);
  } catch (error: any) {
    console.error('Error deleting heritage images:', error);
    throw handleStorageError(error);
  }
};

/**
 * Xóa tất cả documents của heritage spot
 */
export const deleteHeritageDocuments = async (spotId: string): Promise<void> => {
  try {
    const folderRef = ref(storage, `heritage-spots/${spotId}/documents`);
    const result = await listAll(folderRef);

    const deletePromises = result.items.map(itemRef => deleteObject(itemRef));
    await Promise.all(deletePromises);
  } catch (error: any) {
    console.error('Error deleting heritage documents:', error);
    throw handleStorageError(error);
  }
};

/**
 * Xóa toàn bộ folder của heritage spot
 */
export const deleteHeritageFolder = async (spotId: string): Promise<void> => {
  try {
    await Promise.all([
      deleteHeritageImages(spotId),
      deleteHeritageDocuments(spotId)
    ]);
  } catch (error) {
    console.error('Error deleting heritage folder:', error);
    throw error;
  }
};

// ===== FILE VALIDATION =====

/**
 * Validate image file
 */
const validateImageFile = (file: File): void => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Chỉ chấp nhận file ảnh: JPEG, PNG, WebP, GIF');
  }

  if (file.size > maxSize) {
    throw new Error('Kích thước file không được vượt quá 5MB');
  }
};

/**
 * Validate document file
 */
const validateDocumentFile = (file: File): void => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Chỉ chấp nhận file: PDF, DOC, DOCX');
  }

  if (file.size > maxSize) {
    throw new Error('Kích thước file không được vượt quá 10MB');
  }
};

// ===== UTILITY FUNCTIONS =====

/**
 * Generate unique file path
 */
export const generateFilePath = (
  folder: string,
  fileName: string,
  subFolder?: string
): string => {
  const timestamp = Date.now();
  const fileExtension = fileName.split('.').pop();
  const cleanFileName = fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, '_');
  const uniqueFileName = `${timestamp}_${cleanFileName}.${fileExtension}`;

  if (subFolder) {
    return `${folder}/${subFolder}/${uniqueFileName}`;
  }

  return `${folder}/${uniqueFileName}`;
};

/**
 * Get file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Extract file extension
 */
export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

/**
 * Check if file is image
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * Check if file is document
 */
export const isDocumentFile = (file: File): boolean => {
  const documentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  return documentTypes.includes(file.type);
};

// ===== ERROR HANDLING =====

/**
 * Handle Firebase Storage errors
 */
const handleStorageError = (error: any): Error => {
  switch (error.code) {
    case 'storage/object-not-found':
      return new Error('File không tồn tại');
    case 'storage/unauthorized':
      return new Error('Bạn không có quyền truy cập file này');
    case 'storage/canceled':
      return new Error('Upload bị hủy');
    case 'storage/unknown':
      return new Error('Lỗi không xác định khi upload file');
    case 'storage/invalid-format':
      return new Error('Định dạng file không hợp lệ');
    case 'storage/invalid-argument':
      return new Error('Tham số không hợp lệ');
    case 'storage/retry-limit-exceeded':
      return new Error('Quá số lần thử lại. Vui lòng thử lại sau');
    default:
      return new Error('Có lỗi xảy ra khi xử lý file');
  }
};
