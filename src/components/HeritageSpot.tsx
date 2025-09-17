import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { HeritageSpot as HeritageSpotType } from '../types/heritage';

interface HeritageSpotProps {
  spot: HeritageSpotType;
  mapRef: React.RefObject<HTMLDivElement>;
  hideDot?: boolean;
}

const HeritageSpot: React.FC<HeritageSpotProps> = ({ spot, mapRef, hideDot }) => {
  const ref = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const controls = useAnimation();
  const lineControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        x: 0,
        transition: { duration: 0.8, ease: "easeOut" }
      });

      // Animate line drawing
      lineControls.start({
        scaleX: 1,
        transition: { duration: 1, delay: 0.3 }
      });
    }
  }, [isInView, controls, lineControls]);

  const getLinePosition = () => {
    if (!mapRef.current || !ref.current) return {};

    const mapRect = mapRef.current.getBoundingClientRect();
    const spotRect = ref.current.getBoundingClientRect();

    const mapCenterX = mapRect.left + (mapRect.width * spot.coordinates.x / 100);
    const mapCenterY = mapRect.top + (mapRect.height * spot.coordinates.y / 100);

    const spotCenterX = spotRect.left + spotRect.width / 2;
    const spotCenterY = spotRect.top + spotRect.height / 2;

    const angle = Math.atan2(spotCenterY - mapCenterY, spotCenterX - mapCenterX);
    const distance = Math.sqrt(
      Math.pow(spotCenterX - mapCenterX, 2) + Math.pow(spotCenterY - mapCenterY, 2)
    );

    return {
      left: `${spot.coordinates.x}%`,
      top: `${spot.coordinates.y}%`,
      width: `${distance}px`,
      transform: `rotate(${angle}rad)`,
      transformOrigin: '0 50%'
    };
  };

  return (
    <div ref={ref} className="relative z-10">
      {/* Animated connecting line */}
      <motion.div
        ref={lineRef}
        initial={{ scaleX: 0 }}
        animate={lineControls}
        // className="absolute h-0.5 bg-yellow-400 origin-left pointer-events-none"
        style={getLinePosition()}
      />

      {/* Map dot indicator */}
      {!hideDot && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="absolute w-4 h-4 bg-yellow-400 rounded-full border-2 border-white shadow-lg pointer-events-none"
          style={{
            left: `${spot.coordinates.x}%`,
            top: `${spot.coordinates.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}

      {/* Heritage spot content */}
      <motion.div
        initial={{
          opacity: 0,
          x: spot.side === 'left' ? -100 : 100
        }}
        animate={controls}
        className={`max-w-md bg-white rounded-2xl shadow-2xl p-6 border-l-4 border-yellow-400 ${
          spot.side === 'left'
            ? 'ml-0 lg:ml-12'
            : 'ml-auto lg:mr-12'
        }`}
      >
        <h3 className="text-2xl font-bold text-red-900 mb-3">
          {spot.name}
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {spot.description}
        </p>
        <div className="mt-4 w-12 h-1 bg-gradient-to-r from-red-600 to-yellow-400 rounded"></div>
      </motion.div>
    </div>
  );
};

export default HeritageSpot;
