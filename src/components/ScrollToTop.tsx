import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: React.FC = () => {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    // Nếu không có hash fragment, scroll to top
    if (!hash) {
      // Đảm bảo DOM đã được cập nhật trước khi scroll
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth' // Smooth scroll
        });
      }, 0);
    }
    // Nếu có hash fragment (ví dụ: #section-1), scroll đến element đó
    else {
      setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 0);
    }
  }, [pathname, hash, key]); // key thay đổi mỗi khi navigate, giúp kích hoạt scroll ngay cả khi URL không đổi

  return null;
};

export default ScrollToTop;
