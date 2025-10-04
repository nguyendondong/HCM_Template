import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Glasses, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Info, Loader2 } from 'lucide-react';
import { vrContentService, ExtendedVRExperience } from '../services/vrContentService';

const VRExperiencePage: React.FC = () => {
  const { id: routeId } = useParams<{ id: string }>();
  // State management
  const [selectedExperience, setSelectedExperience] = useState<string | null>(routeId || null);
  const [vrExperiences, setVrExperiences] = useState<ExtendedVRExperience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Video control states
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load VR experiences from Firestore
  useEffect(() => {
    loadVRExperiences();
  }, []);

      const loadVRExperiences = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const experiences = await vrContentService.getVRExperiences();
        setVrExperiences(experiences);
      } catch (err) {
        console.error('Error loading VR experiences:', err);
        setError('Không thể tải danh sách trải nghiệm VR. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

  // Update selected experience when route changes
  useEffect(() => {
    if (routeId) {
      setSelectedExperience(routeId);
    } else {
      setSelectedExperience(null);
    }
  }, [routeId]);

  // Video controls
  // useEffect(() => {
  //   const video = videoRef.current;
  //   if (!video) return;

  //   const handleTimeUpdate = () => setCurrentTime(video.currentTime);
  //   const handleLoadedMetadata = () => setDuration(video.duration);
  //   const handlePlay = () => setIsPlaying(true);
  //   const handlePause = () => setIsPlaying(false);

  //   video.addEventListener('timeupdate', handleTimeUpdate);
  //   video.addEventListener('loadedmetadata', handleLoadedMetadata);
  //   video.addEventListener('play', handlePlay);
  //   video.addEventListener('pause', handlePause);

  //   return () => {
  //     video.removeEventListener('timeupdate', handleTimeUpdate);
  //     video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  //     video.removeEventListener('play', handlePlay);
  //     video.removeEventListener('pause', handlePause);
  //   };
  // }, [selectedExperience]);

  function handleVRCategory(category: string) {
    switch (category) {
      case 'heritage_site':
        return "Di sản lịch sử ";
        break;
      case 'historical_site':
        return "Di tích lịch sử";
        break;
      case 'historical_moment':
        return "Tài liệu lịch sử";
        break;
      case 'daily_life':
        return "Cuộc sống hàng ngày";
        break;
      case 'historical_journey':
        return "Hành trình lịch sử";
        break;
      case 'revolutionary_base':
        return "Cơ sở cách mạng";
        break;
      default:
        return category
        break;
    }
  }

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    setIsMuted(!isMuted);
    video.muted = !isMuted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const restartExperience = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    setCurrentTime(0);
    video.play();
  };

  const getCurrentExperience = () => {
    return vrExperiences.find(exp => exp.id === selectedExperience);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Đang tải trải nghiệm VR...</h3>
          <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (selectedExperience) {
    const experience = getCurrentExperience();
    if (!experience) return null;

    return (
      <div className="min-h-screen bg-black">
        {/* VR Experience Player */}
        <div className="relative w-full h-screen">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            src={experience.videoSrc || experience.vrUrl || '/src/data/video/9018C0AF-BD7B-470D-9E38-33900630D830.mp4'}
            preload="metadata"
          />

          {/* Video Controls Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20">

            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 pt-20 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex items-center justify-between">
                <div></div> {/* Empty space to balance the layout */}

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-white">
                    <Glasses className="w-5 h-5" />
                    <span className="text-sm">VR Mode</span>
                  </div>
                  <button className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors duration-200">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white mb-2">{experience.title}</h3>
                  <p className="text-gray-300">{experience.description}</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={duration ? (currentTime / duration) * 100 : 0}
                    onChange={handleSeek}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={togglePlay}
                      className="flex items-center justify-center w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors duration-200"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                    </button>

                    <button
                      onClick={restartExperience}
                      className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors duration-200"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Volume Control */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={toggleMute}
                        className="p-2 text-white hover:text-yellow-400 transition-colors duration-200"
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <button className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors duration-200">
                      <Maximize className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 to-purple-900 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Trải nghiệm VR
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl">
              Hãy đắm chìm trong lịch sử thông qua công nghệ thực tế ảo tiên tiến,
              trải nghiệm những khoảnh khắc lịch sử như đang thực sự có mặt tại đó.
            </p>
          </motion.div>
        </div>
      </div>

      {/* VR Experiences Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {vrExperiences.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <Glasses className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có trải nghiệm VR nào</h3>
            <p className="text-gray-600">Các trải nghiệm VR sẽ được cập nhật sớm.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vrExperiences.map((experience, index) => (
            <motion.div
              key={experience.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="relative">
                <img
                  src={experience.image || 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600&h=400&fit=crop'}
                  alt={experience.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                  <Glasses className="w-3 h-3" />
                  <span>VR</span>
                </div>
                <div className="absolute top-4 left-4 bg-black/60 text-white px-2 py-1 rounded text-xs">
                  {experience.duration || '20-25 phút'}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
                    {handleVRCategory(experience.category) || 'Trải nghiệm VR'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    experience.difficulty === 'Dễ' ? 'bg-green-100 text-green-700' :
                    experience.difficulty === 'Trung bình' || experience.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {experience.difficulty || 'Trung bình'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{experience.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{experience.description}</p>

                <div className="space-y-2 mb-6">
                  {experience.features && experience.features.length > 0 ? (
                    experience.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">{feature}</span>
                      </div>
                    ))
                  ) : (
                    // Default features if none available
                    ['Trải nghiệm VR 360°', 'Chất lượng cao', 'Tương tác thực tế'].map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">{feature}</span>
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={() => {
                  const url = experience.vrUrl || experience.videoSrc;
                  if (url) {
                    window.open(url, '_blank');
                  } else {
                    setSelectedExperience(experience.id);
                  }
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium"
                >
                  <Play className="w-4 h-4" />
                  <span>Bắt đầu trải nghiệm</span>
                </button>
              </div>
            </motion.div>
          ))}
          </div>
        )}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 bg-white rounded-2xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Yêu cầu hệ thống</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Thiết bị VR</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Oculus Quest 2/3</li>
                <li>• HTC Vive</li>
                <li>• PlayStation VR</li>
                <li>• Hoặc smartphone + VR Box</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Kết nối Internet</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Tốc độ tối thiểu: 50 Mbps</li>
                <li>• Khuyến nghị: 100 Mbps+</li>
                <li>• Kết nối ổn định</li>
                <li>• Độ trễ thấp</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Không gian</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Diện tích: 2m x 2m</li>
                <li>• Không có vật cản</li>
                <li>• Ánh sáng vừa phải</li>
                <li>• Môi trường an toàn</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

export default VRExperiencePage;
