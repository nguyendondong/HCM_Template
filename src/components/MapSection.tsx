import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import HeritageSpot from './HeritageSpot';
import { heritageSpots } from '../data/heritageSpots';

const MapSection: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const spotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [lineProgress, setLineProgress] = useState(0);

  // Theo dõi từng spot khi vào viewport
  useEffect(() => {
    const handleScroll = () => {
      // Kiểm tra nếu phần giữa của MapSection không còn trong viewport thì ẩn popup
      if (sectionRef.current) {
        const sectionRect = sectionRef.current.getBoundingClientRect();
        const sectionMiddle = sectionRect.top + sectionRect.height / 2;
        if (sectionMiddle < 0 || sectionMiddle > window.innerHeight) {
          setSelectedSpotId(null);
          return;
        }
      }
      let foundId: string | null = null;
      let minDistance = Infinity;
      const viewportCenter = window.innerHeight / 2;
      heritageSpots.forEach((spot, idx) => {
        const ref = spotRefs.current[idx];
        if (ref) {
          const rect = ref.getBoundingClientRect();
          const spotCenter = rect.top + rect.height / 2;
          // Kiểm tra nếu spot nằm trong viewport
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            const distance = Math.abs(spotCenter - viewportCenter);
            if (distance < minDistance) {
              minDistance = distance;
              foundId = spot.id;
            }
          }
        }
      });
      setSelectedSpotId(foundId); // Luôn set, nếu không có dot nào thì set null
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Gọi lần đầu khi mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setLineProgress(0);
    if (selectedSpotId) {
      const timeout = setTimeout(() => setLineProgress(1), 30);
      return () => clearTimeout(timeout);
    }
  }, [selectedSpotId]);

  return (
    <section ref={sectionRef} id="map-section" className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            The Revolutionary Path
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Follow the historic journey through Vietnam's most significant heritage sites,
            each marking a pivotal moment in Uncle Ho's extraordinary life.
          </p>
        </motion.div>

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
                {heritageSpots.map((spot, index) => (
                  <motion.div
                    key={spot.id}
                    ref={el => spotRefs.current[index] = el}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className="absolute w-6 h-6 bg-yellow-400 rounded-full border-2 border-white shadow-lg animate-pulse z-10 pointer-events-auto"
                    style={{
                      left: `${spot.coordinates.x}%`,
                      top: `${spot.coordinates.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                ))}
              </div>
              {/* Popup mô tả nằm cố định ngoài map, hiệu ứng slide-x, vẽ line từ chấm đến popup */}
              {selectedSpotId && (() => {
                const spot = heritageSpots.find(s => s.id === selectedSpotId);
                if (!spot || !mapRef.current) return null;
                const mapRect = mapRef.current.getBoundingClientRect();
                const popupWidth = 380;
                const popupHeight = 180;
                const spotX = mapRect.left + (mapRect.width * spot.coordinates.x / 100);
                const spotY = mapRect.top + (mapRect.height * spot.coordinates.y / 100);
                const popupLeft = spot.side === 'left'
                  ? mapRect.left - popupWidth - 32
                  : mapRect.right + 32;
                const popupTop = spotY - popupHeight / 2;
                // Lấy chính xác vị trí DOM của dot
                // Tính lại dotCenter dựa trên phần trăm toạ độ spot và map container
                const dotCenter = {
                  x: mapRect.left + mapRect.width * spot.coordinates.x / 100,
                  y: mapRect.top + mapRect.height * spot.coordinates.y / 100
                };
                // Tính điểm đầu/cuối cho line
                const lineStart = dotCenter;
                const lineEnd = {
                  x: spot.side === 'left' ? popupLeft + popupWidth : popupLeft,
                  y: popupTop + popupHeight / 2
                };
                // Animate line từ chấm ra popup
                const animatedX2 = lineStart.x + (lineEnd.x - lineStart.x) * lineProgress;
                const animatedY2 = lineStart.y + (lineEnd.y - lineStart.y) * lineProgress;
                return (
                  <>
                    {/* Line nối từ chấm đến popup, animate từ chấm ra ngoài */}
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
                        markerEnd="url(#dot)"
                        initial={false}
                        animate={false}
                      />
                      <defs>
                        <marker id="dot" markerWidth="8" markerHeight="8" refX="4" refY="4">
                          <circle cx="4" cy="4" r="4" fill="#facc15" />
                        </marker>
                      </defs>
                    </svg>
                    <motion.div
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
                    >
                      <HeritageSpot spot={spot} mapRef={mapRef} hideDot />
                    </motion.div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
