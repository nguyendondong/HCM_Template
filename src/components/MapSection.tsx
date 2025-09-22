import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { enhancedHeritageService } from '../services/enhancedHeritageService';
import { HeritageSpot } from '../types/heritage';

// Export function để scroll đến Hà Nội cho Navbar
export const scrollToHanoi = () => {
  // Scroll đến section trước
  const mapSection = document.getElementById('map-section');
  if (mapSection) {
    // Delay ngắn để đảm bảo section đã render
    setTimeout(() => {
      // Cần tham chiếu dynamic heritage spots từ component state
      // Hiện tại sẽ fallback đến static behavior, sau này có thể cải thiện
      mapSection.scrollIntoView({ behavior: 'smooth' });

      // Trigger Hà Nội selection sau khi scroll
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('selectHanoi'));
      }, 800);
    }, 100); // Delay ngắn để DOM ready
  }
};

const MapSection: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const spotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [lineProgress, setLineProgress] = useState(0);
  const [showLine, setShowLine] = useState(false);
  const [isHoveringSpot, setIsHoveringSpot] = useState(false);
  const [isHoveringPopup, setIsHoveringPopup] = useState(false);
  const [clickedSpotId, setClickedSpotId] = useState<string | null>(null); // Track spot đã click
  const [isNavbarTriggered, setIsNavbarTriggered] = useState(false); // Track khi được trigger từ navbar
  const [lastScrollY, setLastScrollY] = useState(0); // Track scroll position
  const [heritageSpots, setHeritageSpots] = useState<HeritageSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load heritage spots từ service
  useEffect(() => {
    const loadHeritageSpots = async () => {
      try {
        console.log('Loading heritage spots from service...');
        const spots = await enhancedHeritageService.getAllHeritageSpots();
        console.log('Loaded heritage spots:', spots);
        setHeritageSpots(spots);
      } catch (error) {
        console.error('Error loading heritage spots:', error);
        // Fallback: có thể load từ static data hoặc hiển thị thông báo lỗi
        setHeritageSpots([]);
      } finally {
        setLoading(false);
      }
    };

    loadHeritageSpots();
  }, []);

  // Handle click vào spot - Ưu tiên cao nhất
  const handleSpotClick = (e: React.MouseEvent, spotId: string) => {
    e.stopPropagation();
    console.log('Spot clicked:', spotId);
    setIsNavbarTriggered(false);
    setClickedSpotId(spotId); // Đánh dấu spot được click
    setSelectedSpotId(spotId);
    setShowLine(true);
    setLastScrollY(window.scrollY); // Set current scroll position
  };

  // Handle hover vào spot - Chỉ hiển thị khi chưa có spot được click
  const handleSpotHover = (spotId: string) => {
    if (!clickedSpotId) { // Chỉ hover khi chưa có spot được click
      console.log('Hovering spot:', spotId);
      setIsHoveringSpot(true);
      setSelectedSpotId(spotId);
      setShowLine(true);
    }
  };

  // Handle hover ra khỏi spot
  const handleSpotLeave = () => {
    if (!clickedSpotId) { // Chỉ xử lý khi chưa có spot được click
      console.log('Left hover');
      setIsHoveringSpot(false);
      setSelectedSpotId(null);
      setShowLine(false);
    }
  };

  // Handle hover vào popup
  const handlePopupMouseEnter = () => {
    setIsHoveringPopup(true);
  };

  // Handle hover ra khỏi popup
  const handlePopupMouseLeave = () => {
    setIsHoveringPopup(false);
    // Nếu không có spot được click, thì clear selection
    if (!clickedSpotId) {
      setSelectedSpotId(null);
      setShowLine(false);
    }
  };

  // Handle click ra ngoài để reset clicked spot
  const handleClickOutside = (e: React.MouseEvent) => {
    // Kiểm tra xem click có phải vào spot, popup, hoặc button không
    const target = e.target as HTMLElement;
    const isSpotClick = target.closest('[data-spot-id]');
    const isPopupClick = target.closest('[data-popup]');
    const isButtonClick = target.tagName === 'BUTTON' || target.closest('button');
    const isLinkClick = target.tagName === 'A' || target.closest('a');

    console.log('Click detected:', {
      target: target.tagName,
      isSpotClick: !!isSpotClick,
      isPopupClick: !!isPopupClick,
      isButtonClick: !!isButtonClick,
      isLinkClick: !!isLinkClick,
      clickedSpotId
    });

    // Nếu click vào spot, popup, button hoặc link thì không reset
    if (isSpotClick || isPopupClick || isButtonClick || isLinkClick) {
      console.log('Click ignored - target is interactive element');
      return;
    }

    console.log('Clicked outside, resetting clicked spot');
    setClickedSpotId(null); // Reset clicked spot priority
    setIsNavbarTriggered(false);
    setIsHoveringSpot(false);
    setIsHoveringPopup(false);
    // Trigger auto-selection ngay lập tức
    setTimeout(() => {
      handleScroll();
    }, 50);
  };

  // Scroll detection - Reset ưu tiên khi scroll và auto-select spot gần nhất
  const handleScroll = useCallback(() => {
    if (!sectionRef.current) return;

    // Kiểm tra xem MapSection có đang trong viewport không
    const sectionRect = sectionRef.current.getBoundingClientRect();
    const isMapSectionVisible = sectionRect.top < window.innerHeight && sectionRect.bottom > 0;

    // Nếu MapSection không trong viewport, clear selection
    if (!isMapSectionVisible) {
      if (selectedSpotId && !isNavbarTriggered) {
        console.log('MapSection not in viewport, clearing popup');
        setSelectedSpotId(null);
        setShowLine(false);
        setClickedSpotId(null);
        setIsHoveringSpot(false);
        setIsHoveringPopup(false);
      }
      return;
    }

    // Không reset clicked spot khi scroll - chỉ reset khi click outside
    // Auto-update scroll position để theo dõi
    const currentScrollY = window.scrollY;
    setLastScrollY(currentScrollY);

    // Xử lý scroll detection để auto-select spot gần nhất (chỉ khi không có clicked spot priority hoặc hover popup)
    if (!isHoveringPopup && !clickedSpotId) {
      let foundId: string | null = null;
      let minDistance = Infinity;
      const viewportCenter = window.innerHeight / 2;

      heritageSpots.forEach((spot, idx) => {
        const ref = spotRefs.current[idx];
        if (ref) {
          const rect = ref.getBoundingClientRect();
          const spotCenter = rect.top + rect.height / 2;

          // Kiểm tra spot có trong viewport không
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            const distance = Math.abs(spotCenter - viewportCenter);

            if (distance < minDistance) {
              minDistance = distance;
              foundId = spot.id;
            }
          }
        }
      });

      // Auto-select spot gần nhất khi scroll
      if (foundId && !isHoveringSpot) {
        const foundSpotIndex = heritageSpots.findIndex(s => s.id === foundId);
        const foundSpotRef = spotRefs.current[foundSpotIndex];

        if (foundSpotRef) {
          const rect = foundSpotRef.getBoundingClientRect();
          const spotCenterY = rect.top + rect.height / 2;
          const distanceFromSpotY = Math.abs(spotCenterY - viewportCenter);

          // Chỉ auto-select nếu viewport center trong vùng ±30px của spot Y
          if (distanceFromSpotY <= 30) {
            if (foundId !== selectedSpotId) {
              console.log('Auto-selecting spot via scroll:', foundId);
              setSelectedSpotId(foundId);
              setShowLine(true);
            }
          } else {
            // Ngoài vùng ±30px - clear auto-selection
            if (selectedSpotId && !isHoveringSpot) {
              console.log('Outside Y range, clearing auto-selection');
              setSelectedSpotId(null);
              setShowLine(false);
            }
          }
        }
      } else if (!foundId && !isHoveringSpot) {
        // Không có spot nào trong viewport - clear auto-selection
        if (selectedSpotId) {
          console.log('No spot in viewport, clearing auto-selection');
          setSelectedSpotId(null);
          setShowLine(false);
        }
      }
    }
  }, [clickedSpotId, isHoveringSpot, isHoveringPopup, selectedSpotId, isNavbarTriggered, lastScrollY]);

  // Scroll event listener và document click listener
  useEffect(() => {
    // Khởi tạo scroll position
    setLastScrollY(window.scrollY);

    let ticking = false;

    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Document click listener để detect click outside
    const handleDocumentClick = (e: MouseEvent) => {
      if (!sectionRef.current) return;

      const target = e.target as HTMLElement;
      const isClickInSection = sectionRef.current.contains(target);
      const isSpotClick = target.closest('[data-spot-id]');
      const isPopupClick = target.closest('[data-popup]');
      const isButtonClick = target.tagName === 'BUTTON' || target.closest('button');
      const isLinkClick = target.tagName === 'A' || target.closest('a');

      // Nếu click outside section hoặc click trong section nhưng không phải interactive elements
      if (!isClickInSection || (!isSpotClick && !isPopupClick && !isButtonClick && !isLinkClick)) {
        if (clickedSpotId) {
          console.log('Document click - resetting clicked spot');
          setClickedSpotId(null);
          setIsNavbarTriggered(false);
          setIsHoveringSpot(false);
          setIsHoveringPopup(false);
          setTimeout(() => {
            handleScroll();
          }, 50);
        }
      }
    };    // Event listener cho việc select Hà Nội từ navbar
    const handleSelectHanoi = () => {
      console.log('Selecting Hanoi from navbar');

      // Kiểm tra MapSection có visible không trước khi set state
      if (sectionRef.current) {
        const sectionRect = sectionRef.current.getBoundingClientRect();
        const isMapSectionVisible = sectionRect.top < window.innerHeight && sectionRect.bottom > 0;

        if (isMapSectionVisible) {
          setIsNavbarTriggered(true);
          setClickedSpotId('ha-noi-complex');
          setSelectedSpotId('ha-noi-complex');
          setShowLine(true);
          setIsHoveringSpot(false);
          setIsHoveringPopup(false);

          // Làm chậm animation để dễ theo dõi
          setTimeout(() => {
            setLineProgress(0);
            setTimeout(() => setLineProgress(1), 200);
          }, 200);

          // Tự động reset navbar trigger sau 1 giây để cho phép scroll detection
          setTimeout(() => {
            console.log('Auto-resetting navbar trigger to allow scroll detection');
            setIsNavbarTriggered(false);
          }, 1000);
        }
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('selectHanoi', handleSelectHanoi);
    document.addEventListener('click', handleDocumentClick);
    handleScroll(); // Gọi lần đầu khi mount

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('selectHanoi', handleSelectHanoi);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [handleScroll]);

  // Gọi handleScroll khi hover states thay đổi
  useEffect(() => {
    if (!isHoveringSpot && !isHoveringPopup) {
      handleScroll();
    }
  }, [isHoveringSpot, isHoveringPopup, handleScroll]);

  useEffect(() => {
    setLineProgress(0);
    if (selectedSpotId) { // Bỏ điều kiện showLine
      // Tăng delay để popup hiển thị chậm hơn, dễ theo dõi
      const timeout = setTimeout(() => setLineProgress(1), 300); // Tăng từ 10ms lên 300ms
      return () => clearTimeout(timeout);
    }
  }, [selectedSpotId]); // Chỉ theo dõi selectedSpotId

  // Debug effect
  useEffect(() => {
  }, [selectedSpotId, showLine, isHoveringSpot, isHoveringPopup, clickedSpotId]);

  return (
    <section
      ref={sectionRef}
      id="map-section"
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-20"
      onClick={(e) => handleClickOutside(e)}
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Hành trình cách mạng
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Theo dõi hành trình lịch sử qua các di tích quan trọng nhất của Việt Nam,
            mỗi nơi đều ghi dấu một khoảnh khắc quan trọng trong cuộc đời phi thường của Bác Hồ.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <span className="ml-4 text-gray-600">Đang tải di tích...</span>
          </div>
        ) : heritageSpots.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600">Không có dữ liệu di tích. Vui lòng kiểm tra kết nối Firebase.</p>
          </div>
        ) : (
          <div className="relative">
          {/* Vietnam Map Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-lg lg:max-w-2xl mb-20"
          >
            <motion.div
              ref={mapRef}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/f/ff/Vietnam_Full_flag_map.svg"
                alt="Vietnam Map"
                className="w-full h-auto drop-shadow-2xl"
              />

              {/* Heritage spots positioned absolutely on top of the map */}
              <div className="absolute inset-0 pointer-events-none">
                {heritageSpots.map((spot, index) => {
                  // Use coordinates if available, otherwise fall back to mapPosition
                  const posX = spot.coordinates?.x ?? spot.mapPosition?.x ?? 0;
                  const posY = spot.coordinates?.y ?? spot.mapPosition?.y ?? 0;

                  return (
                    <motion.div
                      key={spot.id}
                      ref={el => spotRefs.current[index] = el}
                      data-spot-id={spot.id}
                      transition={{ duration: 0.5, delay: index * 0.2 }}
                      className={`absolute w-6 h-6 rounded-full border-2 border-white shadow-lg transition-all duration-200 z-10 pointer-events-auto cursor-pointer ${
                        selectedSpotId === spot.id && clickedSpotId === spot.id
                          ? 'bg-red-500 scale-125 animate-none ring-2 ring-red-300'
                          : selectedSpotId === spot.id && isHoveringSpot
                          ? 'bg-orange-400 scale-115 animate-none'
                          : selectedSpotId === spot.id
                          ? 'bg-yellow-400 scale-110 animate-pulse'
                          : 'bg-yellow-400 hover:scale-110 animate-pulse hover:animate-none'
                      }`}
                      style={{
                        left: `${posX}%`,
                        top: `${posY}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      onClick={(e) => handleSpotClick(e, spot.id)}
                      onMouseEnter={() => handleSpotHover(spot.id)}
                      onMouseLeave={handleSpotLeave}
                    />
                  );
                })}
              </div>
              {/* Popup hiển thị cho tất cả trạng thái (scroll/hover/click) - CHỈ KHI MapSection visible */}
              {selectedSpotId && sectionRef.current && (() => {
                // Kiểm tra MapSection có trong viewport không
                const sectionRect = sectionRef.current.getBoundingClientRect();
                const isMapSectionVisible = sectionRect.top < window.innerHeight && sectionRect.bottom > 0;

                // Chỉ hiển thị popup khi MapSection đang visible
                if (!isMapSectionVisible) return null;

                const spot = heritageSpots.find(s => s.id === selectedSpotId);
                if (!spot || !mapRef.current) return null;

                const mapRect = mapRef.current.getBoundingClientRect();
                const popupWidth = 380;
                const popupHeight = 180;
                // Use coordinates if available, otherwise fall back to mapPosition
                const posX = spot.coordinates?.x ?? spot.mapPosition?.x ?? 0;
                const posY = spot.coordinates?.y ?? spot.mapPosition?.y ?? 0;

                const spotY = mapRect.top + (mapRect.height * posY / 100);
                const popupLeft = spot.side === 'left'
                  ? mapRect.left - popupWidth - 32
                  : mapRect.right + 32;
                const popupTop = spotY - popupHeight / 2;

                // Tính toạ độ center của spot
                const dotCenter = {
                  x: mapRect.left + mapRect.width * posX / 100,
                  y: mapRect.top + mapRect.height * posY / 100
                };

                // Tính điểm đầu (spot) và điểm cuối (popup) cho line
                const lineStart = dotCenter;
                const lineEnd = {
                  x: spot.side === 'left' ? popupLeft + popupWidth : popupLeft,
                  y: popupTop + popupHeight / 2
                };

                // Animate line từ spot (chấm tròn) ra popup
                const animatedX2 = lineStart.x + (lineEnd.x - lineStart.x) * lineProgress;
                const animatedY2 = lineStart.y + (lineEnd.y - lineStart.y) * lineProgress;

                return (
                  <>
                    {/* Line luôn hiển thị khi có popup */}
                    {selectedSpotId && (
                      <svg
                        style={{
                          position: 'fixed',
                          left: 0,
                          top: 0,
                          pointerEvents: 'none',
                          zIndex: 49
                        }}
                        width={window.innerWidth}
                        height={window.innerHeight}
                      >
                        <motion.line
                          x1={lineStart.x}
                          y1={lineStart.y}
                          x2={animatedX2}
                          y2={animatedY2}
                          stroke="#facc15"
                          strokeWidth={3}
                          strokeDasharray="6 4"
                          initial={false}
                          animate={false}
                        />
                      </svg>
                    )}

                    {/* Popup luôn hiển thị khi có selectedSpotId */}
                    <motion.div
                      data-popup="true"
                      initial={{ opacity: 0, x: spot.side === 'left' ? -60 : 60 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: spot.side === 'left' ? -60 : 60 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      style={{
                        position: 'fixed',
                        left: popupLeft,
                        top: popupTop,
                        width: popupWidth,
                        zIndex: 50,
                        pointerEvents: 'auto',
                      }}
                      onMouseEnter={handlePopupMouseEnter}
                      onMouseLeave={handlePopupMouseLeave}
                    >
                      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 relative">
                        <div className="flex flex-col h-full">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{spot.name}</h3>
                          <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
                            {spot.description}
                          </p>
                          <div className="flex justify-between space-x-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/heritage/${spot.id}`);
                              }}
                              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                            >
                              Xem chi tiết
                            </button>
                            {spot.url && (
                              <a
                                href={spot.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-medium rounded-lg transition-colors duration-200"
                              >
                                Website
                                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Arrow pointer từ popup về spot */}
                        <div
                          className={`absolute top-1/2 transform -translate-y-1/2 w-0 h-0 ${
                            spot.side === 'left'
                              ? 'right-0 translate-x-full border-l-8 border-l-white border-t-8 border-b-8 border-t-transparent border-b-transparent'
                              : 'left-0 -translate-x-full border-r-8 border-r-white border-t-8 border-b-8 border-t-transparent border-b-transparent'
                          }`}
                        />
                      </div>
                    </motion.div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MapSection;
