import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Globe, Clock, Heart, Users, Eye } from 'lucide-react';
import { HeritageSpot } from '../types/heritage';
import { heritageSpots } from '../data/heritageSpots';

const HeritageDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [spot, setSpot] = useState<HeritageSpot | null>(null);

  useEffect(() => {
    if (id) {
      const foundSpot = heritageSpots.find(s => s.id === id);
      setSpot(foundSpot || null);
    }
  }, [id]);

  const handleBackToHome = () => {
    // Store the target section (journey for heritage spots)
    sessionStorage.setItem('targetSection', 'journey');
    navigate('/');
  };

  if (!spot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy di tích</h2>
          <button
            onClick={handleBackToHome}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            ← Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const additionalInfo = {
    'kim-lien': {
      fullName: 'Khu di tích quốc gia đặc biệt Kim Liên',
      established: '19/5/1890',
      area: '108 hecta',
      significance: 'Quê hương và nơi sinh của Chủ tịch Hồ Chí Minh',
      highlights: [
        'Nhà sinh Nguyễn Sinh Cung (Hồ Chí Minh)',
        'Đình Hoàng Trù - nơi Bác thường lui tới',
        'Đền thờ Nguyễn Sinh Sắc (cha của Bác)',
        'Ao cá Bác Hồ - nơi Bác thường câu cá tuổi thơ',
        'Bảo tàng Hồ Chí Minh tại Kim Liên'
      ],
      historicalEvents: [
        'Ngày 19/5/1890: Nguyễn Sinh Cung (Hồ Chí Minh) sinh ra tại đây',
        'Năm 1895-1901: Bác sống và học tại quê nhà Kim Liên',
        'Năm 1906: Bác rời quê hương để đi học tại Huế',
        'Năm 1958: Bác về thăm quê hương lần cuối'
      ],
      gallery: [
        'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1570197505883-b80dfc0e8d1a?w=600&h=400&fit=crop'
      ]
    },
    'ha-noi-complex': {
      fullName: 'Khu di tích Chủ tịch Hồ Chí Minh tại Hà Nội',
      established: '2/9/1945',
      area: '84 hecta',
      significance: 'Nơi Chủ tịch Hồ Chí Minh sống và làm việc, đọc Tuyên ngôn độc lập',
      highlights: [
        'Lăng Chủ tịch Hồ Chí Minh',
        'Nhà sàn Bác Hồ',
        'Bảo tàng Hồ Chí Minh',
        'Phủ Chủ tịch',
        'Công viên Lê Nin'
      ],
      historicalEvents: [
        'Ngày 2/9/1945: Bác Hồ đọc Tuyên ngôn độc lập tại Quảng trường Ba Đình',
        'Năm 1945-1954: Nơi Bác sống và làm việc trong thời kỳ kháng chiến',
        'Năm 1954-1969: Bác tiếp tục sinh hoạt và làm việc tại đây',
        'Ngày 2/9/1969: Bác Hồ qua đời tại Nhà 67'
      ],
      gallery: [
        'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1570197505883-b80dfc0e8d1a?w=600&h=400&fit=crop'
      ]
    }
  };

  const currentSpotInfo = additionalInfo[spot.id as keyof typeof additionalInfo] || {
    fullName: spot.name,
    established: 'Chưa xác định',
    area: 'Chưa xác định',
    significance: spot.description,
    highlights: ['Đang cập nhật thông tin'],
    historicalEvents: ['Đang cập nhật thông tin'],
    gallery: [
      'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop'
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header với gradient background */}
      <div className="relative bg-gradient-to-r from-red-800 to-red-900 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <button
              onClick={handleBackToHome}
              className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Quay về trang chủ
            </button>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {currentSpotInfo.fullName}
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl">
              {currentSpotInfo.significance}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tổng quan</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {spot.description}
              </p>
            </motion.section>

            {/* Historical Events */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-red-600" />
                Dòng thời gian lịch sử
              </h2>
              <div className="space-y-4">
                {currentSpotInfo.historicalEvents.map((event, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">{event}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Highlights */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Eye className="w-6 h-6 mr-3 text-red-600" />
                Điểm nổi bật
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentSpotInfo.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Heart className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Gallery */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Thư viện ảnh</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentSpotInfo.gallery.map((image, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="aspect-square rounded-xl overflow-hidden shadow-md"
                  >
                    <img
                      src={image}
                      alt={`${spot.name} - Ảnh ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Quick Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin cơ bản</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-500">Thành lập</p>
                      <p className="font-medium text-gray-900">{currentSpotInfo.established}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-500">Diện tích</p>
                      <p className="font-medium text-gray-900">{currentSpotInfo.area}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-500">Lượt tham quan</p>
                      <p className="font-medium text-gray-900">Hàng triệu lượt</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* External Link */}
              {spot.url && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white rounded-2xl p-6 shadow-lg"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Tham quan trực tuyến</h3>
                  <a
                    href={spot.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                  >
                    <Globe className="w-5 h-5" />
                    <span>Truy cập website</span>
                  </a>
                </motion.div>
              )}

              {/* Visit Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin tham quan</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">7:30 - 17:30 (hàng ngày)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Miễn phí tham quan</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Có hướng dẫn viên</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeritageDetailsPage;
