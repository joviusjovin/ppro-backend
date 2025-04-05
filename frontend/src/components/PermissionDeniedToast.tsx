import { toast } from 'react-hot-toast';
import { FaLock } from 'react-icons/fa';

export const showPermissionDenied = (system: string) => {
  toast.error(
    <div className="flex items-center gap-2">
      <FaLock className="text-white" />
      <span>You don't have permission to access {system} system</span>
    </div>,
    {
      duration: 3000,
      position: 'top-center',
      style: {
        background: '#EF4444',
        color: 'white',
      },
    }
  );
}; 