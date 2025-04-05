import React from 'react';

interface PermissionDeniedToastProps {
  message?: string;
}

const PermissionDeniedToast: React.FC<PermissionDeniedToastProps> = ({ 
  message = 'You do not have permission to access this resource'
}) => {
  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
      {message}
    </div>
  );
};

export default PermissionDeniedToast; 