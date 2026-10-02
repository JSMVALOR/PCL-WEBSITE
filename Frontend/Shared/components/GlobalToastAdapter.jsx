import { useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';

export default function GlobalToastAdapter() {
  const { addFlag } = useNotification();

  useEffect(() => {
    window.erpToast = {
      show: (message, type = 'info') => {
        addFlag({
          title: type.charAt(0).toUpperCase() + type.slice(1),
          description: message,
          type: type === 'error' ? 'error' : type === 'warning' ? 'warning' : type === 'success' ? 'success' : 'info'
        });
      }
    };
    window.toast = window.erpToast; // Fallback for some components
  }, [addFlag]);

  return null;
}
