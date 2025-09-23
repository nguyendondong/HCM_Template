import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Menu, Home, FileText, Gamepad2, Headphones, Phone } from 'lucide-react';
import { collection, query, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import toast from 'react-hot-toast';

interface NavMenuItem {
  id: string;
  label: string;
  href: string;
  targetSection?: string;
  order: number;
  isActive: boolean;
}

interface NavigationContent {
  id?: string;
  logo?: {
    text: string;
    iconName: string;
  };
  menuItems?: NavMenuItem[];
  mobileMenuEnabled?: boolean;
  brandSettings?: {
    showIcon: boolean;
    showText: boolean;
    customIconUrl?: string;
  };
  menuSettings?: {
    showLabels: boolean;
    highlightActiveSection: boolean;
    smoothScroll: boolean;
  };
  mobileSettings?: {
    showMobileMenu: boolean;
    overlayEnabled: boolean;
    animationEnabled: boolean;
  };
}

interface NavigationEditorProps {
  formData: NavigationContent;
  setFormData: (data: any) => void;
  onSave?: () => void;
}

const NavigationEditor: React.FC<NavigationEditorProps> = ({ formData, setFormData }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'menu' | 'settings'>('general');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch navigation content from Firebase on component mount
  useEffect(() => {
    const fetchNavigationContent = async () => {
      try {
        setIsLoading(true);
        const navQuery = query(collection(db, 'navigationContent'));
        const querySnapshot = await getDocs(navQuery);

        if (!querySnapshot.empty) {
          const navDoc = querySnapshot.docs[0];
          const navContent = navDoc.data() as NavigationContent;

          // Update formData with Firebase content
          setFormData({
            id: navDoc.id,
            ...navContent,
            // Ensure default values exist
            logo: navContent.logo,
            menuItems: navContent.menuItems || [],
            brandSettings: navContent.brandSettings || { showIcon: true, showText: true },
            menuSettings: navContent.menuSettings || {
              showLabels: true,
              highlightActiveSection: true,
              smoothScroll: true
            },
            mobileSettings: navContent.mobileSettings || {
              showMobileMenu: true,
              overlayEnabled: true,
              animationEnabled: true
            }
          });
        }
      } catch (error) {
        console.error('Error fetching navigation content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if formData is empty or doesn't have an id
    if (!formData?.id) {
      fetchNavigationContent();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Save content back to Firebase when formData changes
  const saveToFirebase = async () => {
    if (!formData?.id) return;
    try {
      const docRef = doc(db, 'navigationContent', formData.id);
      await setDoc(docRef, {
        ...formData,
        updatedAt: new Date().toISOString()
      });
      toast.success('Lưu cấu hình navigation thành công!');
      if (typeof onSave === 'function') onSave();
    } catch (error) {
      console.error('Error saving navigation content:', error);
      toast.error('Có lỗi xảy ra khi lưu cấu hình navigation!');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading navigation content...</p>
      </div>
    );
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMenuItemChange = (index: number, field: string, value: any) => {
    const newMenuItems = [...(formData.menuItems || [])];
    newMenuItems[index] = { ...newMenuItems[index], [field]: value };
    setFormData((prev: any) => ({
      ...prev,
      menuItems: newMenuItems
    }));
  };

  const addMenuItem = () => {
    const newMenuItem: NavMenuItem = {
      id: Date.now().toString(),
      label: '',
      href: '',
      targetSection: '',
      order: (formData.menuItems?.length || 0) + 1,
      isActive: true
    };
    const newMenuItems = [...(formData.menuItems || []), newMenuItem];
    setFormData((prev: any) => ({
      ...prev,
      menuItems: newMenuItems
    }));
  };

  const removeMenuItem = (index: number) => {
    const newMenuItems = formData.menuItems?.filter((_: any, i: number) => i !== index) || [];
    // Renumber order
    newMenuItems.forEach((item: any, i: number) => {
      item.order = i + 1;
    });
    setFormData((prev: any) => ({
      ...prev,
      menuItems: newMenuItems
    }));
  };

  const moveMenuItemUp = (index: number) => {
    if (index === 0) return;
    const newMenuItems = [...(formData.menuItems || [])];
    [newMenuItems[index], newMenuItems[index - 1]] = [newMenuItems[index - 1], newMenuItems[index]];
    // Update orders
    newMenuItems.forEach((item: any, i: number) => {
      item.order = i + 1;
    });
    setFormData((prev: any) => ({
      ...prev,
      menuItems: newMenuItems
    }));
  };

  const moveMenuItemDown = (index: number) => {
    if (index >= (formData.menuItems?.length || 0) - 1) return;
    const newMenuItems = [...(formData.menuItems || [])];
    [newMenuItems[index], newMenuItems[index + 1]] = [newMenuItems[index + 1], newMenuItems[index]];
    // Update orders
    newMenuItems.forEach((item: any, i: number) => {
      item.order = i + 1;
    });
    setFormData((prev: any) => ({
      ...prev,
      menuItems: newMenuItems
    }));
  };

  const getIconForSection = (targetSection: string) => {
    switch (targetSection) {
      case 'hero':
        return <Home className="w-4 h-4" />;
      case 'introduction':
        return <FileText className="w-4 h-4" />;
      case 'documents':
        return <FileText className="w-4 h-4" />;
      case 'vr':
        return <Headphones className="w-4 h-4" />;
      case 'games':
        return <Gamepad2 className="w-4 h-4" />;
      case 'contact':
        return <Phone className="w-4 h-4" />;
      default:
        return <Menu className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Save Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Navigation Editor</h2>
          <p className="mt-1 text-gray-600">Manage navigation menu and settings</p>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showPreview ? 'Ẩn Preview' : 'Xem Preview'}
          </button>
          {/* Ẩn nút Save Changes nếu có onSave (modal) */}
          {!onSave && (
            <button
              type="button"
              onClick={saveToFirebase}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              💾 Save Changes
            </button>
          )}
        </div>
      </div>

      {showPreview ? (
        // Preview Mode
        <div className="bg-gray-50 p-6 rounded-lg border">
          <div className="max-w-6xl mx-auto">
            {/* Desktop Navigation Preview */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Desktop Navigation</h3>
              <nav className="bg-white shadow-sm rounded-lg px-6 py-4">
                <div className="flex items-center justify-between">
                  {/* Logo */}
                  <div className="flex items-center space-x-2">
                    {formData.brandSettings?.showIcon && (
                      <div className="text-2xl">
                        {formData.brandSettings?.customIconUrl ? (
                          <img src={formData.brandSettings.customIconUrl} alt="Logo" className="w-8 h-8" />
                        ) : (
                          formData.logo?.iconName || '🏛️'
                        )}
                      </div>
                    )}
                    {formData.brandSettings?.showText && (
                      <span className="text-xl font-bold text-gray-900">
                        {formData.logo?.text || 'Chủ tịch Hồ Chí Minh'}
                      </span>
                    )}
                  </div>

                  {/* Menu Items */}
                  <div className="flex items-center space-x-8">
                    {formData.menuItems?.filter((item: NavMenuItem) => item.isActive).map((item: NavMenuItem, index: number) => (
                      <div key={index} className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
                        {getIconForSection(item.targetSection || '')}
                        {formData.menuSettings?.showLabels && (
                          <span className="font-medium">{item.label}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </nav>
            </div>

            {/* Mobile Navigation Preview */}
            {formData.mobileSettings?.showMobileMenu && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mobile Navigation</h3>
                <div className="bg-white shadow-sm rounded-lg p-4">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {formData.brandSettings?.showIcon && (
                        <div className="text-xl">
                          {formData.brandSettings?.customIconUrl ? (
                            <img src={formData.brandSettings.customIconUrl} alt="Logo" className="w-6 h-6" />
                          ) : (
                            formData.logo?.iconName || '🏛️'
                          )}
                        </div>
                      )}
                      {formData.brandSettings?.showText && (
                        <span className="text-lg font-bold text-gray-900">
                          {formData.logo?.text || 'HCM'}
                        </span>
                      )}
                    </div>
                    <button className="p-2">
                      <Menu className="w-6 h-6 text-gray-700" />
                    </button>
                  </div>

                  {/* Mobile Menu Items */}
                  <div className="space-y-3 border-t pt-4">
                    {formData.menuItems?.filter((item: NavMenuItem) => item.isActive).map((item: NavMenuItem, index: number) => (
                      <div key={index} className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer py-2">
                        {getIconForSection(item.targetSection || '')}
                        <span className="font-medium">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Edit Mode
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'general'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Thông tin chung
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('menu')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'menu'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Menu ({formData.menuItems?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Cài đặt
              </button>
            </nav>
          </div>

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên thương hiệu</label>
                  <input
                    type="text"
                    value={formData.logo?.text || ''}
                    onChange={(e) => handleInputChange('logo', { ...formData.logo, text: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Chủ tịch Hồ Chí Minh"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon/Emoji</label>
                  <input
                    type="text"
                    value={formData.logo?.iconName || ''}
                    onChange={(e) => handleInputChange('logo', { ...formData.logo, iconName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="🏛️"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL Icon tùy chỉnh (tùy chọn)</label>
                <input
                  type="url"
                  value={formData.brandSettings?.customIconUrl || ''}
                  onChange={(e) => handleInputChange('brandSettings', {
                    ...formData.brandSettings,
                    customIconUrl: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Hiển thị Logo</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="showIcon"
                        checked={formData.brandSettings?.showIcon ?? true}
                        onChange={(e) => handleInputChange('brandSettings', {
                          ...formData.brandSettings,
                          showIcon: e.target.checked
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="showIcon" className="text-sm text-gray-700">Hiển thị icon</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="showText"
                        checked={formData.brandSettings?.showText ?? true}
                        onChange={(e) => handleInputChange('brandSettings', {
                          ...formData.brandSettings,
                          showText: e.target.checked
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="showText" className="text-sm text-gray-700">Hiển thị tên</label>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Cài đặt Menu</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="showLabels"
                        checked={formData.menuSettings?.showLabels ?? true}
                        onChange={(e) => handleInputChange('menuSettings', {
                          ...formData.menuSettings,
                          showLabels: e.target.checked
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="showLabels" className="text-sm text-gray-700">Hiển thị nhãn menu</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="smoothScroll"
                        checked={formData.menuSettings?.smoothScroll ?? true}
                        onChange={(e) => handleInputChange('menuSettings', {
                          ...formData.menuSettings,
                          smoothScroll: e.target.checked
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="smoothScroll" className="text-sm text-gray-700">Cuộn mượt</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Menu Tab */}
          {activeTab === 'menu' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Quản lý menu</h3>
                <button
                  type="button"
                  onClick={addMenuItem}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  Thêm menu
                </button>
              </div>

              {formData.menuItems?.map((item: NavMenuItem, index: number) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Nhãn menu</label>
                      <input
                        type="text"
                        value={item.label || ''}
                        onChange={(e) => handleMenuItemChange(index, 'label', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Trang chủ"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Liên kết</label>
                      <input
                        type="text"
                        value={item.href || ''}
                        onChange={(e) => handleMenuItemChange(index, 'href', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="/"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Phần đích</label>
                      <select
                        value={item.targetSection || ''}
                        onChange={(e) => handleMenuItemChange(index, 'targetSection', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="">Chọn phần</option>
                        <option value="hero">Trang chủ</option>
                        <option value="introduction">Giới thiệu</option>
                        <option value="documents">Tài liệu</option>
                        <option value="vr">Trải nghiệm VR</option>
                        <option value="games">Mini Games</option>
                        <option value="contact">Liên hệ</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`active-${index}`}
                          checked={item.isActive ?? true}
                          onChange={(e) => handleMenuItemChange(index, 'isActive', e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor={`active-${index}`} className="text-sm text-gray-700">Kích hoạt</label>
                      </div>
                      <div className="text-xs text-gray-500">
                        Thứ tự: {item.order}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => moveMenuItemUp(index)}
                        disabled={index === 0}
                        className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 disabled:opacity-50"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveMenuItemDown(index)}
                        disabled={index >= (formData.menuItems?.length || 0) - 1}
                        className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 disabled:opacity-50"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMenuItem(index)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {(!formData.menuItems || formData.menuItems.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Menu className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Chưa có menu nào. Thêm menu đầu tiên để bắt đầu.</p>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Cài đặt Desktop</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="highlightActiveSection"
                        checked={formData.menuSettings?.highlightActiveSection ?? true}
                        onChange={(e) => handleInputChange('menuSettings', {
                          ...formData.menuSettings,
                          highlightActiveSection: e.target.checked
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="highlightActiveSection" className="text-sm text-gray-700">
                        Đánh dấu phần đang xem
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Cài đặt Mobile</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="showMobileMenu"
                        checked={formData.mobileSettings?.showMobileMenu ?? true}
                        onChange={(e) => handleInputChange('mobileSettings', {
                          ...formData.mobileSettings,
                          showMobileMenu: e.target.checked
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="showMobileMenu" className="text-sm text-gray-700">
                        Hiển thị menu mobile
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="overlayEnabled"
                        checked={formData.mobileSettings?.overlayEnabled ?? true}
                        onChange={(e) => handleInputChange('mobileSettings', {
                          ...formData.mobileSettings,
                          overlayEnabled: e.target.checked
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="overlayEnabled" className="text-sm text-gray-700">
                        Hiệu ứng overlay
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="animationEnabled"
                        checked={formData.mobileSettings?.animationEnabled ?? true}
                        onChange={(e) => handleInputChange('mobileSettings', {
                          ...formData.mobileSettings,
                          animationEnabled: e.target.checked
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="animationEnabled" className="text-sm text-gray-700">
                        Hiệu ứng chuyển động
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Cài đặt chung</h4>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="mobileMenuEnabled"
                    checked={formData.mobileMenuEnabled ?? true}
                    onChange={(e) => handleInputChange('mobileMenuEnabled', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="mobileMenuEnabled" className="text-sm text-gray-700">
                    Kích hoạt menu mobile (cài đặt legacy)
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NavigationEditor;
