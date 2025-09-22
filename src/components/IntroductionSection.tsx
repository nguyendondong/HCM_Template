import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Globe, BookOpen, Play } from 'lucide-react';
import { Volume2, VolumeX } from 'lucide-react';
import { getFileDownloadURL } from '../services/storageService';

const IntroductionSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string>('');

  // Lấy URL video từ Firebase Storage
  useEffect(() => {
    getFileDownloadURL('Video/testvideo.mp4')
      .then(url => {
        console.log('Video URL loaded:', url);
        setVideoUrl(url);
      })
      .catch(err => {
        console.error('Không lấy được video URL:', err);
        setVideoUrl('');
      });
  }, []);

  // Auto-play và auto-unmute khi section visible, auto-pause và mute khi ra khỏi viewport
  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;

    if (!video || !section) return;

    let lastVisible = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!lastVisible) {
              // Section vừa vào viewport: luôn cố gắng play, nếu bị chặn thì bật mute để đảm bảo play
              const tryPlay = () => {
                video.play().then(() => {
                  // Nếu play thành công, thử bật tiếng
                  video.muted = false;
                  setIsMuted(false);
                }).catch(() => {
                  // Nếu autoplay bị chặn, bật mute để play được
                  video.muted = true;
                  setIsMuted(true);
                  video.play().catch(() => {});
                });
              };
              tryPlay();
              lastVisible = true;
            }
          } else {
            if (lastVisible) {
              // Section vừa ra khỏi viewport: tắt tiếng và pause
              video.muted = true;
              setIsMuted(true);
              if (!video.paused) {
                video.pause();
              }
              lastVisible = false;
            }
          }
        });
      },
      {
        threshold: 0.3, // Trigger khi 30% section visible
        rootMargin: '-50px' // Offset 50px từ viewport
      }
    );

    observer.observe(section);

    // Event listener cho navbar click (giữ nguyên logic mute/unmute)
    const handleNavbarIntroClick = () => {
      setTimeout(() => {
        const video = videoRef.current;
        if (!video) return;
        video.play().then(() => {
          video.muted = false;
          setIsMuted(false);
        }).catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
        });
      }, 800);
    };

    window.addEventListener('introductionNavClick', handleNavbarIntroClick);

    return () => {
      observer.disconnect();
      window.removeEventListener('introductionNavClick', handleNavbarIntroClick);
    };
  }, [videoUrl]);

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(m => !m);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const features = [
    {
      icon: Heart,
      title: 'Tình yêu quê hương',
      description: 'Khám phá tình yêu sâu sắc của Bác Hồ dành cho đất nước và nhân dân Việt Nam'
    },
    {
      icon: Globe,
      title: 'Tầm nhìn toàn cầu',
      description: 'Tìm hiểu về hành trình quốc tế và tầm nhìn của Người về độc lập dân tộc'
    },
    {
      icon: BookOpen,
      title: 'Di sản tư tưởng',
      description: 'Nghiên cứu những tư tưởng và lý tưởng cao đẹp của Chủ tịch Hồ Chí Minh'
    }
  ];

  return (
    <section ref={sectionRef} id="introduction" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Giới thiệu về Chủ tịch Hồ Chí Minh
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Người anh hùng dân tộc vĩ đại, lãnh tụ thiên tài của cách mạng Việt Nam,
            suốt cuộc đời đã cống hiến hết mình cho sự nghiệp giải phóng dân tộc và hạnh phúc của nhân dân.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-lg group cursor-pointer" onClick={handleVideoClick}>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted={isMuted}
                loop
                playsInline
                preload="metadata"
              >
                {videoUrl && (
                  <source src={videoUrl} type="video/mp4" />
                )}
                <p className="text-gray-600 text-center p-8">
                  Trình duyệt của bạn không hỗ trợ phát video.
                </p>
              </video>

              {/* Nút bật/tắt âm thanh */}
              <button
                className="absolute top-4 right-4 bg-white/80 rounded-full p-2 shadow z-20 hover:bg-white"
                onClick={handleToggleMute}
                tabIndex={0}
                aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              >
                {isMuted ? <VolumeX className="w-6 h-6 text-gray-800" /> : <Volume2 className="w-6 h-6 text-gray-800" />}
              </button>

              {/* Play button overlay khi video pause */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-white/90 rounded-full p-4 shadow-lg">
                  <Play className="w-8 h-8 text-gray-800 ml-1" fill="currentColor" />
                </div>
              </div>

              {/* Overlay gradient nhẹ */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none"></div>

              {/* Video title overlay */}
              {/* <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                  <p className="text-white text-sm font-medium">
                    Video giới thiệu về Chủ tịch Hồ Chí Minh
                  </p>
                </div>
              </div> */}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h3 className="text-3xl font-bold text-gray-900">
              Cuộc đời và sự nghiệp
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Sinh ngày 19 tháng 5 năm 1890 tại làng Sen, xã Kim Liên, huyện Nam Đàn, tỉnh Nghệ An.
              Chủ tịch Hồ Chí Minh là biểu tượng của tinh thần bất khuất, ý chí kiên cường và tình yêu
              vô bờ bến dành cho Tổ quốc.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Từ chàng thanh niên Nguyễn Tất Thành ra đi tìm đường cứu nước, đến vị lãnh tụ vĩ đại
              dẫn dắt dân tộc Việt Nam giành độc lập, thống nhất đất nước.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="text-center p-8 bg-gray-50 rounded-2xl hover:bg-red-50 transition-colors duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <feature.icon className="w-8 h-8 text-red-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h4>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntroductionSection;
