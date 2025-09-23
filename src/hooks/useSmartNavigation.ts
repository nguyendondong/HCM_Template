import { useNavigate, useParams, useLocation } from 'react-router-dom';

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

  const goBack = () => {
    console.log('goBack called - isDetailView:', isDetailView);
    console.log('goBack called - listPath:', options.listPath);
    console.log('goBack called - current location:', location.pathname);

    if (isDetailView) {
      // If in detail view, go back to list
      if (options.targetSection) {
        sessionStorage.setItem('targetSection', options.targetSection);
      }
      console.log('Navigating to list:', options.listPath);
      navigate(options.listPath);
    } else {
      // If in list view, go back to home
      if (options.targetSection) {
        sessionStorage.setItem('targetSection', options.targetSection);
      }
      console.log('Navigating to home');
      navigate('/');
    }
  };

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
