import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Layers, Info, Map, FileText, Headset, Gamepad2,
  Users, MessageSquare, HelpCircle, Settings, BarChart2
} from 'lucide-react';

interface SectionData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  collectionName: string;
  navbarId: string;
  route: string;
  documentCount: number;
}

const AdminDashboard: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [sectionData] = useState<SectionData[]>([
    {
      id: 'overview',
      title: 'Tổng quan',
      description: 'Quản lý thống kê và dữ liệu chung về dự án',
      icon: <Layers className="h-6 w-6" />,
      collectionName: 'app-settings',
      navbarId: 'overview',
      route: '/admin/content?section=overview',
      documentCount: 1
    },
    {
      id: 'introduction',
      title: 'Giới thiệu',
      description: 'Chỉnh sửa nội dung giới thiệu về Chủ tịch Hồ Chí Minh',
      icon: <Info className="h-6 w-6" />,
      collectionName: 'content',
      navbarId: 'introduction',
      route: '/admin/content?section=introduction',
      documentCount: 4
    },
    {
      id: 'heritage-spots',
      title: 'Di tích lịch sử',
      description: 'Quản lý thông tin về các di tích lịch sử liên quan đến Bác Hồ',
      icon: <Map className="h-6 w-6" />,
      collectionName: 'heritage-spots',
      navbarId: 'journey',
      route: '/admin/heritage-spots',
      documentCount: 9
    },
    {
      id: 'documents',
      title: 'Tư liệu',
      description: 'Quản lý tư liệu, hình ảnh và tài liệu về Chủ tịch Hồ Chí Minh',
      icon: <FileText className="h-6 w-6" />,
      collectionName: 'documents',
      navbarId: 'documents',
      route: '/admin/content?section=documents',
      documentCount: 25
    },
    {
      id: 'vr-technology',
      title: 'Công nghệ VR',
      description: 'Quản lý nội dung và trải nghiệm VR',
      icon: <Headset className="h-6 w-6" />,
      collectionName: 'vr-experiences',
      navbarId: 'vr-technology',
      route: '/admin/vr-content',
      documentCount: 8
    },
    {
      id: 'mini-game',
      title: 'Mini Game',
      description: 'Quản lý các mini game giáo dục về Chủ tịch Hồ Chí Minh',
      icon: <Gamepad2 className="h-6 w-6" />,
      collectionName: 'minigame-content',
      navbarId: 'mini-game',
      route: '/admin/mini-games',
      documentCount: 5
    },
    {
      id: 'learning-modules',
      title: 'Học liệu',
      description: 'Quản lý các module học tập về Chủ tịch Hồ Chí Minh',
      icon: <HelpCircle className="h-6 w-6" />,
      collectionName: 'learning-modules',
      navbarId: '',
      route: '/admin/content?section=learning-modules',
      documentCount: 12
    },
    {
      id: 'quizzes',
      title: 'Bài kiểm tra',
      description: 'Quản lý các câu hỏi trắc nghiệm kiểm tra kiến thức',
      icon: <HelpCircle className="h-6 w-6" />,
      collectionName: 'quizzes',
      navbarId: '',
      route: '/admin/quizzes',
      documentCount: 36
    },
    {
      id: 'users',
      title: 'Người dùng',
      description: 'Quản lý thông tin người dùng và phân quyền',
      icon: <Users className="h-6 w-6" />,
      collectionName: 'users',
      navbarId: '',
      route: '/admin/users',
      documentCount: 148
    },
    {
      id: 'comments',
      title: 'Bình luận',
      description: 'Quản lý và kiểm duyệt bình luận của người dùng',
      icon: <MessageSquare className="h-6 w-6" />,
      collectionName: 'comments',
      navbarId: '',
      route: '/admin/comments',
      documentCount: 230
    },
    {
      id: 'analytics',
      title: 'Thống kê',
      description: 'Xem thống kê truy cập và hoạt động của người dùng',
      icon: <BarChart2 className="h-6 w-6" />,
      collectionName: '',
      navbarId: '',
      route: '/admin/analytics',
      documentCount: 0
    },
    {
      id: 'settings',
      title: 'Cài đặt',
      description: 'Cấu hình hệ thống và cài đặt chung',
      icon: <Settings className="h-6 w-6" />,
      collectionName: 'app-settings',
      navbarId: '',
      route: '/admin/settings',
      documentCount: 1
    }
  ]);

  // Trong thực tế, bạn sẽ lấy dữ liệu từ Firestore ở đây
  useEffect(() => {
    // Hàm để lấy số lượng tài liệu từ mỗi collection
    const fetchCollectionCounts = async () => {
      if (!currentUser) return;

      try {
        // Ở đây bạn sẽ thêm code để lấy số lượng tài liệu từ Firestore
        // Đây chỉ là code ví dụ:
        // const db = getFirestore();
        // const collections = ['heritage-spots', 'documents', 'vr-experiences', ...];
        // for (const collection of collections) {
        //   const querySnapshot = await getDocs(collection(db, collection));
        //   console.log(`${collection}: ${querySnapshot.size} documents`);
        // }
      } catch (error) {
        console.error("Không thể tải thông tin collections:", error);
      }
    };

    // Chỉ gọi khi đã đăng nhập
    if (currentUser && !loading) {
      fetchCollectionCounts();
    }
  }, [currentUser, loading]);

  const mainSections = sectionData.filter(section => section.navbarId !== '');
  const otherSections = sectionData.filter(section => section.navbarId === '');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-700">Đang kiểm tra đăng nhập...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50" style={{
      "--overview-color": "79, 70, 229", // indigo-600
      "--introduction-color": "37, 99, 235", // blue-600
      "--journey-color": "220, 38, 38", // red-600
      "--documents-color": "202, 138, 4", // yellow-600
      "--vr-technology-color": "22, 163, 74", // green-600
      "--mini-game-color": "147, 51, 234", // purple-600
    } as React.CSSProperties}>
      {/* Admin Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển</h1>
        <p className="mt-2 text-gray-600">Chào mừng, <span className="font-semibold">{currentUser?.email}</span>. Quản lý và cập nhật nội dung website tại đây.</p>
      </div>

      {/* Main Sections - Aligned with Landing Page Navbar */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 inline-flex items-center justify-center mr-2">
            <span className="text-sm">1</span>
          </span>
          Phần hiển thị chính (Theo Navbar)
        </h2>
        <p className="text-gray-600 mb-6">Các phần này trực tiếp ánh xạ đến các mục trên thanh điều hướng của trang chính.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainSections.map((section) => {
            const colorVar = `--${section.id}-color`;

            return (
              <div
                key={section.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(section.route)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `rgba(var(${colorVar}), 0.1)` }}
                    >
                      <div style={{ color: `rgb(var(${colorVar}))` }}>
                        {section.icon}
                      </div>
                    </div>
                    <span
                      className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `rgba(var(${colorVar}), 0.1)`,
                        color: `rgb(var(${colorVar}))`
                      }}
                    >
                      {section.documentCount} tài liệu
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{section.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{section.collectionName}</span>
                    <span
                      className="text-sm font-medium flex items-center"
                      style={{ color: `rgb(var(${colorVar}))` }}
                    >
                      Chỉnh sửa <span className="ml-1">→</span>
                    </span>
                  </div>
                </div>
                <div className="h-1" style={{ backgroundColor: `rgb(var(${colorVar}))` }}></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Other Admin Sections */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 inline-flex items-center justify-center mr-2">
            <span className="text-sm">2</span>
          </span>
          Quản lý hệ thống
        </h2>
        <p className="text-gray-600 mb-6">Các công cụ quản trị và dữ liệu bổ sung của hệ thống.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {otherSections.map((section, index) => {
            // Tạo các màu sắc theo chuỗi để có sự đa dạng
            const baseColors = [
              "74, 109, 255", // blue
              "80, 205, 137", // green
              "248, 114, 114", // red
              "250, 176, 5", // yellow
              "131, 56, 236", // purple
              "221, 80, 151", // pink
            ];

            const colorIndex = index % baseColors.length;
            const bgColor = `rgba(${baseColors[colorIndex]}, 0.1)`;
            const textColor = `rgb(${baseColors[colorIndex]})`;

            return (
              <div
                key={section.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => navigate(section.route)}
              >
                <div className="flex items-center">
                  <div
                    className="p-2 rounded-lg mr-3 transition-colors"
                    style={{
                      backgroundColor: bgColor,
                    }}
                  >
                    <div style={{ color: textColor }}>
                      {section.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">{section.title}</h3>
                    <div className="flex items-center">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full mr-2"
                        style={{
                          backgroundColor: bgColor,
                          color: textColor
                        }}
                      >
                        {section.documentCount}
                      </span>
                      <span className="text-xs text-gray-500">{section.collectionName}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tổng quan dự án</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg p-4 text-center" style={{ backgroundColor: `rgba(var(--journey-color), 0.1)` }}>
            <div className="text-3xl font-bold" style={{ color: `rgb(var(--journey-color))` }}>9</div>
            <p className="text-sm text-gray-600">Di tích quan trọng</p>
          </div>
          <div className="rounded-lg p-4 text-center" style={{ backgroundColor: `rgba(var(--introduction-color), 0.1)` }}>
            <div className="text-3xl font-bold" style={{ color: `rgb(var(--introduction-color))` }}>50+</div>
            <p className="text-sm text-gray-600">Năm hoạt động</p>
          </div>
          <div className="rounded-lg p-4 text-center" style={{ backgroundColor: `rgba(var(--documents-color), 0.1)` }}>
            <div className="text-3xl font-bold" style={{ color: `rgb(var(--documents-color))` }}>1M+</div>
            <p className="text-sm text-gray-600">Lượt tham quan</p>
          </div>
          <div className="rounded-lg p-4 text-center" style={{ backgroundColor: `rgba(var(--vr-technology-color), 0.1)` }}>
            <div className="text-3xl font-bold" style={{ color: `rgb(var(--vr-technology-color))` }}>100%</div>
            <p className="text-sm text-gray-600">Chính xác lịch sử</p>
          </div>
        </div>
      </div>

      {/* Recent Activity - Would connect to real data in a production environment */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Hoạt động gần đây</h2>
        <div className="space-y-3">
          <div className="flex items-center py-2 border-b border-gray-100">
            <div
              className="p-2 rounded-full mr-3"
              style={{ backgroundColor: `rgba(var(--journey-color), 0.1)` }}
            >
              <Map
                className="h-4 w-4"
                style={{ color: `rgb(var(--journey-color))` }}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Cập nhật nội dung Di tích Kim Liên</p>
              <p className="text-xs text-gray-500">2 giờ trước</p>
            </div>
          </div>
          <div className="flex items-center py-2 border-b border-gray-100">
            <div
              className="p-2 rounded-full mr-3"
              style={{ backgroundColor: `rgba(var(--introduction-color), 0.1)` }}
            >
              <Users
                className="h-4 w-4"
                style={{ color: `rgb(var(--introduction-color))` }}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Người dùng mới đăng ký</p>
              <p className="text-xs text-gray-500">5 giờ trước</p>
            </div>
          </div>
          <div className="flex items-center py-2">
            <div
              className="p-2 rounded-full mr-3"
              style={{ backgroundColor: `rgba(var(--mini-game-color), 0.1)` }}
            >
              <Gamepad2
                className="h-4 w-4"
                style={{ color: `rgb(var(--mini-game-color))` }}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Thêm mini game mới</p>
              <p className="text-xs text-gray-500">1 ngày trước</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
