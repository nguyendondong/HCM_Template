import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import HeritageSpot from './HeritageSpot';
import { heritageSpots } from '../data/heritageSpots';

const MapSection: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  return (
    <section id="map-section" className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-20">
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
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className="absolute w-6 h-6 bg-yellow-400 rounded-full border-2 border-white shadow-lg animate-pulse z-10"
                    style={{
                      left: `${spot.coordinates.x}%`,
                      top: `${spot.coordinates.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Heritage Spots with Descriptions */}
          <div className="space-y-32">
            {heritageSpots.map((spot, index) => (
              <div key={spot.id} className="relative">
                <HeritageSpot spot={spot} mapRef={mapRef} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;