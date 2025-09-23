import React, { useState } from 'react';
import { Eye, EyeOff, Star, Facebook, Youtube, Instagram, Twitter, Linkedin } from 'lucide-react';

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

interface FooterContent {
  id?: string;
  quote?: string;
  description?: string;
  actionButton?: {
    text: string;
    action: string;
  };
  copyright?: string;
  socialLinks?: SocialLink[];
  backgroundElements?: {
    enableStars: boolean;
    starCount: number;
  };
  contactInfo?: {
    address?: string;
    phone?: string;
    email?: string;
  };
  additionalLinks?: Array<{
    label: string;
    url: string;
    category?: string;
  }>;
  customSections?: Array<{
    title: string;
    content: string;
    links?: Array<{
      label: string;
      url: string;
    }>;
  }>;
}

interface FooterEditorProps {
  formData: FooterContent;
  setFormData: (data: any) => void;
}

const FooterEditor: React.FC<FooterEditorProps> = ({ formData, setFormData }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'social' | 'contact' | 'advanced'>('general');

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialLinkChange = (index: number, field: string, value: string) => {
    const newSocialLinks = [...(formData.socialLinks || [])];
    newSocialLinks[index] = { ...newSocialLinks[index], [field]: value };
    setFormData((prev: any) => ({
      ...prev,
      socialLinks: newSocialLinks
    }));
  };

  const addSocialLink = () => {
    const newSocialLink: SocialLink = {
      platform: 'facebook',
      url: '',
      icon: 'Facebook'
    };
    const newSocialLinks = [...(formData.socialLinks || []), newSocialLink];
    setFormData((prev: any) => ({
      ...prev,
      socialLinks: newSocialLinks
    }));
  };

  const removeSocialLink = (index: number) => {
    const newSocialLinks = formData.socialLinks?.filter((_: any, i: number) => i !== index) || [];
    setFormData((prev: any) => ({
      ...prev,
      socialLinks: newSocialLinks
    }));
  };

  const handleAdditionalLinkChange = (index: number, field: string, value: string) => {
    const newAdditionalLinks = [...(formData.additionalLinks || [])];
    newAdditionalLinks[index] = { ...newAdditionalLinks[index], [field]: value };
    setFormData((prev: any) => ({
      ...prev,
      additionalLinks: newAdditionalLinks
    }));
  };

  const addAdditionalLink = () => {
    const newLink = { label: '', url: '', category: '' };
    const newAdditionalLinks = [...(formData.additionalLinks || []), newLink];
    setFormData((prev: any) => ({
      ...prev,
      additionalLinks: newAdditionalLinks
    }));
  };

  const removeAdditionalLink = (index: number) => {
    const newAdditionalLinks = formData.additionalLinks?.filter((_: any, i: number) => i !== index) || [];
    setFormData((prev: any) => ({
      ...prev,
      additionalLinks: newAdditionalLinks
    }));
  };

  const handleCustomSectionChange = (index: number, field: string, value: any) => {
    const newCustomSections = [...(formData.customSections || [])];
    newCustomSections[index] = { ...newCustomSections[index], [field]: value };
    setFormData((prev: any) => ({
      ...prev,
      customSections: newCustomSections
    }));
  };

  const addCustomSection = () => {
    const newSection = { title: '', content: '', links: [] };
    const newCustomSections = [...(formData.customSections || []), newSection];
    setFormData((prev: any) => ({
      ...prev,
      customSections: newCustomSections
    }));
  };

  const removeCustomSection = (index: number) => {
    const newCustomSections = formData.customSections?.filter((_: any, i: number) => i !== index) || [];
    setFormData((prev: any) => ({
      ...prev,
      customSections: newCustomSections
    }));
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return <Facebook className="w-5 h-5" />;
      case 'youtube':
        return <Youtube className="w-5 h-5" />;
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'twitter':
        return <Twitter className="w-5 h-5" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const generateStars = (count: number) => {
    return Array.from({ length: count }, (_, i) => (
      <Star
        key={i}
        className={`absolute text-yellow-300 ${
          i % 3 === 0 ? 'w-2 h-2' : i % 3 === 1 ? 'w-3 h-3' : 'w-1 h-1'
        }`}
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`
        }}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Preview Toggle */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
          {showPreview ? 'Ẩn Preview' : 'Xem Preview'}
        </button>
      </div>

      {showPreview ? (
        // Preview Mode
        <div className="bg-gray-50 p-6 rounded-lg border">
          <div className="max-w-6xl mx-auto">
            <div className="relative bg-gradient-to-r from-red-800 to-red-900 text-white p-8 rounded-lg overflow-hidden">
              {/* Background Stars */}
              {formData.backgroundElements?.enableStars && (
                <div className="absolute inset-0">
                  {generateStars(formData.backgroundElements.starCount || 20)}
                </div>
              )}

              <div className="relative z-10">
                <div className="text-center mb-12">
                  {formData.quote && (
                    <blockquote className="text-3xl md:text-4xl font-bold mb-6">
                      "{formData.quote}"
                    </blockquote>
                  )}
                  {formData.description && (
                    <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-4xl mx-auto leading-relaxed">{formData.description}</p>
                  )}
                  {formData.actionButton?.text && (
                    <button className="px-10 py-4 bg-yellow-400 text-red-900 font-bold text-lg rounded-full hover:bg-yellow-300 transition-all duration-300 shadow-2xl mb-16">
                      {formData.actionButton.text}
                    </button>
                  )}
                </div>

                {/* Contact Info - 3 Column Grid */}
                {(formData.contactInfo?.address || formData.contactInfo?.phone || formData.contactInfo?.email) && (
                  <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    {formData.contactInfo.address && (
                      <div>
                        <h4 className="font-bold text-white mb-3 text-lg">Address</h4>
                        <p className="text-base text-gray-200 leading-relaxed">{formData.contactInfo.address}</p>
                      </div>
                    )}
                    {formData.contactInfo.phone && (
                      <div>
                        <h4 className="font-bold text-white mb-3 text-lg">Phone</h4>
                        <p className="text-base text-gray-200">{formData.contactInfo.phone}</p>
                      </div>
                    )}
                    {formData.contactInfo.email && (
                      <div>
                        <h4 className="font-bold text-white mb-3 text-lg">Email</h4>
                        <p className="text-base text-gray-200">{formData.contactInfo.email}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Additional Links - Horizontal Layout */}
                {formData.additionalLinks && formData.additionalLinks.length > 0 && (
                  <div className="mb-8 flex flex-wrap justify-center gap-8">
                    {formData.additionalLinks.map((link: any, index: number) => (
                      <a key={index} href={link.url} className="text-base font-medium text-gray-200 hover:text-yellow-400 transition-colors duration-300">
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}

                {/* Social Links */}
                {formData.socialLinks && formData.socialLinks.length > 0 && (
                  <div className="mb-16 flex justify-center space-x-8">
                    {formData.socialLinks.map((social: SocialLink, index: number) => (
                      <a
                        key={index}
                        href={social.url}
                        className="p-3 bg-red-700 hover:bg-red-600 text-gray-200 hover:text-yellow-400 rounded-full transition-all duration-300 transform hover:scale-110"
                        title={social.platform}
                      >
                        {getSocialIcon(social.platform)}
                      </a>
                    ))}
                  </div>
                )}

                {/* Copyright */}
                <div className="text-center border-t border-white border-opacity-20 pt-8">
                  <p className="text-base text-gray-300">
                    {formData.copyright || '© 2025 Heritage Journey Following Uncle Ho. Honoring the legacy of Vietnam\'s beloved leader.'}
                  </p>
                </div>
              </div>
            </div>
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
                onClick={() => setActiveTab('social')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'social'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Mạng xã hội ({formData.socialLinks?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('contact')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'contact'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Liên hệ
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('advanced')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'advanced'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Nâng cao
              </button>
            </nav>
          </div>

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Câu trích dẫn chính</label>
                <textarea
                  value={formData.quote || ''}
                  onChange={(e) => handleInputChange('quote', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Không có gì quý hơn độc lập tự do"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Khám phá Địa điểm  và tư tưởng của Chủ tịch Hồ Chí Minh"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Văn bản nút hành động</label>
                  <input
                    type="text"
                    value={formData.actionButton?.text || ''}
                    onChange={(e) => handleInputChange('actionButton', {
                      ...formData.actionButton,
                      text: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Khám phá ngay"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hành động nút</label>
                  <input
                    type="text"
                    value={formData.actionButton?.action || ''}
                    onChange={(e) => handleInputChange('actionButton', {
                      ...formData.actionButton,
                      action: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="scrollToTop"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bản quyền</label>
                <input
                  type="text"
                  value={formData.copyright || ''}
                  onChange={(e) => handleInputChange('copyright', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="© 2025 Chủ tịch Hồ Chí Minh. Tất cả quyền được bảo lưu."
                />
              </div>

              {/* Background Settings */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-4">Cài đặt nền</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableStars"
                      checked={formData.backgroundElements?.enableStars ?? true}
                      onChange={(e) => handleInputChange('backgroundElements', {
                        ...formData.backgroundElements,
                        enableStars: e.target.checked
                      })}
                      className="mr-2"
                    />
                    <label htmlFor="enableStars" className="text-sm text-gray-700">Hiển thị ngôi sao</label>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Số lượng ngôi sao</label>
                    <input
                      type="number"
                      value={formData.backgroundElements?.starCount || 20}
                      onChange={(e) => handleInputChange('backgroundElements', {
                        ...formData.backgroundElements,
                        starCount: parseInt(e.target.value) || 20
                      })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Tab */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Quản lý mạng xã hội</h3>
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  Thêm mạng xã hội
                </button>
              </div>

              {formData.socialLinks?.map((social: SocialLink, index: number) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Nền tảng</label>
                      <select
                        value={social.platform || 'facebook'}
                        onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="facebook">Facebook</option>
                        <option value="youtube">YouTube</option>
                        <option value="instagram">Instagram</option>
                        <option value="twitter">Twitter</option>
                        <option value="linkedin">LinkedIn</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">URL</label>
                      <input
                        type="url"
                        value={social.url || ''}
                        onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="https://facebook.com/example"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeSocialLink(index)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}

              {(!formData.socialLinks || formData.socialLinks.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Facebook className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Chưa có mạng xã hội nào. Thêm liên kết đầu tiên để kết nối với cộng đồng.</p>
                </div>
              )}
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Thông tin liên hệ</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                <textarea
                  value={formData.contactInfo?.address || ''}
                  onChange={(e) => handleInputChange('contactInfo', {
                    ...formData.contactInfo,
                    address: e.target.value
                  })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phủ Chủ tịch, 1 Hùng Vương, Ba Đình, Hà Nội"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                  <input
                    type="tel"
                    value={formData.contactInfo?.phone || ''}
                    onChange={(e) => handleInputChange('contactInfo', {
                      ...formData.contactInfo,
                      phone: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+84 24 3845 5555"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.contactInfo?.email || ''}
                    onChange={(e) => handleInputChange('contactInfo', {
                      ...formData.contactInfo,
                      email: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="info@hochiminh.gov.vn"
                  />
                </div>
              </div>

              {/* Additional Links */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-900">Liên kết bổ sung</h4>
                  <button
                    type="button"
                    onClick={addAdditionalLink}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                  >
                    Thêm liên kết
                  </button>
                </div>

                {formData.additionalLinks?.map((link: any, index: number) => (
                  <div key={index} className="grid grid-cols-3 gap-4 mb-4 p-4 border border-gray-200 rounded-md">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Nhãn</label>
                      <input
                        type="text"
                        value={link.label || ''}
                        onChange={(e) => handleAdditionalLinkChange(index, 'label', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Trang chủ chính thức"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">URL</label>
                      <input
                        type="url"
                        value={link.url || ''}
                        onChange={(e) => handleAdditionalLinkChange(index, 'url', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="https://example.com"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeAdditionalLink(index)}
                        className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 w-full"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Phần tùy chỉnh</h3>
                <button
                  type="button"
                  onClick={addCustomSection}
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
                >
                  Thêm phần
                </button>
              </div>

              {formData.customSections?.map((section: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tiêu đề phần</label>
                      <input
                        type="text"
                        value={section.title || ''}
                        onChange={(e) => handleCustomSectionChange(index, 'title', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Về chúng tôi"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeCustomSection(index)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        Xóa phần
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-1">Nội dung</label>
                    <textarea
                      value={section.content || ''}
                      onChange={(e) => handleCustomSectionChange(index, 'content', e.target.value)}
                      rows={3}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Mô tả về phần này..."
                    />
                  </div>
                </div>
              ))}

              {(!formData.customSections || formData.customSections.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <p>Chưa có phần tùy chỉnh nào. Thêm phần để mở rộng footer.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FooterEditor;
