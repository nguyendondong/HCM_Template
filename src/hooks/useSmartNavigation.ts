import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

interface SmartNavigationOptions {
  listPath: string;
  targetSection?: string;
}

export const useSmartNavigation = (options: SmartNavigationOptions) => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  // Check if we're in detail view (has id param)
  const isDetailView = Boolean(params.id);

  // Check if we came from the list page
  const cameFromList = location.state?.from === options.listPath;

  const goBack = useCallback(() => {
    if (isDetailView) {
      // Navigate to the list page if it exists
      if (options.listPath) {
        navigate(options.listPath);
      } else {
        // Fallback to home
        goToHome();
      }
    } else {
      // Not in detail view, go back using browser history
      window.history.back();
    }
  }, [isDetailView, options.listPath, navigate]);

  const goToDetail = (id: string) => {
    navigate(`${options.listPath}/${id}`, {
      state: { from: options.listPath }
    });
  };

  const goToHome = () => {
    if (options.targetSection) {
      sessionStorage.setItem('targetSection', options.targetSection);
    }
    navigate('/');
  };

  return {
    isDetailView,
    goBack,
    goToDetail,
    goToHome,
    cameFromList
  };
};
