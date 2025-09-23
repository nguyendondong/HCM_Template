import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  MapPin,
  FileText,
  Users,
  MessageSquare,
  HelpCircle,
  Headset,
  Gamepad2,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

// Import admin components
import AdminDashboard from './AdminDashboard';
import {
  ContentManager,
  ContentDetails,
  SectionEditor,
  DocumentManager,
  HeritageSpotsManager,
  QuizzesManager,
  VRContentManager,
  MiniGamesManager
} from './content';
import { UsersManager, CommentsManager } from './user-management';
import { AnalyticsManager } from './analytics';
import { SettingsManager } from './settings';

const AdminLayout: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-700">Đang kiểm tra đăng nhập...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigation = [
    { name: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
    { name: 'Địa điểm ', href: '/admin/heritage-spots', icon: MapPin },
    { name: 'Nội dung', href: '/admin/content', icon: FileText },
    { name: 'Tài liệu', href: '/admin/documents', icon: FileText },
    { name: 'Người dùng', href: '/admin/users', icon: Users },
    { name: 'Bình luận', href: '/admin/comments', icon: MessageSquare },
    { name: 'Câu hỏi', href: '/admin/quizzes', icon: HelpCircle },
    { name: 'VR Content', href: '/admin/vr-content', icon: Headset },
    { name: 'Mini Games', href: '/admin/mini-games', icon: Gamepad2 },
    { name: 'Thống kê', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Cài đặt', href: '/admin/settings', icon: Settings },
  ];

  const isActivePath = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">Heritage Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActivePath(item.href)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User info and logout */}
        <div className="absolute bottom-0 w-full p-4 border-t">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {currentUser.email?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Admin</p>
              <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold">Heritage Admin</h1>
          <div className="w-6" /> {/* Spacer */}
        </div>

        {/* Page content */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/heritage-spots" element={<HeritageSpotsManager />} />
            <Route path="/content" element={<ContentManager />} />
            <Route path="/content/details/:id" element={<ContentDetails />} />
            <Route path="/content/section-editor" element={<SectionEditor />} />
            <Route path="/documents" element={<DocumentManager />} />
            <Route path="/users" element={<UsersManager />} />
            <Route path="/comments" element={<CommentsManager />} />
            <Route path="/quizzes" element={<QuizzesManager />} />
            <Route path="/vr-content" element={<VRContentManager />} />
            <Route path="/mini-games" element={<MiniGamesManager />} />
            <Route path="/analytics" element={<AnalyticsManager />} />
            <Route path="/settings" element={<SettingsManager />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
