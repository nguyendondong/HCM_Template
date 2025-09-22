import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Settings,
  Info
} from 'lucide-react';
import { initializeAllDefaultData, resetAndInitializeData } from '../../scripts/initializeData';

const DataInitializationPanel: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleInitializeData = async () => {
    try {
      setIsInitializing(true);
      setStatus('idle');
      setMessage('Đang khởi tạo dữ liệu...');

      await initializeAllDefaultData();

      setStatus('success');
      setMessage('Khởi tạo dữ liệu thành công! Tất cả nội dung đã được tạo trên Firebase.');
    } catch (error) {
      console.error('Error initializing data:', error);
      setStatus('error');
      setMessage('Lỗi khởi tạo dữ liệu. Vui lòng kiểm tra console để biết chi tiết.');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('⚠️ CẢNH BÁO: Thao tác này sẽ reset tất cả dữ liệu. Bạn có chắc chắn?')) {
      return;
    }

    try {
      setIsResetting(true);
      setStatus('idle');
      setMessage('Đang reset và khởi tạo lại dữ liệu...');

      await resetAndInitializeData();

      setStatus('success');
      setMessage('Reset và khởi tạo dữ liệu thành công!');
    } catch (error) {
      console.error('Error resetting data:', error);
      setStatus('error');
      setMessage('Lỗi reset dữ liệu. Vui lòng kiểm tra console để biết chi tiết.');
    } finally {
      setIsResetting(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <Database className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">Quản lý Dữ liệu Firebase</h2>
      </div>

      {/* Status Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex items-center space-x-2 p-4 rounded-lg border mb-6 ${getStatusColor()}`}
        >
          {getStatusIcon()}
          <span className="text-sm font-medium">{message}</span>
        </motion.div>
      )}

      {/* Information Panel */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Thông tin Dữ liệu
        </h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>• Nội dung Hero Section</span>
            <span className="text-green-600 font-medium">Sẵn sàng</span>
          </div>
          <div className="flex items-center justify-between">
            <span>• Menu Navigation</span>
            <span className="text-green-600 font-medium">Sẵn sàng</span>
          </div>
          <div className="flex items-center justify-between">
            <span>• Footer Content</span>
            <span className="text-green-600 font-medium">Sẵn sàng</span>
          </div>
          <div className="flex items-center justify-between">
            <span>• Cấu hình trang web</span>
            <span className="text-green-600 font-medium">Sẵn sàng</span>
          </div>
          <div className="flex items-center justify-between">
            <span>• Dữ liệu di tích nâng cao</span>
            <span className="text-green-600 font-medium">Sẵn sàng</span>
          </div>
          <div className="flex items-center justify-between">
            <span>• Nội dung trang Documents</span>
            <span className="text-green-600 font-medium">Sẵn sàng</span>
          </div>
          <div className="flex items-center justify-between">
            <span>• Nội dung trang VR Experience</span>
            <span className="text-green-600 font-medium">Sẵn sàng</span>
          </div>
          <div className="flex items-center justify-between">
            <span>• Nội dung trang Mini Games</span>
            <span className="text-green-600 font-medium">Sẵn sàng</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleInitializeData}
          disabled={isInitializing || isResetting}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isInitializing ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Play className="w-5 h-5" />
          )}
          <span>
            {isInitializing ? 'Đang khởi tạo...' : 'Khởi tạo Dữ liệu'}
          </span>
        </button>

        <button
          onClick={handleResetData}
          disabled={isInitializing || isResetting}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isResetting ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span>
            {isResetting ? 'Đang reset...' : 'Reset Dữ liệu'}
          </span>
        </button>
      </div>

      {/* Warning */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Lưu ý quan trọng:</p>
            <ul className="space-y-1 text-xs">
              <li>• Khởi tạo dữ liệu sẽ tạo nội dung mặc định trên Firebase</li>
              <li>• Reset dữ liệu chỉ nên sử dụng trong môi trường development</li>
              <li>• Đảm bảo cấu hình Firebase đã được thiết lập đúng</li>
              <li>• Kiểm tra kết nối internet trước khi thực hiện</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DataInitializationPanel;
