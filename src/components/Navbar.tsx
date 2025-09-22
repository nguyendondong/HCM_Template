import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Star } from 'lucide-react';
import { scrollToHanoi } from './MapSection';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('overview'); // Track active section
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we're on homepage
  const isHomePage = location.pathname === '/';

  // Detect scroll for background transparency
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Detect active section - only on homepage
  useEffect(() => {
    if (!isHomePage) {
      setActiveSection(''); // Clear active section when not on homepage
      return;
    }

    const sections = [
      { id: 'overview', element: document.getElementById('overview') },
      { id: 'introduction', element: document.getElementById('introduction') },
      { id: 'journey', element: document.getElementById('map-section') },
      { id: 'documents', element: document.getElementById('documents') },
      { id: 'vr-technology', element: document.getElementById('vr-technology') },
      { id: 'mini-game', element: document.getElementById('mini-game') }
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = sections.find(s => s.element === entry.target);
            if (section) {
              setActiveSection(section.id);
            }
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '-100px 0px -100px 0px'
      }
    );

    sections.forEach(section => {
      if (section.element) {
        observer.observe(section.element);
      }
    });

    return () => observer.disconnect();
  }, [isHomePage]); // Add isHomePage dependency

  const navItems = [
    { id: 'overview', label: 'Tổng quan', href: '#overview' },
    { id: 'introduction', label: 'Giới thiệu', href: '#introduction' },
    { id: 'journey', label: 'Hành trình theo chân Bác', href: '#map-section' },
    { id: 'documents', label: 'Tư liệu về Chủ tịch Hồ Chí Minh', href: '#documents' },
    { id: 'vr-technology', label: 'Ứng dụng công nghệ VR', href: '#vr-technology' },
    { id: 'mini-game', label: 'Mini Game', href: '#mini-game' }
  ];

  const scrollToSection = (href: string) => {
    // If not on homepage, navigate to homepage first with section info
    if (!isHomePage) {
      const sectionId = href.replace('#', '');
      sessionStorage.setItem('targetSection', sectionId);
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
        // Đảm bảo trigger event cho video nếu là introduction
        if (sectionId === 'introduction') {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('introductionNavClick'));
          }, 500);
        }
        // Đảm bảo scrollToHanoi nếu là map-section
        if (sectionId === 'map-section') {
          setTimeout(() => {
            scrollToHanoi();
          }, 500);
        }
      }, 400);
      setIsOpen(false);
      return;
    }

    // Xử lý đặc biệt cho journey section - scroll đến Hà Nội
    if (href === '#map-section') {
      scrollToHanoi();
      setIsOpen(false);
      return;
    }

    // Xử lý đặc biệt cho introduction section - trigger video autoplay
    if (href === '#introduction') {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('introductionNavClick'));
        }, 500);
        setIsOpen(false);
      }
      return;
    }

    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false); // Close mobile menu after click
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled || !isHomePage
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          >
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
              <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
            </div>
            <span className={`text-xl font-bold transition-colors duration-300 ${
              scrolled || !isHomePage ? 'text-gray-900' : 'text-white'
            }`}>

            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item, index) => (
              <motion.div
                key={item.id}
                className="relative"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <motion.button
                  onClick={() => scrollToSection(item.href)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/20 ${
                    scrolled || !isHomePage
                      ? activeSection === item.id && isHomePage
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                      : activeSection === item.id && isHomePage
                        ? 'text-yellow-400 bg-white/20'
                        : 'text-white hover:text-yellow-400'
                  }`}
                >
                  {item.label}

                  {/* Active indicator line - only show on homepage */}
                  {activeSection === item.id && isHomePage && (
                    <motion.div
                      layoutId="activeIndicator"
                      className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-current rounded-full ${
                        scrolled || !isHomePage ? 'w-8' : 'w-6'
                      }`}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30
                      }}
                    />
                  )}
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors duration-300 ${
              scrolled || !isHomePage
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-white hover:bg-white/20'
            }`}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200"
          >
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="space-y-2">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    onClick={async () => {
                      setIsOpen(false);
                      await new Promise(r => setTimeout(r, 120));
                      scrollToSection(item.href);
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`w-full text-left px-4 py-3 font-medium rounded-lg transition-colors duration-200 ${
                      activeSection === item.id && isHomePage
                        ? 'text-red-600 bg-red-50 border-l-4 border-red-600'
                        : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                    }`}
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
