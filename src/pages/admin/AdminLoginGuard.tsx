import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminLoginGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    const lastLogin = localStorage.getItem('admin_last_login');
    const EXPIRE_DAYS = parseInt(import.meta.env.VITE_ADMIN_SESSION_EXPIRE_DAYS || '3', 10);
    const expireMs = EXPIRE_DAYS * 24 * 60 * 60 * 1000;
    const isSessionValid = currentUser && lastLogin && (Date.now() - Number(lastLogin) < expireMs);
    if (isSessionValid) {
      navigate('/admin', { replace: true });
    }
  }, [currentUser, loading, navigate]);

  if (loading) return null;
  return <>{children}</>;
};

export default AdminLoginGuard;
