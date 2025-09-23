import React, { useState, useRef } from 'react';
import { storage } from '../../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { UploadCloud, File, X, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  folder: string; // Path in Firebase Storage (e.g., 'documents', 'images/thumbnails')
  onUploadComplete: (url: string, fileName: string) => void;
  accept?: string; // MIME types to accept
  maxSizeMB?: number; // Maximum file size in MB
  label?: string;
  buttonText?: string;
  className?: string;
  thumbnailMode?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  folder,
  onUploadComplete,
  accept = '*/*',
  maxSizeMB = 10,
  label = 'Upload File',
  buttonText = 'Choose File',
  className = '',
  thumbnailMode = false,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setIsComplete(false);

    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Check file size
      if (selectedFile.size > maxSize) {
        setError(`File size exceeds maximum limit (${maxSizeMB}MB)`);
        return;
      }

      setFile(selectedFile);

      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target) {
            setPreview(event.target.result as string);
          }
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      // Generate a unique file name using timestamp
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}.${fileExtension}`;

      // Create Firebase Storage reference
      const storageRef = ref(storage, `${folder}/${fileName}`);

      // Start upload
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Monitor upload progress
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setError('Failed to upload file. Please try again.');
          setIsUploading(false);
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            onUploadComplete(downloadUrl, fileName);
            setIsUploading(false);
            setIsComplete(true);
            setFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          } catch (error) {
            console.error('Error getting download URL:', error);
            setError('Failed to get download URL');
            setIsUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      setError('An unexpected error occurred');
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setPreview(null);
    setProgress(0);
    setError(null);
    setIsComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && <p className="text-sm font-medium mb-2">{label}</p>}

      <div className={`border-2 border-dashed rounded-md p-4 ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}>
        {/* File Selection UI */}
        {!file && !isComplete && (
          <div className="flex flex-col items-center justify-center py-4">
            <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-2">
              {thumbnailMode
                ? 'Kéo hình vào đây hoặc chọn file'
                : 'Kéo tập tin vào đây hoặc chọn file'}
            </p>
            <p className="text-xs text-gray-400 mb-3">
              Kích thước tối đa: {maxSizeMB}MB
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {buttonText}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* Preview and Upload UI */}
        {file && !isComplete && (
          <div>
            {/* File Info */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-12 w-12 object-cover rounded"
                  />
                ) : (
                  <File className="h-8 w-8 text-blue-500" />
                )}
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancel}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className={`px-3 py-1.5 text-sm rounded-md ${
                  isUploading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isUploading ? `Đang tải... ${Math.round(progress)}%` : 'Tải lên'}
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {isComplete && (
          <div className="flex items-center text-green-600 py-2">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span className="text-sm">Tải lên thành công!</span>
            <button
              onClick={handleCancel}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center text-red-600 py-2">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
