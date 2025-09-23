import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Facebook, Youtube, Instagram, Twitter, Linkedin } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
  }>;
  isActive?: boolean;
}

const Footer: React.FC = () => {
  const [footerData, setFooterData] = useState<FooterContent>({
    quote: "Independence - Freedom - Happiness",
    description: "Join millions who have walked in the footsteps of Uncle Ho. Experience the legacy that continues to inspire Vietnam and the world.",
    actionButton: {
      text: "Plan Your Heritage Journey",
      action: "/heritage-journey"
    },
    copyright: "© 2025 Heritage Journey Following Uncle Ho. Honoring the legacy of Vietnam's beloved leader.",
    backgroundElements: {
      enableStars: true,
      starCount: 12
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFooterContent();
  }, []);

  const getSocialIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'facebook':
        return <Facebook className="w-6 h-6" />;
      case 'youtube':
        return <Youtube className="w-6 h-6" />;
      case 'instagram':
        return <Instagram className="w-6 h-6" />;
      case 'twitter':
        return <Twitter className="w-6 h-6" />;
      case 'linkedin':
        return <Linkedin className="w-6 h-6" />;
      default:
        return <div className="w-6 h-6 bg-current rounded"></div>;
    }
  };

  const fetchFooterContent = async () => {
    try {
      const footerQuery = query(
        collection(db, 'footerContent'),
        orderBy('updatedAt', 'desc'),
        limit(1)
      );
      const querySnapshot = await getDocs(footerQuery);

      if (!querySnapshot.empty) {
        const footerDoc = querySnapshot.docs[0];
        const footerContent = footerDoc.data() as FooterContent;
        setFooterData({ ...footerData, ...footerContent });
      }
    } catch (error) {
      console.error('Error fetching footer content:', error);
    } finally {
      setLoading(false);
    }
  };

  const stars = Array.from({
    length: footerData.backgroundElements?.starCount || 12
  }, (_, i) => i);

  if (loading) {
    return (
      <footer className="relative bg-gradient-to-r from-red-800 to-red-900 py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-red-700 rounded mb-4"></div>
            <div className="h-4 bg-red-700 rounded mb-8"></div>
            <div className="h-12 bg-red-700 rounded-full w-64 mx-auto"></div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative bg-gradient-to-r from-red-800 to-red-900 py-20 overflow-hidden">
      {/* Animated Stars Background */}
      {footerData.backgroundElements?.enableStars && (
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
      )}

      <div className="relative z-10 max-w-6xl mx-auto text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            "{footerData.quote}"
          </h3>
          <p className="text-lg md:text-xl text-gray-200 mb-10 leading-relaxed max-w-4xl mx-auto">
            {footerData.description}
          </p>

          {footerData.actionButton && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block mb-16"
            >
              <button
                onClick={() => window.location.href = footerData.actionButton?.action || '#'}
                className="bg-yellow-400 hover:bg-yellow-300 text-red-900 font-bold text-lg px-10 py-4 rounded-full transition-all duration-300 shadow-2xl"
              >
                {footerData.actionButton.text}
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Contact Info Section */}
        {footerData.contactInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-200"
          >
            {footerData.contactInfo.address && (
              <div className="text-center">
                <h4 className="font-bold text-white mb-3 text-lg">Address</h4>
                <p className="text-base leading-relaxed">{footerData.contactInfo.address}</p>
              </div>
            )}
            {footerData.contactInfo.phone && (
              <div className="text-center">
                <h4 className="font-bold text-white mb-3 text-lg">Phone</h4>
                <p className="text-base">{footerData.contactInfo.phone}</p>
              </div>
            )}
            {footerData.contactInfo.email && (
              <div className="text-center">
                <h4 className="font-bold text-white mb-3 text-lg">Email</h4>
                <p className="text-base">{footerData.contactInfo.email}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Additional Links */}
        {footerData.additionalLinks && footerData.additionalLinks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mb-8 flex flex-wrap justify-center gap-8"
          >
            {footerData.additionalLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                className="text-gray-200 hover:text-yellow-400 transition-colors duration-300 text-base font-medium"
              >
                {link.label}
              </a>
            ))}
          </motion.div>
        )}

        {/* Social Links */}
        {footerData.socialLinks && footerData.socialLinks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mb-16 flex justify-center space-x-8"
          >
            {footerData.socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-yellow-400 transition-colors duration-300 p-3 rounded-full bg-red-700 hover:bg-red-600"
                title={social.platform}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="sr-only">{social.platform}</span>
                {getSocialIcon(social.icon)}
              </motion.a>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="pt-8 border-t border-red-700"
        >
          <p className="text-gray-300 text-base">
            {footerData.copyright}
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
