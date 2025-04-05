import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useRights = (requiredRight: string) => {
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkRights = () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const userRights = tokenData.rights || [];
        
        if (!userRights.includes(requiredRight)) {
          navigate('/admin/unauthorized');
          return;
        }

        setHasAccess(true);
      } catch (error) {
        console.error('Error checking rights:', error);
        navigate('/admin/login');
      }
    };

    checkRights();
  }, [requiredRight, navigate]);

  return hasAccess;
}; 