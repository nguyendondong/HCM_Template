import React from 'react';
import AuthForms from '../../components/AuthForms';
import { AuthProvider } from '../../contexts/AuthContext';
import AdminLoginGuard from './AdminLoginGuard';

const AdminLoginPage: React.FC = () => {
  const handleSuccess = () => {
    localStorage.setItem('admin_last_login', Date.now().toString());
    window.location.href = '/admin';
  };

  return (
    <AuthProvider>
      <AdminLoginGuard>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-yellow-50">
          <div className="w-full max-w-lg p-6">
            <h1 className="text-4xl font-bold text-center text-red-700 mb-8 drop-shadow-lg">
              Đăng nhập Quản trị
            </h1>
            <AuthForms onSuccess={handleSuccess} />
          </div>
        </div>
      </AdminLoginGuard>
    </AuthProvider>
  );
};

export default AdminLoginPage;
