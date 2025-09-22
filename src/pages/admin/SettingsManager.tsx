import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  Settings,
  Save,
  RefreshCw,
  Shield,
  Globe,
  Palette,
  Database,
  AlertTriangle,
  CheckCircle,
  Mail,
  Monitor
} from 'lucide-react';

interface AppSettings {
  // General Settings
  appName: string;
  appDescription: string;
  appVersion: string;
  maintenanceMode: boolean;

  // Feature Toggles
  enableComments: boolean;
  enableQuizzes: boolean;
  enableMiniGames: boolean;
  enableVRContent: boolean;
  enableNotifications: boolean;

  // Security Settings
  requireEmailVerification: boolean;
  maxLoginAttempts: number;
  sessionTimeout: number; // in minutes

  // Content Settings
  maxCommentLength: number;
  moderateComments: boolean;
  defaultQuizTimeLimit: number;
  defaultGameTimeLimit: number;

  // UI Settings
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  faviconUrl: string;

  // Contact Information
  supportEmail: string;
  supportPhone: string;
  socialMediaLinks: {
    facebook: string;
    instagram: string;
    youtube: string;
    website: string;
  };

  // Analytics
  enableAnalytics: boolean;
  trackUserBehavior: boolean;

  // Backup & Maintenance
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  lastBackup?: any;

  updatedAt: any;
}

interface SettingsManagerProps {}

const SettingsManager: React.FC<SettingsManagerProps> = () => {
  const [settings, setSettings] = useState<AppSettings>({
    appName: 'Heritage Journey',
    appDescription: 'Khám phá di sản văn hóa Hồ Chí Minh',
    appVersion: '1.0.0',
    maintenanceMode: false,
    enableComments: true,
    enableQuizzes: true,
    enableMiniGames: true,
    enableVRContent: true,
    enableNotifications: true,
    requireEmailVerification: false,
    maxLoginAttempts: 5,
    sessionTimeout: 60,
    maxCommentLength: 500,
    moderateComments: true,
    defaultQuizTimeLimit: 300,
    defaultGameTimeLimit: 300,
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    logoUrl: '',
    faviconUrl: '',
    supportEmail: 'support@heritagejourney.vn',
    supportPhone: '+84 123 456 789',
    socialMediaLinks: {
      facebook: '',
      instagram: '',
      youtube: '',
      website: ''
    },
    enableAnalytics: true,
    trackUserBehavior: true,
    autoBackup: true,
    backupFrequency: 'daily',
    updatedAt: new Date()
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const settingsDoc = await getDoc(doc(db, 'settings', 'app'));
      if (settingsDoc.exists()) {
        setSettings({ ...settings, ...settingsDoc.data() });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const updatedSettings = {
        ...settings,
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'settings', 'app'), updatedSettings);
      setSettings(updatedSettings);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateSocialMedia = (platform: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      socialMediaLinks: {
        ...prev.socialMediaLinks,
        [platform]: value
      }
    }));
  };

  const tabs = [
    { id: 'general', name: 'Chung', icon: Settings },
    { id: 'features', name: 'Tính năng', icon: Monitor },
    { id: 'security', name: 'Bảo mật', icon: Shield },
    { id: 'content', name: 'Nội dung', icon: Globe },
    { id: 'ui', name: 'Giao diện', icon: Palette },
    { id: 'contact', name: 'Liên hệ', icon: Mail },
    { id: 'analytics', name: 'Phân tích', icon: Database },
    { id: 'backup', name: 'Sao lưu', icon: RefreshCw }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500 flex items-center">
          <RefreshCw className="animate-spin mr-2" size={20} />
          Đang tải cài đặt...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt Hệ thống</h1>
          {lastSaved && (
            <p className="text-gray-600 mt-1">
              Lưu lần cuối: {lastSaved.toLocaleString('vi-VN')}
            </p>
          )}
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="animate-spin mr-2" size={16} />
              Đang lưu...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Lưu cài đặt
            </>
          )}
        </button>
      </div>

      {/* Maintenance Mode Warning */}
      {settings.maintenanceMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Chế độ bảo trì đang bật</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Ứng dụng hiện đang ở chế độ bảo trì. Người dùng sẽ không thể truy cập.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab Navigation */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Cài đặt chung</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên ứng dụng
                    </label>
                    <input
                      type="text"
                      value={settings.appName}
                      onChange={(e) => updateSetting('appName', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phiên bản
                    </label>
                    <input
                      type="text"
                      value={settings.appVersion}
                      onChange={(e) => updateSetting('appVersion', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả ứng dụng
                  </label>
                  <textarea
                    value={settings.appDescription}
                    onChange={(e) => updateSetting('appDescription', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                    Bật chế độ bảo trì
                  </label>
                </div>
              </div>
            )}

            {/* Features Settings */}
            {activeTab === 'features' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Cài đặt tính năng</h2>

                <div className="space-y-4">
                  {[
                    { key: 'enableComments', label: 'Bình luận', desc: 'Cho phép người dùng bình luận trên di sản' },
                    { key: 'enableQuizzes', label: 'Quiz', desc: 'Kích hoạt tính năng quiz kiến thức' },
                    { key: 'enableMiniGames', label: 'Mini Games', desc: 'Cho phép chơi mini games' },
                    { key: 'enableVRContent', label: 'Nội dung VR', desc: 'Hiển thị trải nghiệm thực tế ảo' },
                    { key: 'enableNotifications', label: 'Thông báo', desc: 'Gửi thông báo push cho người dùng' }
                  ].map((feature) => (
                    <div key={feature.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{feature.label}</h3>
                        <p className="text-sm text-gray-500">{feature.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings[feature.key as keyof AppSettings] as boolean}
                        onChange={(e) => updateSetting(feature.key as keyof AppSettings, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Cài đặt bảo mật</h2>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireEmailVerification"
                      checked={settings.requireEmailVerification}
                      onChange={(e) => updateSetting('requireEmailVerification', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requireEmailVerification" className="ml-2 block text-sm text-gray-900">
                      Yêu cầu xác thực email
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số lần đăng nhập tối đa
                      </label>
                      <input
                        type="number"
                        value={settings.maxLoginAttempts}
                        onChange={(e) => updateSetting('maxLoginAttempts', Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        max="10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thời gian hết hạn phiên (phút)
                      </label>
                      <input
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => updateSetting('sessionTimeout', Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="15"
                        max="480"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Settings */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Cài đặt nội dung</h2>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="moderateComments"
                      checked={settings.moderateComments}
                      onChange={(e) => updateSetting('moderateComments', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="moderateComments" className="ml-2 block text-sm text-gray-900">
                      Kiểm duyệt bình luận trước khi hiển thị
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Độ dài bình luận tối đa
                      </label>
                      <input
                        type="number"
                        value={settings.maxCommentLength}
                        onChange={(e) => updateSetting('maxCommentLength', Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="50"
                        max="1000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thời gian quiz mặc định (giây)
                      </label>
                      <input
                        type="number"
                        value={settings.defaultQuizTimeLimit}
                        onChange={(e) => updateSetting('defaultQuizTimeLimit', Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="60"
                        max="1800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thời gian game mặc định (giây)
                      </label>
                      <input
                        type="number"
                        value={settings.defaultGameTimeLimit}
                        onChange={(e) => updateSetting('defaultGameTimeLimit', Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="60"
                        max="1800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* UI Settings */}
            {activeTab === 'ui' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Cài đặt giao diện</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Màu chính
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => updateSetting('primaryColor', e.target.value)}
                        className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.primaryColor}
                        onChange={(e) => updateSetting('primaryColor', e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Màu phụ
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                        className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.secondaryColor}
                        onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Logo
                    </label>
                    <input
                      type="url"
                      value={settings.logoUrl}
                      onChange={(e) => updateSetting('logoUrl', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Favicon
                    </label>
                    <input
                      type="url"
                      value={settings.faviconUrl}
                      onChange={(e) => updateSetting('faviconUrl', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/favicon.ico"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Contact Settings */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Thông tin liên hệ</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email hỗ trợ
                    </label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => updateSetting('supportEmail', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại hỗ trợ
                    </label>
                    <input
                      type="tel"
                      value={settings.supportPhone}
                      onChange={(e) => updateSetting('supportPhone', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={settings.socialMediaLinks.facebook}
                      onChange={(e) => updateSocialMedia('facebook', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://facebook.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={settings.socialMediaLinks.instagram}
                      onChange={(e) => updateSocialMedia('instagram', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://instagram.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      YouTube
                    </label>
                    <input
                      type="url"
                      value={settings.socialMediaLinks.youtube}
                      onChange={(e) => updateSocialMedia('youtube', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://youtube.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={settings.socialMediaLinks.website}
                      onChange={(e) => updateSocialMedia('website', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Settings */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Cài đặt phân tích</h2>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableAnalytics"
                      checked={settings.enableAnalytics}
                      onChange={(e) => updateSetting('enableAnalytics', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableAnalytics" className="ml-2 block text-sm text-gray-900">
                      Bật phân tích dữ liệu
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="trackUserBehavior"
                      checked={settings.trackUserBehavior}
                      onChange={(e) => updateSetting('trackUserBehavior', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="trackUserBehavior" className="ml-2 block text-sm text-gray-900">
                      Theo dõi hành vi người dùng
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Backup Settings */}
            {activeTab === 'backup' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Cài đặt sao lưu</h2>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoBackup"
                      checked={settings.autoBackup}
                      onChange={(e) => updateSetting('autoBackup', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="autoBackup" className="ml-2 block text-sm text-gray-900">
                      Tự động sao lưu
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tần suất sao lưu
                    </label>
                    <select
                      value={settings.backupFrequency}
                      onChange={(e) => updateSetting('backupFrequency', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="daily">Hằng ngày</option>
                      <option value="weekly">Hằng tuần</option>
                      <option value="monthly">Hằng tháng</option>
                    </select>
                  </div>

                  {settings.lastBackup && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                          <h3 className="text-sm font-medium text-green-800">Sao lưu gần nhất</h3>
                          <p className="text-sm text-green-700">
                            {new Date(settings.lastBackup).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;
