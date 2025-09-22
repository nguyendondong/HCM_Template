import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-700">Đang kiểm tra đăng nhập...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-red-100">
      <h1 className="text-4xl font-bold text-red-700 mb-4">Chào mừng Admin!</h1>
      <p className="text-lg text-gray-700 mb-8">Bạn đã đăng nhập với email: <span className="font-semibold">{currentUser?.email}</span></p>
      {/* Thêm các chức năng chỉnh sửa data tại đây */}
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Quản lý dữ liệu</h2>
        <p className="text-gray-600">Tại đây bạn có thể chỉnh sửa, thêm, xóa dữ liệu di sản, người dùng, v.v.</p>
        {/* TODO: Thêm các component quản trị thực tế */}
      </div>
    </div>
  );
};

export default AdminDashboard;
