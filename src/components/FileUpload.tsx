import React, { useState } from 'react';
import { uploadHeritageImage } from '../services/storageService';

interface FileUploadProps {
  spotId: string;
  onUploadComplete: (downloadURL: string) => void;
  onUploadError: (error: string) => void;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  spotId,
  onUploadComplete,
  onUploadError,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      onUploadError('Chỉ chấp nhận file ảnh: JPEG, PNG, WebP, GIF');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      onUploadError('Kích thước file không được vượt quá 5MB');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const downloadURL = await uploadHeritageImage(
        file,
        spotId,
        (uploadProgress) => {
          setProgress(uploadProgress);
        }
      );

      onUploadComplete(downloadURL);
      setProgress(100);

      // Reset file input
      event.target.value = '';
    } catch (error: any) {
      onUploadError(error.message || 'Failed to upload file');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`file-upload ${className}`}>
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {uploading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded">
            <div className="text-sm text-blue-600">Đang tải lên...</div>
          </div>
        )}
      </div>

      {uploading && (
        <div className="mt-2">
          <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1 text-center">
            {Math.round(progress)}% hoàn thành
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
