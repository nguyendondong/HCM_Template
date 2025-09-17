import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const Footer: React.FC = () => {
  const stars = Array.from({ length: 12 }, (_, i) => i);

  return (
    <footer className="relative bg-gradient-to-r from-red-800 to-red-900 py-20 overflow-hidden">
      {/* Animated Stars Background */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <motion.div
            key={star}
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            whileInView={{ opacity: 0.3, scale: 1, rotate: 360 }}
            viewport={{ once: true }}
            transition={{ 
              duration: 2, 
              delay: star * 0.1,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 3
            }}
            className="absolute"
            style={{
              left: `${10 + (star * 8)}%`,
              top: `${20 + (star % 3) * 20}%`,
            }}
          >
            <Star className="w-8 h-8 text-yellow-400 fill-current" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-8">
            "Independence - Freedom - Happiness"
          </h3>
          <p className="text-xl text-gray-200 mb-8 leading-relaxed">
            Join millions who have walked in the footsteps of Uncle Ho. 
            Experience the legacy that continues to inspire Vietnam and the world.
          </p>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <button className="bg-yellow-400 hover:bg-yellow-300 text-red-900 font-bold text-lg px-8 py-4 rounded-full transition-all duration-300 shadow-2xl">
              Plan Your Heritage Journey
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-16 pt-8 border-t border-red-700"
        >
          <p className="text-gray-300">
            © 2025 Heritage Journey Following Uncle Ho. Honoring the legacy of Vietnam's beloved leader.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;