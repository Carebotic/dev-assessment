import React, { useEffect } from 'react';

interface NotificationProps {
  type: 'error' | 'success' | 'warning';
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
  // Auto-close after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = 
    type === 'error' ? 'bg-red-500' : 
    type === 'warning' ? 'bg-amber-500' : 
    'bg-green-500';

  return (
    <div className={`fixed top-2 left-1/2 transform -translate-x-1/2 z-[100] min-w-[300px] max-w-md ${bgColor} text-white px-4 py-3 rounded-md shadow-lg flex items-center justify-between`}>
      <span>{message}</span>
      <button 
        onClick={onClose}
        className="ml-4 text-white hover:text-gray-200 focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default Notification;
