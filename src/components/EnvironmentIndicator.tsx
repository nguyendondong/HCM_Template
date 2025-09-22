import React from 'react';

interface EnvironmentIndicatorProps {
  className?: string;
}

const EnvironmentIndicator: React.FC<EnvironmentIndicatorProps> = ({ className = '' }) => {
  const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true';
  const environment = useEmulators ? 'development' : 'production';
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  // Chỉ hiển thị trong development
  if (environment !== 'development') {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className={`px-3 py-2 rounded-lg shadow-lg text-sm font-medium ${
        useEmulators
          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
          : 'bg-red-100 text-red-800 border border-red-300'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            useEmulators ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span>
            {useEmulators ? '🔧 Emulators' : '🌐 Production'}
          </span>
        </div>
        <div className="text-xs opacity-75 mt-1">
          Project: {projectId}
        </div>
      </div>
    </div>
  );
};

export default EnvironmentIndicator;
